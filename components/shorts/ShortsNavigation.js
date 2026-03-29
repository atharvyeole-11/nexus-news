"use client";

import { ChevronUp, ChevronDown } from "lucide-react";

export function ShortsNavigation({ currentIndex, total, onNext, onPrevious }) {
  const canGoNext = currentIndex < total - 1;
  const canGoPrevious = currentIndex > 0;

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className={`rounded-full p-3 transition-all ${
          canGoPrevious
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
        }`}
        aria-label="Previous short"
      >
        <ChevronUp className="h-6 w-6" />
      </button>
      
      <div className="flex flex-col items-center gap-1 py-2">
        {Array.from({ length: total }, (_, index) => (
          <div
            key={index}
            className={`h-1 w-1 rounded-full transition-all ${
              index === currentIndex
                ? "bg-amber-400 w-2"
                : "bg-white/30"
            }`}
          />
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={`rounded-full p-3 transition-all ${
          canGoNext
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
        }`}
        aria-label="Next short"
      >
        <ChevronDown className="h-6 w-6" />
      </button>
    </div>
  );
}
