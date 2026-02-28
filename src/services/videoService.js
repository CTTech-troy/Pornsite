// frontend/src/services/videoService.js
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

const API_BASE = import.meta.env.VITE_API_BASE || '';

/**
 * Fetch videos paginated from backend.
 * Returns an array of normalized video objects.
 */
export async function fetchVideos({ page = 1, limit = 10 } = {}) {
  const offset = Math.max((page - 1) * limit, 0);
  const url = `${API_BASE}/videos?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;
  try {
    console.info('[videoService] fetchVideos -> url:', url);
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    console.info('[videoService] fetchVideos -> raw response:', body);
    // backend may return { success, data } or raw array
    const arr = Array.isArray(body) ? body : (body && body.data ? body.data : []);
    console.info('[videoService] fetchVideos -> normalized array (length=' + (arr?.length || 0) + '):', arr);
    return Array.isArray(arr) ? arr : [];
  } catch (err) {
    console.error('[videoService] fetchVideos error', err);
    throw err;
  }
}

export async function searchVideos({ q = '', page = 1 } = {}) {
  const url = `${API_BASE}/videos/search?q=${encodeURIComponent(q)}&page=${encodeURIComponent(page)}`;
  try {
    const { status, body } = await fetchJson(url);
    if (status >= 400) throw new Error('Search returned status ' + status);
    // Extract array from common keys
    const dataPart = body && (body.data || body.results || body.videos || body.items || body);
    return Array.isArray(dataPart) ? dataPart : [];
  } catch (err) {
    console.error('videoService.searchVideos error', err);
    throw err;
  }
}

export async function getTrending(page = 1) {
  // Trending endpoints removed from backend; return empty fallback to avoid 404s.
  console.debug('videoService.getTrending: backend trending endpoints removed, returning empty list');
  return [];
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
  const url = `${API_BASE}/videos/video/${encodeURIComponent(videoId)}`;
  try {
    const { status, body } = await fetchJson(url);
    if (status >= 400) throw new Error('Get video by ID failed ' + status);
    // Extract from response object that has { ok: true, data: {...} } or just return the full body
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
