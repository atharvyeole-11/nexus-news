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
    <div ref={containerRef} className="relative h-full w-full">
      {/* YouTube Iframe */}
      <div className="relative h-full w-full bg-black">
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${short.videoId}?autoplay=0&mute=1&enablejsapi=1&loop=1&playlist=${short.videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3`}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        
        {/* Overlay Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
          <div className="flex items-center justify-between">
            {/* Left: Title & Channel */}
            <div className="flex-1">
              <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">
                {short.title}
              </h3>
              <p className="text-[#A0A0A0] text-xs flex items-center gap-2">
                <span className="px-2 py-1 rounded-full bg-[#C8102E]/20 text-[#C8102E] text-xs">
                  {short.channelName}
                </span>
                <span>•</span>
                <span>{new Date(short.publishedAt).toLocaleDateString()}</span>
              </p>
              <span>{formatDuration(short.duration)}</span>
            </div>

            {/* Right: Mute Button */}
            <button
              onClick={toggleMute}
              className="nav-link bg-black/50 backdrop-blur-sm p-2 rounded-full"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-white" />
              ) : (
                <Volume2 className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
          <div 
            className="h-full bg-[#C8102E] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Sidebar */}
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
