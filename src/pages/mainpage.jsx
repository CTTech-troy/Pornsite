import React, { useState } from 'react';
import  Navbar  from '../components/Navbar';
import  LiveNowSection  from '../components/LiveNowSection';
import  VideoGrid  from '../components/VideoGrid';
import  Sidebar  from '../components/Sidebar';
import  Dashboard  from '../components/Dashboard';
import  AuthModal  from '../components/AuthModal';
import  UploadModal  from '../components/UploadModal';
import  VideoPage  from '../components/VideoPage';
import  AdBanner  from '../components/AdBanner';
import  PublicProfile  from '../components/PublicProfile';
import  LiveStreamPage  from '../components/LiveStreamPage';
import  CreatorApplicationModal  from '../components/CreatorApplicationModal';
import CreatorApplicationPage from '../pages/CreatorApplicationPage';
import  CreatorLiveStudio  from '../components/CreatorLiveStudio';
import { useAuth } from '../hooks/useAuth';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


export default function App() {
  const {
    user,
    isAuthenticated,
    uploadedVideos,
    login,
    signup,
    logout,
    uploadVideo,
    applyAsCreator,
    approveCreator
  } = useAuth();
  const [showDashboard, setShowDashboard] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentPublicProfile, setCurrentPublicProfile] = useState(null);
  const [currentLiveStream, setCurrentLiveStream] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  const [showCreatorPage, setShowCreatorPage] = useState(false);
  const [showLiveStudio, setShowLiveStudio] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
    setCurrentVideo(null);
    setCurrentLiveStream(null);
    setCurrentPublicProfile(null);
    setShowLiveStudio(false);
  };
  const handleUploadClick = () => {
    if (isAuthenticated) {
      if (user?.creatorStatus === 'approved') {
        setIsUploadModalOpen(true);
      } else {
        setIsCreatorModalOpen(true);
      }
    } else {
      handleLoginClick();
    }
  };
  const handleVideoClick = (video) => {
    setCurrentVideo(video);
    setCurrentLiveStream(null);
    setCurrentPublicProfile(null);
    setShowLiveStudio(false);
    window.scrollTo(0, 0);
  };
  const handleLiveStreamClick = (stream) => {
    setCurrentLiveStream(stream);
    setCurrentVideo(null);
    setCurrentPublicProfile(null);
    setShowLiveStudio(false);
    window.scrollTo(0, 0);
  };
  const handleBackToFeed = () => {
    setCurrentVideo(null);
    setCurrentPublicProfile(null);
    setCurrentLiveStream(null);
    setShowDashboard(false);
    setShowLiveStudio(false);
    window.scrollTo(0, 0);
  };
  const handleCreatorClick = (creator) => {
    // Normalize creator data since it might come from different sources
    const profileData = {
      name: creator.name || creator,
      avatar:
      creator.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.name || creator}`,
      followers: creator.followers || '1.2M',
      bio: creator.bio,
      coverImage: creator.coverImage
    };
    setCurrentPublicProfile(profileData);
    setCurrentVideo(null);
    setCurrentLiveStream(null);
    setShowLiveStudio(false);
    window.scrollTo(0, 0);
  };
  const handleApplyCreator = () => {
    // Open the full-page Creator Application instead of modal
    setShowCreatorPage(true);
  };
  const handleGoLive = () => {
    setShowLiveStudio(true);
    setShowDashboard(false);
  };
  const handleSearch = (query) => {
    setSearchQuery(query);
    // If we're not on home, go to home to show results
    if (
    currentVideo ||
    currentPublicProfile ||
    currentLiveStream ||
    showDashboard)
    {
      handleBackToFeed();
    }
  };
  // Render Creator Live Studio if active
  if (showLiveStudio && user) {
    return <CreatorLiveStudio user={user} onBack={handleBackToFeed} />;
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
          onUploadClick={handleUploadClick}
          onHomeClick={handleBackToFeed}
          creatorStatus={user?.creatorStatus}
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
            creatorStatus={user.creatorStatus}
            onSimulateApproval={approveCreator} />
        ) : currentLiveStream ? (
          <LiveStreamPage stream={currentLiveStream} onBack={handleBackToFeed} />
        ) : currentPublicProfile ? (
          <PublicProfile
            creator={currentPublicProfile}
            videos={uploadedVideos.length > 0 ? uploadedVideos : []}
            onBack={handleBackToFeed}
            onVideoClick={handleVideoClick} />
        ) : currentVideo ? (
          <VideoPage
            video={currentVideo}
            currentUser={user}
            isAuthenticated={isAuthenticated}
            onLoginClick={handleLoginClick}
            onBack={handleBackToFeed}
            onCreatorClick={handleCreatorClick}
            onVideoClick={handleVideoClick} />
        ) : (
          <main className="max-w-7xl mx-auto px-4 pb-12">
            <LiveNowSection onStreamClick={handleLiveStreamClick} />

            <AdBanner size="leaderboard" />

            <div className="flex flex-col lg:flex-row gap-8 mt-4">
              <VideoGrid
              userUploadedVideos={uploadedVideos}
              onVideoClick={handleVideoClick}
              searchQuery={searchQuery}
              remoteApi="pornhub" />

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