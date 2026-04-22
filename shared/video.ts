export function getYouTubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url.trim());
    const hostname = parsed.hostname.replace(/^www\./, "");
    let videoId: string | null = null;

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v");
      } else if (parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1]?.split(/[/?#]/)[0] || null;
      } else if (parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.split("/shorts/")[1]?.split(/[/?#]/)[0] || null;
      }
    }

    if (hostname === "youtu.be") {
      videoId = parsed.pathname.replace("/", "").split(/[/?#]/)[0] || null;
    }

    if (!videoId || !/^[a-zA-Z0-9_-]{6,}$/.test(videoId)) return null;

    const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
    embedUrl.searchParams.set("rel", "0");
    embedUrl.searchParams.set("modestbranding", "1");
    embedUrl.searchParams.set("playsinline", "1");
    return embedUrl.toString();
  } catch {
    return null;
  }
}

export function isSupportedTutorialVideoUrl(url?: string | null): boolean {
  return getYouTubeEmbedUrl(url) !== null;
}
