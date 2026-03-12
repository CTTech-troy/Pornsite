import React, { useState, useRef } from 'react';
import { Heart, MessageCircle, Eye, Play, Send, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import * as tiktokApi from '../api/tiktokApi';

function formatTime(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    const n = Date.now() - d.getTime();
    if (n < 60000) return 'Just now';
    if (n < 3600000) return `${Math.floor(n / 60000)}m ago`;
    if (n < 86400000) return `${Math.floor(n / 3600000)}h ago`;
    return `${Math.floor(n / 86400000)}d ago`;
  } catch {
    return '';
  }
}

export default function TikTokVideoCard({
  video,
  getToken,
  isAuthenticated,
  onLoginClick,
  onVideoClick,
  showComments = false,
  onCommentsChange,
}) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(video?.likes_count ?? 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(video?.comments_count ?? 0);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [showCommentSection, setShowCommentSection] = useState(showComments);
  const viewRecordedRef = useRef(false);

  const videoId = video?.video_id;
  const storageUrl = video?.storage_url;
  const title = video?.title || 'Video';
  const description = video?.description || '';
  const viewsCount = video?.views_count ?? 0;
  const userId = video?.user_id;

  const recordViewOnce = async () => {
    if (!videoId || viewRecordedRef.current) return;
    viewRecordedRef.current = true;
    try {
      const token = getToken ? await getToken() : null;
      let sessionId = null;
      if (!token && typeof localStorage !== 'undefined') {
        sessionId = localStorage.getItem('tiktok_session_id');
        if (!sessionId) {
          sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
          localStorage.setItem('tiktok_session_id', sessionId);
        }
      }
      await tiktokApi.recordView(videoId, token, sessionId);
    } catch (_) {}
  };

  const loadLikeStatus = async () => {
    if (!videoId) return;
    try {
      const token = getToken ? await getToken() : null;
      const res = await tiktokApi.getLikeStatus(videoId, token);
      setLiked(!!res.liked);
    } catch (_) {}
  };

  const loadComments = async () => {
    if (!videoId) return;
    try {
      const list = await tiktokApi.getComments(videoId);
      setComments(list || []);
      setCommentsCount(list?.length ?? 0);
      onCommentsChange?.(list?.length ?? 0);
    } catch (_) {}
  };

  React.useEffect(() => {
    loadLikeStatus();
  }, [videoId, getToken]);

  React.useEffect(() => {
    if (showCommentSection) loadComments();
  }, [showCommentSection, videoId]);

  const handlePlay = () => {
    recordViewOnce();
  };

  const toggleLike = async () => {
    if (!isAuthenticated) {
      onLoginClick?.();
      return;
    }
    if (!videoId || likeLoading) return;
    setLikeLoading(true);
    try {
      const token = await getToken?.();
      if (!token) return;
      if (liked) {
        const res = await tiktokApi.unlikeVideo(videoId, token);
        setLikesCount(res.likesCount ?? Math.max(0, likesCount - 1));
        setLiked(false);
      } else {
        const res = await tiktokApi.likeVideo(videoId, token);
        setLikesCount(res.likesCount ?? likesCount + 1);
        setLiked(true);
      }
    } catch (_) {}
    setLikeLoading(false);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onLoginClick?.();
      return;
    }
    const text = commentText.trim();
    if (!text || !videoId || commentSubmitting) return;
    setCommentSubmitting(true);
    try {
      const token = await getToken?.();
      if (!token) return;
      const res = await tiktokApi.addComment(videoId, text, token);
      setCommentText('');
      setCommentsCount(res.commentsCount ?? commentsCount + 1);
      await loadComments();
    } catch (_) {}
    setCommentSubmitting(false);
  };

  const handleCardClick = () => {
    if (onVideoClick) onVideoClick(video);
    else window.location.href = `#/tiktok/video/${videoId}`;
  };

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col md:flex-row gap-4 p-4">
        {/* Video + meta */}
        <div className="flex-1 min-w-0">
          <div
            className="relative aspect-video max-w-xl rounded-xl overflow-hidden bg-black cursor-pointer group"
            onClick={handleCardClick}
          >
            <video
              src={storageUrl}
              className="w-full h-full object-contain"
              controls
              playsInline
              poster=""
              onPlay={handlePlay}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/20">
              <Play className="w-14 h-14 text-white/90 fill-white/90" />
            </div>
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
              {viewsCount} views
            </div>
          </div>
          <h3 className="mt-2 font-bold text-[#1A1A2E] line-clamp-2">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{description}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">Creator: {userId ? String(userId).slice(0, 12) + '…' : '—'}</p>
        </div>

        {/* Actions + comments */}
        <div className="flex md:flex-col items-center md:items-end gap-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleLike}
              disabled={likeLoading}
              className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-[#FF4654] disabled:opacity-50"
            >
              <Heart className={`w-6 h-6 ${liked ? 'fill-[#FF4654] text-[#FF4654]' : ''}`} />
              <span className="text-xs font-bold">{likesCount}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCommentSection((s) => !s)}
              className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-[#FF4654]"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs font-bold">{commentsCount}</span>
            </button>
            <div className="flex flex-col items-center gap-0.5 text-gray-500">
              <Eye className="w-6 h-6" />
              <span className="text-xs font-bold">{viewsCount}</span>
            </div>
          </div>

          {showCommentSection && (
            <div className="w-full md:w-72 border border-gray-100 rounded-xl p-3 bg-gray-50/50 max-h-64 flex flex-col">
              <div className="text-sm font-bold text-gray-700 mb-2">Comments</div>
              <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                {comments.length === 0 && <p className="text-xs text-gray-400">No comments yet.</p>}
                {comments.map((c) => (
                  <div key={c.id} className="text-xs bg-white rounded-lg p-2 border border-gray-100">
                    <p className="font-medium text-gray-500">{c.user_id ? String(c.user_id).slice(0, 8) + '…' : 'Anon'}</p>
                    <p className="text-gray-800">{c.comment}</p>
                    <p className="text-gray-400 mt-0.5">{formatTime(c.created_at)}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={submitComment} className="mt-2 flex gap-2 flex-shrink-0">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4654]"
                />
                <button
                  type="submit"
                  disabled={commentSubmitting || !commentText.trim()}
                  className="p-2 rounded-lg bg-[#FF4654] text-white hover:bg-[#FF7043] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
