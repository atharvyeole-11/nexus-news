"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Newspaper, LogOut, LayoutDashboard, LogIn, Play } from "lucide-react";
import {
  LANGUAGES,
  getStoredLanguage,
  setStoredLanguage,
  tFor,
} from "@/lib/translations";

export function Navbar() {
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState(() => getStoredLanguage());
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function onLangChange(event) {
      if (event?.detail?.language) setLanguage(event.detail.language);
      else setLanguage(getStoredLanguage());
    }
    function onStorage(e) {
      if (e.key === "nexus_language") setLanguage(getStoredLanguage());
    }
    window.addEventListener("nexus-language-change", onLangChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("nexus-language-change", onLangChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const tr = (key) => tFor(language, key);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-heading flex items-center gap-2 text-lg font-bold tracking-tight text-zinc-100"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
            <Newspaper className="h-4 w-4" aria-hidden />
          </span>
          Nexus News
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/shorts"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-800/80 hover:text-amber-400"
          >
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Shorts</span>
          </Link>

          <select
            value={language}
            onChange={(e) => {
              const next = e.target.value;
              setLanguage(next);
              setStoredLanguage(next);
            }}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-300 outline-none transition focus:border-amber-500/50 sm:text-sm"
            aria-label="Language"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.nativeLabel}
              </option>
            ))}
          </select>

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-800/80 hover:text-amber-400"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">{tr("dashboard")}</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-zinc-800/80 hover:text-zinc-100"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{tr("signOut")}</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="btn-primary gap-2 !py-2 !text-sm"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
