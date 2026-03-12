/**
 * Parse duration from API (number of seconds, or string "M:SS" or "H:MM:SS") to seconds.
 */
export function parseDurationToSeconds(val) {
  if (val == null || val === '') return 0;
  const n = Number(val);
  if (!Number.isNaN(n) && n >= 0) return Math.floor(n);
  const s = String(val).trim();
  const parts = s.split(':').map(Number);
  if (parts.length === 2 && parts.every((p) => !Number.isNaN(p))) {
    const [m, sec] = parts;
    return Math.max(0, Math.floor(m) * 60 + Math.floor(sec));
  }
  if (parts.length === 3 && parts.every((p) => !Number.isNaN(p))) {
    const [h, m, sec] = parts;
    return Math.max(0, Math.floor(h) * 3600 + Math.floor(m) * 60 + Math.floor(sec));
  }
  return 0;
}

/**
 * Format duration as "M:SS" or "H:MM:SS".
 * Accepts: number (seconds), or string ("12:34", "1:05:30", or "90").
 */
export function formatDuration(secondsOrString) {
  const sec =
    typeof secondsOrString === 'number' && !Number.isNaN(secondsOrString)
      ? Math.floor(secondsOrString)
      : parseDurationToSeconds(secondsOrString);
  if (sec <= 0) return '0:00';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}
