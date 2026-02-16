import React from 'react';
import Navbar from '../components/Navbar.jsx';
import AuthModal from '../components/AuthModal.jsx';
import UploadModal from '../components/UploadModal.jsx';
import CreatorApplicationModal from '../components/CreatorApplicationModal.jsx';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Leaderboard65() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const { user, isAuthenticated, login, signup, uploadVideo, applyAsCreator } = useAuth();
  const navigate = useNavigate();

  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authModalTab, setAuthModalTab] = React.useState('login');
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = React.useState(false);

  const handleLoginClick = () => { setAuthModalTab('login'); setIsAuthModalOpen(true); };
  const handleSignUpClick = () => { setAuthModalTab('signup'); setIsAuthModalOpen(true); };
  const handleUploadClick = () => {
    if (isAuthenticated) {
      if (user?.creatorStatus === 'approved') setIsUploadModalOpen(true);
      else setIsCreatorModalOpen(true);
    } else handleLoginClick();
  };
  const handleDashboardClick = () => { /* optionally navigate to dashboard */ };
  const handleBackToFeed = () => navigate('/');
  const handleApplyCreator = (data) => { try { applyAsCreator(data); } catch (e) { console.warn(e); } };

  React.useEffect(() => {
    let mounted = true;
    const base = (import.meta.env && import.meta.env.VITE_API_URL) ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '') : '';
    const url = `${base}/api/videos/pornstars?limit=200`;
    (async () => {
      try {
        const res = await fetch(url);
        if (!mounted) return;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        const data = Array.isArray(body) ? body : (body && body.data ? body.data : []);
        const filtered = data.filter(d => d && d.star_thumb && !d.star_thumb.includes('pornstars/default'));
        const threshold = 661;
        filtered.sort((a, b) => {
          const ai = Number(a.videos_count_all) || 0;
          const bi = Number(b.videos_count_all) || 0;
          const aHot = ai > threshold;
          const bHot = bi > threshold;
          if (aHot && bHot) return bi - ai;
          if (aHot) return -1;
          if (bHot) return 1;
          return String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' });
        });
        if (mounted) setItems(filtered.slice(0, 65).map((it, i) => ({ ...it, rank: i + 1 })));
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
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
        creatorStatus={user?.creatorStatus}
        onSearch={() => {}}
      />
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Leaderboard — Top 65</h1>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">Error: {error}</div>}
        {!loading && !error && items.length === 0 && <div>No items</div>}
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((s) => (
              <div key={s.id || s.rank} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow">
                <img src={s.star_thumb} alt={s.name} className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <div className="font-bold">{s.rank}. {s.star_name || 'Unknown'}</div>
                  <div className="text-sm text-gray-500">{s.videos_count_all || 0} videos</div>
                </div>
              </div>
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