// component/VideoGrid.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import VideoCard from './VideoCard';
import { searchVideos, getTrending } from '../services/videoService';

export default function VideoGrid({
  userUploadedVideos = [],
  onVideoClick,
  searchQuery = '',
  useRemote = true, // if true, fetch remote videos from backend
  remoteApi // optional; if not provided we'll prefer VITE_API_URL or '/api/videos/search'
}) {
  const [videos, setVideos] = useState([
    ...userUploadedVideos
  ]);
  const [loading, setLoading] = useState(false);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [remoteError, setRemoteError] = useState(null);
  const observerTarget = useRef(null);
  const fetchingRef = useRef(false); // prevents concurrent requests
  // Smart search: exact matches first, then fuzzy/suggested
  const getDisplayVideos = () => {
    if (!searchQuery) return videos;
    const query = searchQuery.toLowerCase();
    const words = query.split(/\s+/).filter(Boolean);
    // Score each video by relevance
    const scored = videos.map((video) => {
      const titleLower = video.title.toLowerCase();
      const channelLower = video.channel.toLowerCase();
      let score = 0;
      // Exact substring match in title
      if (titleLower.includes(query)) score += 10;
      // Exact substring match in channel
      if (channelLower.includes(query)) score += 8;
      // Individual word matches
      words.forEach((word) => {
        if (titleLower.includes(word)) score += 3;
        if (channelLower.includes(word)) score += 2;
      });
      // First letter match bonus
      if (titleLower.startsWith(query[0])) score += 1;
      return {
        video,
        score
      };
    });
    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);
    // If we have matches (score > 0), show them first, then fill with suggestions
    const matched = scored.filter((s) => s.score > 0).map((s) => s.video);
    const unmatched = scored.filter((s) => s.score === 0).map((s) => s.video);
    // Always return at least 6 videos — fill with shuffled suggestions if needed
    if (matched.length >= 6) return matched;
    // Shuffle unmatched for variety
    const shuffled = [...unmatched].sort(() => Math.random() - 0.5);
    return [...matched, ...shuffled].slice(0, Math.max(9, matched.length));
  };
  const displayVideos = getDisplayVideos();
  // Do not render video cards without an active thumbnail
  const displayVideosWithThumbnail = displayVideos.filter(
    (v) =>
      (v.thumbnail && String(v.thumbnail).trim() !== '') ||
      (v.thumbnailUrl && String(v.thumbnailUrl || '').trim() !== '')
  );
  const hasExactMatches =
  searchQuery &&
  displayVideosWithThumbnail.some((v) => {
    const q = searchQuery.toLowerCase();
    return (
      v.title.toLowerCase().includes(q) || v.channel.toLowerCase().includes(q));

  });
  // Infinite scroll logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !searchQuery) {
          loadMoreVideos();
        }
      },
      {
        threshold: 0.1
      }
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loading, videos, searchQuery]);
  // Update videos when user uploads new ones
  useEffect(() => {
    if (userUploadedVideos.length > 0) {
      setVideos(() => [...userUploadedVideos]);
    }
  }, [userUploadedVideos]);

  // compute API URL: prefer explicit prop -> VITE_API_URL env var -> dev default -> same-origin
  const apiBase =
    (import.meta.env && import.meta.env.VITE_API_URL) ||
    (import.meta.env?.DEV ? 'http://localhost:5000' : '') ||
    '';
  const apiUrl =
    remoteApi ||
    (apiBase ? `${String(apiBase).replace(/\/$/, '')}/api/videos/search` : '/api/videos/search');
  // Fetch remote videos from backend when useRemote is true
  useEffect(() => {
    let mounted = true;
    async function loadRemote(q, currentPage) {
      if (!useRemote || fetchingRef.current || !mounted) return;
      fetchingRef.current = true;
      setRemoteLoading(true);
      try {
        console.info(`[VideoGrid] loadRemote start page=${currentPage} query="${q}"`);
        let items = [];
        if (remoteApi === 'pornhub' || String(apiUrl).includes('pornhub')) {
          items = await getTrending(currentPage);
        } else if (q) {
          // respect search queries
          items = await searchVideos({ q, page: currentPage });
        } else {
          items = await fetchVideos({ page: currentPage, limit: 10 });
        }

        console.info(`[VideoGrid] loadRemote -> raw items (page=${currentPage}):`, items);
        if (!mounted) return;

        setRemoteError(null);
        const raw = Array.isArray(items) ? items : [];

        if (!raw.length) {
          console.warn(`[VideoGrid] No remote items returned by service (page=${currentPage}). raw.length=0`);
        }

        // Map into UI shape expected by VideoCard
        const remoteVideos = raw.map((it) => {
          if (!it || !it.thumbnail || !it.video_url) return null;
          return {
            id: it.id,
            title: it.title,
            channel: it.channel || it.uploader || '',
            thumbnail: it.thumbnail,
            videoSrc: it.video_url,
            duration: it.duration || ''
          };
        }).filter(Boolean);

        setVideos((prev) => {
          const preserved = prev.filter(v => !String(v.id).startsWith('remote-'));
          if (page <= 1) return [...remoteVideos, ...preserved];
          const existingIds = new Set(prev.map(pv => String(pv.id)));
          const filteredNew = remoteVideos.filter(rv => !existingIds.has(String(rv.id)));
          return [...prev, ...filteredNew];
        });
      } catch (err) {
        console.error('Failed fetching remote videos', err);
        if (mounted) setRemoteError(err && err.message ? err.message : String(err));
      } finally {
        fetchingRef.current = false;
        if (mounted) setRemoteLoading(false);
      }
    }

    if (useRemote) {
      // don't default to 'trending' — request whatever query the caller provided (may be empty)
      loadRemote(searchQuery);
    }
    return () => { mounted = false; };
  }, [useRemote, searchQuery, page]);
  const loadMoreVideos = () => {
    // trigger next page load
    setLoading(true);
    setPage((p) => p + 1);
    // loading flag will be cleared by the remote fetch finally block
    setTimeout(() => setLoading(false), 500);
  };
  return (
    <div className="flex-1">
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
          displayVideosWithThumbnail.map((video, index) =>
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
          {loading &&
        <div className="flex gap-2">
              <div className="w-3 h-3 bg-[#FF4654] rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-[#FF7043] rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce delay-200"></div>
            </div>
        }
        </div>
      }
    </div>);

}