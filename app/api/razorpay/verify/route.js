import { NextResponse } from "next/server";
import { verifyRazorpayPayment } from "../../../lib/razorpay";

export async function POST(request) {
  try {
    const body = await request.json();
    const { razorpayOrderId, razorpayPaymentId, signature } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !signature) {
      return NextResponse.json(
        { success: false, error: "Missing required payment verification fields" },
        { status: 400 }
      );
    }

    const result = verifyRazorpayPayment({
      razorpayOrderId,
      razorpayPaymentId,
      signature,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Payment signature verification failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, verified: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
