import { useState, useEffect, useCallback } from 'react';
import * as videoInteractionsApi from '../api/videoInteractionsApi';

function formatTime(ts) {
  if (!ts) return '';
  const d = Date.now() - Number(ts);
  if (d < 60000) return 'Just now';
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
  return `${Math.floor(d / 86400000)}d ago`;
}

/**
 * Like and comment state + actions for a video from the public RTDB feed.
 * @param {string} videoId - video id
 * @param {{ getToken: () => Promise<string|null>, initialLikes?: number, initialTotalComments?: number }} opts
 */
export function usePublicVideoInteractions(videoId, { getToken, initialLikes = 0, initialTotalComments = 0 } = {}) {
  const [liked, setLiked] = useState(false);
  const [totalLikes, setTotalLikes] = useState(initialLikes);
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(initialTotalComments);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);

  const mapComment = (c) => {
    const uid = c.userId || '';
    return {
      id: c.commentId || uid,
      author: uid ? `User ${String(uid).slice(0, 8)}` : 'Anonymous',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(uid || 'anon')}`,
      text: c.text || '',
      time: formatTime(c.createdAt),
      likes: 0,
    };
  };

  const load = useCallback(async () => {
    if (!videoId || typeof videoId !== 'string' || !videoId.trim()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = getToken ? await getToken() : null;
      const [likeStatus, commentList] = await Promise.all([
        videoInteractionsApi.getLikeStatus(videoId, token),
        videoInteractionsApi.getComments(videoId),
      ]);
      setLiked(likeStatus.liked);
      if (likeStatus.totalLikes != null) setTotalLikes(Number(likeStatus.totalLikes) || 0);
      if (likeStatus.totalComments != null) setTotalComments(Number(likeStatus.totalComments) || 0);
      const mapped = (commentList || []).map(mapComment);
      setComments(mapped);
      const count = likeStatus.totalComments != null ? Number(likeStatus.totalComments) : mapped.length;
      setTotalComments(count);
    } catch (e) {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [videoId, getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleLike = useCallback(async () => {
    if (!videoId || !getToken) return;
    const token = await getToken();
    if (!token) return;
    setLikeLoading(true);
    try {
      const currentlyLiked = liked;
      if (currentlyLiked) {
        const res = await videoInteractionsApi.unlikeVideo(videoId, token);
        setLiked(false);
        setTotalLikes(res.totalLikes ?? totalLikes - 1);
      } else {
        const res = await videoInteractionsApi.likeVideo(videoId, token);
        setLiked(true);
        setTotalLikes(res.totalLikes ?? totalLikes + 1);
      }
    } catch (e) {
      // keep UI state unchanged
    } finally {
      setLikeLoading(false);
    }
  }, [videoId, getToken, liked, totalLikes]);

  const addComment = useCallback(async (text) => {
    if (!videoId || !getToken || !(text && text.trim())) return;
    const token = await getToken();
    if (!token) return;
    try {
      const res = await videoInteractionsApi.addComment(videoId, text.trim(), token);
      if (res.totalComments != null) setTotalComments(Number(res.totalComments));
      await load();
    } catch (e) {
      throw e;
    }
  }, [videoId, getToken, load]);

  return {
    likes: totalLikes,
    liked,
    comments,
    totalComments,
    loading,
    likeLoading,
    toggleLike,
    addComment,
    refresh: load,
  };
}
