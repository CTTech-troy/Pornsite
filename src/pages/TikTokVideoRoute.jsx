import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../hooks/useAuth';
import TikTokVideoPage from './TikTokVideoPage';

export default function TikTokVideoRoute() {
  const navigate = useNavigate();
  const { user, isAuthenticated, getIdToken, login, signup } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  const handleLoginClick = () => {
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
  };

  const goHome = () => navigate('/');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        isAuthenticated={isAuthenticated}
        user={user}
        onLoginClick={handleLoginClick}
        onSignUpClick={() => { setAuthModalTab('signup'); setIsAuthModalOpen(true); }}
        onDashboardClick={goHome}
        onProfileClick={goHome}
        onUploadClick={handleLoginClick}
        onHomeClick={goHome}
        creatorStatus={user?.creatorStatus}
      />
      <TikTokVideoPage
        getToken={getIdToken}
        isAuthenticated={isAuthenticated}
        onLoginClick={handleLoginClick}
        user={user}
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
