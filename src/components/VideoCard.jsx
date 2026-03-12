// component/VideoCard.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, Eye, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isDirectStreamUrl } from '../utils/streamUrl';
import { formatDuration } from '../utils/formatDuration';

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=60&crop=faces&bg=fff';
const FALLBACK_THUMBNAIL = '/fallback.jpg';

// Smart segments: first 5s, middle 5s, last 6s (duration in seconds)
function getSmartSegments(durationSec) {
  const d = Math.max(0, Number(durationSec) || 0);
  if (d <= 0) return [{ start: 0, lengthMs: 5000 }];
  const first = { start: 0, lengthMs: Math.min(5, d) * 1000 };
  const midStart = Math.max(0, d / 2 - 2.5);
  const mid = { start: midStart, lengthMs: Math.min(5000, (d - midStart) * 1000) };
  const endStart = Math.max(0, d - 6);
  const last = { start: endStart, lengthMs: Math.min(6000, (d - endStart) * 1000) };
  return [first, mid, last].filter((s) => s.lengthMs > 200);
}

export default function VideoCard({
  id: cardId,
  title,
  channel,
  views,
  time,
  thumbnail,
  duration,
  durationSeconds,
  avatar,
  videoSrc,
  likes,
  comments,
  onClick,
  onHoverStart,
  onHoverEnd,
  activePreviewId,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [previewStep, setPreviewStep] = useState(0);
  const [avatarSrc, setAvatarSrc] = useState(avatar || FALLBACK_AVATAR);
  const [thumbSrc, setThumbSrc] = useState(thumbnail || FALLBACK_THUMBNAIL);
  const [isDesktop, setIsDesktop] = useState(true);
  const videoRef = useRef(null);
  const segmentTimeoutRef = useRef(null);
  const runningPreviewRef = useRef(false);
  const metadataLoadedRef = useRef(false);

  const effectiveVideoSrc = videoSrc && isDirectStreamUrl(videoSrc) ? videoSrc : '';

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover)');
    setIsDesktop(mq.matches);
    const handler = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onLoaded = () => { metadataLoadedRef.current = true; };
    v.addEventListener('loadedmetadata', onLoaded);
    return () => v.removeEventListener('loadedmetadata', onLoaded);
  }, []);

  const isActivePreview = activePreviewId != null ? activePreviewId === cardId : true;
  const shouldPreview = isDesktop && effectiveVideoSrc && isHovered && isActivePreview;

  useEffect(() => {
    if (!shouldPreview) {
      runningPreviewRef.current = false;
      clearTimeout(segmentTimeoutRef.current);
      const v = videoRef.current;
      try { if (v) { v.pause(); v.currentTime = 0; } } catch (e) {}
      setPreviewStep(0);
    }
  }, [shouldPreview]);

  const playSegment = async (start, lengthMs, onSegmentEnd) => {
    const v = videoRef.current;
    if (!v || !runningPreviewRef.current) return;
    try {
      await new Promise((resolve) => {
        const handleSeeked = () => {
          v.removeEventListener('seeked', handleSeeked);
          resolve();
        };
        v.addEventListener('seeked', handleSeeked);
        try { v.currentTime = Math.max(0, start); } catch (e) { resolve(); }
      });
      await v.play();
    } catch (e) {}
    clearTimeout(segmentTimeoutRef.current);
    segmentTimeoutRef.current = setTimeout(() => {
      try { if (v) v.pause(); } catch (e) {}
      onSegmentEnd?.();
    }, lengthMs);
  };

  const startPreviews = () => {
    if (!effectiveVideoSrc || !isDesktop) return;
    if (onHoverStart) onHoverStart();
    runningPreviewRef.current = true;
    setPreviewStep(0);
    const v = videoRef.current;
    const durationSec = durationSeconds ?? (v?.duration && !Number.isNaN(v.duration) ? v.duration : 0);
    const segments = getSmartSegments(durationSec);
    let step = 0;
    const runStep = () => {
      if (!runningPreviewRef.current || segments.length === 0) return;
      const seg = segments[step % segments.length];
      setPreviewStep(step % segments.length);
      step++;
      playSegment(seg.start, seg.lengthMs, () => {
        if (runningPreviewRef.current) setTimeout(runStep, 150);
      });
    };
    if (!metadataLoadedRef.current) {
      const check = setInterval(() => {
        if (metadataLoadedRef.current) {
          clearInterval(check);
          runStep();
        }
      }, 100);
      const fallback = setTimeout(() => { clearInterval(check); runStep(); }, 2000);
      return () => clearTimeout(fallback);
    }
    runStep();
  };

  const stopPreviews = () => {
    runningPreviewRef.current = false;
    clearTimeout(segmentTimeoutRef.current);
    const v = videoRef.current;
    try { if (v) { v.pause(); v.currentTime = 0; } } catch (e) {}
    setPreviewStep(0);
    if (onHoverEnd) onHoverEnd();
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (isDesktop && videoSrc) startPreviews();
  };
  const handleMouseLeave = () => {
    stopPreviews();
    setIsHovered(false);
  };

  return (
    <motion.div
      className="group relative flex flex-col gap-2 cursor-pointer"
      whileHover={{
        scale: 1.02
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
      onClick={onClick}
      onMouseEnter={() => { setIsHovered(true); startPreviews(); }}
      onMouseLeave={() => { stopPreviews(); setIsHovered(false); }}>

      {/* Thumbnail - more compact */}
      <div
        className="relative aspect-video rounded-xl overflow-hidden shadow-sm group-hover:shadow-lg transition-all duration-300"
      >
        {/* Main thumbnail image */}
        <img
          src={thumbSrc}
          alt={title}
          className="w-full h-full object-cover"
          onError={() => setThumbSrc(FALLBACK_THUMBNAIL)}
        />

        {/* If a video source is provided, show a muted looping preview video */}
        {effectiveVideoSrc && (
          <video
            ref={videoRef}
            src={effectiveVideoSrc}
            muted
            playsInline
            preload="metadata"
            poster={thumbSrc}
            className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${shouldPreview ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
        {/* Preview overlay - desktop only when this card is active */}
        <AnimatePresence>
          {shouldPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10">
          <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-4 h-4 text-[#FF4654] fill-[#FF4654] ml-0.5" />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
          {formatDuration(duration ?? durationSeconds) || '0:00'}
        </div>

        {/* Preview progress - desktop only when this card is active */}
        {shouldPreview && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
            <motion.div
            className="h-full bg-[#FF4654]"
            initial={{
              width: '0%'
            }}
            animate={{
              width: '100%'
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }} />

          </div>
        )}
      </div>

      {/* Content Info - tighter */}
      <div className="flex gap-2 px-0.5">
        <img
          src={avatarSrc}
          alt={channel}
          onError={() => setAvatarSrc(FALLBACK_AVATAR)}
          className="w-8 h-8 rounded-full object-cover border border-gray-100 flex-shrink-0 mt-0.5" />

        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
          <h3 className="text-[#1A1A2E] font-bold text-sm leading-tight line-clamp-2 group-hover:text-[#FF4654] transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <span className="truncate">{channel}</span>
            <span className="w-0.5 h-0.5 bg-gray-300 rounded-full flex-shrink-0"></span>
            <span className="flex-shrink-0">{time ?? ''}</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
            <div className="flex items-center gap-0.5">
              <Heart className="w-3 h-3" />
              <span>{likes ?? 0}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <MessageCircle className="w-3 h-3" />
              <span>{comments ?? 0}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Eye className="w-3 h-3" />
              <span>{views ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>);

}