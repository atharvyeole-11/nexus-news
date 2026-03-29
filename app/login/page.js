"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { setStoredLanguage } from "@/lib/translations";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
        });
        if (err) throw err;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("language")
          .eq("id", user.id)
          .maybeSingle();
        if (profile?.language) {
          setStoredLanguage(profile.language);
        }
      }
      if (user?.user_metadata?.onboarding_complete) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
      router.refresh();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="newsroom-grain flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="card-news glow-amber w-full max-w-md p-8">
        <h1 className="font-heading text-2xl font-bold text-white">Sign in to Nexus</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Use your email and password. New here? Create an account on the same form.
        </p>

        <div className="mt-6 flex rounded-lg border border-zinc-800 bg-zinc-950/80 p-1">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              mode === "signin"
                ? "bg-amber-500 text-zinc-950"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              mode === "signup"
                ? "bg-amber-500 text-zinc-950"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-newsroom"
              placeholder="you@newsroom.dev"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-newsroom"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Working…
              </>
            ) : mode === "signin" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          <Link href="/" className="text-amber-500 hover:text-amber-400">
            ← Back home
          </Link>
        </p>
      </div>
    </div>
  );
}
