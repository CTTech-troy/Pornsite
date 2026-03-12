// frontend/src/services/videoService.js
import { formatDuration, parseDurationToSeconds } from '../utils/formatDuration';

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await res.json();
    return { status: res.status, body };
  }
  const text = await res.text();
  try {
    return { status: res.status, body: JSON.parse(text) };
  } catch (e) {
    return { status: res.status, body: text };
  }
}

// no pornhub embed conversion here anymore

const API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || '';

// No client-side scraper — rely on backend endpoints for trending/search results.

/**
 * Fetch videos paginated from backend.
 * Returns an array of normalized video objects.
 */
export async function fetchVideos({ page = 1, limit = 20 } = {}) {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const url = `${API_BASE}/api/videos?page=${encodeURIComponent(pageNum)}&limit=${encodeURIComponent(limitNum)}`;
  try {
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    const arr = Array.isArray(body) ? body : (body && body.data ? body.data : []);
    return Array.isArray(arr) ? arr : [];
  } catch (err) {
    console.error('[videoService] fetchVideos error', err);
    throw err;
  }
}

export async function searchVideos({ q = '', page = 1 } = {}) {
  const url = `${API_BASE}/api/videos/search?q=${encodeURIComponent(q)}&page=${encodeURIComponent(page)}`;
  try {
    const { status, body } = await fetchJson(url);
    if (status >= 400) throw new Error('Search returned status ' + status);
    const dataPart = body && (body.data || body.results || body.videos || body.items || body);
    return Array.isArray(dataPart) ? dataPart : [];
  } catch (err) {
    console.error('videoService.searchVideos error', err);
    return [];
  }
}

export async function getTrending(page = 1, limit = 20) {
  // Prefer backend trending endpoint; fallback to paginated feed.
  try {
    const items = await fetchVideos({ page, limit });
    // Map backend's shape to the UI-friendly shape if necessary
    return Array.isArray(items)
      ? items.map((it) => ({
        id: it.id || it.videoId || it.video_id || it.url || String(Math.random()).slice(2),
        title: it.title || it.name || '',
        channel: it.channel || it.uploader || it.author || '',
        thumbnail: it.thumbnail || it.thumbnailUrl || it.preview || '',
        video_url: it.video_url || it.videoUrl || it.url || it.videoSrc || '',
        duration: formatDuration(it.duration ?? it.length),
        durationSeconds: parseDurationToSeconds(it.duration ?? it.length) || 0,
      }))
      : [];
  } catch (err) {
    console.error('videoService.getTrending error', err);
    return [];
  }
}

export async function downloadVideo(videoLink) {
  const url = `${API_BASE}/videos/download`;
  try {
    const { status, body } = await fetchJson(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: videoLink }) });
    if (status >= 400) throw new Error('Download failed ' + status);
    return body;
  } catch (err) {
    console.error('videoService.downloadVideo error', err);
    throw err;
  }
}

export async function getVideoById(videoId) {
  const url = `${API_BASE}/api/videos/${encodeURIComponent(videoId)}`;
  try {
    const { status, body } = await fetchJson(url);
    if (status >= 400) throw new Error('Get video by ID failed ' + status);
    return body && body.data ? body.data : body;
  } catch (err) {
    console.error('videoService.getVideoById error', err);
    throw err;
  }
}

export default {
  searchVideos,
  getTrending,
  downloadVideo,
  getVideoById,
  fetchVideos,
};
