const BASE =
  (import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof window !== 'undefined' && import.meta.env?.DEV ? 'http://localhost:5000' : '') ||
  '';

function buildUrl(path) {
  if (path.startsWith('http')) return path;
  const base = BASE.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

async function request(path, options = {}) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || res.statusText || 'Request failed');
  return data;
}

/**
 * Fetch paginated video feed.
 * @param {{ page: number, limit: number }} opts
 * @returns {Promise<{ data: Array<{ id, videoUrl, thumbnailUrl, duration, createdAt, title?, channel?, views? }>, total: number, page: number, totalPages: number }>}
 */
export async function getVideosPage({ page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return request(`/api/videos?${params}`);
}

/**
 * Fetch a single video by id (from feed cache). Returns null if not found.
 */
export async function getVideoById(id) {
  if (!id) return null;
  const data = await request(`/api/videos/${encodeURIComponent(id)}`).catch(() => null);
  const video = data?.data ?? data ?? null;
  if (video) {
    const url = video.videoUrl ?? video.video_url ?? video.url ?? video.videoSrc ?? '';
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      console.warn('[Video API] getVideoById: video missing or invalid video_url', { id, url: url?.slice?.(0, 60) });
    }
    console.log('Video API Response: getVideoById', { id, hasUrl: !!(url && url.startsWith('http')) });
  }
  return video;
}

/**
 * Search videos via RapidAPI Pornhub Scraper.
 * @param {{ q: string, page?: number, filter?: 'relevance'|'newest'|'mostviewed' }} opts
 * @returns {Promise<{ data: Array, total: number, page: number, totalPages: number }>}
 */
export async function searchVideos({ q = '', page = 1, filter = 'relevance' } = {}) {
  if (!String(q).trim()) return { data: [], total: 0, page: 1, totalPages: 0 };
  const params = new URLSearchParams({ q: String(q).trim(), page: String(page), filter: String(filter) });
  return request(`/api/videos/search?${params}`).catch((err) => {
    console.warn('searchVideos failed:', err?.message);
    return { data: [], total: 0, page: 1, totalPages: 0 };
  });
}

/**
 * Search pornstars via RapidAPI Pornhub Scraper.
 * @param {{ q: string, page?: number }} opts
 * @returns {Promise<{ data: Array, total: number, page: number, totalPages: number }>}
 */
export async function searchPornstars({ q = '', page = 1 } = {}) {
  if (!String(q).trim()) return { data: [], total: 0, page: 1, totalPages: 0 };
  const params = new URLSearchParams({ q: String(q).trim(), page: String(page) });
  return request(`/api/videos/search/pornstar?${params}`).catch((err) => {
    console.warn('searchPornstars failed:', err?.message);
    return { data: [], total: 0, page: 1, totalPages: 0 };
  });
}
