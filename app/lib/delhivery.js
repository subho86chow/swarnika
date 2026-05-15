/**
 * Delhivery B2C API Client
 * Ref: delhivery-mcp docs — Pincode Serviceability, Shipment Creation,
 *      Pickup Request, Packing Slip, Package Tracking, Cancel Shipment
 */

const DELHIVERY_BASE_URL = process.env.DELHIVERY_BASE_URL || "https://track.delhivery.com";
const DELHIVERY_TOKEN = process.env.DELHIVERY_TOKEN;

function getHeaders(contentType = "application/json") {
  const headers = {
    Authorization: `Token ${DELHIVERY_TOKEN}`,
    Accept: "application/json",
  };
  if (contentType) {
    headers["Content-Type"] = contentType;
  }
  return headers;
}

/**
 * Validate a 6-digit Indian pincode format
 */
function isValidPincode(pincode) {
  return /^[1-9][0-9]{5}$/.test(String(pincode));
}

/**
 * Sleep helper for retry backoff
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mask token for safe logging
 */
function maskToken(token) {
  if (!token) return "***";
  return token.slice(0, 8) + "***";
}

/**
 * Generic Delhivery API fetch with retry logic.
 * Retries on 5xx, timeouts, and network errors. Never retries 4xx or business logic errors.
 */
async function delhiveryFetch(url, options, { timeoutMs = 15000, maxRetries = 3 } = {}) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 403 — rate limit / WAF. Pause and retry.
      if (res.status === 403) {
        if (attempt < maxRetries - 1) {
          await sleep(30000);
          attempt++;
          continue;
        }
        return { success: false, error: "Rate limited by Delhivery. Please try again later." };
      }

      // 4xx — don't retry
      if (res.status >= 400 && res.status < 500) {
        const text = await res.text();
        return { success: false, error: `Delhivery error (${res.status}): ${text}` };
      }

      // 5xx — retry with backoff
      if (res.status >= 500) {
        if (attempt < maxRetries - 1) {
          await sleep(1000 * Math.pow(2, attempt));
          attempt++;
          continue;
        }
        return { success: false, error: `Delhivery server error (${res.status}). Please try again.` };
      }

      const data = await res.json();
      return { success: true, data, status: res.status };
    } catch (err) {
      if (err.name === "AbortError") {
        if (attempt < maxRetries - 1) {
          await sleep(1000 * Math.pow(2, attempt));
          attempt++;
          continue;
        }
        return { success: false, error: "Request to Delhivery timed out. Please try again." };
      }

      if (attempt < maxRetries - 1) {
        await sleep(1000 * Math.pow(2, attempt));
        attempt++;
        continue;
      }

      return { success: false, error: err.message || "Network error. Please try again." };
    }
  }

  return { success: false, error: "Max retries exceeded." };
}

/**
 * Check if a pincode is serviceable by Delhivery.
 * @param {string|number} pincode — 6-digit Indian pincode
 * @returns {Promise<{success: boolean, serviceable: boolean, data?: any, error?: string}>}
 */
export async function checkPincode(pincode) {
  const pin = String(pincode).trim();

  if (!isValidPincode(pin)) {
    return { success: false, serviceable: false, error: "Invalid pincode. Please enter a 6-digit number." };
  }

  if (!DELHIVERY_TOKEN) {
    return { success: false, serviceable: false, error: "Delhivery token not configured." };
  }

  const url = `${DELHIVERY_BASE_URL}/c/api/pin-codes/json/?filter_codes=${pin}`;
  const result = await delhiveryFetch(url, { method: "GET", headers: getHeaders() }, { timeoutMs: 10000 });

  if (!result.success) {
    return { success: false, serviceable: false, error: result.error };
  }

  const deliveryCodes = result.data?.delivery_codes || [];
  const isServiceable = deliveryCodes.length > 0;

  return {
    success: true,
    serviceable: isServiceable,
    data: deliveryCodes[0] || null,
  };
}

/**
 * Create a shipment in Delhivery.
 * Ref: Shipment Creation API — requires warehouse pre-registration.
 * @param {Object} payload — shipment payload per Delhivery spec
 * @returns {Promise<{success: boolean, waybill?: string, error?: string}>}
 */
export async function createShipment(payload) {
  if (!DELHIVERY_TOKEN) {
    return { success: false, error: "Delhivery token not configured." };
  }

  const url = `${DELHIVERY_BASE_URL}/api/cmu/create.json`;

  const body = new URLSearchParams();
  body.append("format", "json");
  body.append("data", JSON.stringify(payload));

  const result = await delhiveryFetch(
    url,
    {
      method: "POST",
      headers: getHeaders("application/x-www-form-urlencoded"),
      body: body.toString(),
    },
    { timeoutMs: 15000 }
  );

  if (!result.success) {
    return { success: false, error: result.error };
  }

  // Delhivery returns nested packages array
  const pkg = result.data?.packages?.[0];
  if (pkg?.status === "Success") {
    return { success: true, waybill: pkg.waybill };
  }

  const remark = pkg?.remarks?.[0] || result.data?.rmk || "Unknown error";
  return { success: false, error: remark };
}

