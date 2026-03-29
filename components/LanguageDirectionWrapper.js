"use client";

import { useEffect, useState } from "react";
import { LANGUAGE_EVENT, getLanguageMeta, getStoredLanguage } from "@/lib/translations";

export function LanguageDirectionWrapper({ children }) {
  const [language, setLanguage] = useState(() => getStoredLanguage());

  useEffect(() => {
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

  const isRtl = getLanguageMeta(language).rtl;
  return <div dir={isRtl ? "rtl" : "ltr"}>{children}</div>;
}

