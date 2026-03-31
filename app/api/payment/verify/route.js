import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification parameters" },
        { status: 400 }
      );
    }

    // Verify Razorpay signature
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected_signature = createHmac("sha256", key_secret)
      .update(body.toString())
      .digest("hex");

    if (expected_signature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Payment is valid, update user subscription
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Calculate subscription dates
    const now = new Date();
    const subscriptionEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    // Update user's subscription in Supabase
    const { error: updateError } = await supabase
      .from("user_profiles")
      .upsert({
        user_id: user.id,
        subscription_tier: tier,
        subscription_start: now.toISOString(),
        subscription_end: subscriptionEnd.toISOString(),
        updated_at: now.toISOString(),
      });

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      tier: tier,
      subscription_end: subscriptionEnd.toISOString(),
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
