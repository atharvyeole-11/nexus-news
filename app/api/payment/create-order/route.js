import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request) {
  try {
    const { amount, tier } = await request.json();

    if (!amount || !tier) {
      return NextResponse.json(
        { error: "Amount and tier are required" },
        { status: 400 }
      );
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create order
    const order = await razorpay.orders.create({
      amount: amount, // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        tier: tier,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
