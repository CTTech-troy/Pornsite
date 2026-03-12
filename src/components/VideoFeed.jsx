import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import VideoCard from './VideoCard';
import { descriptionFromTitle } from '../utils/descriptionFromTitle';
import { fetchTrendingVideos, fetchHomeFeed } from '../api/trendingApi';

function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(Number(seconds))) return '0:00';
  const n = Math.floor(Number(seconds));
  const m = Math.floor(n / 60);
  const s = n % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Normalize v2/search API response: can be { videos: [] }, { data: {} }, or array */
function extractVideosFromSearchResponse(data) {
  if (!data || typeof data !== 'object') return [];
  if (Array.isArray(data)) return data;
  const videos = data.videos ?? (data.data && Array.isArray(data.data.videos) ? data.data.videos : null) ?? data.data ?? data.results ?? data.items ?? data.list ?? [];
  return Array.isArray(videos) ? videos : [];
}

function mapSearchHitToCard(v) {
  if (!v || typeof v !== 'object') return null;
  const title = v.title || v.title_clean || v.name || 'Video';
  const thumb = v.thumb ?? v.thumbnail ?? v.thumbnailUrl ?? v.poster ?? (v.thumbs && (v.thumbs[0]?.src ?? v.thumbs[0])) ?? '';
  const thumbStr = typeof thumb === 'string' ? thumb : (thumb?.src ?? thumb?.url ?? '');
  return {
    id: v.video_id ?? v.id ?? v.key ?? v.url ?? `v-${Math.random().toString(36).slice(2)}`,
    title: String(title),
    channel: v.channel ?? v.uploader ?? v.creator ?? (v.pornstars && (Array.isArray(v.pornstars) ? v.pornstars[0] : v.pornstars)) ?? 'Creator',
    views: v.views ?? v.views_count ?? 0,
    thumbnail: thumbStr,
    duration: formatDuration(v.duration),
    durationSeconds: parseDurationToSeconds(v.duration) || Number(v.duration) || 0,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(v.video_id || v.id || title)).slice(0, 50)}`,
    videoSrc: v.url ?? v.video_url ?? v.link ?? '',
    likes: v.rating ?? '0',
    comments: '0',
    time: v.time ?? v.added ?? '',
    description: descriptionFromTitle(title),
  };
}

export default function VideoFeed({
  onVideoClick,
  searchQuery = '',
  userUploadedVideos = [],
}) {
  const [localVideos, setLocalVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [activePreviewId, setActivePreviewId] = useState(null);
  const observerTargetRef = useRef(null);

  const pageSize = 20;
  const isSearchMode = Boolean(searchQuery);
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY || '';
  const hasValidApiKey = Boolean(apiKey && apiKey !== 'YOUR_API_KEY' && apiKey.length > 10);
  const RAPIDAPI_HOST = 'pornhub2.p.rapidapi.com';

  const fetchVideos = useCallback(async (pageNum, isRefresh = false) => {
    const isTrendingMode = !searchQuery.trim();
    const key = import.meta.env.VITE_RAPIDAPI_KEY || '';
    const trendingKey = import.meta.env.VITE_RAPIDAPI_TRENDING_KEY || key;
    const apiBase = (import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL).trim()) || '';
    const hasKey = (k) => k && k !== 'YOUR_API_KEY' && k.length > 10;
    const useBackendForTrending = Boolean(apiBase);

    if (isTrendingMode) {
      if (!useBackendForTrending && !hasKey(trendingKey)) {
        setError('Configure backend .env (RAPIDAPI_TRENDING_*) and set VITE_API_URL in frontend .env, or set VITE_RAPIDAPI_KEY for trending.');
        setIsLoading(false);
        setHasMore(false);
        return;
      }
      try {
        setIsLoading(true);
        if (isRefresh) {
          setError(null);
          setHasMore(true);
          setPage(1);
        }
        const pagesToFetch = isRefresh ? 3 : 1;
        const startPage = isRefresh ? 1 : pageNum;
        const { items, hasMore: more, nextPage: next } = await fetchHomeFeed(startPage, pagesToFetch, 'hot');
        if (next != null) setNextPage(next);
        if (items.length === 0) setHasMore(false);
        else setHasMore(Boolean(more));
        setLocalVideos((prev) => (isRefresh ? items : [...prev, ...items]));
      } catch (err) {
        try {
          const { items, hasMore: more } = await fetchTrendingVideos(isRefresh ? 1 : pageNum, trendingKey);
          setNextPage(isRefresh ? 2 : pageNum + 1);
          setHasMore(Boolean(more));
          setLocalVideos((prev) => (isRefresh ? items : [...prev, ...items]));
        } catch (fallbackErr) {
          setError(fallbackErr?.message || err?.message || 'Failed to load feed');
          setHasMore(false);
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!hasValidApiKey) {
      setError('API key not configured. Set VITE_RAPIDAPI_KEY in your environment.');
      setIsLoading(false);
      setHasMore(false);
      return;
    }
    try {
      setIsLoading(true);
      if (isRefresh) {
        setError(null);
        setHasMore(true);
      }

      const searchTerm = searchQuery.trim();
      const params = new URLSearchParams({
        search: searchTerm,
        page: String(pageNum),
        period: 'weekly',
        ordering: 'newest',
        thumbsize: 'small',
      });
      const url = `https://${RAPIDAPI_HOST}/v2/search?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': RAPIDAPI_HOST,
        },
      });

      if (!response.ok) throw new Error('Search failed');
      const raw = await response.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('Invalid response');
      }

      const items = extractVideosFromSearchResponse(data);
      if (items.length === 0) setHasMore(false);
      const mapped = items.map((v) => mapSearchHitToCard(v)).filter(Boolean);

      setLocalVideos((prev) => (isRefresh ? mapped : [...prev, ...mapped]));
    } catch (err) {
      setError(err?.message || 'Failed to load videos');
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [hasValidApiKey, apiKey, searchQuery]);

  useEffect(() => {
    setPage(1);
    const isTrendingMode = !searchQuery.trim();
    const trendingKey = import.meta.env.VITE_RAPIDAPI_TRENDING_KEY || import.meta.env.VITE_RAPIDAPI_KEY || '';
    const canFetchTrending = (import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL).trim() !== '') || (trendingKey && trendingKey !== 'YOUR_API_KEY' && trendingKey.length > 10);
    if (isTrendingMode) {
      if (canFetchTrending) fetchVideos(1, true);
      else { setIsLoading(false); setHasMore(false); setLocalVideos([]); }
    } else {
      if (hasValidApiKey) fetchVideos(1, true);
      else { setIsLoading(false); setHasMore(false); setLocalVideos([]); }
    }
  }, [searchQuery, hasValidApiKey, fetchVideos]);

  const loadNext = () => {
    if (isLoading || !hasMore) return;
    const isTrendingMode = !searchQuery.trim();
    if (isTrendingMode) {
      fetchVideos(nextPage, false);
      setPage(nextPage);
    } else {
      const p = page + 1;
      setPage(p);
      fetchVideos(p, false);
    }
  };

  const invalidate = () => {
    setPage(1);
    setNextPage(2);
    const isTrendingMode = !searchQuery.trim();
    const apiBase = (import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL).trim()) || '';
    const canFetchTrending = apiBase || (import.meta.env.VITE_RAPIDAPI_KEY && import.meta.env.VITE_RAPIDAPI_KEY !== 'YOUR_API_KEY');
    if (isTrendingMode && canFetchTrending) {
      fetchVideos(1, true);
      return;
    }
    if (hasValidApiKey) fetchVideos(1, true);
    else { setError(null); setHasMore(false); setLocalVideos([]); }
  };

  const dedupe = (arr) => {
    const seen = new Set();
    return arr.filter((v) => {
      const id = v?.id ?? v?.videoId;
      if (id == null || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  };

  // Filter: keep creator videos with thumbnail or rtdb source; keep API videos if they have id+title (thumbnail optional so we don't drop API results)
  const userValid = dedupe(userUploadedVideos || []).filter(
    (v) => (v.thumbnail && String(v.thumbnail).trim() !== '') || (v.source === 'rtdb' && v.videoSrc)
  );
  const apiValid = dedupe(localVideos).filter(
    (v) => (v && (v.id || v.videoId)) && ((v.thumbnail && String(v.thumbnail).trim() !== '') || (v.source === 'rtdb' && v.videoSrc) || (v.title && String(v.title).trim() !== ''))
  );

  // 60/40 Mix Algorithm
  // Mix 6 creator videos and 4 API videos for every 10 videos
  const merged = [];
  let userIdx = 0;
  let apiIdx = 0;

  while (userIdx < userValid.length || apiIdx < apiValid.length) {
    // Take up to 6 creator videos
    for (let i = 0; i < 6 && userIdx < userValid.length; i++) {
      merged.push(userValid[userIdx++]);
    }
    // Take up to 4 API videos
    for (let i = 0; i < 4 && apiIdx < apiValid.length; i++) {
      merged.push(apiValid[apiIdx++]);
    }
  }

  const loadNextRef = useRef();
  useEffect(() => {
    loadNextRef.current = loadNext;
  });

  // Track loading in a ref to read from IntersectionObserver callback without stale closure
  const isLoadingRef = useRef(isLoading);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
  const observerDebounceRef = useRef(null);

  // Infinite scroll: load next (loops to page 1 after last page) when target is visible
  useEffect(() => {
    const el = observerTargetRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        // prevent multiple rapid triggers while a fetch is in flight
        if (isLoadingRef.current) return;
        if (observerDebounceRef.current) return;
        observerDebounceRef.current = setTimeout(() => {
          observerDebounceRef.current = null;
          if (!isLoadingRef.current) loadNextRef.current?.();
        }, 250);
      },
      { rootMargin: '200px', threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-[#1A1A2E] flex items-center gap-2">
            {searchQuery ? (
              <>
                <Search className="w-6 h-6 text-[#FF4654]" />
                Results for &ldquo;{searchQuery}&rdquo;
              </>
            ) : (
              'Trending Now'
            )}
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between gap-2">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => { setError(null); invalidate(); }}
              className="px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        )}

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.05 },
            },
          }}
        >
          {merged.length === 0 && isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`skel-${i}`} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl aspect-video w-full mb-2" />
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded mb-2" />
                    <div className="h-2 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          {merged.length === 0 && !isLoading && (
            <p className="col-span-full text-gray-500 py-8 text-center">
              {isSearchMode
                ? (!hasValidApiKey
                  ? 'No videos available. Set VITE_RAPIDAPI_KEY to search.'
                  : `No videos found for "${searchQuery}".`)
                : (!(import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL).trim()) && !(import.meta.env.VITE_RAPIDAPI_KEY || import.meta.env.VITE_RAPIDAPI_TRENDING_KEY)?.length
                  ? 'No videos available. Set VITE_API_URL (backend) or VITE_RAPIDAPI_KEY for trending.'
                  : 'No trending videos available.')}
            </p>
          )}
          {merged.length > 0 &&
            merged.map((video, index) => {
              const isTriggerPoint = index === merged.length - 3;
              return (
                <React.Fragment key={String(video?.id ?? video?.videoId ?? `feed-${index}`)}>
                  {isTriggerPoint && (
                    <div
                      ref={observerTargetRef}
                      className="col-span-full h-0 w-full"
                      aria-hidden
                    />
                  )}
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                  >
                    <VideoCard
                      {...video}
                      durationSeconds={video.durationSeconds}
                      onClick={() => onVideoClick?.(video)}
                      onHoverStart={() => setActivePreviewId(video.id)}
                      onHoverEnd={() => setActivePreviewId((id) => (id === video.id ? null : id))}
                      activePreviewId={activePreviewId}
                    />
                  </motion.div>
                </React.Fragment>
              );
            })}
        </motion.div>

        <div
          className="w-full py-8 flex flex-col items-center justify-center min-h-[80px] gap-4"
        >
          {isLoading && merged.length > 0 && (
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-[#FF4654] rounded-full animate-bounce" />
              <div className="w-3 h-3 bg-[#FF7043] rounded-full animate-bounce [animation-delay:0.1s]" />
              <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            </div>
          )}
          {!isLoading && merged.length > 0 && (
            <button
              type="button"
              onClick={() => loadNext()}
              className="px-5 py-2.5 rounded-xl bg-[#F0F2F5] text-[#1A1A2E] font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              Load more videos
            </button>
          )}
        </div>
      </div>
    </>
  );
}
