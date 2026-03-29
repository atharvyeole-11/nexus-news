"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Radio, Sparkles, Shield, Play } from "lucide-react";

export default function HomePage() {
  return (
    <div className="newsroom-grain min-h-[calc(100vh-3.5rem)]">
      <section className="relative overflow-hidden border-b border-zinc-800/80">
        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-600/5 blur-[100px]" />

        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-amber-400">
              <Radio className="h-3.5 w-3.5" />
              Live desk
            </p>
            <h1 className="font-heading text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
              The newsroom,{" "}
              <span className="text-[#f59e0b]">rebuilt for focus</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
              Nexus News pulls top headlines from trusted sources, layers Nova AI for
              quick context, and keeps your reading profile in one dark, distraction-free
              space.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/login" className="btn-primary glow-amber gap-2 px-6 py-3 text-base">
                Enter the desk
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="btn-ghost px-6 py-3 text-base">
                Preview feed
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {[
          {
            icon: Play,
            title: "News Shorts",
            body: "TikTok-style vertical video news from BBC, CNN, Reuters, and more.",
            href: "/shorts",
            featured: true,
          },
          {
            icon: Sparkles,
            title: "Nova AI",
            body: "Ask questions about coverage, compare angles, and get tight briefs powered by Groq.",
            href: "/dashboard",
          },
          {
            icon: Radio,
            title: "NewsAPI wire",
            body: "Headlines and metadata from newsapi.org, filtered by category and region.",
            href: "/dashboard",
          },
          {
            icon: Shield,
            title: "Supabase auth",
            body: "Secure sign-in and a six-step onboarding flow so your feed matches you.",
            href: "/login",
          },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className={`card-news p-6 ${item.featured ? 'ring-2 ring-amber-500/20 bg-amber-500/5' : ''}`}
          >
            <Link href={item.href} className="block">
              <item.icon className={`mb-4 h-8 w-8 ${item.featured ? 'text-amber-400' : 'text-amber-500'}`} />
              <h2 className="font-heading text-lg font-semibold text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{item.body}</p>
              {item.featured && (
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-amber-400">
                  <span>Watch Now</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
