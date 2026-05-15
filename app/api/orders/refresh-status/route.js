import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getTrackingStatus } from "../../../lib/delhivery";

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Map Delhivery scan status to our order status.
 */
function mapScanStatus(statusString, statusCodeString = "") {
  if (!statusString && !statusCodeString) return null;
  const s = String(statusString).toLowerCase().trim();
  const code = String(statusCodeString).toLowerCase().trim();

  if (
    s.includes("manifested") ||
    s.includes("in transit") ||
    s.includes("bagging") ||
    s.includes("arrived at") ||
    s.includes("out for delivery") ||
    s.includes("dispatched") ||
    s.includes("picked up") ||
    s.includes("shipped")
  ) {
    return "shipped";
  }
  if (s.includes("delivered")) return "delivered";
  if (
    s.includes("rto") ||
    s.includes("returned") ||
    s.includes("cancelled") ||
    s.includes("undelivered") ||
    s.includes("not picked") ||
    code.includes("x-pnp") ||
    code.includes("x-can")
  ) {
    return "cancelled";
  }
  return null;
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * POST /api/orders/refresh-status
 *
 * Cron job endpoint to bulk-sync tracking status for all active orders.
 * Called by cron-job.org (or similar) every 6 hours.
 *
 * Auth: Authorization: Bearer <CRON_SECRET>
 *       (Also accepts non-standard `Bearer: <token>` for cron-job.org UI flexibility.)
 */
export async function POST(request) {
  try {
    // ── Auth ──
    const authHeader = request.headers.get("authorization") || "";
    const bearerHeader = request.headers.get("bearer") || "";

    let providedSecret = "";
    if (authHeader.toLowerCase().startsWith("bearer ")) {
      providedSecret = authHeader.slice(7).trim();
    } else if (bearerHeader) {
      // Fallback for cron-job.org UI where user puts "Bearer" as the key
      providedSecret = bearerHeader.trim();
    }

    if (!CRON_SECRET) {
      return NextResponse.json(
        { success: false, error: "CRON_SECRET not configured on server" },
        { status: 500 }
      );
    }

    if (providedSecret !== CRON_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ── Find active orders ──
    // Only check orders from last 30 days that have a waybill and aren't already final
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await prisma.order.findMany({
      where: {
        delhiveryWaybill: { not: null },
        status: { in: ["paid", "shipped"] },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        id: true,
        status: true,
        delhiveryWaybill: true,
        shippedAt: true,
        deliveredAt: true,
        cancelledAt: true,
      },
    });

    if (orders.length === 0) {
      return NextResponse.json({
        success: true,
        checked: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
        message: "No active orders to refresh",
      });
    }

    // ── Batch waybills (Delhivery max 50 per request) ──
    const waybillMap = new Map(); // waybill -> order
    for (const order of orders) {
      waybillMap.set(order.delhiveryWaybill, order);
    }

    const waybills = Array.from(waybillMap.keys());
    const batches = chunkArray(waybills, 50);

    let updated = 0;
    let skipped = 0;
    let failed = 0;
    const errors = [];

    const statusHierarchy = { pending: 0, paid: 1, shipped: 2, delivered: 3, cancelled: 4 };

    for (const batch of batches) {
      const result = await getTrackingStatus(batch);

      if (!result.success) {
        failed += batch.length;
        errors.push(`Batch failed: ${result.error}`);
        continue;
      }

      const shipments = result.shipments || [];

      for (const shipment of shipments) {
        const waybill = shipment?.AWB || shipment?.Waybill || shipment?.waybill;
        const order = waybillMap.get(waybill);
        if (!order) {
          skipped++;
          continue;
        }

        // Delhivery returns both a top-level Status on each shipment AND a Scans array.
        // The top-level Status reflects the current state (e.g. "Cancelled").
        // Prefer the top-level Status; fall back to the latest scan.
        const topLevelStatus = shipment?.Status?.Status || shipment?.Status?.status;
        const topLevelStatusCode = shipment?.Status?.StatusCode || "";
        const scans = shipment?.Scans || shipment?.scans || [];
        const latestScan = scans[0];

        const scanStatus = latestScan?.ScanDetail?.Scan || latestScan?.Status || "";
        const scanStatusCode = latestScan?.ScanDetail?.StatusCode || "";
        const statusString = (topLevelStatus || scanStatus).toString().toLowerCase().trim();
        const statusCodeString = (topLevelStatusCode || scanStatusCode).toString().toLowerCase().trim();

        if (!statusString) {
          skipped++;
          continue;
        }

        const newStatus = mapScanStatus(statusString, statusCodeString);

        if (!newStatus) {
          skipped++;
          continue;
        }

        const currentLevel = statusHierarchy[order.status] || 0;
        const newLevel = statusHierarchy[newStatus] || 0;

        // Only update if status advances (or is cancelled)
        if (newLevel > currentLevel || newStatus === "cancelled") {
          const updateData = { status: newStatus };
          if (newStatus === "shipped" && !order.shippedAt) updateData.shippedAt = new Date();
          if (newStatus === "delivered" && !order.deliveredAt) updateData.deliveredAt = new Date();
          if (newStatus === "cancelled" && !order.cancelledAt) updateData.cancelledAt = new Date();

          await prisma.order.update({ where: { id: order.id }, data: updateData });
          updated++;
        } else {
          skipped++;
        }
      }

      // Count waybills that returned no shipment data at all
      const returnedWaybills = new Set(shipments.map((s) => s?.AWB || s?.Waybill || s?.waybill));
      for (const wb of batch) {
        if (!returnedWaybills.has(wb)) {
          skipped++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      checked: orders.length,
      updated,
      skipped,
      failed,
      errors: errors.length > 0 ? errors : undefined,
      message: `Refreshed ${orders.length} order(s). ${updated} updated, ${skipped} unchanged, ${failed} failed.`,
    });
  } catch (err) {
    console.error("Refresh status cron error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Cron refresh failed" },
      { status: 500 }
    );
  }
}
