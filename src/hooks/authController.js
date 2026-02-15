const API_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

async function request(path, opts = {}) {
  const url = `${API_URL.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
    method: opts.method || 'POST',
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body: json };
}

export async function signupWithEmail(name, email, password) {
  return request('/api/auth/signup', { body: { name, email, password }, method: 'POST' });
}

export async function loginWithEmail(email, password) {
  return request('/api/auth/login', { body: { email, password }, method: 'POST' });
}

export async function loginWithGoogle(payload) {
  // payload should include { email, displayName, photoURL }
  return request('/api/auth/google', { body: payload, method: 'POST' });
}

export async function resendVerification(email) {
  return request('/api/auth/resend-verification', { body: { email }, method: 'POST' });
}

export async function applyCreator(uid, applicationData) {
  return request('/api/auth/apply-creator', { body: { uid, applicationData }, method: 'POST' });
}

export async function approveCreator(adminSecret, user_id, approve = true) {
  return request('/api/auth/approve-creator', { body: { user_id, approve }, method: 'POST', headers: { 'x-admin-secret': adminSecret } });
}

export async function uploadMedia(formData) {
  const API_UPLOAD = `${API_URL.replace(/\/$/, '')}/api/auth/media/upload`;
  const res = await fetch(API_UPLOAD, {
    method: 'POST',
    body: formData,
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body: json };
}

export default {
  signupWithEmail,
  loginWithEmail,
  loginWithGoogle,
  resendVerification,
  applyCreator,
  approveCreator,
  uploadMedia,
};
