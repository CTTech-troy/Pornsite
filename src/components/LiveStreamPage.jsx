import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft,
  Send,
  Users,
  Heart,
  Share2,
  MoreHorizontal,
  Smile,
  Gift,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdBanner from './AdBanner';
import { getLive, getGiftCatalog } from '../api/liveApi';
import { getProfile, followUser } from '../api/usersApi';
import { connectSocket, emit, on } from '../api/socket';

const COMMENT_COLORS = ['text-blue-500', 'text-green-500', 'text-purple-500', 'text-orange-500', 'text-pink-500'];

export default function LiveStreamPage({ stream, onBack, userId: propsUserId }) {
  const liveId = stream?.id ?? stream?.liveId;
  const userId = propsUserId ?? stream?.userId ?? 'guest';
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(!!liveId);
  const [error, setError] = useState(null);
  const [viewers, setViewers] = useState(stream?.viewers ?? 0);
  const [likes, setLikes] = useState(stream?.total_likes ?? 0);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [streamEnded, setStreamEnded] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftCatalog, setGiftCatalog] = useState([]);
  const [giftNotification, setGiftNotification] = useState(null);
  const chatContainerRef = useRef(null);

  // Load live by id
  useEffect(() => {
    if (!liveId) {
      setLive(stream);
      setLoading(false);
      return;
    }
    getLive(liveId)
      .then((data) => {
        const status = data?.status;
        if (status !== 'live' && status !== 'paused') {
          setStreamEnded(true);
          return;
        }
        setLive(data);
        setViewers(data.viewers_count ?? 0);
        setLikes(data.total_likes ?? 0);
        setError(null);
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load stream');
        setStreamEnded(true);
      })
      .finally(() => setLoading(false));
  }, [liveId]);

  // Socket: join on mount, leave on unmount
  useEffect(() => {
    if (!liveId || !live) return;
    connectSocket();
    emit('join-live', { liveId, userId });
    return () => {
      emit('leave-live', { liveId, userId });
    };
  }, [liveId, userId, live?.id]);

  // Socket listeners
  useEffect(() => {
    if (!liveId) return;
    const unsubViewers = on('update-viewers', (p) => setViewers(p.viewersCount ?? 0));
    const unsubLikes = on('update-likes', (p) => setLikes(p.totalLikes ?? 0));
    const unsubComment = on('new-comment', (c) => {
      const color = COMMENT_COLORS[Math.floor(Math.random() * COMMENT_COLORS.length)];
      setMessages((prev) => [...prev.slice(-50), { id: c.id || Date.now(), user: c.user_id || 'Viewer', text: c.message || '', color }]);
    });
    const unsubGift = on('new-gift', (payload) => {
      const g = payload.gift;
      setGiftNotification({ user: g?.sender_id || 'Viewer', gift: g?.name || g?.gift_type || 'Gift', value: g?.amount ?? 0 });
      setTimeout(() => setGiftNotification(null), 3000);
    });
    const unsubEnded = on('live-ended', () => {
      setStreamEnded(true);
      setTimeout(onBack, 2000);
    });
    const unsubPaused = on('live-paused', () => setIsPaused(true));
    const unsubResumed = on('live-resumed', () => setIsPaused(false));
    return () => {
      unsubViewers?.();
      unsubLikes?.();
      unsubComment?.();
      unsubGift?.();
      unsubEnded?.();
      unsubPaused?.();
      unsubResumed?.();
    };
  }, [liveId]);

  // Creator profile (followers)
  const hostId = stream?.host_id || live?.host_id;
  useEffect(() => {
    if (!hostId) return;
    getProfile(hostId).then((p) => setFollowersCount(p?.followers ?? 0)).catch(() => {});
  }, [hostId]);

  // Gift catalog
  useEffect(() => {
    getGiftCatalog().then((list) => setGiftCatalog(Array.isArray(list) ? list : list?.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !liveId) return;
    emit('comment-live', { liveId, userId, message: inputValue.trim() });
    setMessages((prev) => [...prev, { id: Date.now(), user: 'You', text: inputValue.trim(), color: 'text-[#FF4654]' }]);
    setInputValue('');
  };

  const handleLike = () => {
    if (liveId) emit('like-live', { liveId });
  };

  const handleSendGift = (giftType, quantity = 1) => {
    if (!liveId || !userId) return;
    emit('gift-live', { liveId, senderId: userId, giftType, quantity });
    setShowGiftModal(false);
  };

  const displayStreamer = live?.host_display_name?.trim() || stream?.streamer || live?.host_id || stream?.host_id || 'Host';
  const displayAvatar = stream?.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayStreamer}`;
  const thumbnail = stream?.thumbnail ?? 'bg-gradient-to-br from-purple-600 to-blue-500';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <p className="text-gray-500">Loading stream...</p>
      </div>
    );
  }

  if (streamEnded || error) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-gray-700 font-bold">Stream ended</p>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button onClick={onBack} className="bg-[#FF4654] text-white px-6 py-2 rounded-full font-bold hover:bg-[#FF7043]">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={displayAvatar} alt={displayStreamer} className="w-8 h-8 rounded-full object-cover ring-2 ring-[#FF4654]" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#1A1A2E]">{displayStreamer}</h1>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
              LIVE • {viewers} watching • {followersCount} followers
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={async () => {
              if (isFollowing) return;
              if (!hostId) return;
              try {
                await followUser(hostId);
                setIsFollowing(true);
                setFollowersCount((c) => c + 1);
              } catch (err) {
                console.warn('Follow failed', err);
              }
            }}
            disabled={isFollowing}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isFollowing ? 'bg-gray-100 text-gray-700' : 'bg-[#FF4654] text-white hover:bg-[#FF7043]'}`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-80px)]">
        {/* Left: Video / placeholder */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className={`w-full aspect-video rounded-2xl ${thumbnail} relative overflow-hidden shadow-lg group`}>
            {isPaused && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
                <div className="text-center text-white">
                  <p className="text-xl font-bold">Stream paused</p>
                </div>
              </div>
            )}
            <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1.5">
              <Users className="w-3 h-3" />
              {viewers}
            </div>
            <div className="absolute bottom-4 left-4 flex gap-2">
              <button
                onClick={handleLike}
                className="bg-black/50 hover:bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1"
              >
                <Heart className="w-3.5 h-3.5 text-[#FF4654]" />
                {likes}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black text-[#1A1A2E] mb-2">{stream?.title ?? 'Live stream'}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <span className="text-[#FF4654] font-bold">{stream?.category ?? 'Live'}</span>
            </div>
          </div>

          <AdBanner size="leaderboard" />
        </div>

        {/* Right: Live Chat */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-[#1A1A2E]">Live Chat</h3>
            <Users className="w-4 h-4 text-gray-400" />
          </div>

          <AnimatePresence>
            {giftNotification && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-3 mt-2 p-2 bg-gradient-to-r from-[#FF4654] to-[#FF7043] rounded-xl text-white text-xs font-bold"
              >
                {giftNotification.user} sent {giftNotification.gift} (₦{giftNotification.value})
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
            <div className="text-center text-xs text-gray-400 py-4">Welcome to the chat! Be nice.</div>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm"
              >
                <span className={`font-bold ${msg.color} mr-2`}>{msg.user}:</span>
                <span className="text-gray-700">{msg.text}</span>
              </motion.div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50/30">
            <form onSubmit={handleSendMessage} className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Send a message..."
                className="w-full bg-white border border-gray-200 rounded-full py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4654] focus:border-transparent"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button type="button" className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full">
                  <Smile className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="p-1.5 bg-[#FF4654] text-white rounded-full hover:bg-[#FF7043] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </form>
            <div className="flex justify-between items-center mt-3 px-1">
              <button
                onClick={handleLike}
                className="text-xs font-bold text-[#FF4654] flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
              >
                <Heart className="w-3 h-3" />
                Like ({likes})
              </button>
              <button
                onClick={() => setShowGiftModal(true)}
                className="text-xs font-bold text-gray-500 flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
              >
                <Gift className="w-3 h-3" />
                Gift
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gift modal */}
      <AnimatePresence>
        {showGiftModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setShowGiftModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#1A1A2E]">Send gift</h3>
                <button onClick={() => setShowGiftModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {giftCatalog.map((g) => (
                  <button
                    key={g.type}
                    onClick={() => handleSendGift(g.type, 1)}
                    className="p-4 border border-gray-200 rounded-xl hover:border-[#FF4654] hover:bg-red-50/50 text-left"
                  >
                    <span className="font-bold text-[#1A1A2E] block">{g.name}</span>
                    <span className="text-sm text-gray-500">₦{g.price}</span>
                  </button>
                ))}
              </div>
              {giftCatalog.length === 0 && <p className="text-gray-500 text-sm">No gifts available.</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
