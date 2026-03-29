"use client";

import { useState } from "react";
import { Heart, Share2, BookmarkPlus, MoreHorizontal } from "lucide-react";
import Image from "next/image";

export function ShortsSidebar({ short, onLike, onShare, onSubscribe }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(short.likeCount || 0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.(short);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: short.title,
        text: `Check out this news short: ${short.title}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
    onShare?.(short);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const formatCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Like Button */}
      <button
        onClick={handleLike}
        className="flex flex-col items-center gap-1 transition-transform hover:scale-110"
      >
        <div className={`rounded-full p-3 transition-colors ${
          isLiked 
            ? "bg-red-500/20 text-red-400" 
            : "bg-white/10 text-white hover:bg-white/20"
        }`}>
          <Heart className={`h-6 w-6 ${isLiked ? "fill-current" : ""}`} />
        </div>
        <span className="text-xs text-white font-medium">
          {formatCount(likeCount)}
        </span>
      </button>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="flex flex-col items-center gap-1 transition-transform hover:scale-110"
      >
        <div className="rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20">
          <Share2 className="h-6 w-6" />
        </div>
        <span className="text-xs text-white font-medium">Share</span>
      </button>

      {/* Bookmark Button */}
      <button
        onClick={handleBookmark}
        className="flex flex-col items-center gap-1 transition-transform hover:scale-110"
      >
        <div className={`rounded-full p-3 transition-colors ${
          isBookmarked 
            ? "bg-amber-500/20 text-amber-400" 
            : "bg-white/10 text-white hover:bg-white/20"
        }`}>
          <BookmarkPlus className={`h-6 w-6 ${isBookmarked ? "fill-current" : ""}`} />
        </div>
        <span className="text-xs text-white font-medium">Save</span>
      </button>

      {/* More Options */}
      <button className="flex flex-col items-center gap-1 transition-transform hover:scale-110">
        <div className="rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20">
          <MoreHorizontal className="h-6 w-6" />
        </div>
      </button>

      {/* Channel Avatar */}
      <button
        onClick={onSubscribe}
        className="relative -mt-2 transition-transform hover:scale-110"
      >
        <div className="relative h-12 w-12">
          <Image
            src={short.channelAvatar || `https://picsum.photos/seed/${short.channelId}/48/48.jpg`}
            alt={short.channelName}
            className="h-full w-full rounded-full border-2 border-white object-cover"
            width={48}
            height={48}
          />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 p-0.5">
            <svg className="h-3 w-3 text-zinc-900" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3a7 7 0 100 14 7 7 0 000-14zm0 11a1 1 0 01-1-1V8a1 1 0 112 0v5a1 1 0 01-1 1zm0-9a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
}
