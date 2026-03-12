import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Users,
  Video as VideoIcon,
  CheckCircle2,
  Bell,
  Loader2,
} from 'lucide-react';
import VideoCard from './VideoCard';
import { fetchSearchVideos } from '../api/pornhub2Search';

export default function PublicProfile({
  creator,
  videos = [],
  searchTerm = null,
  onBack,
  onVideoClick,
}) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [apiVideos, setApiVideos] = useState([]);
  const [loading, setLoading] = useState(!!searchTerm);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalViews, setTotalViews] = useState(null);

  const loadPage = useCallback(async (pageNum, append = false) => {
    if (!searchTerm) return;
    setError(null);
    setLoading(true);
    try {
      const apiKey = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_RAPIDAPI_KEY;
      const { items, hasMore: more } = await fetchSearchVideos(searchTerm, pageNum, apiKey);
      setApiVideos((prev) => (append ? [...prev, ...items] : items));
      setHasMore(more);
      if (pageNum === 1 && items.length > 0) {
        const sum = items.reduce((acc, v) => acc + (Number(v.views) || 0), 0);
        setTotalViews(sum);
      }
    } catch (err) {
      setError(err && err.message ? err.message : 'Failed to load videos');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm) {
      setPage(1);
      loadPage(1, false);
    } else {
      setApiVideos([]);
      setLoading(false);
      setError(null);
    }
  }, [searchTerm, loadPage]);

  const loadMore = () => {
    if (loading || !hasMore || !searchTerm) return;
    const next = page + 1;
    setPage(next);
    loadPage(next, true);
  };

  const displayVideos = searchTerm ? apiVideos : (videos || []);
  const displayName = creator?.name || searchTerm || 'Creator';
  const displayAvatar = creator?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`;
  const displayFollowers = creator?.followers ?? (totalViews != null ? `${Number(totalViews).toLocaleString()} total views` : '—');
  const displayBio = creator?.bio || `Videos found for "${searchTerm || displayName}".`

  return (
    <div className="min-h-screen bg-[#F8F8FA] pb-12">
      {/* Cover Image */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-gray-800 to-gray-900 relative">
        <button
          onClick={onBack}
          className="absolute top-6 left-6 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30 transition-colors z-10"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        {creator?.coverImage && (
          <img
            src={creator.coverImage}
            alt="Cover"
            className="w-full h-full object-cover opacity-60"
          />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
          <div className="relative">
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg bg-gray-100 object-cover"
            />
            <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left mb-2">
            <h1 className="text-3xl font-black text-gray-900 mb-1 flex items-center justify-center md:justify-start gap-2">
              {displayName}
            </h1>
            <p className="text-gray-500 font-medium mb-4 max-w-md mx-auto md:mx-0">
              {displayBio}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                <Users className="w-4 h-4 text-[#FF6B6B]" />
                <span>{displayFollowers}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                <VideoIcon className="w-4 h-4 text-[#845EF7]" />
                <span>{displayVideos.length} Videos</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${isFollowing ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-black shadow-gray-200'}`}
          >
            {isFollowing ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Following
              </>
            ) : (
              <>
                <Bell className="w-5 h-5" />
                Follow
              </>
            )}
          </button>
        </div>

        {/* Videos Grid */}
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            {searchTerm ? `Videos for "${searchTerm}"` : 'Latest Videos'}
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading && displayVideos.length === 0 ? (
            <div className="flex items-center justify-center py-20 gap-2 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Finding videos...</span>
            </div>
          ) : displayVideos.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    {...video}
                    onClick={() => onVideoClick && onVideoClick(video)}
                  />
                ))}
              </div>
              {searchTerm && hasMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-[#FF4654] text-white font-bold text-sm hover:bg-[#FF7043] disabled:opacity-50 transition-colors"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      'Load more videos'
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">
              No videos available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
