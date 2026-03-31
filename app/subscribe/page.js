"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Check, Crown, Loader2, Star } from "lucide-react";

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: "₹99",
    cadence: "/month",
    blurb: "Unlock NOVA AI chat and image generation.",
    features: [
      "💬 NOVA Chat (AI news assistant)",
      "🖼️ News image generation (Gemini)",
    ],
    amount: 9900, // ₹99 in paise
  },
  {
    id: "premium",
    name: "Premium",
    price: "₹299",
    cadence: "/month",
    blurb: "Complete creator workflow for news content.",
    features: [
      "Everything in Basic",
      "🎬 60s Hindi/English video scripts",
      "📋 Suggested visuals per beat",
    ],
    amount: 29900, // ₹299 in paise
    badge: "Most Complete",
  },
];

export default function SubscribePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        router.push("/login");
        return;
      }
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, [router]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (plan) => {
    if (!user) {
      router.push("/login");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      // Create order
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plan.amount,
          tier: plan.id,
        }),
      });

      const orderData = await orderResponse.json();
      if (!orderData.success) {
        throw new Error(orderData.error);
      }

      // Load Razorpay
      await loadRazorpay();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "Nexus News",
        description: `${plan.name} Subscription`,
        image: "/favicon.ico",
        handler: async function (response) {
          // Verify payment
          const verifyResponse = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              tier: plan.id,
            }),
          });

          const verifyData = await verifyResponse.json();
          if (verifyData.success) {
            // Show success message
            alert("Payment successful! Welcome to " + plan.name + " plan.");
            router.push("/dashboard");
          } else {
            setError("Payment verification failed. Please contact support.");
          }
          setProcessing(false);
        },
        prefill: {
          name: user.user_metadata?.full_name || user.email,
          email: user.email,
        },
        theme: {
          color: "#F59E0B",
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] py-12 px-4">
      <div className="mx-auto max-w-4xl page-content">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your NOVA Plan
          </h1>
          <p className="text-[#A0A0A0] text-lg">
            Unlock AI-powered news analysis and content creation
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`
                subscription-card relative rounded-2xl border p-8 transition-all
                ${plan.id === "premium" 
                  ? "border-[#E8C84A] bg-gradient-to-br from-[#E8C84A]/10 to-[#E8C84A]/5" 
                  : "border-[#2A2A2A] bg-[#1A1A1A]"
                }
              `}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#E8C84A] to-[#FFA500] px-4 py-1 text-xs font-bold text-[#0F0F0F]">
                    <Crown className="h-3 w-3" />
                    {plan.badge}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-[#A0A0A0]">
                    {plan.cadence}
                  </span>
                </div>
              </div>

              <p className="text-[#A0A0A0] mb-8">
                {plan.blurb}
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#00C853] flex-shrink-0 mt-0.5" />
                    <span className="text-[#A0A0A0]">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePayment(plan)}
                disabled={processing}
                className={`
                  w-full rounded-lg py-3 px-6 font-semibold transition-all
                  ${plan.id === "premium"
                    ? "btn-primary bg-[#E8C84A] hover:bg-[#FFA500] text-white"
                    : "btn-primary bg-[#C8102E] hover:bg-[#FF1744] text-white"
                  }
                  ${processing ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {processing ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  `Get ${plan.name}`
                )}
              </button>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-8 rounded-lg bg-[#C8102E]/10 border border-[#C8102E]/20 p-4 text-center">
            <p className="text-[#FF6D00]">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
