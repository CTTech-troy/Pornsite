/**
 * Pornhub2 RapidAPI v2/search client.
 * Use: https://pornhub2.p.rapidapi.com/v2/search?search=<term>&page=1&period=weekly&ordering=newest&thumbsize=small
 */
import { descriptionFromTitle } from '../utils/descriptionFromTitle';
import { formatDuration, parseDurationToSeconds } from '../utils/formatDuration';

const RAPIDAPI_HOST = 'pornhub2.p.rapidapi.com';

export function extractVideosFromSearchResponse(data) {
  if (!data || typeof data !== 'object') return [];
  if (Array.isArray(data)) return data;
  const videos = data.videos ?? (data.data && Array.isArray(data.data.videos) ? data.data.videos : null) ?? data.data ?? data.results ?? data.items ?? data.list ?? [];
  return Array.isArray(videos) ? videos : [];
}

export function mapSearchHitToCard(v) {
  if (!v || typeof v !== 'object') return null;
  const title = v.title || v.title_clean || v.name || 'Video';
  const thumb = v.thumb ?? v.thumbnail ?? v.thumbnailUrl ?? v.poster ?? (v.thumbs && (v.thumbs[0]?.src ?? v.thumbs[0])) ?? '';
  const thumbStr = typeof thumb === 'string' ? thumb : (thumb?.src ?? thumb?.url ?? '');
  return {
    id: v.video_id ?? v.id ?? v.key ?? v.url ?? `v-${Math.random().toString(36).slice(2)}`,
    title: String(title),
    channel: v.channel ?? v.uploader ?? v.creator ?? (v.pornstars && (Array.isArray(v.pornstars) ? v.pornstars[0] : v.pornstars)) ?? 'Creator',
    views: v.views ?? v.views_count ?? 0,
    thumbnail: thumbStr,
    duration: formatDuration(v.duration),
    durationSeconds: parseDurationToSeconds(v.duration) || Number(v.duration) || 0,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(v.video_id || v.id || title)).slice(0, 50)}`,
    videoSrc: v.url ?? v.video_url ?? v.link ?? '',
    likes: v.rating ?? '0',
    comments: '0',
    time: v.time ?? v.added ?? '',
    description: descriptionFromTitle(title),
  };
}

/**
 * Fetch videos from Pornhub2 v2/search.
 * @param {string} searchTerm - Query (e.g. creator name)
 * @param {number} page - Page number
 * @param {string} apiKey - VITE_RAPIDAPI_KEY
 * @returns {{ items: Array, hasMore: boolean }}
 */
export async function fetchSearchVideos(searchTerm, page = 1, apiKey) {
  const key = apiKey || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_RAPIDAPI_KEY) || '';
  if (!key || key === 'YOUR_API_KEY' || key.length < 10) {
    return { items: [], hasMore: false };
  }
  const params = new URLSearchParams({
    search: String(searchTerm).trim() || 'trending',
    page: String(page),
    period: 'weekly',
    ordering: 'newest',
    thumbsize: 'small',
  });
  const url = `https://${RAPIDAPI_HOST}/v2/search?${params.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': key,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
  });
  if (!response.ok) throw new Error('Search failed');
  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('Invalid response');
  }
  const items = extractVideosFromSearchResponse(data).map(mapSearchHitToCard).filter(Boolean);
  const hasMore = items.length >= 20;
  return { items, hasMore };
}

export { RAPIDAPI_HOST };
