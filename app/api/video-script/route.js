import { NextResponse } from "next/server";
import { getUserSubscriptionTier } from "@/lib/supabase-route";
import { normalizeSubscriptionTier, tierCanUseVideoScript } from "@/lib/subscription";

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function POST(request) {
  try {
    const { tier, userId } = await getUserSubscriptionTier(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!tierCanUseVideoScript(normalizeSubscriptionTier(tier))) {
      return NextResponse.json(
        { error: "Video scripts require Premium or Pro." },
        { status: 403 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const article = body.article || {};
    const title = String(article.title || "").trim();
    const description = String(article.description || "").trim();
    const url = String(article.url || "").trim();

    if (!title) {
      return NextResponse.json({ error: "article.title is required" }, { status: 400 });
    }

    const userContent = JSON.stringify(
      { title, description: description || null, url: url || null },
      null,
      0
    );

    const res = await fetch(GROQ_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.75,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You write punchy ~60 second vertical video scripts for Indian digital news (energetic mix of Hindi and English, code-mixing natural for youth news). Output ONLY valid JSON with this exact shape (no markdown):
{
  "paragraphs": [
    { "narration": "string — one spoken beat", "visual": "string — suggested B-roll / graphic / shot" }
  ],
  "fullScript": "string — entire script as one block for teleprompter"
}
Use 4–7 paragraphs. Visuals must be concrete (e.g. maps, charts, crowd shots, anchor desk). Stay factual; no invented quotes.`,
          },
          {
            role: "user",
            content: `Base the script on this article JSON:\n${userContent}`,
          },
        ],
      }),
    });

    const rawText = await res.text();
    let json;
    try {
      json = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { error: `Groq error: ${res.status}`, detail: rawText.slice(0, 500) },
        { status: 502 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: json?.error?.message || `Groq error: ${res.status}`, detail: json },
        { status: 502 }
      );
    }

    const reply = json.choices?.[0]?.message?.content;
    if (typeof reply !== "string") {
      return NextResponse.json({ error: "Empty Groq response" }, { status: 502 });
    }

    let replyText = reply.trim();
    if (replyText.startsWith("```")) {
      replyText = replyText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    }

    let parsed;
    try {
      parsed = JSON.parse(replyText);
    } catch {
      return NextResponse.json(
        { error: "Model did not return valid JSON", raw: reply.slice(0, 800) },
        { status: 502 }
      );
    }

    return NextResponse.json({
      paragraphs: Array.isArray(parsed.paragraphs) ? parsed.paragraphs : [],
      fullScript: typeof parsed.fullScript === "string" ? parsed.fullScript : "",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || "Video script request failed" },
      { status: 500 }
    );
  }
}
