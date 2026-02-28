import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import UploadModal from '../components/UploadModal';
import CreatorApplicationModal from '../components/CreatorApplicationModal';
import VideoCard from '../components/VideoCard';
import { useAuth } from '../hooks/useAuth';
import { getCreatorBySlug } from '../api/creatorsApi';
import { getPathSafeVideoId } from '../utils/videoId';
import { ArrowLeft, Film, Loader2 } from 'lucide-react';

function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(Number(seconds))) return '0:00';
  const n = Math.floor(Number(seconds));
  const m = Math.floor(n / 60);
  const s = n % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function mapCreatorVideoToCard(v, index) {
  return {
    id: v.id || `v-${index}`,
    title: v.title || 'Video',
    channel: '',
    views: v.views ?? 0,
    time: '',
    thumbnail: v.thumbnail || '',
    duration: formatDuration(v.duration),
    durationSeconds: Number(v.duration) || 0,
    avatar: '',
    videoSrc: v.url || '',
    likes: '0',
    comments: '0',
  };
}

export default function CreatorPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, login, signup, uploadVideo, applyAsCreator } = useAuth();
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);

  const hasCreatorPrivileges = user?.creator === true || user?.creatorStatus === 'approved';

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError('Missing creator');
      return;
    }
    let mounted = true;
    setLoading(true);
    setError(null);
    getCreatorBySlug(slug)
      .then((data) => {
        if (!mounted) return;
        setCreator(data || null);
        if (!data) setError('Creator not found');
      })
      .catch((err) => {
        if (!mounted) return;
        setCreator(null);
        setError(err?.message || 'Failed to load');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [slug]);

  const handleLoginClick = () => { setAuthModalTab('login'); setIsAuthModalOpen(true); };
  const handleSignUpClick = () => { setAuthModalTab('signup'); setIsAuthModalOpen(true); };
  const handleUploadClick = () => {
    if (isAuthenticated && hasCreatorPrivileges) setIsUploadModalOpen(true);
    else if (!isAuthenticated) handleLoginClick();
    else setIsCreatorModalOpen(true);
  };
  const handleBack = () => navigate(-1);
  const handleHome = () => navigate('/');
  const handleVideoClick = (video) => {
    const pathId = getPathSafeVideoId(video.id);
    navigate(`/video/${pathId}`, { state: { video } });
  };
  const handleApplyCreator = (data) => {
    try { applyAsCreator(data); } catch (e) { console.warn(e); }
  };

  const videos = creator?.videos ?? [];
  const videoCards = videos.map(mapCreatorVideoToCard);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#FF4654] animate-spin" />
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] font-sans text-[#1A1A2E]">
        <Navbar
          isAuthenticated={isAuthenticated}
          user={user}
          onLoginClick={handleLoginClick}
          onSignUpClick={handleSignUpClick}
          onDashboardClick={handleHome}
          onProfileClick={handleHome}
          onUploadClick={handleUploadClick}
          onHomeClick={handleHome}
          creatorStatus={hasCreatorPrivileges ? 'approved' : user?.creatorStatus}
        />
        <main className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600 mb-4">{error || 'Creator not found.'}</p>
          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-2 rounded-xl bg-[#FF4654] text-white font-bold text-sm hover:bg-[#ff5564]"
          >
            Go back
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
        onDashboardClick={handleHome}
        onProfileClick={handleHome}
        onUploadClick={handleUploadClick}
        onHomeClick={handleHome}
        creatorStatus={hasCreatorPrivileges ? 'approved' : user?.creatorStatus}
      />
      <main className="max-w-7xl mx-auto px-4 py-6 pb-12">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-[#FF4654] font-medium text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Profile header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <img
              src={creator.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(creator.name)}`}
              alt={creator.name}
              className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-black text-[#1A1A2E] mb-2">
                {creator.name || creator.star_name || 'Creator'}
              </h1>
              {creator.bio && (
                <p className="text-gray-600 text-sm leading-relaxed mb-4 max-w-2xl">{creator.bio}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Film className="w-4 h-4 text-[#FF4654]" />
                  {creator.videosCount ?? videos.length} videos
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div>
          <h2 className="text-lg font-black text-[#1A1A2E] mb-4">Content</h2>
          {videoCards.length === 0 ? (
            <p className="text-gray-500 py-8">No videos yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {videoCards.map((video, index) => (
                <VideoCard
                  key={video.id}
                  {...video}
                  onClick={() => handleVideoClick(video)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={login}
        onSignUp={signup}
        initialTab={authModalTab}
      />
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={uploadVideo}
      />
      <CreatorApplicationModal
        isOpen={isCreatorModalOpen}
        onClose={() => setIsCreatorModalOpen(false)}
        onApply={(data) => { handleApplyCreator(data); setIsCreatorModalOpen(false); }}
      />
    </div>
  );
}
