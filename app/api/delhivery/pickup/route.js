import { NextResponse } from "next/server";
import { createPickupRequest } from "../../../lib/delhivery";

export async function POST(request) {
  try {
    const body = await request.json();
    const { pickup_location, pickup_date, pickup_time, consolidated_count } = body;

    if (!pickup_location) {
      return NextResponse.json(
        { success: false, error: "pickup_location is required" },
        { status: 400 }
      );
    }

    const result = await createPickupRequest({
      pickup_location,
      pickup_date: pickup_date || new Date().toISOString().split("T")[0],
      pickup_time: pickup_time || "14:00:00",
      consolidated_count: consolidated_count || 1,
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
