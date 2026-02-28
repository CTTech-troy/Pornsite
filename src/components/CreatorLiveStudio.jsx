import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft,
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Settings,
  Users,
  Heart,
  Gift,
  MessageSquare,
  Pause,
  Play,
  X,
  Home,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { createLive, getLive, getMyActiveLive } from '../api/liveApi';
import { connectSocket, emit, on, off } from '../api/socket';

const COMMENT_COLORS = ['text-blue-400', 'text-green-400', 'text-purple-400', 'text-orange-400', 'text-pink-400'];

export default function CreatorLiveStudio({ user, onBack, initialLiveId }) {
  const hostId = user?.uid || user?.id || '';
  const displayName = user?.displayName || user?.name || user?.email || 'Creator';
  const [liveId, setLiveId] = useState(null);
  const [liveCreatedAt, setLiveCreatedAt] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [frontCamera, setFrontCamera] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [viewers, setViewers] = useState(0);
  const [likes, setLikes] = useState(0);
  const [giftValue, setGiftValue] = useState(0);
  const [comments, setComments] = useState([]);
  const [giftNotification, setGiftNotification] = useState(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(true);
  const [endPayout, setEndPayout] = useState(null);
  const [goLiveError, setGoLiveError] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(!!initialLiveId);
  const chatRef = useRef(null);
  const mobileChatRef = useRef(null);
  const videoRef = useRef(null);
  const videoRefDesktop = useRef(null);
  const streamRef = useRef(null);

  // Resume existing live when initialLiveId is provided
  useEffect(() => {
    if (!initialLiveId || !hostId) {
      setResumeLoading(false);
      return;
    }
    getLive(initialLiveId)
      .then((live) => {
        if (live && (live.status === 'live' || live.status === 'paused')) {
          setLiveId(live.id);
          setLiveCreatedAt(live.created_at || new Date().toISOString());
          setViewers(live.viewers_count ?? 1);
          setLikes(live.total_likes ?? 0);
          setGiftValue(live.total_gifts_amount ?? 0);
          setComments([]);
          setIsLive(true);
          setIsPaused(live.status === 'paused');
          connectSocket();
          emit('join-live', { liveId: live.id, userId: hostId });
        }
      })
      .catch(() => setGoLiveError('Could not load your live session'))
      .finally(() => setResumeLoading(false));
  }, [initialLiveId, hostId]);

  // Timer for live duration from live start
  useEffect(() => {
    if (!isLive || !liveCreatedAt) return;
    const tick = () => {
      const start = new Date(liveCreatedAt).getTime();
      setElapsedTime(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isLive, liveCreatedAt]);

  // Socket listeners when we have a live session
  useEffect(() => {
    if (!liveId) return;
    const unsubViewers = on('update-viewers', (payload) => setViewers(payload.viewersCount ?? 0));
    const unsubLikes = on('update-likes', (payload) => setLikes(payload.totalLikes ?? 0));
    const unsubComment = on('new-comment', (c) => {
      const color = COMMENT_COLORS[Math.floor(Math.random() * COMMENT_COLORS.length)];
      setComments((prev) => [...prev.slice(-50), { id: c.id || Date.now(), user: c.user_id || 'Viewer', text: c.message || '', color }]);
    });
    const unsubGift = on('new-gift', (payload) => {
      const g = payload.gift;
      const amount = g?.amount ?? 0;
      setGiftValue(payload.totalGiftsAmount ?? 0);
      setGiftNotification({
        user: g?.sender_id || 'Viewer',
        gift: g?.name || g?.gift_type || 'Gift',
        value: amount,
      });
      setTimeout(() => setGiftNotification(null), 3000);
    });
    const unsubEnded = on('live-ended', (payout) => {
      setEndPayout(payout);
      setIsLive(false);
      setIsPaused(false);
      setLiveId(null);
      setTimeout(() => {
        setEndPayout(null);
        onBack();
      }, 2500);
    });
    const unsubPaused = on('live-paused', () => setShowExitModal(false));
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

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    if (mobileChatRef.current) mobileChatRef.current.scrollTop = mobileChatRef.current.scrollHeight;
  }, [comments]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleGoLive = async () => {
    if (isLive) {
      setShowExitModal(true);
      return;
    }
    if (!hostId) return;
    setGoLiveError(null);
    try {
      const existing = await getMyActiveLive(hostId);
      if (existing?.id) {
        setGoLiveError('You already have an active live. End it before starting another.');
        return;
      }
      const live = await createLive(hostId, displayName);
      const id = live?.id;
      const createdAt = live?.created_at;
      if (!id) throw new Error('No live id returned');
      setLiveId(id);
      setLiveCreatedAt(createdAt || new Date().toISOString());
      setViewers(1);
      setLikes(0);
      setGiftValue(0);
      setComments([]);
      setIsLive(true);
      setIsPaused(false);
      connectSocket();
      emit('join-live', { liveId: id, userId: hostId });
    } catch (err) {
      setGoLiveError(err?.message || 'Go live failed');
    }
  };

  const handlePauseStream = () => {
    if (liveId) emit('pause-live', { liveId });
    setIsPaused(true);
    setShowExitModal(false);
  };

  const handleResumeStream = () => {
    if (liveId) emit('resume-live', { liveId });
    setIsPaused(false);
  };

  const handleEndStream = () => {
    if (liveId) emit('end-live', { liveId });
    setIsLive(false);
    setIsPaused(false);
    setElapsedTime(0);
    setShowExitModal(false);
    setLiveId(null);
    onBack();
  };

  const handleGoHome = () => {
    if (liveId) emit('pause-live', { liveId });
    setIsPaused(true);
    setShowExitModal(false);
    onBack();
  };

  const handleExitStudio = () => {
    if (isLive) setShowExitModal(true);
    else onBack();
  };

  // Camera: getUserMedia and attach to video(s)
  useEffect(() => {
    if (!cameraEnabled) return;
    const constraints = { video: { facingMode: frontCamera ? 'user' : 'environment' }, audio: micEnabled };
    navigator.mediaDevices?.getUserMedia(constraints).then((stream) => {
      streamRef.current = stream;
      [videoRef.current, videoRefDesktop.current].forEach((el) => { if (el) el.srcObject = stream; });
    }).catch((err) => console.warn('getUserMedia failed', err));
    return () => {
      streamRef.current?.getTracks?.().forEach((t) => t.stop());
      streamRef.current = null;
      [videoRef.current, videoRefDesktop.current].forEach((el) => { if (el) el.srcObject = null; });
    };
  }, [cameraEnabled, micEnabled, frontCamera]);

  if (resumeLoading) {
    return (
      <div className="h-screen bg-[#0F1923] text-white flex flex-col items-center justify-center gap-4">
        <p className="text-white/80">Loading your live session...</p>
        <button onClick={onBack} className="text-sm text-[#FF4654] hover:underline">Cancel</button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0F1923] text-white flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 flex-shrink-0 border-b border-gray-800 flex items-center justify-between px-3 md:px-4 bg-[#1A1A2E]">
        <div className="flex items-center gap-3">
          <button
            onClick={handleExitStudio}
            className="p-2 hover:bg-white/10 rounded-full transition-colors">

            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-base md:text-lg hidden sm:block">
            letstream Studio
          </h1>
          <h1 className="font-bold text-base sm:hidden">Studio</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {isLive &&
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${isPaused ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-red-500/20 border-red-500/50'}`}>

              <div
              className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />

              <span
              className={`text-xs font-bold ${isPaused ? 'text-yellow-500' : 'text-red-500'}`}>

                {isPaused ? 'PAUSED' : formatTime(elapsedTime)}
              </span>
            </div>
          }
          <button
            onClick={handleExitStudio}
            className="bg-red-600 hover:bg-red-700 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-colors">

            Exit
          </button>
        </div>
      </div>

      {goLiveError && (
        <div className="mx-4 mt-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm flex items-center justify-between gap-2">
          <span>{goLiveError}</span>
          <button type="button" onClick={() => setGoLiveError(null)} className="text-white/80 hover:text-white">×</button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {/* MOBILE LAYOUT: Full-screen camera with overlay chat */}
        <div className="lg:hidden h-full relative">
          {/* Full-screen Camera */}
          <div className="absolute inset-0 bg-black">
            {cameraEnabled ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center opacity-30">
                  <VideoOff className="w-20 h-20 mx-auto mb-3" />
                  <p className="text-lg font-bold">Camera Off</p>
                </div>
              </div>
            )}

            {/* Paused Overlay */}
            {isPaused &&
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-20 gap-4">
                <Pause className="w-14 h-14 text-yellow-500" />
                <h2 className="text-xl font-bold text-white">Stream Paused</h2>
                <div className="flex flex-col gap-2 w-56">
                  <button
                  onClick={handleResumeStream}
                  className="bg-yellow-500 text-black px-5 py-2.5 rounded-full font-bold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2">

                    <Play className="w-4 h-4" />
                    Resume
                  </button>
                  <button
                  onClick={handleGoHome}
                  className="bg-white/10 text-white px-5 py-2.5 rounded-full font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2">

                    <Home className="w-4 h-4" />
                    Go to Homepage
                  </button>
                  <button
                  onClick={handleEndStream}
                  className="bg-red-600/80 text-white px-5 py-2.5 rounded-full font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 text-sm">

                    <X className="w-4 h-4" />
                    End Stream
                  </button>
                </div>
              </div>
            }
          </div>

          {/* Top Overlay: Stats */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <div className="flex gap-2">
              {isLive && !isPaused &&
              <div className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                  LIVE
                </div>
              }
              <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <Users className="w-3 h-3" />
                {viewers}
              </div>
            </div>
            <div className="flex gap-1.5">
              <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <Heart className="w-3 h-3 text-[#FF4654]" />
                {likes}
              </div>
              <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <Gift className="w-3 h-3 text-[#FF4654]" />₦{giftValue}
              </div>
            </div>
          </div>

          {/* Gift Notification - Mobile */}
          <AnimatePresence>
            {giftNotification &&
            <motion.div
              initial={{
                opacity: 0,
                y: -20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                y: -20
              }}
              className="absolute top-12 left-3 right-3 bg-gradient-to-r from-[#FF4654] to-[#FF7043] p-2 rounded-xl shadow-lg z-20 flex items-center gap-2">

                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Gift className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-xs font-bold text-white truncate">
                  {giftNotification.user} sent {giftNotification.gift} (₦
                  {giftNotification.value})
                </p>
              </motion.div>
            }
          </AnimatePresence>

          {/* Bottom Overlay: Chat + Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            {/* Chat Overlay */}
            {showMobileChat && isLive &&
            <div className="px-3 mb-2">
                <div
                ref={mobileChatRef}
                className="h-40 overflow-y-auto space-y-1.5 mask-gradient-top"
                style={{
                  maskImage:
                  'linear-gradient(to bottom, transparent 0%, black 30%)',
                  WebkitMaskImage:
                  'linear-gradient(to bottom, transparent 0%, black 30%)'
                }}>

                  {comments.map((msg) =>
                <motion.div
                  key={msg.id}
                  initial={{
                    opacity: 0,
                    x: -10
                  }}
                  animate={{
                    opacity: 1,
                    x: 0
                  }}
                  className="text-xs drop-shadow-lg">

                      <span className={`font-bold ${msg.color} mr-1`}>
                        {msg.user}:
                      </span>
                      <span className="text-white/90">{msg.text}</span>
                    </motion.div>
                )}
                </div>
              </div>
            }

            {/* Controls Bar */}
            <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-6 pb-4 px-3">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setMicEnabled(!micEnabled)}
                  className={`p-2.5 rounded-full transition-colors ${micEnabled ? 'bg-white/15 hover:bg-white/25' : 'bg-red-500/30 text-red-400'}`}>

                  {micEnabled ?
                  <Mic className="w-5 h-5" /> :

                  <MicOff className="w-5 h-5" />
                  }
                </button>
                <button
                  onClick={() => setCameraEnabled(!cameraEnabled)}
                  className={`p-2.5 rounded-full transition-colors ${cameraEnabled ? 'bg-white/15 hover:bg-white/25' : 'bg-red-500/30 text-red-400'}`}>

                  {cameraEnabled ?
                  <Video className="w-5 h-5" /> :

                  <VideoOff className="w-5 h-5" />
                  }
                </button>
                <button
                  onClick={handleGoLive}
                  className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${isLive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-[#FF4654] hover:bg-[#FF7043] text-white'}`}>

                  {isLive ? 'End' : 'Go Live'}
                </button>
                <button
                  onClick={() => setFrontCamera(!frontCamera)}
                  className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors">

                  <Camera className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowMobileChat(!showMobileChat)}
                  className={`p-2.5 rounded-full transition-colors ${showMobileChat ? 'bg-[#FF4654]/30 text-[#FF4654]' : 'bg-white/15 hover:bg-white/25'}`}>

                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP LAYOUT: Side-by-side */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-4 p-4 h-full min-h-0 overflow-hidden">
          {/* Left: Camera Preview */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <div className="flex-1 bg-black rounded-2xl relative overflow-hidden border border-gray-800 shadow-2xl min-h-0">
              {/* Camera Feed */}
              {cameraEnabled ? (
                <video ref={videoRefDesktop} autoPlay playsInline muted className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center opacity-30">
                    <VideoOff className="w-24 h-24 mx-auto mb-4" />
                    <p className="text-xl font-bold">Camera Off</p>
                  </div>
                </div>
              )}

              {/* Paused Overlay - Desktop */}
              {isPaused &&
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20">
                  <div className="text-center space-y-4">
                    <Pause className="w-16 h-16 text-yellow-500 mx-auto" />
                    <h2 className="text-2xl font-bold text-white">
                      Stream Paused
                    </h2>
                    <div className="flex flex-col gap-2 w-64 mx-auto">
                      <button
                      onClick={handleResumeStream}
                      className="bg-yellow-500 text-black px-6 py-2.5 rounded-full font-bold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2">

                        <Play className="w-4 h-4" />
                        Resume Stream
                      </button>
                      <button
                      onClick={handleGoHome}
                      className="bg-white/10 text-white px-6 py-2.5 rounded-full font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2">

                        <Home className="w-4 h-4" />
                        Go to Homepage
                      </button>
                      <button
                      onClick={handleEndStream}
                      className="bg-red-600/80 text-white px-6 py-2.5 rounded-full font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 text-sm">

                        <X className="w-4 h-4" />
                        End Stream
                      </button>
                    </div>
                  </div>
                </div>
              }

              {/* Overlays */}
              <div className="absolute top-4 left-4 flex gap-2">
                {isLive && !isPaused &&
                <div className="bg-red-600 text-white text-xs font-black px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    LIVE
                  </div>
                }
                <div className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1.5">
                  <Users className="w-3 h-3" />
                  {viewers}
                </div>
              </div>

              {/* Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-xl p-2.5 rounded-2xl border border-white/10 z-10">
                <button
                  onClick={() => setMicEnabled(!micEnabled)}
                  className={`p-2.5 rounded-full transition-colors ${micEnabled ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}>

                  {micEnabled ?
                  <Mic className="w-5 h-5" /> :

                  <MicOff className="w-5 h-5" />
                  }
                </button>
                <button
                  onClick={() => setCameraEnabled(!cameraEnabled)}
                  className={`p-2.5 rounded-full transition-colors ${cameraEnabled ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}>

                  {cameraEnabled ?
                  <Video className="w-5 h-5" /> :

                  <VideoOff className="w-5 h-5" />
                  }
                </button>
                <button
                  onClick={handleGoLive}
                  className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${isLive ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/50' : 'bg-[#FF4654] hover:bg-[#FF7043] text-white shadow-lg shadow-red-900/50'}`}>

                  {isLive ? 'End Stream' : 'Go Live'}
                </button>
                <button
                  onClick={() => setFrontCamera(!frontCamera)}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">

                  <Camera className="w-5 h-5" />
                </button>
                <button className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Dashboard */}
          <div className="lg:col-span-1 flex flex-col gap-3 min-h-0 overflow-hidden">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 flex-shrink-0">
              <div className="bg-[#1A1A2E] p-2.5 rounded-xl border border-gray-800">
                <p className="text-[10px] text-gray-400 mb-0.5">Viewers</p>
                <p className="text-base font-bold text-white flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#FF4654]" />
                  {viewers}
                </p>
              </div>
              <div className="bg-[#1A1A2E] p-2.5 rounded-xl border border-gray-800">
                <p className="text-[10px] text-gray-400 mb-0.5">Likes</p>
                <p className="text-base font-bold text-white flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-[#FF4654]" />
                  {likes}
                </p>
              </div>
              <div className="bg-[#1A1A2E] p-2.5 rounded-xl border border-gray-800">
                <p className="text-[10px] text-gray-400 mb-0.5">Gifts</p>
                <p className="text-base font-bold text-white flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-[#FF4654]" />₦{giftValue}
                </p>
              </div>
            </div>

            {/* Live Chat */}
            <div className="flex-1 bg-[#1A1A2E] rounded-2xl border border-gray-800 flex flex-col min-h-0 overflow-hidden relative">
              <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-[#0F1923] flex-shrink-0">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                  <MessageSquare className="w-4 h-4 text-[#FF4654]" />
                  Live Chat
                </h3>
              </div>

              {/* Gift Notification Toast */}
              <AnimatePresence>
                {giftNotification &&
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  exit={{
                    opacity: 0,
                    y: -20
                  }}
                  className="absolute top-14 left-3 right-3 bg-gradient-to-r from-[#FF4654] to-[#FF7043] p-2.5 rounded-xl shadow-lg z-10 flex items-center gap-2">

                    <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Gift className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-white/80">
                        New Gift!
                      </p>
                      <p className="text-xs font-bold text-white truncate">
                        {giftNotification.user} sent {giftNotification.gift} (₦
                        {giftNotification.value})
                      </p>
                    </div>
                  </motion.div>
                }
              </AnimatePresence>

              {/* Chat messages */}
              <div
                ref={chatRef}
                className="flex-1 overflow-y-auto p-3 space-y-2 scroll-smooth min-h-0">

                {!isLive &&
                <div className="text-center text-gray-500 text-sm py-10">
                    Go live to see chat messages
                  </div>
                }
                {comments.map((msg) =>
                <motion.div
                  key={msg.id}
                  initial={{
                    opacity: 0,
                    x: -10
                  }}
                  animate={{
                    opacity: 1,
                    x: 0
                  }}
                  className="text-sm">

                    <span className={`font-bold ${msg.color} mr-1.5`}>
                      {msg.user}:
                    </span>
                    <span className="text-gray-300">{msg.text}</span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitModal &&
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
            initial={{
              opacity: 0,
              scale: 0.95
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            exit={{
              opacity: 0,
              scale: 0.95
            }}
            className="bg-[#1A1A2E] rounded-2xl p-6 max-w-sm w-full border border-gray-700 shadow-2xl">

              <h3 className="text-xl font-bold text-white mb-2">
                Exit Live Studio?
              </h3>
              <p className="text-gray-400 mb-6 text-sm">
                You are currently live. Choose what you'd like to do.
              </p>
              <div className="flex flex-col gap-3">
                <button
                onClick={handlePauseStream}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">

                  <Pause className="w-5 h-5" />
                  Pause Stream
                </button>
                <button
                onClick={handleGoHome}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 border border-gray-700">

                  <Home className="w-5 h-5" />
                  Go to Homepage
                </button>
                <button
                onClick={handleEndStream}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">

                  <X className="w-5 h-5" />
                  End Stream & Exit
                </button>
                <button
                onClick={() => setShowExitModal(false)}
                className="w-full text-gray-400 hover:text-white font-bold py-2 rounded-xl transition-colors text-sm">

                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>

      {/* Stream ended – earnings */}
      <AnimatePresence>
        {endPayout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-[#1A1A2E] rounded-2xl p-6 border border-gray-700 text-center">
              <p className="text-white font-bold text-lg">Stream ended</p>
              <p className="text-[#FF4654] font-black text-2xl mt-2">You earned ₦{endPayout.hostShare ?? 0}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}