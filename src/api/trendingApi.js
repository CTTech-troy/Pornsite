/**
 * Fetch trending videos.
 * Prefers backend GET /api/videos/trending?page=1 (no API key in frontend).
 * Fallback: direct RapidAPI pornhub-api-xnxx if backend not configured.
 */
import { descriptionFromTitle } from '../utils/descriptionFromTitle';
import { formatDuration, parseDurationToSeconds, getDurationSecondsFromItem } from '../utils/formatDuration';
import { logVideoApiResponse, validateVideoItem, getVideoUrlFromItem } from '../utils/videoValidation';

const TRENDING_HOST = 'pornhub-api-xnxx.p.rapidapi.com';

function getApiBase() {
  try {
    const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || '';
    return String(base).replace(/\/$/, '');
  } catch {
    return '';
  }
}

function extractVideosFromResponse(data) {
  if (!data || typeof data !== 'object') return [];
  if (Array.isArray(data)) return data;
  const list = data.videos ?? data.data ?? (data.data && Array.isArray(data.data.videos) ? data.data.videos : null) ?? data.results ?? data.items ?? data.list ?? [];
  return Array.isArray(list) ? list : [];
}

function mapToCard(v, index) {
  if (!v || typeof v !== 'object') return null;
  const urlResult = validateVideoItem(v, index);
  if (!urlResult.valid && urlResult.error) {
    console.warn('[trendingApi] Skipping video with invalid/missing URL:', v?.id ?? v?.video_id ?? index);
  }
  const videoUrl = getVideoUrlFromItem(v) || urlResult.url;
  const title = v.title || v.title_clean || v.name || 'Video';
  const thumb = v.thumb ?? v.thumbnail ?? v.thumbnailUrl ?? v.poster ?? (v.thumbs && (v.thumbs[0]?.src ?? v.thumbs[0])) ?? '';
  const thumbStr = typeof thumb === 'string' ? thumb : (thumb?.src ?? thumb?.url ?? '');
  return {
    id: v.video_id ?? v.id ?? v.key ?? v.url ?? `v-${Math.random().toString(36).slice(2)}`,
    title: String(title),
    channel: v.channel ?? v.uploader ?? v.creator ?? (v.pornstars && (Array.isArray(v.pornstars) ? v.pornstars[0] : v.pornstars)) ?? 'Creator',
    views: v.views ?? v.views_count ?? 0,
    thumbnail: thumbStr,
    duration: formatDuration(getDurationSecondsFromItem(v)),
    durationSeconds: getDurationSecondsFromItem(v),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(v.video_id || v.id || title)).slice(0, 50)}`,
    videoSrc: videoUrl,
    video_url: videoUrl,
    url: videoUrl,
    likes: v.rating ?? '0',
    comments: '0',
    time: v.time ?? v.added ?? '',
    description: descriptionFromTitle(title),
  };
}

/**
 * Fetch trending from backend or direct RapidAPI.
 * @param {number} page - Page number (default 1)
 * @param {string} _apiKey - Ignored when using backend
 * @returns {{ items: Array, hasMore: boolean }}
 */
export async function fetchTrendingVideos(page = 1, _apiKey) {
  const base = getApiBase();
  if (base) {
    try {
      const url = `${base}/api/videos/trending?page=${encodeURIComponent(String(page))}`;
      const response = await fetch(url);
      const json = await response.json().catch(() => ({}));
      logVideoApiResponse('GET /api/videos/trending', { ok: response.ok, status: response.status, dataCount: Array.isArray(json?.data) ? json.data.length : 0, json });
      if (!response.ok) {
        if (response.status === 429) throw new Error('Rate limit exceeded. Try again later.');
        throw new Error(json?.error || 'Trending fetch failed');
      }
      const rawItems = Array.isArray(json?.data) ? json.data : [];
      rawItems.forEach((v, i) => {
        const link = v?.video_url ?? v?.videoUrl ?? v?.videoSrc ?? v?.url ?? v?.link ?? '';
        if (!link || typeof link !== 'string' || !link.startsWith('http')) {
          console.error('[Video API] Trending video missing or invalid video_url:', { index: i, id: v?.id ?? v?.video_id, link: link ? link.slice(0, 80) : link });
        }
      });
      const hasMore = Boolean(json?.hasMore);
      return { items: rawItems, hasMore };
    } catch (err) {
      throw err;
    }
  }

  const key = _apiKey ||
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_RAPIDAPI_TRENDING_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_RAPIDAPI_KEY) ||
    '';
  if (!key || key === 'YOUR_API_KEY' || key.length < 10) {
    return { items: [], hasMore: false };
  }
  const url = `https://${TRENDING_HOST}/api/trending?page=${encodeURIComponent(String(page))}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': key,
      'x-rapidapi-host': TRENDING_HOST,
    },
  });
  if (!response.ok) throw new Error('Trending fetch failed');
  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('Invalid response');
  }
  logVideoApiResponse('RapidAPI trending', { dataCount: extractVideosFromResponse(data).length, data });
  const list = extractVideosFromResponse(data);
  list.forEach((v, i) => {
    const link = v?.url ?? v?.video_url ?? v?.videoUrl ?? v?.link ?? '';
    if (!link || typeof link !== 'string' || !link.startsWith('http')) {
      console.error('[Video API] Trending (RapidAPI) video missing or invalid video_url:', { index: i, id: v?.video_id ?? v?.id, link: link ? link.slice(0, 80) : link });
    }
  });
  const items = list.map((v, i) => mapToCard(v, i)).filter(Boolean);
  const hasMore = items.length >= 20;
  return { items, hasMore };
}

/**
 * Home feed from backend xnxx search API (many videos at once + infinite scroll).
 * GET /api/videos/home-feed?page=1&q=hot&pages=3
 * @param {number} page - Starting page (1-based)
 * @param {number} pages - How many pages to fetch in one request (1-5, default 3 for first load)
 * @param {string} q - Search query (default "hot")
 * @returns {{ items: Array, hasMore: boolean, nextPage: number }}
 */
export async function fetchHomeFeed(page = 1, pages = 3, q = 'hot') {
  const base = getApiBase();
  if (!base) return { items: [], hasMore: false, nextPage: page + 1 };
  const url = `${base}/api/videos/home-feed?page=${encodeURIComponent(String(page))}&pages=${encodeURIComponent(String(pages))}&q=${encodeURIComponent(String(q))}`;
  const response = await fetch(url);
  const json = await response.json().catch(() => ({}));
  logVideoApiResponse('GET /api/videos/home-feed', { ok: response.ok, dataCount: Array.isArray(json?.data) ? json.data.length : 0, json });
  if (!response.ok) {
    throw new Error(json?.error || 'Home feed failed');
  }
  const rawItems = Array.isArray(json?.data) ? json.data : [];
  rawItems.forEach((v, i) => {
    const link = v?.videoSrc ?? v?.video_url ?? v?.url ?? v?.link ?? '';
    if (!link || typeof link !== 'string' || !link.startsWith('http')) {
      console.error('[Video API] Home-feed video missing or invalid video_url:', { index: i, id: v?.id ?? v?.video_id, link: link ? link.slice(0, 80) : link });
    }
  });
  const items = rawItems;
  const hasMore = Boolean(json?.hasMore);
  const nextPage = typeof json?.nextPage === 'number' ? json.nextPage : page + (typeof pages === 'number' ? pages : 1);
  return { items, hasMore, nextPage };
}

export { TRENDING_HOST };
