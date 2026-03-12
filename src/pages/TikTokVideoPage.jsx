import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Eye, Send, Loader2, Trash2, SkipForward } from 'lucide-react';
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

function getSessionId() {
  if (typeof localStorage === 'undefined') return null;
  let id = localStorage.getItem('tiktok_session_id');
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem('tiktok_session_id', id);
  }
  return id;
}

export default function TikTokVideoPage({ getToken, isAuthenticated, onLoginClick, user }) {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [phase, setPhase] = useState('loading'); // 'loading' | 'ad' | 'content'
  const [playbackState, setPlaybackState] = useState(null); // { shouldPlayAd, adUrl, skipAfterSeconds }
  const [adCanSkip, setAdCanSkip] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const viewRecordedRef = useRef(false);
  const adRef = useRef(null);
  const mainVideoRef = useRef(null);
  const skipTimerRef = useRef(null);

  // Load playback state (video + whether to show ad)
  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;
    (async () => {
      setPhase('loading');
      try {
        const token = getToken ? await getToken() : null;
        const sessionId = !token ? getSessionId() : null;
        const state = await tiktokApi.getPlaybackState(videoId, token, sessionId);
        if (cancelled) return;
        setVideo(state.video);
        setLikesCount(state.video?.likes_count ?? 0);
        setViewsCount(state.video?.views_count ?? 0);
        setCommentsCount(state.video?.comments_count ?? 0);
        setPlaybackState({
          shouldPlayAd: state.shouldPlayAd,
          adUrl: state.adUrl,
          skipAfterSeconds: state.skipAfterSeconds ?? 5,
        });

        const list = await tiktokApi.getComments(videoId);
        if (!cancelled) setComments(list || []);
        const likeStatus = await tiktokApi.getLikeStatus(videoId, token);
        if (!cancelled) setLiked(!!likeStatus.liked);

        if (state.shouldPlayAd && state.adUrl) {
          setPhase('ad');
          const skipSec = Math.max(0, state.skipAfterSeconds ?? 5);
          if (skipSec > 0) {
            skipTimerRef.current = setTimeout(() => {
              setAdCanSkip(true);
            }, skipSec * 1000);
          } else {
            setAdCanSkip(true);
          }
        } else {
          if (state.shouldPlayAd && !state.adUrl) {
            const tok = getToken ? await getToken() : null;
            const sid = !tok ? getSessionId() : null;
            await tiktokApi.markAdCompleted(videoId, tok, sid);
          }
          setPhase('content');
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setVideo(null);
        setPhase('content');
      }
    })();
    return () => {
      cancelled = true;
      if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
    };
  }, [videoId, getToken]);

  const finishAd = async (skipped = false) => {
    if (skipTimerRef.current) {
      clearTimeout(skipTimerRef.current);
      skipTimerRef.current = null;
    }
    try {
      const token = getToken ? await getToken() : null;
      const sessionId = !token ? getSessionId() : null;
      await tiktokApi.markAdCompleted(videoId, token, sessionId);
    } catch (_) {}
    setPhase('content');
    setAdCanSkip(false);
    setTimeout(() => {
      mainVideoRef.current?.play?.();
    }, 100);
  };

  const recordViewOnce = async () => {
    if (!videoId || viewRecordedRef.current) return;
    viewRecordedRef.current = true;
    try {
      const token = getToken ? await getToken() : null;
      const sessionId = !token ? getSessionId() : null;
      const res = await tiktokApi.recordView(videoId, token, sessionId);
      setViewsCount((c) => res?.viewsCount ?? c + 1);
    } catch (_) {}
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
      const list = await tiktokApi.getComments(videoId);
      setComments(list || []);
    } catch (_) {}
    setCommentSubmitting(false);
  };

  const deleteComment = async (commentId) => {
    if (!isAuthenticated) return;
    try {
      const token = await getToken?.();
      if (!token) return;
      await tiktokApi.deleteComment(commentId, token);
      setCommentsCount((c) => Math.max(0, c - 1));
      const list = await tiktokApi.getComments(videoId);
      setComments(list || []);
    } catch (_) {}
  };

  if (phase === 'loading' && !video) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="w-10 h-10 text-[#FF4654] animate-spin" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-gray-500">Video not found.</p>
        <button
          type="button"
          onClick={() => navigate('/tiktok')}
          className="text-[#FF4654] font-bold hover:underline"
        >
          Back to feed
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button
          type="button"
          onClick={() => navigate('/tiktok')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#FF4654] font-medium mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to feed
        </button>

        {/* Ad phase: full-width ad player with skip after X seconds */}
        {phase === 'ad' && playbackState?.adUrl && (
          <div className="bg-black rounded-2xl overflow-hidden shadow-xl border-2 border-amber-500/50 mb-6">
            <div className="relative aspect-video">
              <video
                ref={adRef}
                src={playbackState.adUrl}
                className="w-full h-full object-contain"
                controls
                autoPlay
                playsInline
                onEnded={() => finishAd(false)}
              />
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-amber-400 text-xs font-bold rounded">
                Ad
              </div>
              {adCanSkip && (
                <button
                  type="button"
                  onClick={() => finishAd(true)}
                  className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-[#FF4654] text-white font-bold rounded-xl hover:bg-[#FF7043] shadow-lg"
                >
                  <SkipForward className="w-5 h-5" />
                  Skip Ad
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main video player */}
        {(phase === 'content' || (phase === 'ad' && !playbackState?.adUrl)) && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="aspect-video bg-black">
              <video
                ref={mainVideoRef}
                src={video.storage_url}
                className="w-full h-full object-contain"
                controls
                autoPlay={phase === 'content'}
                playsInline
                onPlay={recordViewOnce}
              />
            </div>
            <div className="p-6">
              <h1 className="text-xl font-black text-[#1A1A2E]">{video.title}</h1>
              {video.description && (
                <p className="text-gray-600 mt-1">{video.description}</p>
              )}
              <p className="text-sm text-gray-400 mt-2">Creator: {String(video.user_id).slice(0, 16)}…</p>

              <div className="flex items-center gap-6 mt-4 flex-wrap">
                <button
                  type="button"
                  onClick={toggleLike}
                  disabled={likeLoading}
                  className="flex items-center gap-2 text-gray-600 hover:text-[#FF4654] disabled:opacity-50"
                >
                  <Heart className={`w-6 h-6 ${liked ? 'fill-[#FF4654] text-[#FF4654]' : ''}`} />
                  <span className="font-bold">{likesCount}</span> likes
                </button>
                <div className="flex items-center gap-2 text-gray-500">
                  <Eye className="w-6 h-6" />
                  <span className="font-bold">{viewsCount}</span> views
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <MessageCircle className="w-6 h-6" />
                  <span className="font-bold">{commentsCount}</span> comments
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments */}
        {(phase === 'content' || (phase === 'ad' && !playbackState?.adUrl)) && (
          <div className="mt-6 bg-white rounded-2xl shadow border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-[#1A1A2E] mb-4">Comments</h2>
            <form onSubmit={submitComment} className="flex gap-2 mb-6">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={isAuthenticated ? 'Add a comment...' : 'Log in to comment'}
                disabled={!isAuthenticated}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF4654] disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={commentSubmitting || !commentText.trim() || !isAuthenticated}
                className="px-4 py-3 rounded-xl bg-[#FF4654] text-white font-bold hover:bg-[#FF7043] disabled:opacity-50 flex items-center gap-2"
              >
                {commentSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Post
              </button>
            </form>
            <div className="space-y-3">
              {comments.length === 0 && <p className="text-gray-400">No comments yet.</p>}
              {comments.map((c) => (
                <div key={c.id} className="flex items-start justify-between gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{c.user_id ? String(c.user_id).slice(0, 12) + '…' : 'Anon'}</p>
                    <p className="text-gray-800">{c.comment}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatTime(c.created_at)}</p>
                  </div>
                  {user && c.user_id === user.uid && (
                    <button
                      type="button"
                      onClick={() => deleteComment(c.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
