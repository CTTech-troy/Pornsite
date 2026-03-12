import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Loader2 } from 'lucide-react';
import * as tiktokApi from '../api/tiktokApi';
import TikTokVideoCard from '../components/TikTokVideoCard';
import TikTokUploadModal from '../components/TikTokUploadModal';

export default function TikTokFeedPage({ getToken, isAuthenticated, onLoginClick }) {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const loadFeed = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const { data } = await tiktokApi.getFeed(pageNum, 20);
      setVideos((prev) => (append ? [...prev, ...data] : data));
      setHasMore(data.length >= 20);
    } catch (err) {
      console.error('TikTok feed error', err);
      setVideos((prev) => (append ? prev : []));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed(1, false);
  }, [loadFeed]);

  const loadMore = () => {
    if (loading || !hasMore) return;
    const next = page + 1;
    setPage(next);
    loadFeed(next, true);
  };

  const handleVideoClick = (video) => {
    navigate(`/tiktok/video/${video.video_id}`);
  };

  const handleUploadSuccess = () => {
    setUploadModalOpen(false);
    loadFeed(1, false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-[#1A1A2E]">TikTok-style Feed</h1>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF4654] text-white font-bold hover:bg-[#FF7043] transition-colors"
            >
              <Upload className="w-5 h-5" />
              Upload
            </button>
          )}
        </div>

        {loading && videos.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 text-[#FF4654] animate-spin" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No videos yet. Upload one to get started!</p>
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setUploadModalOpen(true)}
                className="mt-4 text-[#FF4654] font-bold hover:underline"
              >
                Upload video
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {videos.map((video) => (
              <TikTokVideoCard
                key={video.video_id}
                video={video}
                getToken={getToken}
                isAuthenticated={isAuthenticated}
                onLoginClick={onLoginClick}
                onVideoClick={handleVideoClick}
              />
            ))}
            {hasMore && (
              <div className="flex justify-center py-4">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2 rounded-full border-2 border-[#FF4654] text-[#FF4654] font-bold hover:bg-[#FF4654] hover:text-white disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin inline" /> : 'Load more'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <TikTokUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
        getToken={getToken}
        isAuthenticated={isAuthenticated}
        onLoginClick={onLoginClick}
      />
    </div>
  );
}
