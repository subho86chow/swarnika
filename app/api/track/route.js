import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { getTrackingStatus } from "../../lib/delhivery";

/**
 * Public tracking API — no auth required.
 * GET /api/track?waybill=xxx
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const waybill = searchParams.get("waybill");

    if (!waybill) {
      return NextResponse.json(
        { success: false, error: "Waybill is required" },
        { status: 400 }
      );
    }

    // Optionally verify the waybill exists in our system
    const order = await prisma.order.findFirst({
      where: { delhiveryWaybill: waybill },
      select: {
        id: true,
        status: true,
        shippingName: true,
        shippingCity: true,
        totalAmount: true,
        createdAt: true,
      },
    });

    const result = await getTrackingStatus([waybill]);
    if (!result.success) {
      return NextResponse.json(result);
    }

    const shipment = result.shipments?.[0];

    return NextResponse.json({
      success: true,
      waybill,
      order: order || null,
      shipment,
    });
  } catch (err) {
    console.error("Track API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Tracking failed" },
      { status: 500 }
    );
  }
}
