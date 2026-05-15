import { NextResponse } from "next/server";
import { checkPincode } from "../../../lib/delhivery";

export async function POST(request) {
  try {
    const body = await request.json();
    const { pincode } = body;

    if (!pincode) {
      return NextResponse.json(
        { success: false, error: "Pincode is required" },
        { status: 400 }
      );
    }

    const result = await checkPincode(pincode);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
