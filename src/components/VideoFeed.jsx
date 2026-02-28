import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCw } from 'lucide-react';
import VideoCard from './VideoCard';
import { useVideoFeed } from '../context/VideoFeedContext';
import { searchVideos as searchVideosApi } from '../api/videoFeedApi';
import { descriptionFromTitle } from '../utils/descriptionFromTitle';

function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(Number(seconds))) return '0:00';
  const n = Math.floor(Number(seconds));
  const m = Math.floor(n / 60);
  const s = n % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function mapSearchHitToCard(v) {
  const title = v.title || 'Video';
  return {
    id: v.id,
    title,
    channel: v.channel || 'Creator',
    views: v.views ?? 0,
    thumbnail: v.thumbnailUrl || v.thumbnail || '',
    duration: formatDuration(v.duration),
    durationSeconds: Number(v.duration) || 0,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(v.id)}`,
    videoSrc: v.videoUrl || '',
    likes: '0',
    comments: '0',
    description: descriptionFromTitle(title),
  };
}

export default function VideoFeed({
  onVideoClick,
  searchQuery = '',
  userUploadedVideos = [],
}) {
  const {
    feedVideos,
    publicVideos,
    pageSize = 50,
    error,
    setError,
    isLoading,
    isLoadingMore,
    loadNext,
    invalidate,
  } = useVideoFeed();

  const [activePreviewId, setActivePreviewId] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const sentinelRef = useRef(null);
  const endOfPageOneRef = useRef(null);
  const pageTwoLoadedRef = useRef(false);

  useEffect(() => {
    const q = String(searchQuery || '').trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    searchVideosApi({ q, page: 1, filter: 'relevance' })
      .then((res) => {
        if (cancelled) return;
        const raw = Array.isArray(res?.data) ? res.data : [];
        const withThumbnail = raw.filter((v) => (v.thumbnailUrl || v.thumbnail || '').trim() !== '');
        setSearchResults(withThumbnail.map(mapSearchHitToCard));
      })
      .catch(() => {
        if (!cancelled) setSearchResults([]);
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });
    return () => { cancelled = true; };
  }, [searchQuery]);

  const publicFiltered = searchQuery
    ? publicVideos.filter(
        (v) =>
          (v.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (v.channel || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : publicVideos;
  const feedFiltered = searchQuery
    ? feedVideos.filter(
        (v) =>
          (v.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (v.channel || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : feedVideos;
  const feedFromApi = feedFiltered.filter((v) => !publicVideos.some((p) => p.id === v.id));
  const seenIds = new Set();
  const dedupe = (arr) =>
    arr.filter((v) => {
      const id = v?.id ?? v?.videoId;
      if (id == null || seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });
  const withUser =
    userUploadedVideos?.length
      ? [...dedupe(userUploadedVideos), ...dedupe(publicFiltered), ...dedupe(feedFromApi)]
      : [...dedupe(publicFiltered), ...dedupe(feedFromApi)];
  const withThumbnail = withUser.filter(
    (v) =>
      (v.thumbnail && String(v.thumbnail).trim() !== '') ||
      (v.source === 'rtdb' && v.videoSrc)
  );
  const feedMerged = withThumbnail;
  const isSearchMode = String(searchQuery || '').trim() !== '';
  const merged = isSearchMode ? searchResults : feedMerged;
  const showFeedLoading = isSearchMode ? searchLoading : isLoading;
  const showFeedError = isSearchMode ? null : error;

  // Infinite scroll: only when not in search mode
  useEffect(() => {
    if (isSearchMode) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (isLoading || isLoadingMore) return;
        loadNext();
      },
      { rootMargin: '200px', threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isSearchMode, isLoading, isLoadingMore, loadNext]);

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
          <button
            type="button"
            onClick={() => invalidate()}
            disabled={showFeedLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-[#FF4654] hover:bg-gray-100 disabled:opacity-50"
            title="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${showFeedLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {showFeedError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between gap-2">
            <span>{showFeedError}</span>
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
          {merged.length === 0 && showFeedLoading &&
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
          {merged.length === 0 && !showFeedLoading && (
            <p className="col-span-full text-gray-500 py-8 text-center">
              {isSearchMode ? `No videos found for "${searchQuery}".` : 'No videos yet. Check your API config.'}
            </p>
          )}
          {merged.length > 0 &&
            merged.map((video, index) => (
              <React.Fragment key={`${video?.id ?? video?.videoId ?? 'feed'}-${index}`}>
                {index === pageSize && (
                  <div
                    ref={endOfPageOneRef}
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
            ))}
        </motion.div>

        <div
          ref={sentinelRef}
          className="w-full py-8 flex flex-col items-center justify-center min-h-[80px] gap-4"
        >
          {(showFeedLoading || isLoadingMore) && merged.length > 0 && (
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-[#FF4654] rounded-full animate-bounce" />
              <div className="w-3 h-3 bg-[#FF7043] rounded-full animate-bounce [animation-delay:0.1s]" />
              <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            </div>
          )}
          {!showFeedLoading && !isLoadingMore && merged.length > 0 && !isSearchMode && (
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
