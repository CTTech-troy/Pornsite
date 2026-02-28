import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import VideoPage from '../components/VideoPage';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../hooks/useAuth';
import { useVideoFeed } from '../context/VideoFeedContext';
import { getVideoById } from '../api/videoFeedApi';
import { getPublicVideoById } from '../api/publicVideosApi';
import { getMyActiveLive } from '../api/liveApi';
import { getPathSafeVideoId } from '../utils/videoId';
import { descriptionFromTitle } from '../utils/descriptionFromTitle';

function formatTimeAgo(ts) {
  if (!ts) return '';
  const d = Date.now() - Number(ts);
  if (d < 60000) return 'Just now';
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
  return `${Math.floor(d / 86400000)}d ago`;
}

function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(Number(seconds))) return '0:00';
  const n = Math.floor(Number(seconds));
  const m = Math.floor(n / 60);
  const s = n % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function mapApiVideoToCard(v) {
  const title = v.title || 'Video';
  return {
    id: v.id,
    title,
    channel: v.channel || 'Creator',
    views: v.views ?? 0,
    time: '',
    thumbnail: v.thumbnailUrl || '',
    thumbnailColor: 'bg-gray-900',
    duration: formatDuration(v.duration),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(v.id)}`,
    videoSrc: v.videoUrl || '',
    durationSeconds: Number(v.duration) || 0,
    likes: String(v.totalLikes ?? 0),
    comments: String(v.totalComments ?? 0),
    description: descriptionFromTitle(title),
  };
}

function mapPublicVideoToCard(p) {
  return {
    id: p.videoId,
    title: p.title || 'Video',
    description: p.description || '',
    channel: p.userId ? `User ${String(p.userId).slice(0, 8)}` : 'Creator',
    views: 0,
    time: formatTimeAgo(p.createdAt),
    thumbnail: '',
    thumbnailColor: 'bg-gray-900',
    duration: '',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.videoId)}`,
    videoSrc: p.videoUrl || '',
    url: p.videoUrl || '',
    durationSeconds: 0,
    likes: String(p.totalLikes ?? 0),
    comments: String(p.totalComments ?? 0),
    source: 'rtdb',
  };
}

export default function VideoDetailRoute() {
  const { videoId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, getIdToken, login, signup } = useAuth();
  const { feedVideos, publicVideos } = useVideoFeed();
  const [video, setVideo] = useState(state?.video ?? null);
  const [loading, setLoading] = useState(!state?.video);
  const [notFound, setNotFound] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [myActiveLive, setMyActiveLive] = useState(null);
  const hasCreatorPrivileges = user?.creator === true || user?.creatorStatus === 'approved';

  const currentId = video?.id ?? videoId;
  const relatedVideos = useMemo(() => {
    const all = [...feedVideos, ...publicVideos];
    const seen = new Set();
    const unique = all.filter((v) => {
      const id = v.id || '';
      if (seen.has(id)) return false;
      seen.add(id);
      return id && id !== currentId;
    });
    return unique.slice(0, 6);
  }, [feedVideos, publicVideos, currentId]);

  useEffect(() => {
    if (!user?.uid || !hasCreatorPrivileges) {
      setMyActiveLive(null);
      return;
    }
    getMyActiveLive(user.uid).then((data) => setMyActiveLive(data || null)).catch(() => setMyActiveLive(null));
  }, [user?.uid, hasCreatorPrivileges]);

  useEffect(() => {
    if (state?.video) {
      setVideo(state.video);
      setLoading(false);
      return;
    }
    if (!videoId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    getVideoById(videoId)
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setVideo(mapApiVideoToCard(data));
        } else {
          return getPublicVideoById(videoId).then((pub) => {
            if (cancelled) return;
            if (pub) setVideo(mapPublicVideoToCard(pub));
            else setNotFound(true);
          });
        }
      })
      .catch(() => {
        if (cancelled) return;
        getPublicVideoById(videoId)
          .then((pub) => {
            if (cancelled) return;
            if (pub) setVideo(mapPublicVideoToCard(pub));
            else setNotFound(true);
          })
          .catch(() => {
            if (!cancelled) setNotFound(true);
          });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [videoId, state?.video]);

  const handleBack = () => {
    navigate('/');
    window.scrollTo(0, 0);
  };

  const handleVideoClick = (v) => {
    const pathId = getPathSafeVideoId(v.id);
    navigate(`/video/${pathId}`, { state: { video: v } });
    window.scrollTo(0, 0);
  };

  const handleCreatorClick = () => {
    navigate('/');
  };

  const handleLoginClick = () => {
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
  };

  const handleSignUpClick = () => {
    setAuthModalTab('signup');
    setIsAuthModalOpen(true);
  };

  const goHome = () => {
    navigate('/');
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-[#FF4654] rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-[#FF7043] rounded-full animate-bounce [animation-delay:0.1s]" />
          <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
        </div>
      </div>
    );
  }

  if (notFound || !video) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] font-sans text-[#1A1A2E]">
        <Navbar
          isAuthenticated={isAuthenticated}
          user={user}
          onLoginClick={handleLoginClick}
          onSignUpClick={handleSignUpClick}
          onDashboardClick={goHome}
          onProfileClick={goHome}
          onUploadClick={handleLoginClick}
          onHomeClick={handleBack}
          creatorStatus={hasCreatorPrivileges ? 'approved' : user?.creatorStatus}
          hasActiveLive={!!myActiveLive?.id}
        />
        <main className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600 mb-4">Video not found.</p>
          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-2 rounded-xl bg-[#FF4654] text-white font-bold text-sm hover:bg-[#ff5564]"
          >
            Back to home
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-[#1A1A2E]">
      <Navbar
        isAuthenticated={isAuthenticated}
        user={user}
        onLoginClick={handleLoginClick}
        onSignUpClick={handleSignUpClick}
        onDashboardClick={goHome}
        onProfileClick={goHome}
        onUploadClick={handleLoginClick}
        onHomeClick={handleBack}
        creatorStatus={hasCreatorPrivileges ? 'approved' : user?.creatorStatus}
        hasActiveLive={!!myActiveLive?.id}
      />
      <VideoPage
        video={video}
        videoId={videoId}
        relatedVideos={relatedVideos}
        currentUser={user}
        isAuthenticated={isAuthenticated}
        onLoginClick={handleLoginClick}
        onBack={handleBack}
        onCreatorClick={handleCreatorClick}
        onVideoClick={handleVideoClick}
        getToken={getIdToken}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={login}
        onSignUp={signup}
        initialTab={authModalTab}
      />
    </div>
  );
}
