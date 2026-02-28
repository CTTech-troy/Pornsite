import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import AuthModal from '../components/AuthModal.jsx';
import UploadModal from '../components/UploadModal.jsx';
import CreatorApplicationModal from '../components/CreatorApplicationModal.jsx';
import { useAuth } from '../hooks/useAuth';
import { getCreators } from '../api/creatorsApi';
import { useNavigate } from 'react-router-dom';
import { Trophy, ChevronRight } from 'lucide-react';

export default function Leaderboard65() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated, login, signup, uploadVideo, applyAsCreator } = useAuth();
  const navigate = useNavigate();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);

  const handleLoginClick = () => { setAuthModalTab('login'); setIsAuthModalOpen(true); };
  const handleSignUpClick = () => { setAuthModalTab('signup'); setIsAuthModalOpen(true); };
  const hasCreatorPrivileges = user?.creator === true || user?.creatorStatus === 'approved';
  const handleUploadClick = () => {
    if (isAuthenticated) {
      if (hasCreatorPrivileges) setIsUploadModalOpen(true);
      else setIsCreatorModalOpen(true);
    } else handleLoginClick();
  };
  const handleDashboardClick = () => {};
  const handleBackToFeed = () => navigate('/');
  const handleApplyCreator = (data) => { try { applyAsCreator(data); } catch (e) { console.warn(e); } };

  useEffect(() => {
    let mounted = true;
    getCreators(500)
      .then((data) => {
        if (!mounted) return;
        setItems(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || 'Failed to load');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <Navbar
        isAuthenticated={isAuthenticated}
        user={user}
        onLoginClick={handleLoginClick}
        onSignUpClick={handleSignUpClick}
        onDashboardClick={handleDashboardClick}
        onUploadClick={handleUploadClick}
        onHomeClick={handleBackToFeed}
        creatorStatus={hasCreatorPrivileges ? 'approved' : user?.creatorStatus}
        onSearch={() => {}}
      />
      <main className="max-w-7xl mx-auto px-4 py-8 pb-12">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-8 h-8 text-[#FF4654]" />
          <h1 className="text-2xl md:text-3xl font-black text-[#1A1A2E]">Creator Leaderboard</h1>
        </div>
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl animate-pulse">
                <div className="w-16 h-16 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}
        {!loading && !error && items.length === 0 && (
          <p className="text-gray-500 py-8">No creators to show.</p>
        )}
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((c, index) => (
              <button
                key={c.id || c.slug || index}
                type="button"
                onClick={() => navigate(`/creator/${encodeURIComponent(c.slug || c.id)}`)}
                className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-[#FF4654]/30 hover:shadow-md transition-all text-left group"
              >
                <span className="flex-shrink-0 w-8 text-lg font-black text-gray-400 group-hover:text-[#FF4654]">
                  {index + 1}
                </span>
                <img
                  src={c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.name || c.id)}`}
                  alt={c.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#1A1A2E] truncate">{c.name || c.star_name || 'Creator'}</div>
                  <div className="text-sm text-gray-500">{c.videosCount ?? 0} videos</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#FF4654] flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
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
    </>
  );
}
