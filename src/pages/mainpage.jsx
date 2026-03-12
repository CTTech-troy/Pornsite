import React, { useState, useEffect } from 'react';
import  Navbar  from '../components/Navbar';
import  LiveNowSection  from '../components/LiveNowSection.jsx';
import VideoFeed from '../components/VideoFeed';
import  Sidebar  from '../components/Sidebar';
import  Dashboard  from '../components/Dashboard';
import  AuthModal  from '../components/AuthModal';
import  UploadModal  from '../components/UploadModal';
import  AdBanner  from '../components/AdBanner';
import  PublicProfile  from '../components/PublicProfile';
import  LiveStreamPage  from '../components/LiveStreamPage';
import  CreatorApplicationModal  from '../components/CreatorApplicationModal';
import CreatorApplicationPage from '../pages/CreatorApplicationPage';
import  CreatorLiveStudio  from '../components/CreatorLiveStudio';
import { useAuth } from '../hooks/useAuth';
import { getMyActiveLive } from '../api/liveApi';
import { useNavigate } from 'react-router-dom';
import { getPathSafeVideoId } from '../utils/videoId';

export default function MainPage() {
  const {
    user,
    isAuthenticated,
    uploadedVideos,
    login,
    signup,
    logout,
    uploadVideo,
    getIdToken,
    applyAsCreator,
    approveCreator
  } = useAuth();
  const [showDashboard, setShowDashboard] = useState(false);
  const [currentPublicProfile, setCurrentPublicProfile] = useState(null);
  const [currentLiveStream, setCurrentLiveStream] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  const [showCreatorPage, setShowCreatorPage] = useState(false);
  const [showLiveStudio, setShowLiveStudio] = useState(false);
  const [initialLiveIdForStudio, setInitialLiveIdForStudio] = useState(null);
  const [myActiveLive, setMyActiveLive] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const hasCreatorPrivileges = user?.creator === true || user?.creatorStatus === 'approved';
  useEffect(() => {
    if (!user?.uid || !hasCreatorPrivileges) {
      setMyActiveLive(null);
      return;
    }
    getMyActiveLive(user.uid).then((data) => setMyActiveLive(data || null)).catch(() => setMyActiveLive(null));
  }, [user?.uid, hasCreatorPrivileges, showLiveStudio]);

  const handleProfileClick = () => {
    if (myActiveLive?.id) {
      setInitialLiveIdForStudio(myActiveLive.id);
      setShowLiveStudio(true);
      setShowDashboard(false);
      setCurrentLiveStream(null);
      setCurrentPublicProfile(null);
    } else {
      setShowDashboard(true);
      setShowLiveStudio(false);
      setCurrentLiveStream(null);
      setCurrentPublicProfile(null);
    }
  };
  const handleLoginClick = () => {
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
  };
  const handleSignUpClick = () => {
    setAuthModalTab('signup');
    setIsAuthModalOpen(true);
  };
  const handleDashboardClick = () => {
    setShowDashboard(true);
    setCurrentLiveStream(null);
    setCurrentPublicProfile(null);
    setShowLiveStudio(false);
  };
  const handleUploadClick = () => {
    if (isAuthenticated) {
      if (hasCreatorPrivileges) {
        setIsUploadModalOpen(true);
      } else {
        setIsCreatorModalOpen(true);
      }
    } else {
      handleLoginClick();
    }
  };
  const handleVideoClick = (video) => {
    const pathId = getPathSafeVideoId(video.id);
    navigate(`/video/${pathId}`, { state: { video } });
    setCurrentLiveStream(null);
    setCurrentPublicProfile(null);
    setShowLiveStudio(false);
    window.scrollTo(0, 0);
  };
  const handleLiveStreamClick = (stream) => {
    setCurrentLiveStream(stream);
    setCurrentPublicProfile(null);
    setShowLiveStudio(false);
    window.scrollTo(0, 0);
  };
  const handleBackToFeed = () => {
    setCurrentPublicProfile(null);
    setCurrentLiveStream(null);
    setShowDashboard(false);
    setShowLiveStudio(false);
    window.scrollTo(0, 0);
  };
  const handleCreatorClick = (creator) => {
    const name = creator?.name ?? creator?.star_name ?? (typeof creator === 'string' ? creator : '');
    const profileData = {
      name: name || 'Creator',
      avatar: creator?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'creator')}`,
      followers: creator?.followers || '—',
      bio: creator?.bio,
      coverImage: creator?.coverImage,
      searchTerm: name || (typeof creator === 'string' ? creator : ''),
    };
    setCurrentPublicProfile(profileData);
    setCurrentLiveStream(null);
    setShowLiveStudio(false);
    window.scrollTo(0, 0);
  };
  const handleApplyCreator = () => {
    // Open the full-page Creator Application instead of modal
    setShowCreatorPage(true);
  };
  const handleGoLive = (existingLiveId = null) => {
    setInitialLiveIdForStudio(existingLiveId ?? null);
    setShowLiveStudio(true);
    setShowDashboard(false);
  };
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (
      currentPublicProfile ||
      currentLiveStream ||
      showDashboard
    ) {
      handleBackToFeed();
    }
  };
  // Render Creator Live Studio if active
  if (showLiveStudio && user) {
    return (
      <CreatorLiveStudio
        user={user}
        onBack={() => {
          setShowLiveStudio(false);
          setInitialLiveIdForStudio(null);
          setMyActiveLive(null);
          getMyActiveLive(user?.uid).then((data) => setMyActiveLive(data || null)).catch(() => {});
        }}
        initialLiveId={initialLiveIdForStudio}
      />
    );
  }
  // Render the full-page Creator Application if requested
  if (showCreatorPage) {
    return (
      <CreatorApplicationPage
        onClose={() => setShowCreatorPage(false)}
        onApply={(data) => {
          try { applyAsCreator(data) } catch (err) { console.warn(err) }
          setShowCreatorPage(false)
        }}
      />
    )
  }
  return (
    <>
      <div className="min-h-screen bg-[#F0F2F5] font-sans text-[#1A1A2E]">
        <Navbar
          isAuthenticated={isAuthenticated}
          user={user}
          onLoginClick={handleLoginClick}
          onSignUpClick={handleSignUpClick}
          onDashboardClick={handleDashboardClick}
          onProfileClick={handleProfileClick}
          onUploadClick={handleUploadClick}
          onHomeClick={handleBackToFeed}
          onGoLive={handleGoLive}
          creatorStatus={hasCreatorPrivileges ? 'approved' : user?.creatorStatus}
          hasActiveLive={!!myActiveLive?.id}
          activeLiveId={myActiveLive?.id}
          onSearch={handleSearch} />

        {showDashboard && user ? (
          <Dashboard
            user={user}
            uploadedVideos={uploadedVideos}
            onBack={handleBackToFeed}
            onUpload={() => setIsUploadModalOpen(true)}
            onLogout={logout}
            onApplyCreator={handleApplyCreator}
            onGoLive={handleGoLive}
            hasActiveLive={!!myActiveLive?.id}
            activeLiveId={myActiveLive?.id}
            creatorStatus={hasCreatorPrivileges ? 'approved' : user.creatorStatus}
            onSimulateApproval={approveCreator} />
        ) : currentLiveStream ? (
          <LiveStreamPage stream={currentLiveStream} onBack={handleBackToFeed} userId={user?.uid} />
        ) : currentPublicProfile ? (
          <PublicProfile
            creator={currentPublicProfile}
            videos={uploadedVideos.length > 0 ? uploadedVideos : []}
            searchTerm={currentPublicProfile.searchTerm || null}
            onBack={handleBackToFeed}
            onVideoClick={handleVideoClick} />
        ) : (
          <main className="max-w-7xl mx-auto px-4 pb-12">
            <LiveNowSection onStreamClick={handleLiveStreamClick} />

            <AdBanner size="leaderboard" />

            <div className="flex flex-col lg:flex-row gap-8 mt-4">
              <VideoFeed
                userUploadedVideos={uploadedVideos}
                onVideoClick={handleVideoClick}
                searchQuery={searchQuery}
              />
              <Sidebar onCreatorClick={handleCreatorClick} />
            </div>
          </main>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={login}
        onSignUp={signup}
        initialTab={authModalTab} />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={uploadVideo} />

      <CreatorApplicationModal
        isOpen={isCreatorModalOpen}
        onClose={() => setIsCreatorModalOpen(false)}
        onApply={applyAsCreator} />


    </>
  );
}