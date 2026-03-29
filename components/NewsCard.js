"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, Sparkles } from "lucide-react";
import {
  getStoredLanguage,
  tFor,
  getLanguageMeta,
  LANGUAGE_EVENT,
} from "@/lib/translations";

export function NewsCard({ article, index = 0 }) {
  const {
    title,
    description,
    url,
    urlToImage,
    source,
    publishedAt,
    aiSummary,
  } = article;

  const [imageFailed, setImageFailed] = useState(false);
  const [translated, setTranslated] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [language, setLanguage] = useState("en");
  const tr = (key) => tFor(language, key);

  useEffect(() => {
    setLanguage(getStoredLanguage());
    function onLangChange(event) {
      if (event?.detail?.language) setLanguage(event.detail.language);
      else setLanguage(getStoredLanguage());
    }
    function onStorage(e) {
      if (e.key === "nexus_language") setLanguage(getStoredLanguage());
    }
    window.addEventListener(LANGUAGE_EVENT, onLangChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(LANGUAGE_EVENT, onLangChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const dateLabel = publishedAt
    ? formatDistanceToNow(new Date(publishedAt), { addSuffix: true })
    : "";

  const snippet =
    description && String(description).trim()
      ? description.trim()
      : "No snippet on the wire — open the article to read the full story.";

  const showImage = Boolean(urlToImage) && !imageFailed;

  async function handleTranslate() {
    if (language === "en" || translating) return;
    setTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `${title || ""}\n\n${snippet || ""}`,
          targetLanguage: language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Translation failed");
      const [translatedTitle, ...rest] = String(data.translatedText || "").split("\n\n");
      setTranslated({
        title: translatedTitle || title,
        description: rest.join("\n\n") || snippet,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setTranslating(false);
    }
  }

  return (
    <article
      className="card-news group flex flex-col overflow-hidden"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={urlToImage}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 px-4 text-center text-zinc-600">
            <Sparkles className="mb-2 h-10 w-10 opacity-30" />
            <span className="text-xs text-zinc-500">No image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-90" />
        {(source?.name || source?.id) && (
          <span className="absolute left-3 top-3 max-w-[85%] truncate rounded-md bg-black/55 px-2 py-0.5 text-xs font-medium text-amber-400 backdrop-blur-sm">
            {source.name || source.id}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="font-heading text-lg font-semibold leading-snug text-zinc-50 group-hover:text-amber-400/95">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-start gap-1"
          >
            {translated?.title || title}
            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 opacity-0 transition group-hover:opacity-70" />
          </a>
        </h2>

        {aiSummary && (
          <p className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs leading-relaxed text-amber-200/90">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
            <span className="font-semibold text-amber-400">{tr("aiSummary")}:</span>{" "}
            {aiSummary}
          </p>
        )}

        <p className="line-clamp-4 text-sm leading-relaxed text-zinc-400">
          {translated?.description || snippet}
        </p>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleTranslate}
            disabled={language === "en" || translating}
            className="rounded-md border border-zinc-800 px-2 py-1 text-xs text-zinc-400 transition hover:border-amber-500/40 hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {translating ? `${tr("loading")}` : tr("translate")}
          </button>
          {translated && (
            <span className="text-[11px] text-zinc-500">
              {getLanguageMeta(language).nativeLabel}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-zinc-600">
          <time dateTime={publishedAt}>{dateLabel}</time>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 transition hover:text-amber-400"
            >
              {tr("readSource")}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
