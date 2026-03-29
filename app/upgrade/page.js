"use client";

import Link from "next/link";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Basic",
    price: "₹99",
    cadence: "/month",
    blurb: "Unlock NOVA image generation for your desk.",
    perks: ["💬 NOVA Chat", "🖼️ News image generation (Gemini)"],
  },
  {
    name: "Premium",
    price: "₹299",
    cadence: "/month",
    blurb: "Full creator workflow for short-form news video.",
    perks: [
      "Everything in Basic",
      "🎬 60s Hindi/English video scripts",
      "Suggested visuals per beat",
    ],
    highlight: true,
  },
];

export default function UpgradePage() {
  return (
    <div className="newsroom-grain min-h-[calc(100vh-3.5rem)] px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">Upgrade NOVA</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-500">
          Tiers are enforced via <code className="text-amber-600">user_profiles.subscription_tier</code>{" "}
          in Supabase. Set your tier in the table to test Basic or Premium.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`card-news flex flex-col p-6 ${
              plan.highlight ? "ring-2 ring-amber-500/40" : ""
            }`}
          >
            {plan.highlight && (
              <span className="mb-3 inline-block w-fit rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                Most complete
              </span>
            )}
            <h2 className="font-heading text-xl font-bold text-white">{plan.name}</h2>
            <p className="mt-1 text-sm text-zinc-500">{plan.blurb}</p>
            <p className="mt-4 font-heading text-3xl font-bold text-amber-400">
              {plan.price}
              <span className="text-sm font-normal text-zinc-500">{plan.cadence}</span>
            </p>
            <ul className="mt-6 flex-1 space-y-2 text-left text-sm text-zinc-300">
              {plan.perks.map((p) => (
                <li key={p} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  {p}
                </li>
              ))}
            </ul>
            <Link href="/dashboard" className="btn-primary mt-8 w-full">
              Back to desk
            </Link>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-xl text-center text-xs text-zinc-600">
        Billing integration is not wired yet — this page is a clear upgrade path from NOVA lock
        screens. Add <strong className="text-zinc-400">GEMINI_API_KEY</strong> for images and{" "}
        <strong className="text-zinc-400">GROQ_API_KEY</strong> for scripts.
      </p>
    </div>
  );
}
