"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Calendar, Plus, Play, Radio } from "lucide-react";

export default function HomePage() {
  return (
    <div className="newsroom-grain min-h-[calc(100vh-3.5rem)] bg-[var(--color-bg)]">
      <section className="relative overflow-hidden border-b border-[var(--color-border)]">
        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[var(--color-accent)]/10 blur-[120px]" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[var(--color-gold)]/5 blur-[100px]" />

        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="page-content max-w-3xl"
          >
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--color-accent)]">
              <Radio className="h-3.5 w-3.5" />
              Live desk
            </p>
            <h1 className="font-heading text-4xl font-bold leading-[1.1] tracking-tight text-[var(--color-text)] sm:text-5xl md:text-6xl">
              The newsroom,{" "}
              <span className="text-[var(--color-accent)]">rebuilt for focus</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-muted)]">
              Nexus News pulls top headlines from trusted sources, layers Nova AI for
              quick context, and keeps your reading profile in one dark, distraction-free
              space.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/login" className="btn-primary gap-2 px-6 py-3 text-base">
                Enter desk
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="btn-ghost px-6 py-3 text-base">
                Preview feed
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center mb-12 page-content">
          <h2 className="text-3xl font-bold text-[var(--color-text)] mb-4">
            Today&apos;s News Desk
          </h2>
          <p className="text-[var(--color-muted)] text-lg">
            Curated headlines from trusted sources around the world
          </p>
        </div>

        {/* News Sections */}
        <div className="space-y-12">
          {[
            {
              id: "general",
              title: "General",
              color: "#C8102E",
              description: "Top stories and breaking news from around the world",
              articles: [
                {
                  title: "Global Markets Rally Amid Economic Recovery",
                  source: "Reuters",
                  time: "2 hours ago",
                  description: "Major stock indices surge as investors show renewed confidence in economic recovery."
                },
                {
                  title: "Climate Summit Reaches Historic Agreement",
                  source: "BBC News",
                  time: "4 hours ago",
                  description: "World leaders commit to unprecedented carbon reduction targets."
                }
              ]
            },
            {
              id: "business",
              title: "Business",
              color: "#1A73E8",
              description: "Corporate news, market analysis, and financial insights",
              articles: [
                {
                  title: "Tech Giants Report Record Quarterly Earnings",
                  source: "Financial Times",
                  time: "1 hour ago",
                  description: "Major technology companies exceed analyst expectations with strong revenue growth."
                },
                {
                  title: "Central Bank Signals Policy Shift",
                  source: "Wall Street Journal",
                  time: "3 hours ago",
                  description: "Federal Reserve hints at potential interest rate changes in coming months."
                }
              ]
            },
            {
              id: "technology",
              title: "Technology",
              color: "#00BFA5",
              description: "Latest in tech, AI, and digital innovation",
              articles: [
                {
                  title: "Breakthrough in Quantum Computing Achieved",
                  source: "TechCrunch",
                  time: "5 hours ago",
                  description: "Researchers demonstrate quantum supremacy in practical applications."
                },
                {
                  title: "Social Media Platform Launches AI Tools",
                  source: "The Verge",
                  time: "6 hours ago",
                  description: "Major platform integrates advanced AI capabilities for content creators."
                }
              ]
            },
            {
              id: "science",
              title: "Science",
              color: "#7C4DFF",
              description: "Scientific discoveries and research breakthroughs",
              articles: [
                {
                  title: "Mars Colony Reaches Self-Sufficiency Milestone",
                  source: "Nature",
                  time: "2 hours ago",
                  description: "First Martian habitat produces its own oxygen and food sustainably."
                },
                {
                  title: "New Cancer Treatment Shows Promise",
                  source: "Science Daily",
                  time: "8 hours ago",
                  description: "Clinical trials demonstrate 90% success rate in treating aggressive tumors."
                }
              ]
            },
            {
              id: "health",
              title: "Health",
              color: "#00C853",
              description: "Medical advances and wellness insights",
              articles: [
                {
                  title: "Revolutionary Heart Treatment Approved",
                  source: "Medical News Today",
                  time: "3 hours ago",
                  description: "FDA approves new minimally invasive procedure with remarkable success rates."
                },
                {
                  title: "Global Health Initiative Launches",
                  source: "WHO",
                  time: "7 hours ago",
                  description: "International coalition aims to eradicate preventable diseases by 2030."
                }
              ]
            },
            {
              id: "sports",
              title: "Sports",
              color: "#FF6D00",
              description: "Athletic news and competition results",
              articles: [
                {
                  title: "Underdog Team Wins Championship",
                  source: "ESPN",
                  time: "1 hour ago",
                  description: "Historic victory as team defeats favorites in final match."
                },
                {
                  title: "Olympic Committee Announces New Host City",
                  source: "Sports Illustrated",
                  time: "4 hours ago",
                  description: "International selection process concludes with surprise winner for 2032 games."
                }
              ]
            },
            {
              id: "culture",
              title: "Culture",
              color: "#EC407A",
              description: "Arts, entertainment, and cultural happenings",
              articles: [
                {
                  title: "Film Festival Awards Record-Breaking Documentary",
                  source: "Variety",
                  time: "5 hours ago",
                  description: "Controversial documentary about climate change wins top prize at prestigious festival."
                },
                {
                  title: "Museum Launches Digital Art Collection",
                  source: "Art News",
                  time: "6 hours ago",
                  description: "Major institution makes entire collection available as NFTs for public access."
                }
              ]
            }
          ].map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="mb-12 page-content"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-3 border-l-4 border-[var(--color-accent)] pl-4">
                  <TrendingUp className="h-6 w-6" style={{ color: section.color }} />
                  {section.title}
                </h3>
                <Link
                  href={`/dashboard?category=${section.id}`}
                  className="inline-flex items-center gap-2 text-[var(--color-accent)] hover:text-[#FF1744] transition-colors"
                >
                  &quot;See more &quot; →
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {section.articles.map((article, articleIndex) => (
                  <motion.div
                    key={articleIndex}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + articleIndex * 0.05 }}
                    className="news-card bg-[var(--color-card-bg)] border border-[var(--color-border)] p-6 hover:border-[var(--color-accent)]"
                  >
                    <div className="mb-3">
                      <div className="flex items-center gap-2 text-xs text-[var(--color-muted)] mb-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: section.color + '20', color: section.color }}>
                          {article.source}
                        </span>
                        <span className="text-[#707070]">•</span>
                        <span>{article.time}</span>
                      </div>
                      <h4 className="font-semibold text-[var(--color-text)] mb-2 line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-sm text-[var(--color-muted)] line-clamp-3">
                        {article.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="text-center mt-16 page-content">
          <div className="inline-flex gap-4">
            <Link
              href="/shorts"
              className="btn-primary gap-2 px-6 py-3 text-white font-semibold"
            >
              <Play className="h-5 w-5" />
              Watch News Shorts
            </Link>
            <Link
              href="/subscribe"
              className="btn-ghost gap-2 px-6 py-3 text-[#E8C84A] font-semibold border-[#E8C84A]/30 hover:bg-[#E8C84A]/10 hover:border-[#E8C84A]/50"
            >
              <Plus className="h-5 w-5" />
              Upgrade to Premium
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
