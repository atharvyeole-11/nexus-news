"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Newspaper, X, CreditCard, IndianRupee, Banknote, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { normalizeSubscriptionTier } from "@/lib/subscription";

const METHOD_UPI = "upi";
const METHOD_CARD = "card";
const METHOD_NETBANKING = "netbanking";

export function FakePaymentModal({ open, onClose, plan }) {
  const router = useRouter();
  const [method, setMethod] = useState(METHOD_UPI);

  const [upiId, setUpiId] = useState("name@bank");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [bank, setBank] = useState("HDFC Bank");
  const [netAccount, setNetAccount] = useState("");

  const [phase, setPhase] = useState("form"); // form | processing | success
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    // Reset form state when modal opens
    const resetForm = () => {
      setPhase("form");
      setError("");
      setMethod(METHOD_UPI);
    };
    resetForm();
  }, [open]);

  const tier = normalizeSubscriptionTier(plan?.name);

  const confetti = useMemo(() => {
    if (phase !== "success") return [];
    // Use a simple deterministic approach based on phase
    return Array.from({ length: 44 }).map((_, i) => {
      const seed = i * 7; // Simple deterministic seed
      const left = ((seed * 9) % 100);
      const delay = ((seed * 13) % 400);
      const duration = 1200 + ((seed * 17) % 900);
      const rot = ((seed * 23) % 360);
      const size = 6 + ((seed * 29) % 10);
      const colors = ["#f59e0b", "#fbbf24", "#fb7185", "#60a5fa", "#34d399", "#a78bfa", "#22c55e"];
      const color = colors[i % colors.length];
      return { left, delay, duration, rot, size, color, i };
    });
  }, [phase]);

  async function updateSubscription() {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) throw new Error("Not signed in.");

    const { error: upsertErr } = await supabase
      .from("user_profiles")
      .upsert(
        {
          id: userData.user.id,
          subscription_tier: tier,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (upsertErr) throw upsertErr;

    // Used by dashboard for instant UI.
    sessionStorage.setItem("nexus_subscription_tier", tier);
  }

  async function handlePayNow() {
    setError("");
    setPhase("processing");

    // Fake processing time.
    await new Promise((r) => setTimeout(r, 2000));

    try {
      await updateSubscription();
      setPhase("success");
    } catch (e) {
      console.error(e);
      setError(e?.message || "Payment succeeded but DB update failed.");
      setPhase("form");
    }
  }

  if (!open) return null;

  const PLAN_PRICE = plan?.price ?? "";

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          if (phase === "form") onClose?.();
        }}
      />

      <div className="relative w-full max-w-lg px-4 pb-6 sm:pb-0">
        <div className="nova-glass-panel overflow-hidden rounded-2xl border border-amber-500/15">
          <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                <Newspaper className="h-5 w-5" />
              </span>
              <div>
                <p className="font-heading text-sm font-bold text-white">Nexus News</p>
                <p className="text-[11px] text-zinc-500">Secure checkout (demo)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onClose?.()}
              className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-white disabled:opacity-40"
              disabled={phase !== "form"}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-4 py-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Selected plan</p>
                <h2 className="font-heading text-xl font-bold text-white">
                  {tier}
                  <span className="ml-2 text-sm font-semibold text-amber-400">{PLAN_PRICE}</span>
                </h2>
              </div>
              <div className="hidden rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-right sm:block">
                <p className="text-xs text-zinc-500">Instant unlock</p>
                <p className="text-sm font-semibold text-amber-300">Chat + Tools</p>
              </div>
            </div>

            {phase === "form" && (
              <>
                <div className="mb-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                      method === METHOD_UPI
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                        : "border-zinc-800 bg-zinc-950/50 text-zinc-300 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                    onClick={() => setMethod(METHOD_UPI)}
                  >
                    <span className="text-amber-400">Pay via UPI</span>
                  </button>

                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                      method === METHOD_CARD
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                        : "border-zinc-800 bg-zinc-950/50 text-zinc-300 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                    onClick={() => setMethod(METHOD_CARD)}
                  >
                    <CreditCard className="h-4 w-4 text-amber-400" />
                    Card
                  </button>

                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                      method === METHOD_NETBANKING
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                        : "border-zinc-800 bg-zinc-950/50 text-zinc-300 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                    onClick={() => setMethod(METHOD_NETBANKING)}
                  >
                    <Banknote className="h-4 w-4 text-amber-400" />
                    Net banking
                  </button>
                </div>

                {method === METHOD_UPI && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-zinc-400">UPI ID</label>
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
                      <label className="mb-1.5 block text-xs font-medium text-zinc-400">Card number</label>
                      <input
                        className="input-newsroom"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-zinc-400">Name on card</label>
                        <input
                          className="input-newsroom"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="A. Reporter"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-zinc-400">Expiry</label>
                        <input
                          className="input-newsroom"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          placeholder="MM/YY"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-zinc-400">CVV</label>
                      <input
                        className="input-newsroom"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                      />
                    </div>
                  </div>
                )}

                {method === METHOD_NETBANKING && (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-zinc-400">Bank</label>
                      <select
                        className="input-newsroom"
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                      >
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>SBI</option>
                        <option>Axis Bank</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-zinc-400">Account (demo)</label>
                      <input
                        className="input-newsroom"
                        value={netAccount}
                        onChange={(e) => setNetAccount(e.target.value)}
                        placeholder="••••••••"
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
                  aria-label="Pay now"
                >
                  <IndianRupee className="h-4 w-4" />
                  Pay Now
                </button>

                <p className="mt-3 text-xs text-zinc-600">
                  Demo checkout only. Your payment method details are not sent anywhere.
                </p>
              </>
            )}

            {phase === "processing" && (
              <div className="space-y-4 py-3">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
                  <div>
                    <p className="font-heading text-lg font-bold text-white">Processing payment...</p>
                    <p className="text-sm text-zinc-500">Hold on, we’re activating your NOVA tools.</p>
                  </div>
                </div>

                <div className="nova-processing-bar">
                  <div className="nova-processing-bar-fill" />
                </div>

                <p className="text-xs text-zinc-600">Simulated gateway delay: 2 seconds</p>
              </div>
            )}

            {phase === "success" && (
              <div className="relative px-1 pb-2 pt-3">
                <div className="confetti-container" aria-hidden />
                {confetti.length > 0 && (
                  <div className="confetti-container pointer-events-none absolute inset-0">
                    {confetti.map((c) => (
                      <span
                        key={c.i}
                        className="confetti-piece"
                        style={{
                          left: `${c.left}%`,
                          width: `${c.size}px`,
                          height: `${Math.max(4, c.size * 0.55)}px`,
                          backgroundColor: c.color,
                          animationDelay: `${c.delay}ms`,
                          animationDuration: `${c.duration}ms`,
                          transform: `rotate(${c.rot}deg)`,
                        }}
                      />
                    ))}
                  </div>
                )}

                <div className="relative z-10 space-y-3 text-center">
                  <p className="font-heading text-2xl font-bold text-emerald-300">✅ Payment Successful!</p>
                  <p className="text-sm text-zinc-300">
                    Your <span className="font-semibold text-amber-300">{tier}</span> plan is now active!
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTimeout(() => router.push("/dashboard"), 50);
                      router.refresh();
                    }}
                    className="btn-primary w-full glow-amber gap-2"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Icons used but not shown: Sparkles just for bundle size consistency */}
      <span className="hidden">
        <CreditCard />
        <Banknote />
        <IndianRupee />
      </span>
    </div>
  );
}

