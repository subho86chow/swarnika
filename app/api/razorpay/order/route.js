import { NextResponse } from "next/server";
import { createRazorpayOrder } from "../../../lib/razorpay";

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, currency = "INR", receipt, notes = {} } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount is required and must be greater than 0" },
        { status: 400 }
      );
    }

    const result = await createRazorpayOrder({
      amount,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, order: result.order });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
