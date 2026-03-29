import { NextResponse } from "next/server";
import { getUserSubscriptionTier } from "@/lib/supabase-route";
import { normalizeSubscriptionTier, tierCanUseImage } from "@/lib/subscription";

const GEMINI_MODEL = "gemini-2.0-flash-exp-image-generation";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function POST(request) {
  try {
    const { tier } = await getUserSubscriptionTier(request);
    if (!tierCanUseImage(normalizeSubscriptionTier(tier))) {
      return NextResponse.json(
        { error: "Image generation requires Basic, Premium, or Pro." },
        { status: 403 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const res = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Editorial news illustration, clear and professional, no text overlay, safe for broadcast: ${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg =
        data?.error?.message ||
        (typeof data?.error === "string" ? data.error : null) ||
        `Gemini error: ${res.status}`;
      return NextResponse.json({ error: msg, detail: data }, { status: 502 });
    }

    const parts = data.candidates?.[0]?.content?.parts ?? [];
    let imageBase64 = null;
    let mimeType = "image/png";

    for (const part of parts) {
      const inline = part.inlineData || part.inline_data;
      if (inline?.data) {
        imageBase64 = inline.data;
        mimeType = inline.mimeType || inline.mime_type || "image/png";
        break;
      }
    }

    if (!imageBase64) {
      return NextResponse.json(
        {
          error: "No image bytes returned from Gemini. Try a different prompt.",
          detail: data,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      imageBase64,
      mimeType,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || "Gemini request failed" },
      { status: 500 }
    );
  }
}
