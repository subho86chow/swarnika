/**
 * Razorpay API Client
 * Ref: https://razorpay.com/docs/payments/server-integration/nodejs/
 */

import Razorpay from "razorpay";
import crypto from "crypto";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

let instance = null;

function getInstance() {
  if (!instance) {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
    }
    instance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  }
  return instance;
}

/**
 * Create a Razorpay Order.
 * Amount must be in smallest currency unit (paise for INR).
 * @param {Object} params
 * @param {number} params.amount — amount in paise
 * @param {string} params.currency — e.g. "INR"
 * @param {string} params.receipt — your internal receipt id (max 40 chars)
 * @param {Object} [params.notes] — key-value pairs (max 15 pairs, 256 chars each)
 * @returns {Promise<{success: boolean, order?: Object, error?: string}>}
 */
export async function createRazorpayOrder({ amount, currency = "INR", receipt, notes = {} }) {
  try {
    const options = {
      amount,
      currency,
      receipt,
      notes,
    };

    const order = await getInstance().orders.create(options);
    return { success: true, order };
  } catch (err) {
    const message = err?.error?.description || err?.message || "Failed to create Razorpay order";
    return { success: false, error: message };
  }
}

/**
 * Verify Razorpay payment signature.
 * @param {Object} params
 * @param {string} params.razorpayOrderId
 * @param {string} params.razorpayPaymentId
 * @param {string} params.signature — razorpay_signature from checkout
 * @returns {{success: boolean}}
 */
export function verifyRazorpayPayment({ razorpayOrderId, razorpayPaymentId, signature }) {
  try {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isAuthentic = expectedSignature === signature;
    return { success: isAuthentic };
  } catch (err) {
    return { success: false };
  }
}

/**
 * Fetch a payment by ID to confirm capture status.
 * @param {string} paymentId
 * @returns {Promise<{success: boolean, payment?: Object, error?: string}>}
 */
export async function fetchPayment(paymentId) {
  try {
    const payment = await getInstance().payments.fetch(paymentId);
    return { success: true, payment };
  } catch (err) {
    const message = err?.error?.description || err?.message || "Failed to fetch payment";
    return { success: false, error: message };
  }
}
