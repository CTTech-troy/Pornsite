/**
 * Stream URL validation and embed URL resolution for the video player.
 * Use direct stream URLs with <video>; use embed URLs with <iframe> when no stream is available.
 */

const DIRECT_STREAM_EXT = /\.(mp4|m3u8|webm|ogg|mov)(\?|$)/i;
const DIRECT_STREAM_PATH = /\/video\/|\.mp4|\.m3u8|\.webm|googlevideo\.com|cloudfront\.net|cloudinary\.com|firebasestorage\.googleapis\.com/i;
const PAGE_OR_EMBED_PATTERN = /view_video\.php|viewkey=|\/watch\?|youtube\.com\/watch|vimeo\.com\/\d+|dailymotion\.com\/video|\/view\//i;

/**
 * Returns true if the URL looks like a direct playable stream (file or HLS/CDN).
 */
export function isDirectStreamUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const u = url.trim();
  if (!u.startsWith('http')) return false;
  if (PAGE_OR_EMBED_PATTERN.test(u)) return false;
  return DIRECT_STREAM_EXT.test(u) || DIRECT_STREAM_PATH.test(u);
}

/**
 * Returns the best playable source for <video>: streamUrl if valid, else url/videoSrc if direct stream.
 */
export function getDirectStreamUrl(video) {
  if (!video) return '';
  const candidates = [
    video.streamUrl,
    video.videoSrc,
    video.url,
    video.videoUrl,
  ].filter(Boolean);
  for (const u of candidates) {
    if (isDirectStreamUrl(u)) return u;
  }
  return '';
}

/** True if URL is a Pornhub watch/page link (embed loads pornhub.com and often times out). */
export function isPornhubPageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /pornhub\.com|viewkey=/i.test(url.trim());
}

/**
 * If the URL is a known page/watch URL, try to convert to an embed URL for <iframe>.
 * Returns empty string if not embeddable. Pornhub is excluded because its embed often times out.
 */
export function getEmbedUrl(url, videoId) {
  if (!url || typeof url !== 'string') {
    if (videoId && !isPornhubPageUrl(String(videoId))) return tryEmbedFromId(videoId);
    return '';
  }
  const u = url.trim();
  if (isPornhubPageUrl(u)) return '';
  const ytMatch = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]+)/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  const vimeoMatch = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  const dmMatch = u.match(/dailymotion\.com\/video\/([^_?\s]+)/);
  if (dmMatch) {
    return `https://www.dailymotion.com/embed/video/${dmMatch[1]}`;
  }
  return '';
}

function tryEmbedFromId(videoId) {
  if (!videoId || typeof videoId !== 'string') return '';
  const id = videoId.trim();
  if (id.length < 5 || /[.#$[\]]/.test(id)) return '';
  return '';
}

/**
 * Resolve player mode and URL for a video.
 * @returns {{ mode: 'video'|'iframe'|'unavailable'|'external', url: string, embedUrl?: string, externalUrl?: string }}
 */
export function resolvePlayerSource(video) {
  const direct = getDirectStreamUrl(video);
  if (direct) {
    return { mode: 'video', url: direct };
  }
  const raw = (video?.streamUrl || video?.videoSrc || video?.url || video?.videoUrl || '').trim();
  const videoId = video?.id ?? video?.videoId;
  const embedUrl = getEmbedUrl(raw, videoId);
  if (embedUrl) {
    return { mode: 'iframe', url: embedUrl, embedUrl };
  }
  if (raw && isPornhubPageUrl(raw)) {
    return { mode: 'external', url: raw, externalUrl: raw };
  }
  return { mode: 'unavailable', url: '' };
}
