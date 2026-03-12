const BASE =
  (import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof window !== 'undefined' && import.meta.env?.DEV ? 'http://localhost:5000' : '') ||
  '';

function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${BASE.replace(/\/$/, '')}${p}`;
}

/**
 * GET /api/creators?limit=100 — list all creators, sorted by rankingScore desc.
 */
export async function getCreators(limit = 100) {
  const url = apiUrl(`/api/creators?limit=${Math.max(1, limit)}`);
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || res.statusText || 'Failed');
  const list = data.data;
  return Array.isArray(list) ? list : [];
}

/**
 * GET /api/creators/:slug — creator profile + videos.
 * On 429 throws so UI can show "Rate limit exceeded".
 */
export async function getCreatorBySlug(slug) {
  if (!slug) return null;
  const url = apiUrl(`/api/creators/${encodeURIComponent(slug)}`);
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (res.status === 429) {
    throw new Error('Rate limit exceeded. Please try again in a few minutes.');
  }
  if (!res.ok) return null;
  return data.data || null;
}
