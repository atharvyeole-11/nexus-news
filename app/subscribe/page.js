"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { normalizeSubscriptionTier } from "@/lib/subscription";
import { Check, CreditCard, IndianRupee, Loader2 } from "lucide-react";

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: "₹99",
    cadence: "/month",
    blurb: "Unlock NOVA image generation for your desk.",
    features: ["💬 NOVA Chat", "🖼️ News image generation (Gemini)"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "₹299",
    cadence: "/month",
    blurb: "Full creator workflow for short-form news video.",
    features: [
      "Everything in Basic",
      "🎬 60s Hindi/English video scripts",
      "Suggested visuals per beat",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹599",
    cadence: "/month",
    blurb: "Maximum creator mode for consistent news content.",
    features: [
      "Everything in Premium",
      "Priority creative cycles",
      "Extended script + visuals depth",
    ],
  },
];

const METHOD_UPI = "upi";
const METHOD_CARD = "card";

export default function SubscribePage() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [method, setMethod] = useState(() => METHOD_UPI);
  const [phase, setPhase] = useState("form"); // form | processing | success
  const [error, setError] = useState("");

  const [upiId, setUpiId] = useState("name@bank");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    if (!modalOpen) return;
    // Reset form state when modal opens
    const resetForm = () => {
      setPhase("form");
      setError("");
      setMethod(METHOD_UPI);
    };
    resetForm();
  }, [modalOpen]);

  async function ensureSignedIn() {
    const { data, error: userErr } = await supabase.auth.getUser();
    if (userErr || !data?.user) {
      router.replace("/login");
      throw new Error("You need to sign in first.");
    }
    return data.user;
  }

  async function handleSubscribe(plan) {
    try {
      await ensureSignedIn();
      setCurrentPlan(plan);
      setModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  }

  async function updateTier(planName) {
    const { data, error: userErr } = await supabase.auth.getUser();
    if (userErr || !data?.user) throw new Error("Not signed in.");

    const tier = normalizeSubscriptionTier(planName);
    const { error: upsertErr } = await supabase
      .from("user_profiles")
      .upsert(
        {
          id: data.user.id,
          subscription_tier: tier,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (upsertErr) throw upsertErr;

    // Hint for client dashboards / panels to refresh instantly.
    if (typeof window !== "undefined") {
      window.sessionStorage?.setItem("nexus_subscription_tier", tier);
    }
  }

  async function handlePayNow() {
    if (!currentPlan) return;
    setError("");
    setPhase("processing");

    // Fake processing delay.
    await new Promise((r) => setTimeout(r, 2000));

    try {
      await updateTier(currentPlan.name);
      setPhase("success");
      // Short delay so user can see success state before navigation.
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 900);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Payment succeeded but we could not update your plan.");
      setPhase("form");
    }
  }

  const PLAN = currentPlan;

  return (
    <div className="newsroom-grain min-h-[calc(100vh-3.5rem)] px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
          Choose your Nexus plan
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-500">
          Mock payment gateway only — no real money is charged. On success, your{" "}
          <code className="text-amber-500">user_profiles.subscription_tier</code> is updated
          so NOVA unlocks on the dashboard.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`card-news flex flex-col p-6 ${
              plan.id === "premium" ? "ring-2 ring-amber-500/40" : ""
            }`}
          >
            {plan.id === "premium" && (
              <span className="mb-3 inline-block w-fit rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                Most popular
              </span>
            )}
            <h2 className="font-heading text-xl font-bold text-white">{plan.name}</h2>
            <p className="mt-1 text-sm text-zinc-500">{plan.blurb}</p>
            <p className="mt-4 font-heading text-3xl font-bold text-amber-400">
              {plan.price}
              <span className="text-sm font-normal text-zinc-500">{plan.cadence}</span>
            </p>
            <ul className="mt-6 flex-1 space-y-2 text-left text-sm text-zinc-300">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="btn-primary mt-6 w-full glow-amber"
              onClick={() => handleSubscribe(plan)}
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>

      {modalOpen && PLAN && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => (phase === "form" ? setModalOpen(false) : null)}
          />
          <div className="relative w-full max-w-lg px-4 pb-6 sm:pb-0">
            <div className="nova-glass-panel overflow-hidden rounded-2xl border border-amber-500/20">
              <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3">
                <div>
                  <p className="font-heading text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Nexus News checkout
                  </p>
                  <p className="text-[11px] text-zinc-500">Dark newsroom · demo gateway</p>
                </div>
                <p className="font-heading text-sm font-semibold text-amber-300">
                  {PLAN.price} <span className="text-xs text-zinc-500">{PLAN.cadence}</span>
                </p>
              </div>

              <div className="px-4 py-4">
                <div className="mb-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Plan
                  </p>
                  <p className="font-heading text-lg font-bold text-white">{PLAN.name}</p>
                </div>

                {phase === "form" && (
                  <>
                    <div className="mb-3 flex gap-2">
                      <button
                        type="button"
                        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                          method === METHOD_UPI
                            ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                            : "border-zinc-800 bg-zinc-950/50 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100"
                        }`}
                        onClick={() => setMethod(METHOD_UPI)}
                      >
                        <IndianRupee className="h-4 w-4 text-amber-400" />
                        Pay via UPI
                      </button>
                      <button
                        type="button"
                        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                          method === METHOD_CARD
                            ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                            : "border-zinc-800 bg-zinc-950/50 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100"
                        }`}
                        onClick={() => setMethod(METHOD_CARD)}
                      >
                        <CreditCard className="h-4 w-4 text-amber-400" />
                        Card
                      </button>
                    </div>

                    {method === METHOD_UPI && (
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-zinc-400">
                          UPI ID
                        </label>
                        <input
                          className="input-newsroom"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="name@bank"
                        />
                      </div>
                    )}

                    {method === METHOD_CARD && (
                      <div className="space-y-3">
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                            Card number
                          </label>
                          <input
                            className="input-newsroom"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="4242 4242 4242 4242"
                          />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                              Name on card
                            </label>
                            <input
                              className="input-newsroom"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                              placeholder="A. Reporter"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                              Expiry
                            </label>
                            <input
                              className="input-newsroom"
                              value={expiry}
                              onChange={(e) => setExpiry(e.target.value)}
                              placeholder="MM/YY"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                            CVV
                          </label>
                          <input
                            className="input-newsroom"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            placeholder="123"
                          />
                        </div>
                      </div>
                    )}

                    {error && (
                      <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                        {error}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handlePayNow}
                      className="btn-primary mt-5 w-full glow-amber gap-2"
                    >
                      <IndianRupee className="h-4 w-4" />
                      Pay Now
                    </button>
                    <p className="mt-3 text-xs text-zinc-600">
                      This is a mock gateway — card and UPI details never leave your browser.
                    </p>
                  </>
                )}

                {phase === "processing" && (
                  <div className="space-y-4 py-4">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
                      <div>
                        <p className="font-heading text-lg font-bold text-white">
                          Processing payment...
                        </p>
                        <p className="text-sm text-zinc-500">
                          Simulating bank response for your {PLAN.name} plan.
                        </p>
                      </div>
                    </div>
                    <div className="nova-processing-bar">
                      <div className="nova-processing-bar-fill" />
                    </div>
                  </div>
                )}

                {phase === "success" && (
                  <div className="space-y-3 py-4 text-center">
                    <p className="font-heading text-2xl font-bold text-emerald-300">
                      ✅ Payment Successful!
                    </p>
                    <p className="text-sm text-zinc-300">
                      Your{" "}
                      <span className="font-semibold text-amber-300">{PLAN.name}</span>{" "}
                      plan is now active. Redirecting you to the dashboard...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

