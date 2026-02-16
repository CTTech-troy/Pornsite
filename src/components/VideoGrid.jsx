// component/VideoGrid.jsx
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import VideoCard from './VideoCard';
import { searchVideos, getTrending, fetchVideos } from '../services/videoService';

export default function VideoGrid({
  userUploadedVideos = [],
  onVideoClick,
  searchQuery = '',
  useRemote = true,
  remoteApi
}) {
  const [videos, setVideos] = useState([...userUploadedVideos]);
  const [loading, setLoading] = useState(false);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [remoteError, setRemoteError] = useState(null);
  const observerTarget = useRef(null);
  const fetchingRef = useRef(false); // prevents concurrent requests

  // Reset when query changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setRemoteError(null);
  }, [searchQuery, useRemote, remoteApi]);

  useEffect(() => {
    let mounted = true;

    async function loadRemote(q, currentPage) {
      if (!useRemote || fetchingRef.current || !mounted) return;
      fetchingRef.current = true;
      setRemoteLoading(true);
      try {
        let items = [];
        if (remoteApi === 'pornhub' || String(apiUrl).includes('pornhub')) {
          items = await getTrending(currentPage);
        } else if (q) {
          // respect search queries
          items = await searchVideos({ q, page: currentPage });
        } else {
          items = await fetchVideos({ page: currentPage, limit: 10 });
        }

        if (!mounted) return;

        setRemoteError(null);
        const raw = Array.isArray(items) ? items : [];

        // Map into UI shape expected by VideoCard
        const remoteVideos = raw
          .map((it) => {
            if (!it || !it.thumbnail || !it.url) return null;
            return {
              id: it.id || (`remote-${Math.random().toString(36).slice(2, 9)}`),
              title: it.title || it.name || '',
              channel: it.channel || it.uploader || '',
              thumbnail: it.thumbnail,
              videoSrc: it.video_url || it.url,
              duration: it.duration || it.length || it.video_duration || '',
              views: it.views || it.view_count || '0'
            };
          })
          .filter(Boolean);

        setVideos((prev) => {
          // avoid duplicates by id
          const existingIds = new Set(prev.map((p) => String(p.id)));
          const filteredNew = remoteVideos.filter((rv) => !existingIds.has(String(rv.id)));
          if (currentPage <= 1) {
            // place remote results before local uploaded videos
            const preserved = prev.filter(v => !String(v.id).startsWith('remote-'));
            return [...filteredNew, ...preserved];
          }
          return [...prev, ...filteredNew];
        });

        // If fewer than page size returned, no more available
        if (raw.length < 10) setHasMore(false);
      } catch (err) {
        console.error('Failed fetching remote videos', err);
        if (mounted) setRemoteError(err && err.message ? err.message : String(err));
      } finally {
        fetchingRef.current = false;
        if (mounted) setRemoteLoading(false);
      }
    }

    // Trigger load for current page
    if (useRemote) loadRemote(searchQuery, page);
    return () => { mounted = false; };
  }, [useRemote, searchQuery, page, remoteApi]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !remoteLoading && hasMore && !fetchingRef.current && !searchQuery) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.2 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => { if (observerTarget.current) observer.unobserve(observerTarget.current); };
  }, [loading, remoteLoading, hasMore, searchQuery]);

  const loadMoreVideos = () => {
    if (!hasMore || fetchingRef.current) return;
    setPage((p) => p + 1);
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-[#1A1A2E] flex items-center gap-2">
          {searchQuery ?
          <>
              <Search className="w-6 h-6 text-[#FF4654]" />
              Results for &ldquo;{searchQuery}&rdquo;
            </> :

          'Trending Now'
          }
        </h2>
      </div>

      {/* Show suggestion label if no exact matches but we're still showing content */}
      {searchQuery && !hasExactMatches &&
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
          <Sparkles className="w-4 h-4 text-[#FF7043]" />
          <span>No exact matches — here are some videos you might enjoy</span>
        </div>
      }

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {
            opacity: 0
          },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}>

        {videos.length === 0 ? (
          // Show skeleton placeholders while initial remote load is in progress
          Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl aspect-video w-full mb-2" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded mb-2" />
                  <div className="h-2 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : (
          displayVideos.map((video, index) =>
        <motion.div
          key={`${video.id}-${index}`}
          variants={{
            hidden: {
              opacity: 0,
              y: 20
            },
            show: {
              opacity: 1,
              y: 0
            }
          }}>

            <VideoCard {...video} onClick={() => onVideoClick?.(video)} />
          </motion.div>
          )
        )}
      </motion.div>

      {/* Loading Sentinel - only show if not searching */}
      {!searchQuery &&
        <div ref={observerTarget} className="w-full py-8 flex justify-center">
          {(remoteLoading || loading) ?
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-[#FF4654] rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-[#FF7043] rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce delay-200"></div>
            </div>
            :
            (!hasMore ? <div className="text-sm text-gray-500">No more videos</div> : null)
          }
        </div>
      }
    </div>
  );
}