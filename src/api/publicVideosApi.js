const BASE = import.meta.env.VITE_API_URL || '';

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

/** GET /api/videos/public */
export async function getPublicVideos() {
  const res = await request('/api/videos/public');
  return res.data || [];
}

/** GET /api/videos/public/:videoId */
export async function getPublicVideoById(videoId) {
  const res = await request(`/api/videos/public/${videoId}`);
  return res.data;
}

/** GET /api/videos/public/:videoId/comments */
export async function getPublicComments(videoId) {
  const res = await request(`/api/videos/public/${videoId}/comments`);
  return res.data || [];
}

/** POST /api/videos/public/:videoId/comments — body: { text } */
export async function addPublicComment(videoId, text, idToken) {
  const res = await authRequest(`/api/videos/public/${videoId}/comments`, idToken, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  return res;
}

/** POST /api/videos/public/:videoId/like */
export async function likePublicVideo(videoId, idToken) {
  const res = await authRequest(`/api/videos/public/${videoId}/like`, idToken, { method: 'POST' });
  return res;
}

/** DELETE /api/videos/public/:videoId/like */
export async function unlikePublicVideo(videoId, idToken) {
  const res = await authRequest(`/api/videos/public/${videoId}/like`, idToken, { method: 'DELETE' });
  return res;
}

/** GET /api/videos/public/:videoId/like-status (optional auth) */
export async function getPublicLikeStatus(videoId, idToken) {
  const url = apiUrl(`/api/videos/public/${videoId}/like-status`);
  const headers = { 'Content-Type': 'application/json' };
  if (idToken) headers.Authorization = `Bearer ${idToken}`;
  const res = await fetch(url, { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { liked: false };
  return { liked: !!data.liked };
}
