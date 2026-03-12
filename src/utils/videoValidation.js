/**
 * Video URL validation and API response logging for external API videos.
 * Use for debugging and ensuring only valid playable links are used.
 */

/**
 * Returns true if the value looks like a valid playable or embeddable URL.
 */
export function isValidVideoUrl(url) {
  if (url == null) return false;
  const u = typeof url === 'string' ? url.trim() : String(url).trim();
  if (!u || u.length < 10) return false;
  return u.startsWith('http://') || u.startsWith('https://');
}

/**
 * Extract video_url / playable link from an API video object.
 */
export function getVideoUrlFromItem(item) {
  if (!item || typeof item !== 'object') return '';
  const u =
    item.video_url ??
    item.videoUrl ??
    item.url ??
    item.videoSrc ??
    item.streamUrl ??
    item.storage_url ??
    item.link ??
    item.video_link ??
    item.download_url ??
    (item.mp4 && item.mp4[0]) ??
    '';
  return typeof u === 'string' ? u.trim() : '';
}

/**
 * Validate a video object from external API. Returns { valid: boolean, url: string, error?: string }.
 */
export function validateVideoItem(item, index = -1) {
  const url = getVideoUrlFromItem(item);
  if (!url) {
    const err = `Video at index ${index} missing video_url/videoUrl/url. id=${item?.id ?? item?.video_id ?? '?'}`;
    console.error('[Video API] Invalid or missing URL:', err);
    return { valid: false, url: '', error: err };
  }
  if (!isValidVideoUrl(url)) {
    const err = `Video at index ${index} has invalid URL (not http(s)). id=${item?.id ?? item?.video_id ?? '?'} url=${url.slice(0, 60)}...`;
    console.error('[Video API] Invalid URL:', err);
    return { valid: false, url, error: err };
  }
  return { valid: true, url };
}

/**
 * Log full API response for debugging (video APIs).
 */
export function logVideoApiResponse(apiName, response) {
  try {
    console.log('Video API Response:', apiName, response);
  } catch (e) {
    console.warn('Video API Response (log failed):', apiName, e?.message);
  }
}

/**
 * Validate an array of video items; log errors for invalid ones; return only valid items (optional).
 */
export function validateVideoBatch(items, options = {}) {
  const { filterInvalid = false } = options;
  if (!Array.isArray(items)) return filterInvalid ? [] : items;
  const valid = [];
  items.forEach((v, i) => {
    const result = validateVideoItem(v, i);
    if (result.valid) valid.push(v);
  });
  if (filterInvalid) return valid;
  return items;
}
