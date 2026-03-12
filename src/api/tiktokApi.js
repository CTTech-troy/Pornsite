/**
 * TikTok-style video API: Supabase-backed feed, upload, likes, views, comments.
 * Base: /api/videos/tiktok
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
  const headers = { ...options.headers };
  if (idToken) headers.Authorization = `Bearer ${idToken}`;
  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || res.statusText || 'Request failed');
  return data;
}

/** POST /api/videos/tiktok/upload — FormData: video (file), title, description */
export async function uploadVideo(formData, idToken) {
  const url = apiUrl('/api/videos/tiktok/upload');
  const headers = {};
  if (idToken) headers.Authorization = `Bearer ${idToken}`;
  const res = await fetch(url, { method: 'POST', headers, body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || res.statusText || 'Upload failed');
  return data;
}

/** GET /api/videos/tiktok/feed */
export async function getFeed(page = 1, limit = 20) {
  const data = await request(`/api/videos/tiktok/feed?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`);
  return { data: data.data || [], page: data.page || 1, limit: data.limit || 20 };
}

/** GET /api/videos/tiktok/user/:userId */
export async function getVideosByUser(userId, page = 1, limit = 20) {
  const data = await request(`/api/videos/tiktok/user/${encodeURIComponent(userId)}?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`);
  return { data: data.data || [], page: data.page || 1, limit: data.limit || 20 };
}

/** GET /api/videos/tiktok/:videoId */
export async function getVideo(videoId) {
  const data = await request(`/api/videos/tiktok/${encodeURIComponent(videoId)}`);
  return data.data;
}

/** GET /api/videos/tiktok/:videoId/playback — returns { video, shouldPlayAd, adUrl?, skipAfterSeconds?, hasSeenAd } */
export async function getPlaybackState(videoId, idToken, sessionId = null) {
  const url = apiUrl(`/api/videos/tiktok/${encodeURIComponent(videoId)}/playback`);
  const headers = {};
  if (idToken) headers.Authorization = `Bearer ${idToken}`;
  const qs = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : '';
  const res = await fetch(url + qs, { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || 'Failed');
  return data;
}

/** POST /api/videos/tiktok/:videoId/ad-completed — mark ad as seen */
export async function markAdCompleted(videoId, idToken, sessionId = null) {
  const url = apiUrl(`/api/videos/tiktok/${encodeURIComponent(videoId)}/ad-completed`);
  const headers = { 'Content-Type': 'application/json' };
  if (idToken) headers.Authorization = `Bearer ${idToken}`;
  const body = JSON.stringify(sessionId ? { session_id: sessionId } : {});
  const res = await fetch(url, { method: 'POST', headers, body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || 'Failed');
  return data;
}

/** POST /api/videos/tiktok/:videoId/ad-impression — optional analytics */
export async function recordAdImpression(videoId, { ad_id, skipped }, idToken, sessionId = null) {
  const url = apiUrl(`/api/videos/tiktok/${encodeURIComponent(videoId)}/ad-impression`);
  const headers = { 'Content-Type': 'application/json' };
  if (idToken) headers.Authorization = `Bearer ${idToken}`;
  const body = JSON.stringify({ ad_id, skipped, ...(sessionId ? { session_id: sessionId } : {}) });
  const res = await fetch(url, { method: 'POST', headers, body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return;
  return data;
}

/** GET /api/videos/tiktok/:videoId/like-status */
export async function getLikeStatus(videoId, idToken) {
  const url = apiUrl(`/api/videos/tiktok/${encodeURIComponent(videoId)}/like-status`);
  const headers = {};
  if (idToken) headers.Authorization = `Bearer ${idToken}`;
  const res = await fetch(url, { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { liked: false };
  return { liked: !!data.liked };
}

/** POST /api/videos/tiktok/:videoId/like */
export async function likeVideo(videoId, idToken) {
  return authRequest(`/api/videos/tiktok/${encodeURIComponent(videoId)}/like`, idToken, { method: 'POST' });
}

/** DELETE /api/videos/tiktok/:videoId/like */
export async function unlikeVideo(videoId, idToken) {
  return authRequest(`/api/videos/tiktok/${encodeURIComponent(videoId)}/like`, idToken, { method: 'DELETE' });
}

/** POST /api/videos/tiktok/:videoId/view — optional body: { session_id } for anonymous */
export async function recordView(videoId, idToken, sessionId = null) {
  const url = apiUrl(`/api/videos/tiktok/${encodeURIComponent(videoId)}/view`);
  const headers = { 'Content-Type': 'application/json' };
  if (idToken) headers.Authorization = `Bearer ${idToken}`;
  const body = sessionId ? JSON.stringify({ session_id: sessionId }) : '{}';
  const res = await fetch(url, { method: 'POST', headers, body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || 'Failed');
  return data;
}

/** GET /api/videos/tiktok/:videoId/comments */
export async function getComments(videoId) {
  const data = await request(`/api/videos/tiktok/${encodeURIComponent(videoId)}/comments`);
  return data.data || [];
}

/** POST /api/videos/tiktok/:videoId/comments */
export async function addComment(videoId, text, idToken) {
  return authRequest(`/api/videos/tiktok/${encodeURIComponent(videoId)}/comments`, idToken, {
    method: 'POST',
    body: JSON.stringify({ comment: text }),
  });
}

/** DELETE /api/videos/tiktok/comments/:commentId */
export async function deleteComment(commentId, idToken) {
  return authRequest(`/api/videos/tiktok/comments/${encodeURIComponent(commentId)}`, idToken, { method: 'DELETE' });
}
