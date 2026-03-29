"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bot,
  X,
  Send,
  Loader2,
  Lock,
  Download,
  Copy,
  Check,
} from "lucide-react";
import {
  normalizeSubscriptionTier,
  tierCanUseImage,
  tierCanUseVideoScript,
} from "@/lib/subscription";
import { getStoredLanguage, LANGUAGE_EVENT, tFor } from "@/lib/translations";

const authHeaders = (token) =>
  token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };

export function NovaFloatingPanel({ articles = [], accessToken, subscriptionTier = "Free" }) {
  const tier = normalizeSubscriptionTier(subscriptionTier);
  const canImage = tierCanUseImage(tier);
  const canVideo = tierCanUseVideoScript(tier);

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("chat");

  const panelRef = useRef(null);
  const fabRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "I'm Nova. Ask about today's wire, compare angles on your feed, or get a tighter brief — I can see your current headlines when you chat.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [novaLoading, setNovaLoading] = useState(false);
  const chatBottomRef = useRef(null);

  const [imagePrompt, setImagePrompt] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageResult, setImageResult] = useState(null);
  const [imageMime, setImageMime] = useState("image/png");
  const [imageErr, setImageErr] = useState("");

  const [articleIndex, setArticleIndex] = useState(0);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [videoErr, setVideoErr] = useState("");
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState("en");

  const newsContext = (articles || []).slice(0, 12).map((a) => {
    const src = a.source?.name || "Source";
    const desc = a.description ? ` — ${String(a.description).slice(0, 140)}` : "";
    return `${a.title} (${src})${desc}`;
  });

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
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, tab]);

  useEffect(() => {
    if (!open) return;
    function handleMouse(e) {
      if (panelRef.current?.contains(e.target)) return;
      if (fabRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleMouse);
    return () => document.removeEventListener("mousedown", handleMouse);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const sendChat = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || novaLoading) return;
    setChatInput("");
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setNovaLoading(true);
    try {
      const res = await fetch("/api/nova", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsContext,
          selectedLanguage: language,
          messages: next.slice(-12).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Nova failed");
      setMessages([...next, { role: "assistant", content: data.reply || "" }]);
    } catch (e) {
      setMessages([...next, { role: "assistant", content: `Sorry — ${e.message}` }]);
    } finally {
      setNovaLoading(false);
    }
  }, [chatInput, messages, novaLoading, newsContext, language]);

  async function runImage() {
    const prompt = imagePrompt.trim();
    if (!prompt || imageLoading) return;
    if (!accessToken) {
      setImageErr("Session expired — sign in again.");
      return;
    }
    setImageErr("");
    setImageResult(null);
    setImageLoading(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: authHeaders(accessToken),
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image generation failed");
      setImageResult(data.imageBase64);
      setImageMime(data.mimeType || "image/png");
    } catch (e) {
      setImageErr(e.message);
    } finally {
      setImageLoading(false);
    }
  }

  function downloadImage() {
    if (!imageResult) return;
    const blob = base64ToBlob(imageResult, imageMime);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nova-news-${Date.now()}.${imageMime.includes("jpeg") ? "jpg" : "png"}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function runVideoScript() {
    if (!articles.length || videoLoading) return;
    if (!accessToken) {
      setVideoErr("Session expired — sign in again.");
      return;
    }
    const article = articles[Math.min(articleIndex, articles.length - 1)];
    setVideoErr("");
    setVideoData(null);
    setVideoLoading(true);
    try {
      const res = await fetch("/api/video-script", {
        method: "POST",
        headers: authHeaders(accessToken),
        body: JSON.stringify({
          article: {
            title: article.title,
            description: article.description,
            url: article.url,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Script failed");
      setVideoData({
        paragraphs: data.paragraphs || [],
        fullScript: data.fullScript || "",
      });
    } catch (e) {
      setVideoErr(e.message);
    } finally {
      setVideoLoading(false);
    }
  }

  async function copyScript() {
    if (!videoData?.fullScript) return;
    try {
      await navigator.clipboard.writeText(videoData.fullScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setVideoErr("Could not copy to clipboard.");
    }
  }

  useEffect(() => {
    if (articles.length && articleIndex >= articles.length) {
      setArticleIndex(0);
    }
  }, [articles, articleIndex]);

  const tr = (key) => tFor(language, key);

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        aria-label="Open NOVA AI"
        onClick={() => setOpen((o) => !o)}
        className="nova-fab-glow nova-fab-pulse fixed z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-zinc-950 ring-2 ring-amber-300/60 transition hover:scale-105 hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/50"
        style={{ right: "24px", bottom: "24px" }}
      >
        <Bot className="h-7 w-7" strokeWidth={2.25} />
      </button>

      {open && (
        <div
          ref={panelRef}
          className="nova-glass-panel fixed z-[95] flex max-h-[min(72vh,640px)] w-[min(calc(100vw-32px),440px)] flex-col overflow-hidden rounded-2xl shadow-2xl shadow-black/60"
          style={{
            right: "24px",
            bottom: "calc(24px + 56px + 12px)",
          }}
          role="dialog"
          aria-modal="true"
          aria-label="NOVA AI"
        >
          <div className="flex items-center justify-between border-b border-zinc-800/90 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="font-heading text-sm font-bold text-white">NOVA AI</p>
                <p className="text-[11px] text-zinc-500">
                  Plan: <span className="text-amber-500/90">{tier}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex shrink-0 gap-0 border-b border-zinc-800/80 px-2">
            {[
              { id: "chat", label: "💬 Chat" },
              { id: "image", label: "🖼️ Image" },
              { id: "video", label: "🎬 Video" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`relative flex-1 px-2 py-3 text-center text-xs font-semibold sm:text-sm ${
                  tab === t.id ? "text-amber-400" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {t.label}
                {tab === t.id && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-amber-500" />
                )}
              </button>
            ))}
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto">
            {tab === "chat" && (
              <div className="flex h-[min(56vh,520px)] flex-col">
                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}
                    >
                      {m.role === "assistant" && (
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500">
                          <Bot className="h-4 w-4" />
                        </span>
                      )}
                      <div
                        className={`max-w-[90%] rounded-xl px-3 py-2 leading-relaxed ${
                          m.role === "user"
                            ? "bg-amber-500/20 text-amber-50"
                            : "bg-zinc-900/90 text-zinc-300"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      </div>
                    </div>
                  ))}
                  {novaLoading && (
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Nova is thinking…
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>
                <form
                  className="border-t border-zinc-800/90 p-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendChat();
                  }}
                >
                  <div className="flex gap-2">
                    <input
                      className="input-newsroom flex-1 !py-2"
                      placeholder={tr("askNova")}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button type="submit" disabled={novaLoading} className="btn-primary !px-3">
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {tab === "image" && (
              <div className="relative px-4 py-4">
                {!canImage && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-zinc-950/85 px-6 text-center backdrop-blur-sm">
                    <Lock className="h-10 w-10 text-amber-500" />
                    <p className="text-sm font-medium text-zinc-200">
                      🔒 Upgrade to Basic ₹99/month to generate news images
                    </p>
                    <Link href="/upgrade" className="btn-primary text-sm">
                      Upgrade Now
                    </Link>
                  </div>
                )}
                <div className={!canImage ? "pointer-events-none opacity-40" : ""}>
                  <label className="mb-2 block text-xs font-medium text-zinc-400">
                    Describe the news image to generate
                  </label>
                  <textarea
                    className="input-newsroom mb-3 min-h-[88px] resize-y"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="e.g. Crowds at India Gate at dusk, news broadcast style…"
                  />
                  <button
                    type="button"
                    onClick={runImage}
                    disabled={imageLoading || !canImage}
                    className="btn-primary w-full gap-2"
                  >
                    {imageLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating…
                      </>
                    ) : (
                      "Generate"
                    )}
                  </button>
                  {imageErr && (
                    <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                      {imageErr}
                    </p>
                  )}
                  {imageResult && (
                    <div className="mt-4 space-y-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`data:${imageMime};base64,${imageResult}`}
                        alt="Generated"
                        className="max-h-64 w-full rounded-lg border border-zinc-800 object-contain"
                      />
                      <button
                        type="button"
                        onClick={downloadImage}
                        className="btn-ghost w-full gap-2 border-amber-500/30 text-amber-400"
                      >
                        <Download className="h-4 w-4" />
                        Download image
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === "video" && (
              <div className="relative px-4 py-4">
                {!canVideo && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-zinc-950/85 px-6 text-center backdrop-blur-sm">
                    <Lock className="h-10 w-10 text-amber-500" />
                    <p className="text-sm font-medium text-zinc-200">
                      🔒 Upgrade to Premium ₹299/month for AI video scripts
                    </p>
                    <Link href="/upgrade" className="btn-primary text-sm">
                      Upgrade Now
                    </Link>
                  </div>
                )}
                <div className={!canVideo ? "pointer-events-none opacity-40" : ""}>
                  <label className="mb-2 block text-xs font-medium text-zinc-400">
                    News article from current feed
                  </label>
                  <select
                    className="input-newsroom mb-3"
                    value={String(Math.min(articleIndex, Math.max(0, articles.length - 1)))}
                    onChange={(e) => setArticleIndex(Number(e.target.value))}
                    disabled={!articles.length}
                  >
                    {articles.length === 0 ? (
                      <option value={0}>No articles loaded</option>
                    ) : (
                      articles.map((a, i) => (
                        <option key={a.url || i} value={i}>
                          {(a.title || "Untitled").slice(0, 72)}
                          {(a.title || "").length > 72 ? "…" : ""}
                        </option>
                      ))
                    )}
                  </select>
                  <button
                    type="button"
                    onClick={runVideoScript}
                    disabled={videoLoading || !articles.length || !canVideo}
                    className="btn-primary w-full gap-2"
                  >
                    {videoLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Writing script…
                      </>
                    ) : (
                      "Generate 60-second video script"
                    )}
                  </button>
                  {videoErr && (
                    <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                      {videoErr}
                    </p>
                  )}
                  {videoData && (
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                          Script
                        </span>
                        <button
                          type="button"
                          onClick={copyScript}
                          className="btn-ghost !py-1.5 !text-xs gap-1.5"
                        >
                          {copied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {copied ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm leading-relaxed text-zinc-300">
                        {videoData.fullScript}
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                          Beats & suggested visuals
                        </p>
                        {(videoData.paragraphs || []).map((p, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3 text-sm"
                          >
                            <p className="font-medium text-amber-200/90">
                              {p.narration || "—"}
                            </p>
                            <p className="mt-2 text-xs text-zinc-500">
                              <span className="text-amber-600/90">Visual:</span>{" "}
                              {p.visual || "—"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function base64ToBlob(b64, mime) {
  const byteChars = atob(b64);
  const bytes = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    bytes[i] = byteChars.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime || "image/png" });
}
