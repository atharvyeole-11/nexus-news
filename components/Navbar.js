"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { LANGUAGES, tFor, getStoredLanguage, setStoredLanguage } from "@/lib/translations";
import {
  Newspaper,
  Play,
  LayoutDashboard,
  LogOut,
  LogIn,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { supabase } from "@/lib/supabase";

export function Navbar() {
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState(() => getStoredLanguage());
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

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
    <>
      {/* Breaking News Ticker */}
      <div className="bg-[#C8102E] text-white py-2 overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="breaking-badge px-3 py-1 text-xs font-bold bg-[#FF1744] rounded-full">
            BREAKING
          </div>
          <div className="ticker-text whitespace-nowrap">
            Global markets surge as investors show renewed confidence in economic recovery • Climate summit reaches historic agreement • Tech giants report record quarterly earnings
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-[#0F0F0F] border-b border-[#2A2A2A] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="logo font-heading flex items-center gap-2 text-lg font-bold tracking-tight text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C8102E] text-white">
              <Newspaper className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-white">Nexus</span>
            <span className="text-[#C8102E]">News</span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/shorts"
              className="nav-link inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[#FFFFFF] transition"
            >
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Shorts</span>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`
                nav-link inline-flex items-center justify-center w-10 h-10 rounded-full transition-all
                ${theme === "dark" 
                  ? "bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]" 
                  : "bg-[#F0F0F0] text-yellow-500 hover:bg-[#E0E0E0]"
                }
              `}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Moon className="h-5 w-5 theme-toggle-icon" />
              ) : (
                <Sun className="h-5 w-5 theme-toggle-icon" />
              )}
            </button>

            <select
              value={language}
              onChange={(e) => {
                const next = e.target.value;
                setLanguage(next);
                setStoredLanguage(next);
              }}
              className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-1.5 text-xs text-[#FFFFFF] outline-none transition focus:border-[#C8102E] sm:text-sm"
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
                  className="nav-link inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[#FFFFFF] transition"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="nav-link inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[#FFFFFF] transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="btn-primary inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[#FFFFFF] transition"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
