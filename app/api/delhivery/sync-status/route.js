import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getTrackingStatus } from "../../../lib/delhivery";

/**
 * Map Delhivery status string to our order status.
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

/**
 * Admin API: manually sync tracking status for an order.
 * GET /api/delhivery/sync-status?orderId=xxx
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    if (!order.delhiveryWaybill) {
      return NextResponse.json(
        { success: false, error: "Order has no waybill" },
        { status: 400 }
      );
    }

    const result = await getTrackingStatus([order.delhiveryWaybill]);
    if (!result.success) {
      return NextResponse.json(result);
    }

    const shipment = result.shipments?.[0];
    if (!shipment) {
      return NextResponse.json({
        success: true,
        orderId,
        waybill: order.delhiveryWaybill,
        note: "No shipment data found for waybill",
        oldStatus: order.status,
        newStatus: order.status,
      });
    }

    // Delhivery returns both a top-level Status on each shipment AND a Scans array.
    // The top-level Status reflects the current state (e.g. "Cancelled").
    // Prefer the top-level Status; fall back to the latest scan.
    const topLevelStatus = shipment.Status?.Status || shipment.Status?.status;
    const topLevelStatusCode = shipment.Status?.StatusCode || "";
    const scans = shipment.Scans || shipment.scans || [];
    const latestScan = scans[0];
    const scanStatus = latestScan?.ScanDetail?.Scan || latestScan?.Status || "";
    const scanStatusCode = latestScan?.ScanDetail?.StatusCode || "";
    const statusString = (topLevelStatus || scanStatus).toString().toLowerCase().trim();
    const statusCodeString = (topLevelStatusCode || scanStatusCode).toString().toLowerCase().trim();

    if (!statusString) {
      return NextResponse.json({
        success: true,
        orderId,
        waybill: order.delhiveryWaybill,
        note: "No status data yet",
        shipment,
      });
    }

    const newStatus = mapScanStatus(statusString, statusCodeString);

    if (newStatus) {
      const statusHierarchy = { pending: 0, paid: 1, shipped: 2, delivered: 3, cancelled: 4 };
      const currentLevel = statusHierarchy[order.status] || 0;
      const newLevel = statusHierarchy[newStatus] || 0;

      if (newLevel >= currentLevel || newStatus === "cancelled") {
        const updateData = { status: newStatus };
        if (newStatus === "shipped" && !order.shippedAt) updateData.shippedAt = new Date();
        if (newStatus === "delivered" && !order.deliveredAt) updateData.deliveredAt = new Date();
        if (newStatus === "cancelled" && !order.cancelledAt) updateData.cancelledAt = new Date();

        await prisma.order.update({ where: { id: order.id }, data: updateData });
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      waybill: order.delhiveryWaybill,
      oldStatus: order.status,
      newStatus: newStatus || order.status,
      topLevelStatus: topLevelStatus || null,
      latestScan: latestScan?.ScanDetail?.Scan || latestScan?.Status || null,
      scanTime: latestScan?.ScanDetail?.ScanDateTime || latestScan?.ScanDateTime || null,
      scans: scans.slice(0, 10),
    });
  } catch (err) {
    console.error("Sync status error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Sync failed" },
      { status: 500 }
    );
  }
}