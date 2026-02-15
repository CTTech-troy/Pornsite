// component/VideoCard.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, Eye, Play, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VideoCard({
  title,
  channel,
  views,
  time,
  thumbnail,
  duration,
  avatar,
  videoSrc,
  likes,
  comments,
  onClick
}) {
  const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=60&crop=faces&bg=fff';
  const FALLBACK_THUMBNAIL = '/fallback.jpg';
  const [isHovered, setIsHovered] = useState(false);
  const [previewStep, setPreviewStep] = useState(0);
  const [avatarSrc, setAvatarSrc] = useState(avatar || FALLBACK_AVATAR);
  const [thumbSrc, setThumbSrc] = useState(thumbnail || FALLBACK_THUMBNAIL);
  const videoRef = useRef(null);
  const segmentTimeoutRef = useRef(null);
  const runningPreviewRef = useRef(false);
  const metadataLoadedRef = useRef(false);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onLoaded = () => { metadataLoadedRef.current = true; };
    v.addEventListener('loadedmetadata', onLoaded);
    return () => v.removeEventListener('loadedmetadata', onLoaded);
  }, []);

  // Play a short segment starting at `start` seconds and lasting `lengthMs` milliseconds
  const playSegment = async (start, lengthMs = 500) => {
    const v = videoRef.current;
    if (!v) return;
    try {
      // Seek reliably
      await new Promise((resolve) => {
        const handleSeeked = () => {
          v.removeEventListener('seeked', handleSeeked);
          resolve();
        };
        v.addEventListener('seeked', handleSeeked);
        try { v.currentTime = Math.max(0, start); } catch (e) { resolve(); }
      });
      // play
      await v.play();
    } catch (e) {
      // ignore playback errors
    }
    // stop after lengthMs
    clearTimeout(segmentTimeoutRef.current);
    segmentTimeoutRef.current = setTimeout(() => {
      try { v.pause(); } catch (e) {}
    }, lengthMs);
  };

  const startPreviews = () => {
    if (!videoSrc) return;
    runningPreviewRef.current = true;
    setPreviewStep(0);
    const v = videoRef.current;
    const duration = (v && v.duration && !Number.isNaN(v.duration)) ? v.duration : 0;
    const starts = [0.5, Math.max(0.5, (duration / 2) - 0.25), Math.max(0.5, duration - 0.5)];
    let step = 0;
    const runStep = async () => {
      if (!runningPreviewRef.current) return;
      setPreviewStep(step);
      await playSegment(starts[step] || 0.5, 500);
      step = (step + 1) % 3;
      if (runningPreviewRef.current) {
        // small delay between segments for smoothness
        segmentTimeoutRef.current = setTimeout(runStep, 80);
      }
    };
    // ensure metadata loaded before running (if not, wait briefly)
    if (!metadataLoadedRef.current) {
      const check = setInterval(() => {
        if (metadataLoadedRef.current) {
          clearInterval(check);
          runStep();
        }
      }, 100);
      // timeout fallback
      setTimeout(() => { clearInterval(check); runStep(); }, 1500);
    } else {
      runStep();
    }
  };

  const stopPreviews = () => {
    runningPreviewRef.current = false;
    clearTimeout(segmentTimeoutRef.current);
    const v = videoRef.current;
    try { if (v) { v.pause(); v.currentTime = 0; } } catch (e) {}
    setPreviewStep(0);
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
        {videoSrc && (
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            loop
            playsInline
            poster={thumbSrc}
            className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
        {/* Preview Overlay */}
        <AnimatePresence>
          {isHovered &&
          <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            className="absolute inset-0 transition-all duration-1000"
            style={{
              backdropFilter: `hue-rotate(${previewStep * 90}deg)`
            }} />

          }
        </AnimatePresence>

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10">
          <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-4 h-4 text-[#FF4654] fill-[#FF4654] ml-0.5" />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
          {duration}
        </div>

        {/* Preview Progress Bar */}
        {isHovered &&
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
        }
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
            <span className="flex-shrink-0">{time}</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
            <div className="flex items-center gap-0.5">
              <Heart className="w-3 h-3" />
              <span>{likes}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <MessageCircle className="w-3 h-3" />
              <span>{comments}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Eye className="w-3 h-3" />
              <span>{views}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>);

}