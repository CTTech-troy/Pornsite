import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { getVideosPage } from '../api/videoFeedApi';
import { getPublicVideos } from '../api/publicVideosApi';
import { descriptionFromTitle } from '../utils/descriptionFromTitle';

const LIMIT = 50;

function formatTimeAgo(ts) {
  if (!ts) return '';
  const d = Date.now() - Number(ts);
  if (d < 60000) return 'Just now';
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
  return `${Math.floor(d / 86400000)}d ago`;
}

function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(Number(seconds))) return '0:00';
  const n = Math.floor(Number(seconds));
  const m = Math.floor(n / 60);
  const s = n % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function hasActiveThumbnail(v) {
  if (v.thumbnailActive === true) return true;
  const url = v.thumbnailUrl ?? v.thumbnail ?? '';
  return typeof url === 'string' && url.trim() !== '';
}

function mapPublicVideoToCard(p) {
  return {
    id: p.videoId,
    title: p.title || 'Video',
    description: p.description || '',
    channel: p.userId ? `User ${String(p.userId).slice(0, 8)}` : 'Creator',
    views: 0,
    time: formatTimeAgo(p.createdAt),
    thumbnail: '',
    duration: '',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.videoId)}`,
    videoSrc: p.videoUrl || '',
    url: p.videoUrl || '',
    durationSeconds: 0,
    likes: String(p.totalLikes ?? 0),
    comments: String(p.totalComments ?? 0),
    source: 'rtdb',
  };
}

function mapApiVideoToCard(v) {
  const title = v.title || 'Video';
  return {
    id: v.id,
    title,
    channel: v.channel || 'Creator',
    views: v.views ?? 0,
    time: '',
    thumbnail: v.thumbnailUrl || '',
    duration: formatDuration(v.duration),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(v.id)}`,
    videoSrc: v.videoUrl || '',
    durationSeconds: Number(v.duration) || 0,
    likes: String(v.totalLikes ?? 0),
    comments: String(v.totalComments ?? 0),
    description: descriptionFromTitle(title),
  };
}

const VideoFeedContext = createContext(null);

export function VideoFeedProvider({ children }) {
  const [feedVideos, setFeedVideos] = useState([]);
  const [publicVideos, setPublicVideos] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const initialLoadDoneRef = useRef(false);
  const publicLoadDoneRef = useRef(false);
  const fetchingRef = useRef(false);
  const lastRequestedPageRef = useRef(0);

  const loadFeedPage = useCallback(async (pageNum, options = {}) => {
    const { append = false } = options;
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setError(null);
    if (pageNum <= 1 && !append) setIsLoading(true);
    else setIsLoadingMore(true);
    try {
      const res = await getVideosPage({ page: pageNum, limit: LIMIT });
      const rawList = Array.isArray(res.data) ? res.data : [];
      const withThumbnail = rawList.filter(hasActiveThumbnail);
      const list = withThumbnail.map(mapApiVideoToCard);
      const totalPagesVal = Math.max(1, Number(res.totalPages) || 1);
      setTotalPages(totalPagesVal);
      setFeedVideos((prev) => {
        if (pageNum <= 1 && !append) return [...list];
        return [...prev, ...list];
      });
      return { list, totalPagesVal };
    } catch (err) {
      setError(err?.message || 'Failed to load videos');
      if (pageNum <= 1 && !append) setFeedVideos([]);
      throw err;
    } finally {
      fetchingRef.current = false;
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  const loadPublicVideos = useCallback(async () => {
    try {
      const data = await getPublicVideos();
      setPublicVideos(Array.isArray(data) ? data.map(mapPublicVideoToCard) : []);
    } catch {
      setPublicVideos([]);
    } finally {
      publicLoadDoneRef.current = true;
    }
  }, []);

  // Load once on mount: page 1 + public videos
  useEffect(() => {
    if (initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = true;
    loadFeedPage(1)
      .then((result) => {
        if (result) lastRequestedPageRef.current = 1;
      })
      .catch(() => {});
    if (!publicLoadDoneRef.current) loadPublicVideos();
  }, [loadFeedPage, loadPublicVideos]);

  const loadPage = useCallback(
    async (pageNum) => {
      const page = Math.max(1, Number(pageNum) || 1);
      const end = page * LIMIT;
      if (feedVideos.length >= end) return;
      await loadFeedPage(page);
    },
    [loadFeedPage, feedVideos.length]
  );

  /** Load next page for infinite scroll; loops back to page 1 after totalPages. Uses last-requested page so we don't freeze when a page returns fewer than LIMIT items. */
  const loadNext = useCallback(async () => {
    if (fetchingRef.current) return;
    let nextPage = lastRequestedPageRef.current + 1;
    let append = false;
    if (totalPages > 0 && nextPage > totalPages) {
      nextPage = 1;
      append = true;
    }
    await loadFeedPage(nextPage, { append });
    lastRequestedPageRef.current = nextPage;
  }, [loadFeedPage, totalPages]);

  const invalidate = useCallback(() => {
    initialLoadDoneRef.current = true;
    publicLoadDoneRef.current = false;
    lastRequestedPageRef.current = 0;
    setFeedVideos([]);
    setPublicVideos([]);
    setTotalPages(0);
    setError(null);
    setIsLoading(true);
    loadFeedPage(1)
      .then((result) => {
        if (result) lastRequestedPageRef.current = 1;
      })
      .catch(() => {});
    loadPublicVideos();
  }, [loadFeedPage, loadPublicVideos]);

  const value = {
    feedVideos,
    publicVideos,
    totalPages,
    pageSize: LIMIT,
    error,
    setError,
    isLoading,
    isLoadingMore,
    loadPage,
    loadNext,
    invalidate,
    loadFeedPage,
    hasInitiallyLoaded: feedVideos.length > 0 || publicVideos.length > 0,
  };

  return <VideoFeedContext.Provider value={value}>{children}</VideoFeedContext.Provider>;
}

export function useVideoFeed() {
  const ctx = useContext(VideoFeedContext);
  if (!ctx) throw new Error('useVideoFeed must be used within VideoFeedProvider');
  return ctx;
}
