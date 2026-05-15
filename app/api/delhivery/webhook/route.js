import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

/**
 * Map Delhivery scan status to our order status.
 */
function mapScanStatus(scanStatus) {
  if (!scanStatus) return null;
  const s = String(scanStatus).toLowerCase().trim();

  // Shipped statuses
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

  // Delivered
  if (s.includes("delivered")) {
    return "delivered";
  }

  // Cancelled / RTO
  if (
    s.includes("rto") ||
    s.includes("returned") ||
    s.includes("cancelled") ||
    s.includes("undelivered")
  ) {
    return "cancelled";
  }

  return null;
}

/**
 * Delhivery webhook — receives scan events.
 * Configure webhook URL in Delhivery One Panel:
 *   POST https://swarnikaofficial.com/api/delhivery/webhook
 */
export async function POST(request) {
  try {
    const payload = await request.json();

    // Delhivery webhook payload structure varies.
    // Common patterns: payload.waybill, payload.status, payload.scan
    const waybill =
      payload.waybill ||
      payload.awb ||
      payload.tracking_id ||
      payload.Waybill;

    const scanStatus =
      payload.status ||
      payload.scan_status ||
      payload.Status ||
      payload.scan?.status;

    if (!waybill) {
      return NextResponse.json(
        { success: false, error: "Missing waybill" },
        { status: 400 }
      );
    }

    // Find order by waybill
    const order = await prisma.order.findFirst({
      where: { delhiveryWaybill: String(waybill) },
    });

    if (!order) {
      // Waybill not in our system — log and return 200 so Delhivery doesn't retry
      console.warn(`Webhook: waybill ${waybill} not found in local orders`);
      return NextResponse.json({ success: false, error: "Waybill not found" });
    }

    const newStatus = mapScanStatus(scanStatus);
    if (!newStatus) {
      // Unrecognized status — log but don't update
      console.log(`Webhook: unrecognized status "${scanStatus}" for waybill ${waybill}`);
      return NextResponse.json({ success: true, note: "Status unrecognized, no action" });
    }

    // Don't downgrade status (e.g., don't go from delivered back to shipped)
    const statusHierarchy = { pending: 0, paid: 1, shipped: 2, delivered: 3, cancelled: 4 };
    const currentLevel = statusHierarchy[order.status] || 0;
    const newLevel = statusHierarchy[newStatus] || 0;

    if (newLevel < currentLevel && newStatus !== "cancelled") {
      return NextResponse.json({ success: true, note: "Status downgrade prevented" });
    }

    // Build update data
    const updateData = { status: newStatus };
    if (newStatus === "shipped" && !order.shippedAt) {
      updateData.shippedAt = new Date();
    }
    if (newStatus === "delivered" && !order.deliveredAt) {
      updateData.deliveredAt = new Date();
    }
    if (newStatus === "cancelled" && !order.cancelledAt) {
      updateData.cancelledAt = new Date();
    }

    await prisma.order.update({
      where: { id: order.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      oldStatus: order.status,
      newStatus,
    });
  } catch (err) {
    console.error("Delhivery webhook error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}
