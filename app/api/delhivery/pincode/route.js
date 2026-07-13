import { NextResponse } from "next/server";
import { checkPincode, getExpectedTAT } from "../../../lib/delhivery";

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
    
    // If serviceable, try to get expected delivery date
    if (result.success && result.serviceable) {
      try {
        // Fallback origin pin if not configured, 122003 is common hub
        const originPin = process.env.DELHIVERY_ORIGIN_PIN || "122003"; 
        const tatResult = await getExpectedTAT({ 
          origin_pin: originPin, 
          destination_pin: pincode, 
          mot: "S" 
        });
        
        if (tatResult.success && tatResult.data) {
          result.tat = tatResult.data.tat;
          result.expected_delivery_date = tatResult.data.expected_delivery_date;
        }
      } catch (err) {
        // Ignore TAT errors and just return serviceability
        console.error("Error fetching TAT:", err);
      }
    }
    
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
