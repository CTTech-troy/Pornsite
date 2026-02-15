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

const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '') + '/api' : '/api';

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
  const url = `${API_BASE}/videos/trending?page=${encodeURIComponent(page)}`;
  try {
    const { status, body } = await fetchJson(url);
    if (status >= 400) throw new Error('Trending returned status ' + status);
    const dataPart = body && (body.data || body.results || body.videos || body.items || body);
    return Array.isArray(dataPart) ? dataPart : [];
  } catch (err) {
    console.error('videoService.getTrending error', err);
    throw err;
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

export default {
  searchVideos,
  getTrending,
  downloadVideo,
};
