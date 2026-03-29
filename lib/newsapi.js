const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama3-8b-8192";

const NEWS_BASE = "https://newsapi.org/v2/top-headlines";

/**
 * Drop placeholder / broken items so the dashboard always has renderable cards.
 */
export function normalizeArticles(list) {
  return (list ?? []).filter((a) => {
    if (!a || typeof a.title !== "string") return false;
    const t = a.title.trim();
    if (!t || /^removed\s*$/i.test(t) || t.toLowerCase().includes("[removed]"))
      return false;
    if (!a.url || typeof a.url !== "string") return false;
    return true;
  });
}

async function fetchTopHeadlinesOnce({ key, query }) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v == null || v === "") continue;
    params.set(k, String(v));
  }

  const res = await fetch(`${NEWS_BASE}?${params}`, {
    headers: { "X-Api-Key": key },
    cache: "no-store",
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`NewsAPI error: ${res.status} ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    throw new Error(data?.message || `NewsAPI error: ${res.status} ${text.slice(0, 200)}`);
  }
  if (data.status !== "ok") {
    throw new Error(data.message || "NewsAPI returned an error");
  }

  return normalizeArticles(data.articles);
}

/**
 * Fetches top headlines (server-side only — uses NEWS_API_KEY).
 *
 * Developer/free tier often returns no results for some country + category pairs (e.g. IN + tech).
 * We try a short chain: country+category → country only → US+category → US only.
 */
export async function fetchTopHeadlines({
  category = "general",
  country = "us",
  pageSize = 24,
} = {}) {
  const key = process.env.NEWS_API_KEY;
  if (!key) {
    throw new Error("NEWS_API_KEY is not configured");
  }

  const cty = (country || "us").toLowerCase();
  const cat = (category || "general").toLowerCase();
  const hasCategory = cat && cat !== "general";

  /** @type {{ country?: string, category?: string }[]} */
  const strategies = [];

  if (hasCategory) {
    strategies.push({ country: cty, category: cat });
    strategies.push({ country: cty });
    if (cty !== "us") {
      strategies.push({ country: "us", category: cat });
      strategies.push({ country: "us" });
    }
  } else {
    strategies.push({ country: cty });
    if (cty !== "us") {
      strategies.push({ country: "us" });
    }
  }

  const seen = new Set();
  let lastMeta = { country: cty, category: hasCategory ? cat : null };

  for (const s of strategies) {
    const sig = JSON.stringify(s);
    if (seen.has(sig)) continue;
    seen.add(sig);

    const articles = await fetchTopHeadlinesOnce({
      key,
      query: { ...s, pageSize },
    });

    lastMeta = {
      country: s.country,
      category: s.category ?? null,
    };

    if (articles.length > 0) {
      const requestedCategoryParam = hasCategory ? cat : null;
      const usedFallback =
        s.country !== cty ||
        (s.category ?? null) !== (requestedCategoryParam ?? null);

      return {
        articles,
        meta: {
          requestedCountry: cty,
          requestedCategory: cat,
          effectiveCountry: s.country,
          effectiveCategory: s.category ?? null,
          usedFallback,
        },
      };
    }
  }

  return {
    articles: [],
    meta: {
      requestedCountry: cty,
      requestedCategory: cat,
      effectiveCountry: lastMeta.country,
      effectiveCategory: lastMeta.category,
      usedFallback: false,
    },
  };
}

async function groqChat(messages) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const res = await fetch(GROQ_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.4,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error: ${res.status} ${err}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  return typeof content === "string" ? content.trim() : "";
}

/**
 * Uses Groq to add a short AI summary line per article (batched for efficiency).
 */
export async function enrichArticlesWithGroqSummaries(
  articles,
  { maxItems = 8 } = {}
) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !articles?.length) {
    return articles.map((a) => ({ ...a, aiSummary: null }));
  }

  const slice = articles.slice(0, maxItems).map((a, i) => ({
    i,
    title: a.title,
    description: a.description || "",
    source: a.source?.name || "",
  }));

  const userPayload = JSON.stringify(slice);

  const raw = await groqChat([
    {
      role: "system",
      content:
        "You are a news desk editor. Given JSON items with i, title, description, source — return ONLY valid JSON: an array of {i, summary} where summary is at most 22 words, neutral tone. No markdown, no prose outside JSON.",
    },
    {
      role: "user",
      content: userPayload,
    },
  ]);

  let parsed = [];
  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw);
  } catch {
    return articles.map((a) => ({ ...a, aiSummary: null }));
  }

  const byIndex = new Map(parsed.map((p) => [p.i, p.summary]));

  return articles.map((a, idx) => ({
    ...a,
    aiSummary: idx < maxItems ? byIndex.get(idx) || null : null,
  }));
}

/**
 * Ask Groq for a single headline analysis (e.g. bias check or context).
 */
export async function analyzeArticleWithGroq({ title, description, url }) {
  const text = await groqChat([
    {
      role: "system",
      content:
        "You are Nova, a concise analyst for Nexus News. Give 2–3 short bullet points of context or what to watch. Plain text, no markdown headers.",
    },
    {
      role: "user",
      content: JSON.stringify({ title, description: description || "", url: url || "" }),
    },
  ]);
  return text;
}
