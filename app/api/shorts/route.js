import { NextResponse } from "next/server";

// News channel IDs for major news organizations
const NEWS_CHANNELS = [
  { name: "BBC News", id: "UCCj95zIFD3oG7o7VJ5m0sXQ" },
  { name: "CNN", id: "UCupvZG-5ko_eiVup2rZgNjA" },
  { name: "Reuters", id: "UCupvZG-5ko_eiVup2rZgNjA" },
  { name: "NDTV", id: "UCZFMm1mMw0F81Y3s4eP_tIw" },
  { name: "Al Jazeera", id: "UCNye-wNBqNL5ZzHSJj3l8Bg" },
  { name: "Times Now", id: "UC_o7IjKcQx9dV7j8f5WQ5Jg" }
];

// Cache for 30 minutes
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
let cache = {
  data: null,
  timestamp: 0
};

function getYouTubeApiKey() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn("YOUTUBE_API_KEY environment variable is not set");
    return null;
  }
  return apiKey;
}

async function fetchShortsFromChannel(channelId, channelName, apiKey) {
  try {
    // Search for shorts from the specific channel
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&channelId=${channelId}&q=news shorts&videoDuration=short&maxResults=10&order=date&key=${apiKey}`;
    
    const response = await fetch(searchUrl);
    if (!response.ok) {
      console.error(`Failed to fetch from ${channelName}:`, response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (!data.items) {
      console.log(`No items found for ${channelName}`);
      return [];
    }

    // Get video details including view count
    const videoIds = data.items.map(item => item.id.videoId).join(',');
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${apiKey}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    
    // Combine search results with video details
    const shorts = data.items.map((item, index) => {
      const details = detailsData.items?.find(d => d.id === item.id.videoId);
      const viewCount = parseInt(details?.statistics?.viewCount || '0');
      const duration = details?.contentDetails?.duration || 'PT0S';
      
      // Convert ISO 8601 duration to seconds
      const durationSeconds = parseDuration(duration);
      
      return {
        id: item.id.videoId,
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channelName: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        channelAvatar: null, // Would need additional API call to get channel avatar
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        viewCount: viewCount,
        likeCount: parseInt(details?.statistics?.likeCount || '0'),
        duration: durationSeconds,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      };
    });

    // Filter for videos under 60 seconds (shorts format)
    return shorts.filter(short => short.duration <= 60);
  } catch (error) {
    console.error(`Error fetching shorts from ${channelName}:`, error);
    return [];
  }
}

function parseDuration(duration) {
  // Parse ISO 8601 duration (e.g., "PT30S", "PT1M15S")
  const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const minutes = parseInt(match[1] || '0');
  const seconds = parseInt(match[2] || '0');
  return minutes * 60 + seconds;
}

export async function GET() {
  try {
    // Check if YouTube API key is available
    if (!process.env.YOUTUBE_API_KEY) {
      console.warn("YouTube API key not found, returning empty shorts array");
      return NextResponse.json({ shorts: [] });
    }

    // Check cache
    const now = Date.now();
    if (cache.data && (now - cache.timestamp) < CACHE_DURATION) {
      return NextResponse.json({ shorts: cache.data });
    }

    const apiKey = getYouTubeApiKey();
    if (!apiKey) {
      return NextResponse.json({ shorts: [] });
    }

    let allShorts = [];

    // Fetch shorts from each channel
    for (const channel of NEWS_CHANNELS) {
      const channelShorts = await fetchShortsFromChannel(channel.id, channel.name, apiKey);
      allShorts = [...allShorts, ...channelShorts];
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Sort by view count (most popular first) and then by publish date
    allShorts.sort((a, b) => {
      if (b.viewCount !== a.viewCount) {
        return b.viewCount - a.viewCount;
      }
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });

    // Remove duplicates (same video ID)
    const uniqueShorts = allShorts.filter((short, index, self) => 
      index === self.findIndex((s) => s.videoId === short.videoId)
    );

    // Limit to 50 shorts maximum
    const limitedShorts = uniqueShorts.slice(0, 50);

    // Update cache
    cache.data = limitedShorts;
    cache.timestamp = now;

    return NextResponse.json({ shorts: limitedShorts });
  } catch (error) {
    console.error("Error in shorts API:", error);
    
    // Return cached data if available, even if expired
    if (cache.data) {
      return NextResponse.json({ 
        shorts: cache.data,
        warning: "Using cached data due to API error"
      });
    }

    // Return empty array to prevent crashes
    return NextResponse.json({ shorts: [] });
  }
}
