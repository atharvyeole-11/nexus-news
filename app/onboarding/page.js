"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { LANGUAGES, getStoredLanguage, setStoredLanguage } from "@/lib/translations";

const TOPICS = [
  "Politics",
  "Business",
  "Technology",
  "Science",
  "Health",
  "Sports",
  "Culture",
  "World",
];

const STEPS = 6;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [topics, setTopics] = useState([]);
  const [region, setRegion] = useState("us");
  const [digest, setDigest] = useState("daily");
  const [bio, setBio] = useState("");
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      if (user.user_metadata?.onboarding_complete) {
        router.replace("/dashboard");
        return;
      }
      setDisplayName(user.user_metadata?.display_name || user.email?.split("@")[0] || "");
      setLanguage(getStoredLanguage());
      setLoading(false);
    });
  }, [router]);

  function toggleTopic(t) {
    setTopics((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  async function finish() {
    setSaving(true);
    const { data: authData } = await supabase.auth.getUser();
    const { error } = await supabase.auth.updateUser({
      data: {
        onboarding_complete: true,
        display_name: displayName.trim(),
        role: role.trim(),
        topics,
        region,
        digest,
        bio: bio.trim(),
        language,
      },
    });
    if (!error && authData?.user?.id) {
      const { error: profileError } = await supabase.from("user_profiles").upsert(
        {
          id: authData.user.id,
          language,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
      if (profileError) {
        setSaving(false);
        alert(profileError.message);
        return;
      }
    }
    setSaving(false);
    if (error) {
      alert(error.message);
      return;
    }
    setStoredLanguage(language);
    router.push("/dashboard");
    router.refresh();
  }

  function next() {
    if (step < STEPS - 1) setStep(step + 1);
    else finish();
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="newsroom-grain flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="card-news w-full max-w-lg p-8">
        <div className="mb-8 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Profile setup
          </span>
          <span className="text-xs text-amber-500">
            Step {step + 1} / {STEPS}
          </span>
        </div>

        <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS) * 100}%` }}
          />
        </div>

        {step === 0 && (
          <div className="mt-8 space-y-4">
            <h1 className="font-heading text-2xl font-bold text-white">How should we call you?</h1>
            <p className="text-sm text-zinc-500">This appears on your desk and in Nova context.</p>
            <input
              className="input-newsroom"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Alex Reporter"
            />
          </div>
        )}

        {step === 1 && (
          <div className="mt-8 space-y-4">
            <h1 className="font-heading text-2xl font-bold text-white">What is your role?</h1>
            <p className="text-sm text-zinc-500">Helps Nova tailor tone and examples.</p>
            <select
              className="input-newsroom"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Select…</option>
              <option value="journalist">Journalist</option>
              <option value="editor">Editor</option>
              <option value="researcher">Researcher</option>
              <option value="reader">Avid reader</option>
              <option value="student">Student</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}

        {step === 2 && (
          <div className="mt-8 space-y-4">
            <h1 className="font-heading text-2xl font-bold text-white">Topics you follow</h1>
            <p className="text-sm text-zinc-500">Pick any that matter for your feed.</p>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTopic(t)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    topics.includes(t)
                      ? "border-amber-500 bg-amber-500/15 text-amber-400"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-8 space-y-4">
            <h1 className="font-heading text-2xl font-bold text-white">Primary region</h1>
            <p className="text-sm text-zinc-500">Default country for headline wires.</p>
            <select
              className="input-newsroom"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="us">United States</option>
              <option value="gb">United Kingdom</option>
              <option value="ca">Canada</option>
              <option value="au">Australia</option>
              <option value="in">India</option>
              <option value="de">Germany</option>
              <option value="fr">France</option>
            </select>
          </div>
        )}

        {step === 4 && (
          <div className="mt-8 space-y-4">
            <h1 className="font-heading text-2xl font-bold text-white">Digest cadence</h1>
            <p className="text-sm text-zinc-500">How often you want a summary ping (in-app).</p>
            <div className="space-y-2">
              {[
                { id: "daily", label: "Daily snapshot" },
                { id: "weekly", label: "Weekly roundup" },
                { id: "never", label: "No digest" },
              ].map((o) => (
                <label
                  key={o.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition ${
                    digest === o.id
                      ? "border-amber-500/50 bg-amber-500/10"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="digest"
                    checked={digest === o.id}
                    onChange={() => setDigest(o.id)}
                    className="accent-amber-500"
                  />
                  <span className="text-sm text-zinc-200">{o.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="mt-8 space-y-4">
            <h1 className="font-heading text-2xl font-bold text-white">Language preference</h1>
            <p className="text-sm text-zinc-500">
              Pick your preferred UI and assistant language. You can change this anytime from the header.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`rounded-lg border px-2 py-2 text-sm transition ${
                    language === l.code
                      ? "border-amber-500 bg-amber-500/15 text-amber-300"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {l.flag} {l.nativeLabel}
                </button>
              ))}
            </div>
            <p className="pt-2 text-sm text-zinc-500">Short bio (optional)</p>
            <textarea
              className="input-newsroom min-h-[100px] resize-y"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Tech policy, EU focus"
              maxLength={280}
            />
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-500">
              <p className="font-medium text-zinc-300">Review</p>
              <ul className="mt-2 space-y-1">
                <li>Name: {displayName || "—"}</li>
                <li>Role: {role || "—"}</li>
                <li>Topics: {topics.length ? topics.join(", ") : "—"}</li>
                <li>Region: {region.toUpperCase()}</li>
                <li>Digest: {digest}</li>
                <li>Language: {language.toUpperCase()}</li>
              </ul>
            </div>
          </div>
        )}

        <div className="mt-10 flex justify-between gap-4">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="btn-ghost gap-1 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={saving || (step === 0 && !displayName.trim())}
            className="btn-primary gap-1"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving
              </>
            ) : step === STEPS - 1 ? (
              <>
                <Check className="h-4 w-4" />
                Finish
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
