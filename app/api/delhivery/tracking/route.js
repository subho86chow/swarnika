import { NextResponse } from "next/server";
import { getTrackingStatus } from "../../../lib/delhivery";

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

    const result = await getTrackingStatus([waybill]);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
