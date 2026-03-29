import { NextResponse } from "next/server";
import {
  normalizeArticles,
  enrichArticlesWithGroqSummaries,
} from "@/lib/newsapi";

const DEFAULT_QUERY = "India business economy";

const QUERY_BY_CATEGORY = {
  general: "India news today",
  business: "India business economy stocks",
  technology: "India technology startup",
  science: "India science research",
  health: "India health medical",
  sports: "India cricket sports",
  entertainment: "India culture entertainment Bollywood",
};

function queryForCategory(category) {
  const key = (category || "general").toLowerCase();
  return QUERY_BY_CATEGORY[key] ?? DEFAULT_QUERY;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "general";
    const country = searchParams.get("country") || "us";
    const enrich = searchParams.get("enrich") !== "0";

    const key = process.env.NEWS_API_KEY;
    if (!key) {
      return NextResponse.json(
        { ok: false, error: "NEWS_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const q = queryForCategory(category);
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      q
    )}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${key}`;

    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    if (!res.ok || data.status === "error") {
      throw new Error(data.message || `NewsAPI error: ${res.status}`);
    }

    const articles = normalizeArticles(data.articles ?? []);

    let withAi = articles.map((a) => ({ ...a, aiSummary: null }));
    if (enrich && articles.length > 0) {
      try {
        withAi = await enrichArticlesWithGroqSummaries(articles, { maxItems: 8 });
      } catch (groqErr) {
        console.error("Groq enrichment failed, returning articles without AI:", groqErr);
        withAi = articles.map((a) => ({ ...a, aiSummary: null }));
      }
    }

    return NextResponse.json({
      ok: true,
      category,
      country,
      articles: withAi,
      meta: {
        query: q,
        endpoint: "everything",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: e.message || "Failed to load news" },
      { status: 500 }
    );
  }
}
