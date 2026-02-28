/**
 * Generate a short description from a video title (for API videos that have no description).
 * Uses simple templates to rephrase the title – no external API.
 */

const PREFIXES = [
  'In this video we take a look at',
  'This video is all about',
  'Here we explore',
  'Join us for',
  'Check out',
  'Discover',
  'A closer look at',
  'Everything you need to know about',
];

const SUFFIXES = [
  ' Hope you enjoy!',
  ' Don\'t forget to like and subscribe for more.',
  ' Thanks for watching!',
  ' Let us know what you think in the comments.',
  ' Enjoy the video!',
];

function pick(arr, seed) {
  const n = arr.length;
  if (n === 0) return '';
  const i = Math.abs(seed) % n;
  return arr[i];
}

/**
 * Returns a 1–2 sentence description based on the title.
 * Deterministic per title (same title → same description).
 */
export function descriptionFromTitle(title) {
  const t = (title || '').trim();
  if (!t) return 'Watch this video. Hope you enjoy!';
  const seed = t.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const prefix = pick(PREFIXES, seed);
  const suffix = pick(SUFFIXES, seed + 1);
  const normalized = t.endsWith('.') ? t.slice(0, -1) : t;
  return `${prefix} ${normalized}.${suffix}`;
}
