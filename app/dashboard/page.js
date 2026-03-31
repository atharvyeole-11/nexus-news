"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { NewsCard } from "@/components/NewsCard";
import { NovaFloatingPanel } from "@/components/NovaFloatingPanel";
import { Loader2, Crown, Calendar } from "lucide-react";
import { normalizeSubscriptionTier } from "@/lib/subscription";
import {
  LANGUAGE_EVENT,
  getLanguageMeta,
  getStoredLanguage,
  setStoredLanguage,
  tFor,
} from "@/lib/translations";

const CATEGORIES = [
  { id: "general", label: "General" },
  { id: "business", label: "Business" },
  { id: "technology", label: "Tech" },
  { id: "science", label: "Science" },
  { id: "health", label: "Health" },
  { id: "sports", label: "Sports" },
  { id: "entertainment", label: "Culture" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState("Free");
  const [accessToken, setAccessToken] = useState(null);
  const [articles, setArticles] = useState([]);
  const [newsMeta, setNewsMeta] = useState(null);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState("");
  const [category, setCategory] = useState("general");
  const [region, setRegion] = useState("us");
  const [enrich, setEnrich] = useState(true);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    setLanguage(getStoredLanguage());
    function onLang(event) {
      if (event?.detail?.language) setLanguage(event.detail.language);
      else setLanguage(getStoredLanguage());
    }
    function onStorage(e) {
      if (e.key === "nexus_language") setLanguage(getStoredLanguage());
    }
    window.addEventListener(LANGUAGE_EVENT, onLang);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(LANGUAGE_EVENT, onLang);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) {
        router.replace("/login");
        return;
      }
      if (!u.user_metadata?.onboarding_complete) {
        router.replace("/onboarding");
        return;
      }
      setUser(u);
      const cachedTier = sessionStorage.getItem("nexus_subscription_tier");
      if (cachedTier) setSubscriptionTier(normalizeSubscriptionTier(cachedTier));
      const r = u.user_metadata?.region;
      if (r) setRegion(r);
      const tops = u.user_metadata?.topics;
      if (Array.isArray(tops) && tops.length) {
        const map = {
          Technology: "technology",
          Business: "business",
          Science: "science",
          Sports: "sports",
          Health: "health",
          Culture: "entertainment",
          Politics: "general",
          World: "general",
        };
        const first = tops[0];
        if (map[first]) setCategory(map[first]);
      }
      setAuthLoading(false);
    });
  }, [router]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!cancelled) {
        setAccessToken(sessionData?.session?.access_token ?? null);
      }

      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("subscription_tier, language")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (!error && profile?.subscription_tier) {
        setSubscriptionTier(normalizeSubscriptionTier(profile.subscription_tier));
      } else {
        setSubscriptionTier("Free");
      }
      if (!error && profile?.language) {
        setStoredLanguage(profile.language);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;
    async function load() {
      setNewsLoading(true);
      setNewsError("");
      try {
        const q = new URLSearchParams({
          category,
          country: region,
          enrich: enrich ? "1" : "0",
        });
        const res = await fetch(`/api/news?${q}`);
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || "Failed to load");
        if (!cancelled) {
          setArticles(data.articles || []);
          setNewsMeta(data.meta ?? null);
        }
      } catch (e) {
        if (!cancelled) setNewsError(e.message);
      } finally {
        if (!cancelled) setNewsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, category, region, enrich]);

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const tr = (key) => tFor(language, key);
  const isRtl = getLanguageMeta(language).rtl;
  const tierStyles = {
    Free: "bg-zinc-700/60 text-zinc-200 border-zinc-600",
    Basic: "bg-sky-500/20 text-sky-300 border-sky-500/35",
    Premium: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    Pro: "bg-yellow-400/20 text-yellow-300 border-yellow-300/50 shadow-[0_0_24px_rgba(250,204,21,0.35)]",
  };

  return (
    <div className="newsroom-grain min-h-[calc(100vh-3.5rem)]" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-white">{tr("desk")}</h1>
            <div className="mt-2 flex items-center gap-3">
              <div className={`
                rounded-lg border px-3 py-2 text-sm font-medium
                ${subscriptionTier === "Free" 
                  ? "border-zinc-700 bg-zinc-800 text-zinc-300" 
                  : subscriptionTier === "Basic" 
                    ? "border-blue-500/30 bg-blue-500/10 text-blue-300" 
                    : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                }
              `}>
                <div className="flex items-center gap-2">
                  {subscriptionTier !== "Free" && (
                    <Crown className="h-4 w-4" />
                  )}
                  <span>
                    {subscriptionTier === "Free" ? "Free" : subscriptionTier === "Basic" ? "Basic" : "Premium"}
                  </span>
                </div>
                {subscriptionTier !== "Free" && (
                  <div className="text-xs opacity-75">
                    Expires: {new Date(user.subscription_end).toLocaleDateString()}
                  </div>
                )}
              </div>
              {subscriptionTier === "Free" && (
                <button
                  onClick={() => router.push("/subscribe")}
                  className="ml-3 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
                >
                  Upgrade
                </button>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {tr("signedInAs")}{" "}
              <span className="text-zinc-300">
                {user?.user_metadata?.display_name || user?.email}
              </span>
              <span className="text-zinc-600"> · </span>
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                  tierStyles[subscriptionTier] || tierStyles.Free
                }`}
              >
                {subscriptionTier}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-zinc-500">
              <input
                type="checkbox"
                checked={enrich}
                onChange={(e) => setEnrich(e.target.checked)}
                className="accent-amber-500"
              />
              AI summaries (Groq)
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
            >
              <option value="us">US</option>
              <option value="gb">UK</option>
              <option value="ca">CA</option>
              <option value="au">AU</option>
              <option value="in">IN</option>
              <option value="de">DE</option>
              <option value="fr">FR</option>
            </select>
          </div>
        </header>

        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  category === c.id
                    ? "bg-amber-500 text-zinc-950"
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                  {{
                    general: tr("general"),
                    business: tr("business"),
                    technology: tr("tech"),
                    science: tr("science"),
                    health: tr("health"),
                    sports: tr("sports"),
                    entertainment: tr("culture"),
                  }[c.id] || c.label}
              </button>
            ))}
          </div>

          {newsLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-amber-500/80" />
              <span className="ml-3 text-zinc-500">{tr("loading")}</span>
            </div>
          )}
          {newsError && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {newsError}
            </p>
          )}
          {!newsLoading && !newsError && newsMeta?.usedFallback && (
            <p className="mb-4 rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
              Your region or category had no headlines on the NewsAPI developer feed (common for
              non‑US countries like IN on the free tier). Showing top headlines for{" "}
              <strong className="text-amber-400">
                {String(newsMeta.effectiveCountry || "us").toUpperCase()}
              </strong>
              {newsMeta.effectiveCategory ? (
                <>
                  {" "}
                  · category:{" "}
                  <strong className="text-amber-400">{newsMeta.effectiveCategory}</strong>
                </>
              ) : null}
              .
            </p>
          )}
          {!newsLoading && !newsError && articles.length === 0 && (
            <p className="rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-8 text-center text-sm text-zinc-500">
              {tr("noArticles")}
            </p>
          )}
          {!newsLoading && !newsError && articles.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {articles.map((article, i) => (
                <NewsCard key={article.url || i} article={article} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      <NovaFloatingPanel
        articles={articles}
        accessToken={accessToken}
        subscriptionTier={subscriptionTier}
      />
    </div>
  );
}
