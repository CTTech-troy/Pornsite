import React, { useEffect, useState, Fragment } from 'react';
import { useVideoInteractions } from '../hooks/useVideoInteractions';
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
  currentUser,
  isAuthenticated,
  onLoginClick,
  onBack,
  onCreatorClick,
  onVideoClick
}) {
  const {
    likes,
    liked,
    views,
    comments,
    toggleLike,
    addComment,
    incrementViews
  } = useVideoInteractions(video.id);
  const [commentText, setCommentText] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [anonName, setAnonName] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [downloadState, setDownloadState] = useState('idle');
  // Filter related videos (exclude current). If the video provides related items
  // use them; otherwise leave empty.
  const relatedVideos = (video?.related || []).filter((v) => v.id !== video.id).slice(0, 6);
  useEffect(() => {
    const timer = setTimeout(() => {
      incrementViews();
    }, 5000);
    return () => clearTimeout(timer);
  }, [video.id]);
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const authorName = isAuthenticated ?
    currentUser?.name :
    anonName.trim() || 'Anonymous';
    const authorAvatar = isAuthenticated ?
    currentUser?.avatar :
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`;
    addComment(commentText, authorName, authorAvatar);
    setCommentText('');
    setAnonName('');
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
    if (navigator.share) {
      navigator.
      share({
        title: video.title,
        text: `Check out this video: ${video.title}`,
        url: window.location.href
      }).
      catch(console.error);
    } else {
      alert('Link copied to clipboard!');
    }
  };
  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-12">
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content (Video + Info) - Sticky */}
        <div className="lg:col-span-2 lg:sticky lg:top-24">
          {/* Video Player */}
          <div
            className={`aspect-video w-full rounded-2xl ${video.thumbnailColor} shadow-xl relative overflow-hidden group mb-4`}>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1"></div>
              </div>
            </div>

            {/* Infinite Looping Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <motion.div
                className="h-full bg-[#FF4654]"
                initial={{
                  width: '0%'
                }}
                animate={{
                  width: '100%'
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: 'linear'
                }} />

            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex justify-between text-white text-sm font-medium">
                <span>04:20 / {video.duration}</span>
              </div>
            </div>
          </div>

          {/* Video Info */}
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#1A1A2E] leading-tight mb-3">
              {video.title}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-200">
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

              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide relative">
                <button
                  onClick={toggleLike}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-sm transition-all ${liked ? 'bg-red-50 text-[#FF4654]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>

                  <motion.div
                    animate={
                    liked ?
                    {
                      scale: [1, 1.3, 1]
                    } :
                    {}
                    }
                    transition={{
                      duration: 0.3
                    }}>

                    <ThumbsUp
                      className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />

                  </motion.div>
                  <span>{likes}</span>
                </button>

                <button
                  onClick={handleShareClick}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors">

                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>

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
                {video.description ||
                "Join me on this amazing adventure! Don't forget to like and subscribe for more content like this. In this video, we explore the hidden gems and secret spots that most tourists miss. Let me know in the comments what you think!"}
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
                    {comments.length} Comments
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
                        {!isAuthenticated &&
                      <div className="mb-3">
                            <input
                          type="text"
                          value={anonName}
                          onChange={(e) => setAnonName(e.target.value)}
                          placeholder="Your name (optional, defaults to Anonymous)"
                          className="w-full bg-[#F0F2F5] border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4654] focus:border-transparent transition-all placeholder-gray-400" />

                          </div>
                      }
                        <form
                        onSubmit={handleCommentSubmit}
                        className="flex items-center gap-3">

                          <img
                          src={
                          isAuthenticated ?
                          currentUser?.avatar :
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${anonName || 'anon'}`
                          }
                          alt="User"
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0" />

                          <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder={
                          isAuthenticated ?
                          'Add a comment...' :
                          'Comment as guest...'
                          }
                          className="flex-1 bg-transparent border-b-2 border-gray-200 py-2 focus:outline-none focus:border-[#FF4654] transition-colors placeholder-gray-400 text-sm" />

                          {commentText &&
                        <button
                          type="submit"
                          className="p-2 bg-gradient-to-r from-[#FF4654] to-[#FF7043] text-white rounded-full hover:shadow-lg transition-all">

                              <Send className="w-4 h-4" />
                            </button>
                        }
                        </form>
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