/**
 * Create a Pickup Request (PUR) for a shipment.
 * Ref: Pickup Request API — mandatory for forward shipments.
 * @param {Object} params
 * @param {string} params.pickup_location — registered warehouse name
 * @param {string} params.pickup_date — YYYY-MM-DD
 * @param {string} params.pickup_time — HH:MM:SS
 * @param {number} params.consolidated_count — number of packages (default 1)
 * @returns {Promise<{success: boolean, pickup_request_id?: string, error?: string}>}
 */
export async function createPickupRequest({ pickup_location, pickup_date, pickup_time, consolidated_count = 1 }) {
  if (!DELHIVERY_TOKEN) {
    return { success: false, error: "Delhivery token not configured." };
  }

  const url = `${DELHIVERY_BASE_URL}/fm/request/new/`;

  const payload = {
    pickup_location,
    pickup_date,
    pickup_time,
    consolidated_count,
  };

  const result = await delhiveryFetch(
    url,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    },
    { timeoutMs: 10000 }
  );

  if (!result.success) {
    return { success: false, error: result.error };
  }

  // Delhivery returns { pickup_id: "..." } on success
  const pickupId = result.data?.pickup_id || result.data?.pickup_request_id;
  if (pickupId) {
    return { success: true, pickup_request_id: String(pickupId) };
  }

  const remark = result.data?.remark || result.data?.message || "Unknown PUR error";
  return { success: false, error: remark };
}

/**
 * Generate a packing slip (shipping label) for waybill(s).
 * @param {string[]} waybills — array of waybill numbers
 * @param {boolean} pdf — return PDF URL (default true)
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export async function getPackingSlip(waybills, pdf = true) {
  if (!DELHIVERY_TOKEN) {
    return { success: false, error: "Delhivery token not configured." };
  }

  if (!waybills || waybills.length === 0) {
    return { success: false, error: "No waybills provided." };
  }

  const wbns = waybills.join(",");
  const url = `${DELHIVERY_BASE_URL}/api/p/packing_slip?wbns=${encodeURIComponent(wbns)}&pdf=${pdf ? "true" : "false"}`;

  const result = await delhiveryFetch(url, { method: "GET", headers: getHeaders() }, { timeoutMs: 20000 });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  // Delhivery returns PDF as either a direct URL or base64 data
  const slipUrl = result.data?.url || result.data?.packages?.[0]?.pdf_download_link;
  if (slipUrl) {
    return { success: true, url: slipUrl };
  }

  return { success: false, error: "Packing slip not available." };
}

/**
 * Get tracking status for waybill(s).
 * @param {string[]} waybills — array of waybill numbers (max 50)
 * @returns {Promise<{success: boolean, shipments?: any[], error?: string}>}
 */
export async function getTrackingStatus(waybills) {
  if (!DELHIVERY_TOKEN) {
    return { success: false, error: "Delhivery token not configured." };
  }

  if (!waybills || waybills.length === 0) {
    return { success: false, error: "No waybills provided." };
  }

  const wbns = waybills.join(",");
  const url = `${DELHIVERY_BASE_URL}/api/v1/packages/json/?waybill=${encodeURIComponent(wbns)}`;

  const result = await delhiveryFetch(url, { method: "GET", headers: getHeaders() }, { timeoutMs: 15000 });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const rawShipments = result.data?.ShipmentData || [];
  const shipments = rawShipments.map(s => s.Shipment || s).filter(Boolean);
  return { success: true, shipments };
}

/**
 * Cancel a shipment before dispatch.
 * @param {string} waybill — waybill number to cancel
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function cancelShipment(waybill) {
  if (!DELHIVERY_TOKEN) {
    return { success: false, error: "Delhivery token not configured." };
  }

  const url = `${DELHIVERY_BASE_URL}/api/p/edit`;

  const payload = {
    waybill,
    cancellation: "true",
  };

  const result = await delhiveryFetch(
    url,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    },
    { timeoutMs: 10000 }
  );

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const status = result.data?.status;
  const remark = result.data?.remark;

  if (status === true || status === "true" || status === "Success") {
    return { success: true, remark: remark || "Shipment cancelled." };
  }

  return { success: false, error: remark || "Failed to cancel shipment." };
}
