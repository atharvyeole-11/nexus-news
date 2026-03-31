"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ShortsPlayer } from "@/components/shorts/ShortsPlayer";
import { ShortsNavigation } from "@/components/shorts/ShortsNavigation";
import { ShortsSidebar } from "@/components/shorts/ShortsSidebar";
import { Loader2, Play } from "lucide-react";

export default function ShortsPage() {
  const [shorts, setShorts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchShorts();
  }, []);

  const fetchShorts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/shorts");
      if (!response.ok) {
        throw new Error("Failed to fetch shorts");
      }
      const data = await response.json();
      setShorts(data.shorts || []);
    } catch (err) {
      console.error("Shorts fetch error:", err);
      setError(err.message);
      // Set empty array to prevent crashes
      setShorts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = useCallback(() => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, shorts.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") handleNext();
      if (e.key === "ArrowUp") handlePrevious();
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, shorts.length, handleNext, handlePrevious]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-bg)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
          <p className="text-[var(--color-muted)]">Loading news shorts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-bg)]">
        <div className="flex flex-col items-center gap-4 px-4 text-center">
          <div className="rounded-full bg-[var(--color-surface)] p-4">
            <Play className="h-6 w-6 text-[var(--color-muted)]" />
          </div>
          <p className="text-[var(--color-text)]">Failed to load shorts</p>
          <p className="text-[var(--color-muted)] text-sm">{error}</p>
          <button
            onClick={fetchShorts}
            className="btn-primary gap-2 px-6 py-3 text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-bg)]">
        <div className="flex flex-col items-center gap-4 px-4 text-center">
          <div className="rounded-full bg-[var(--color-surface)] p-4">
            <Play className="h-6 w-6 text-[var(--color-muted)]" />
          </div>
          <p className="text-[var(--color-text)]">No news shorts available at the moment</p>
          <p className="text-[var(--color-muted)] text-sm">
            Check back later for the latest news shorts
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="newsroom-grain min-h-[calc(100vh-3.5rem)] bg-[var(--color-bg)]">
      <div className="relative h-screen overflow-hidden">
        {/* Shorts Container */}
        <div className="h-full">
          {shorts.map((short, index) => (
            <div
              key={short.videoId}
              className={`
                shorts-card absolute inset-0 transition-all duration-500
                ${index === currentIndex 
                  ? 'opacity-100 z-10' 
                  : index < currentIndex 
                    ? 'opacity-0 -translate-y-full' 
                    : 'opacity-0 translate-y-full'
                }
              `}
              style={{
                transform: `
                  translateY(${index === currentIndex ? '0' : index < currentIndex ? '-100%' : '100%'})
                  ${index === currentIndex ? 'scale(1)' : 'scale(0.95)'}
                `
              }}
            >
              <ShortsPlayer 
                short={short} 
                isActive={index === currentIndex}
              />
            </div>
          ))}
        </div>

        {/* Navigation */}
        <ShortsNavigation 
          currentIndex={currentIndex}
          totalShorts={shorts.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />

        {/* Sidebar */}
        <ShortsSidebar 
          short={shorts[currentIndex]}
          onLike={() => console.log('Liked:', shorts[currentIndex])}
          onShare={() => console.log('Shared:', shorts[currentIndex])}
          onSubscribe={() => console.log('Subscribed:', shorts[currentIndex])}
        />
      </div>
    </div>
  );
}
