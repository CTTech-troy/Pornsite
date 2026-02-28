const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : '/' + path}`;
  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch (fetchErr) {
    const msg = fetchErr?.message || String(fetchErr);
    if (msg.includes('fetch failed') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      throw new Error('Cannot reach server. Check that the backend is running at ' + (BASE || 'API URL') + ' and try again.');
    }
    throw fetchErr;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText || 'Request failed');
  return data;
}

export async function createLive(hostId, hostDisplayName = null) {
  const { data } = await request('/api/live/create', {
    method: 'POST',
    body: JSON.stringify({ hostId, hostDisplayName: hostDisplayName || undefined }),
  });
  return data;
}

export async function getMyActiveLive(hostId) {
  if (!hostId) return null;
  const { data } = await request(`/api/live/my-active?hostId=${encodeURIComponent(hostId)}`);
  return data;
}

export async function getLive(id) {
  const { data } = await request(`/api/live/${id}`);
  return data;
}

export async function listActiveLives() {
  const { data } = await request('/api/live?status=live');
  return data;
}

export async function getGiftCatalog() {
  const { data } = await request('/api/gifts');
  return data;
}
