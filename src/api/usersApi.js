const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : '/' + path}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText || 'Request failed');
  return data;
}

export async function getProfile(userId) {
  if (!userId) return null;
  const { data } = await request(`/api/users/${encodeURIComponent(userId)}`);
  return data;
}

export async function followUser(creatorUserId) {
  if (!creatorUserId) throw new Error('missing creator id');
  const { followers } = await request(`/api/users/${encodeURIComponent(creatorUserId)}/follow`, { method: 'POST' });
  return followers;
}
