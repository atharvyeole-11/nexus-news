"use client";

import { useState, useEffect, useRef } from "react";
import { ShortsSidebar } from "./ShortsSidebar";
import { Volume2, VolumeX } from "lucide-react";

export function ShortsPlayer({ short, isActive, onNext, onPrevious }) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const iframe = iframeRef.current;
          if (!iframe) return;

          if (entry.isIntersecting) {
            // Card is visible - enable autoplay
            const src = `https://www.youtube.com/embed/${short.videoId}?autoplay=1&mute=1&enablejsapi=1&loop=1&playlist=${short.videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3`;
            iframe.src = src;
            setIsPlaying(true);
          } else {
            // Card is not visible - disable autoplay
            const src = `https://www.youtube.com/embed/${short.videoId}?autoplay=0&mute=1&enablejsapi=1&loop=1&playlist=${short.videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3`;
            iframe.src = src;
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [short.videoId]);

  const toggleMute = () => {
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      if (isMuted) {
        // Unmute - remove mute parameter
        const newSrc = currentSrc.replace('&mute=1', '&mute=0');
        iframeRef.current.src = newSrc;
      } else {
        // Mute - add mute parameter
        const newSrc = currentSrc.replace('&mute=0', '&mute=1');
        iframeRef.current.src = newSrc;
      }
      setIsMuted(!isMuted);
    }
  };

  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }
    return `${count} views`;
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div ref={containerRef} className="relative h-full w-full bg-black">
      <div className="absolute inset-0">
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${short.videoId}?autoplay=0&mute=1&enablejsapi=1&loop=1&playlist=${short.videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3`}
          className="h-full w-full object-cover"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ pointerEvents: isActive ? "auto" : "none" }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800/50">
        <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: "0%" }} />
      </div>

      <button
        onClick={toggleMute}
        className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white transition-opacity hover:bg-black-70"
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </button>

      <div className="absolute bottom-20 left-4 right-16 text-white">
        <h2 className="mb-2 text-lg font-semibold leading-tight">
          {short.title}
        </h2>
        <div className="flex items-center gap-3 text-sm text-zinc-300">
          <span className="font-medium">{short.channelName}</span>
          <span>•</span>
          <span>{formatViewCount(short.viewCount)}</span>
          {short.duration > 0 && (
            <>
              <span>•</span>
              <span>{formatDuration(short.duration)}</span>
            </>
          )}
        </div>
      </div>

      <div className="absolute bottom-20 right-4">
        <ShortsSidebar
          short={short}
          onLike={() => {}}
          onShare={() => {}}
          onSubscribe={() => {}}
        />
      </div>

      {isActive && (
        <>
          {onPrevious && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
              <div className="animate-bounce">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </div>
            </div>
          )}
          {onNext && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
              <div className="animate-bounce">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
