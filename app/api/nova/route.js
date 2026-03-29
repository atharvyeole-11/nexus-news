import { NextResponse } from "next/server";

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const LANGUAGE_PROMPTS = {
  hi: "Respond only in Hindi using Devanagari script. Keep stock names in English.",
  mr: "Respond only in Marathi using Devanagari script. Keep stock names in English.",
  ta: "Respond only in Tamil script. Keep stock names in English.",
  te: "Respond only in Telugu script. Keep stock names in English.",
  bn: "Respond only in Bengali script. Keep stock names in English.",
  gu: "Respond only in Gujarati script. Keep stock names in English.",
  kn: "Respond only in Kannada script. Keep stock names in English.",
  ml: "Respond only in Malayalam script. Keep stock names in English.",
  pa: "Respond only in Punjabi Gurmukhi script. Keep stock names in English.",
  or: "Respond only in Odia script. Keep stock names in English.",
  ur: "Respond only in Urdu script (right to left). Keep stock names in English.",
};

export async function POST(request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const newsContext = Array.isArray(body.newsContext) ? body.newsContext : [];
    const selectedLanguage = String(body.selectedLanguage || "en").toLowerCase();

    let systemContent =
      "You are Nova, the Nexus News assistant. Be concise, factual, and helpful. Prefer short paragraphs or bullet points when listing items. If asked about live news, remind the user headlines are from NewsAPI and may lag real time. When the user asks about the current feed, use the headline list below as grounding context (summaries may be incomplete).";

    if (newsContext.length > 0) {
      const lines = newsContext
        .slice(0, 15)
        .map((line, i) => `${i + 1}. ${String(line)}`);
      systemContent += `\n\nDashboard wire (headlines / snippets):\n${lines.join("\n")}`;
    }
    if (LANGUAGE_PROMPTS[selectedLanguage]) {
      systemContent += `\n\nLanguage instruction: ${LANGUAGE_PROMPTS[selectedLanguage]}`;
    }

    const res = await fetch(GROQ_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.5,
        messages: [
          {
            role: "system",
            content: systemContent,
          },
          ...messages.filter((m) => m && (m.role === "user" || m.role === "assistant")),
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Groq error: ${res.status}`, detail: errText },
        { status: 502 }
      );
    }

    const json = await res.json();
    const reply = json.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ reply });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || "Nova request failed" },
      { status: 500 }
    );
  }
}
