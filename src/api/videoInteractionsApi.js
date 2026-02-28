/**
 * Unified like/comment API by videoId (external API or upload).
 * GET/POST/DELETE /api/videos/:videoId/like-status, like, comments.
 */
const BASE =
  (import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof window !== 'undefined' && import.meta.env?.DEV ? 'http://localhost:5000' : '') ||
  '';

function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${BASE.replace(/\/$/, '')}${p}`;
}

async function request(path, options = {}) {
  const url = apiUrl(path);
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || res.statusText || 'Request failed');
  return data;
}

async function authRequest(path, idToken, options = {}) {
  const url = apiUrl(path);
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (idToken) headers.Authorization = `Bearer ${idToken}`;
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || res.statusText || 'Request failed');
  return data;
}

/** GET /api/videos/:videoId/like-status */
export async function getLikeStatus(videoId, idToken) {
  const url = apiUrl(`/api/videos/${encodeURIComponent(videoId)}/like-status`);
  const headers = { 'Content-Type': 'application/json' };
  if (idToken) headers.Authorization = `Bearer ${idToken}`;
  const res = await fetch(url, { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { liked: false, totalLikes: 0, totalComments: 0 };
  return {
    liked: !!data.liked,
    totalLikes: Number(data.totalLikes) || 0,
    totalComments: Number(data.totalComments) || 0,
  };
}

/** POST /api/videos/:videoId/like */
export async function likeVideo(videoId, idToken) {
  return authRequest(`/api/videos/${encodeURIComponent(videoId)}/like`, idToken, { method: 'POST' });
}

/** DELETE /api/videos/:videoId/like */
export async function unlikeVideo(videoId, idToken) {
  return authRequest(`/api/videos/${encodeURIComponent(videoId)}/like`, idToken, { method: 'DELETE' });
}

/** GET /api/videos/:videoId/comments */
export async function getComments(videoId) {
  const res = await request(`/api/videos/${encodeURIComponent(videoId)}/comments`);
  return res.data || [];
}

/** POST /api/videos/:videoId/comments */
export async function addComment(videoId, text, idToken) {
  return authRequest(`/api/videos/${encodeURIComponent(videoId)}/comments`, idToken, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}
