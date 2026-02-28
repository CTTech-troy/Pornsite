import React, { useEffect, useState, useRef, Fragment } from 'react';
import { usePublicVideoInteractions } from '../hooks/usePublicVideoInteractions';
import { useAdManager } from '../context/AdManagerContext';
import { getPathSafeVideoId } from '../utils/videoId';
import { resolvePlayerSource } from '../utils/streamUrl';
import { descriptionFromTitle } from '../utils/descriptionFromTitle';
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Download,
  MoreHorizontal,
  Send,
  Lock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2 } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdBanner from './AdBanner';
import  VideoCard  from './VideoCard.jsx';

export default function VideoPage({
  video,
  videoId: videoIdProp,
  relatedVideos: relatedVideosProp,
  currentUser,
  isAuthenticated,
  onLoginClick,
  onBack,
  onCreatorClick,
  onVideoClick,
  getToken,
}) {
  const stableVideoId = (videoIdProp || getPathSafeVideoId(video?.id) || video?.id || '').toString().trim();
  const interactions = usePublicVideoInteractions(stableVideoId || null, {
    getToken: getToken || undefined,
    initialLikes: Number(video?.likes) || 0,
    initialTotalComments: Number(video?.comments) || 0,
  });

  const likes = interactions.likes;
  const liked = interactions.liked;
  const views = 0;
  const comments = interactions.comments;
  const toggleLike = () => {
    if (isAuthenticated) interactions.toggleLike();
    else onLoginClick?.();
  };
  const likeLoading = interactions.likeLoading;
  const addComment = interactions.addComment;

  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [anonName, setAnonName] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [downloadState, setDownloadState] = useState('idle');
  const { shouldShowAd, recordVideoWatched } = useAdManager();
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [adEndedOrSkipped, setAdEndedOrSkipped] = useState(false);
  const [mainPlaying, setMainPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const adVideoRef = useRef(null);
  const mainVideoRef = useRef(null);
  const skipTimerRef = useRef(null);
  const relatedVideos = (relatedVideosProp && relatedVideosProp.length > 0)
    ? relatedVideosProp
    : (video?.related || []).filter((v) => v.id !== video?.id).slice(0, 6);
  const isExternalVideo = !video?.source || video?.source !== 'rtdb';

  const AD_VIDEO_URL = import.meta.env.VITE_AD_VIDEO_URL || '';
  const playerSource = resolvePlayerSource(video || {});
  const mainVideoSrc = playerSource.mode === 'video' ? playerSource.url : '';
  const embedUrl = playerSource.mode === 'iframe' ? (playerSource.embedUrl || playerSource.url) : '';
  const externalUrl = playerSource.mode === 'external' ? (playerSource.externalUrl || playerSource.url) : '';
  const hasPlayableSource = playerSource.mode === 'video' || playerSource.mode === 'iframe';
  const hasDirectStream = playerSource.mode === 'video';
  const isExternalOnly = playerSource.mode === 'external';
  // Auto quality: when multiple sources exist (e.g. 1080p/720p/480p), pick by navigator.connection.effectiveType ('4g'→high, '3g'→mid, '2g'→low)

  const playMainVideo = useRef(() => {});
  playMainVideo.current = () => {
    if (!mainVideoRef.current || !mainVideoSrc) return;
    mainVideoRef.current.play().catch(console.warn);
    setMainPlaying(true);
  };

  const stopAdAndPlayMain = () => {
    if (skipTimerRef.current) {
      clearTimeout(skipTimerRef.current);
      skipTimerRef.current = null;
    }
    if (adVideoRef.current) {
      adVideoRef.current.pause();
      adVideoRef.current.currentTime = 0;
    }
    setIsAdPlaying(false);
    setShowSkipButton(false);
    setAdEndedOrSkipped(true);
    recordVideoWatched();
    // Defer play so React can show the main video first (display:block)
    setTimeout(() => {
      if (mainVideoRef.current && mainVideoSrc) {
        mainVideoRef.current.play().catch(console.warn);
        setMainPlaying(true);
      }
    }, 80);
  };

  useEffect(() => {
    if (!adEndedOrSkipped || !mainVideoSrc) return;
    const id = setTimeout(() => {
      if (mainVideoRef.current) {
        mainVideoRef.current.play().catch(console.warn);
        setMainPlaying(true);
      }
    }, 80);
    return () => clearTimeout(id);
  }, [adEndedOrSkipped, mainVideoSrc]);

  const handlePlayClick = () => {
    if (adEndedOrSkipped) {
      playMainVideo.current();
      return;
    }
    const needAd = shouldShowAd && (AD_VIDEO_URL || true);
    if (needAd) {
      if (AD_VIDEO_URL && adVideoRef.current) {
        setIsAdPlaying(true);
        setShowSkipButton(false);
        adVideoRef.current.play().catch(console.warn);
        skipTimerRef.current = setTimeout(() => setShowSkipButton(true), 5000);
      } else {
        skipTimerRef.current = setTimeout(stopAdAndPlayMain, 5000);
        setIsAdPlaying(true);
      }
    } else {
      setAdEndedOrSkipped(true);
      recordVideoWatched();
    }
  };

  useEffect(() => {
    return () => {
      if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
    };
  }, []);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!isAuthenticated) {
      onLoginClick?.();
      return;
    }
    setCommentSubmitting(true);
    try {
      await addComment(commentText.trim());
      setCommentText('');
      setAnonName('');
    } catch (err) {
      // keep text on error
    } finally {
      setCommentSubmitting(false);
    }
  };
  const handleDownloadClick = () => {
    if (!isAuthenticated) {
      onLoginClick();
      return;
    }
    if (downloadState !== 'idle') return;
    setDownloadState('downloading');
    // Simulate download process
    setTimeout(() => {
      setDownloadState('complete');
      // Reset after showing success
      setTimeout(() => {
        setDownloadState('idle');
      }, 3000);
    }, 2000);
  };
  const handleShareClick = () => {
    const pathId = videoIdProp || getPathSafeVideoId(video?.id) || video?.id || '';
    const videoUrl = `${window.location.origin}/video/${pathId}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(videoUrl).then(
        () => {
          setShareToast(true);
          setTimeout(() => setShareToast(false), 2500);
        },
        () => { alert('Link copied: ' + videoUrl); }
      );
    } else {
      alert('Link copied: ' + videoUrl);
    }
  };
  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-12">
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content (Video + Info) - Sticky */}
        <div className="lg:col-span-2 lg:sticky lg:top-24">
          {/* Video Player: ad then main */}
          <div className={`aspect-video w-full rounded-2xl ${video.thumbnailColor || 'bg-gray-900'} shadow-xl relative overflow-hidden group mb-4`}>
            {/* Ad video (shown when isAdPlaying and we have ad URL) */}
            {AD_VIDEO_URL && (
              <video
                ref={adVideoRef}
                className="absolute inset-0 w-full h-full object-contain"
                src={AD_VIDEO_URL}
                muted={false}
                playsInline
                onEnded={stopAdAndPlayMain}
                style={{ display: isAdPlaying ? 'block' : 'none' }}
              />
            )}
            {/* Placeholder "Ad" when no ad URL (5s then auto-continue) */}
            {isAdPlaying && !AD_VIDEO_URL && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-white">
                <span className="text-lg font-bold uppercase">Advertisement</span>
              </div>
            )}
            {/* Main video (direct stream only) */}
            {mainVideoSrc && (
              <video
                ref={mainVideoRef}
                className="absolute inset-0 w-full h-full object-contain"
                src={mainVideoSrc}
                poster={video?.thumbnail}
                controls={mainPlaying}
                playsInline
                onEnded={() => setMainPlaying(false)}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                onCanPlay={() => setIsBuffering(false)}
                style={{ display: adEndedOrSkipped ? 'block' : 'none' }}
              />
            )}
            {/* Embed player when no direct stream but embed URL is available */}
            {embedUrl && adEndedOrSkipped && (
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full rounded-2xl"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title="Video embed"
                style={{ display: 'block' }}
              />
            )}
            {/* Netflix-style buffering loader */}
            <AnimatePresence>
              {isBuffering && mainPlaying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                </motion.div>
              )}
            </AnimatePresence>
            {/* Play overlay (when nothing playing yet or before ad) */}
            {!adEndedOrSkipped && !mainPlaying && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30"
                onClick={handlePlayClick}
                onKeyDown={(e) => e.key === 'Enter' && handlePlayClick()}
                role="button"
                tabIndex={0}
                aria-label="Play"
              >
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1" />
                </div>
              </div>
            )}
            {/* Main video play overlay when ad ended but user hasn't started main (direct stream only) */}
            {adEndedOrSkipped && !mainPlaying && hasDirectStream && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20"
                onClick={handlePlayClick}
                onKeyDown={(e) => e.key === 'Enter' && handlePlayClick()}
                role="button"
                tabIndex={0}
                aria-label="Play video"
              >
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1" />
                </div>
              </div>
            )}
            {/* Removed external-link and unavailable overlays per UX preference */}
            {/* Skip Ad button (after 5s when ad is playing) */}
            {isAdPlaying && showSkipButton && (
              <div className="absolute bottom-4 right-4 z-10">
                <button
                  type="button"
                  onClick={stopAdAndPlayMain}
                  className="px-4 py-2 bg-black/70 text-white text-sm font-bold rounded hover:bg-black/90"
                >
                  Skip Ad
                </button>
              </div>
            )}
            {/* Main video progress / time (when main is playing) */}
            {mainPlaying && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
                <div className="flex justify-between text-white text-sm font-medium">
                  <span>{video.duration}</span>
                </div>
              </div>
            )}
          </div>

          {/* Video Info */}
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#1A1A2E] leading-tight mb-3">
              {video.title}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-200">
              {!isExternalVideo && (
                <div className="flex items-center gap-3">
                  <img
                    src={video.avatar}
                    alt={video.channel}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm cursor-pointer"
                    onClick={() => onCreatorClick?.(video.channel)} />
                  <div>
                    <h3
                      className="font-bold text-[#1A1A2E] hover:text-[#FF4654] cursor-pointer transition-colors"
                      onClick={() => onCreatorClick?.(video.channel)}>
                      {video.channel}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      1.2M subscribers
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSubscribed(!isSubscribed)}
                    className={`ml-2 px-5 py-2 rounded-full font-bold text-sm transition-all ${isSubscribed ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' : 'bg-[#1A1A2E] text-white hover:bg-black shadow-md'}`}>
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide relative">
                <button
                  onClick={toggleLike}
                  disabled={likeLoading}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-sm transition-all ${liked ? 'bg-red-50 text-[#FF4654]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} disabled:opacity-70`}>

                  {likeLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <motion.div
                      animate={liked ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.3 }}>
                      <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                    </motion.div>
                  )}
                  <span>{likes}</span>
                </button>

                <div className="relative">
                  <button
                    onClick={handleShareClick}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  <AnimatePresence>
                    {shareToast && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-full left-0 mt-2 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-lg z-50 whitespace-nowrap">
                        Link copied to clipboard
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative">
                  <button
                    onClick={handleDownloadClick}
                    disabled={downloadState !== 'idle'}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-sm transition-colors ${isAuthenticated ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>

                    {downloadState === 'downloading' ?
                    <Loader2 className="w-4 h-4 animate-spin" /> :
                    isAuthenticated ?
                    <Download className="w-4 h-4" /> :

                    <Lock className="w-4 h-4" />
                    }
                    <span>
                      {downloadState === 'downloading' ?
                      'Downloading...' :
                      'Download'}
                    </span>
                  </button>

                  {/* Download Confirmation Overlay */}
                  <AnimatePresence>
                    {downloadState === 'complete' &&
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 10,
                        scale: 0.9
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1
                      }}
                      exit={{
                        opacity: 0,
                        y: 10,
                        scale: 0.9
                      }}
                      className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-50">

                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 leading-tight mb-1">
                              Downloaded with letstream watermark
                            </p>
                            <p className="text-[10px] text-gray-500 leading-tight">
                              All downloads include letstream branding for
                              content protection
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    }
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-5 bg-white rounded-2xl p-4 text-sm text-gray-700 leading-relaxed shadow-sm border border-gray-100">
              <div className="flex gap-3 font-bold text-[#1A1A2E] mb-2 text-xs">
                <span>{views.toLocaleString()} views</span>
                <span>{video.time}</span>
              </div>
              <p>
                {(video.source === 'rtdb' && (video.description || '').trim())
                  ? video.description
                  : (video.description || '').trim()
                    ? video.description
                    : descriptionFromTitle(video.title)}
              </p>
            </div>

            {/* Collapsible Comments Section */}
            <div className="mt-6">
              {/* Comment Snippet / Toggle */}
              <div
                onClick={() => setShowComments(!showComments)}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">

                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-[#1A1A2E]">
                    {interactions.totalComments} Comments
                  </h3>
                  {showComments ?
                  <ChevronUp className="w-4 h-4 text-gray-500" /> :

                  <ChevronDown className="w-4 h-4 text-gray-500" />
                  }
                </div>
                {!showComments && comments.length > 0 &&
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <img
                    src={comments[0].avatar}
                    alt=""
                    className="w-5 h-5 rounded-full" />

                    <span className="truncate">{comments[0].text}</span>
                  </div>
                }
              </div>

              {/* Full Comments */}
              <AnimatePresence>
                {showComments &&
                <motion.div
                  initial={{
                    height: 0,
                    opacity: 0
                  }}
                  animate={{
                    height: 'auto',
                    opacity: 1
                  }}
                  exit={{
                    height: 0,
                    opacity: 0
                  }}
                  className="overflow-hidden">

                    <div className="pt-4">
                      {/* Add Comment */}
                      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 border border-gray-100">
                        {!isAuthenticated ? (
                          <button
                            type="button"
                            onClick={onLoginClick}
                            className="w-full py-2 px-4 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm font-medium"
                          >
                            Sign in to add a comment
                          </button>
                        ) : (
                          <>
                            <form onSubmit={handleCommentSubmit} className="flex items-center gap-3">
                              <img
                                src={isAuthenticated ? currentUser?.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${anonName || 'anon'}`}
                                alt="User"
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              />
                              <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 bg-transparent border-b-2 border-gray-200 py-2 focus:outline-none focus:border-[#FF4654] transition-colors placeholder-gray-400 text-sm"
                              />
                              {commentText && (
                                <button
                                  type="submit"
                                  disabled={commentSubmitting}
                                  className="p-2 bg-gradient-to-r from-[#FF4654] to-[#FF7043] text-white rounded-full hover:shadow-lg transition-all disabled:opacity-70"
                                >
                                  {commentSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                              )}
                            </form>
                          </>
                        )}
                      </div>

                      {/* Comments List */}
                      <div className="space-y-4">
                        {comments.map((comment) =>
                      <div
                        key={comment.id}
                        className="flex gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100">

                            <img
                          src={comment.avatar}
                          alt={comment.author}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0" />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-[#1A1A2E] text-xs">
                                  {comment.author}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium">
                                  {comment.time}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {comment.text}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <button className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-gray-900 transition-colors">
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>{comment.likes}</span>
                                </button>
                                <button className="text-[10px] font-bold text-gray-400 hover:text-gray-900 transition-colors">
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                      )}
                      </div>
                    </div>
                  </motion.div>
                }
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar (Related Videos) */}
        <div className="lg:col-span-1">
          <h3 className="font-black text-[#1A1A2E] mb-4 text-lg">
            Related Videos
          </h3>
          <div className="flex flex-col gap-4">
            {relatedVideos.map((relatedVideo, index) =>
            <Fragment key={relatedVideo.id}>
                <VideoCard
                {...relatedVideo}
                onClick={() => onVideoClick?.(relatedVideo)} />

                {/* Insert Ad after 3rd video */}
                {index === 2 && <AdBanner size="banner" className="my-2" />}
              </Fragment>
            )}
          </div>
        </div>
      </div>
    </div>);

}