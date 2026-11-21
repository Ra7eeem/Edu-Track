/**
 * Utility to extract 11-character YouTube video ID from various URL formats
 * (e.g. youtu.be, youtube.com/watch?v=, youtube.com/embed/, youtube.com/v/, shorts)
 */
export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== "string") return null;

  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|(?:embed|v|shorts)\/))([a-zA-Z0-9_-]{11})/
  );

  return match ? match[1] : null;
}
