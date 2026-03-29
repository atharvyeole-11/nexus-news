import { NextResponse } from "next/server";

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const LANGUAGE_NAMES = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
  ta: "Tamil",
  te: "Telugu",
  bn: "Bengali",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
  or: "Odia",
  ur: "Urdu",
};

export async function POST(request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY is not configured" }, { status: 500 });
    }

    const body = await request.json();
    const text = String(body.text || "").trim();
    const targetLanguage = String(body.targetLanguage || "en").toLowerCase();
    const languageName = LANGUAGE_NAMES[targetLanguage] || "English";

    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }
    if (targetLanguage === "en") {
      return NextResponse.json({ translatedText: text });
    }

    const res = await fetch(GROQ_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are a professional translator for Indian news. Translate the input faithfully and naturally. Keep company names, numbers, percentages, currencies, stock tickers, and symbols in English exactly as-is. Return only translated text.",
          },
          {
            role: "user",
            content: `Translate to ${languageName}:\n\n${text}`,
          },
        ],
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: `Groq error: ${res.status}`, detail: json },
        { status: 502 }
      );
    }

    const translatedText = json.choices?.[0]?.message?.content?.trim() || text;
    return NextResponse.json({ translatedText });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Translate failed" }, { status: 500 });
  }
}

