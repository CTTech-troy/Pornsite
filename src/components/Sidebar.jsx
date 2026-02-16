import React from 'react';
import { Crown, TrendingUp, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PLACEHOLDER = 'https://via.placeholder.com/100';

function parseVideoCount(v) {
  if (v == null) return 0;
  const n = Number(String(v).replace(/[^\d]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export default function Sidebar({ onCreatorClick }) {
  const navigate = useNavigate();
  const [topCreators, setTopCreators] = React.useState(
    Array.from({ length: 5 }, (_, i) => ({
      rank: i + 1,
      name: 'Loading...',
      followers: '0',
      avatar: PLACEHOLDER,
      raw: null
    }))
  );

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const base = (import.meta.env && import.meta.env.VITE_API_URL)
          ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
          : '';
        // ask backend for a larger batch so frontend can pick true top 5
        const url = `${base}/api/videos/pornstars?limit=200&offset=0`;
        const res = await fetch(url);
        if (!mounted) return;
        if (!res.ok) throw new Error(`Failed to fetch pornstars (status ${res.status})`);
        const body = await res.json();
        const data = Array.isArray(body) ? body : (body && body.data ? body.data : []);
        if (!Array.isArray(data) || data.length === 0) throw new Error('No data');

        // filter out placeholder avatars and parse counts
        const filtered = data
          .map(p => ({ ...p, __videos: parseVideoCount(p.videos_count_all) }))
          .filter(p => p && p.star_thumb && !String(p.star_thumb).includes('pornstars/default'));

        // sort by numeric videos desc and take top 5
        const top5 = filtered
          .sort((a, b) => (b.__videos || 0) - (a.__videos || 0))
          .slice(0, 5);

        // map to UI model and fill placeholders if fewer than 5
        const mapped = top5.map((p, i) => ({
          rank: i + 1,
          name: p.name || p.star_name || 'Unknown',
          followers: String(p.__videos || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
          avatar: p.star_thumb || PLACEHOLDER,
          raw: p
        }));

        while (mapped.length < 5) {
          const n = mapped.length + 1;
          mapped.push({ rank: n, name: 'Unknown', followers: '0', avatar: PLACEHOLDER, raw: null });
        }

        if (mounted) setTopCreators(mapped);
      } catch (err) {
        console.warn('Sidebar: failed to load top creators:', err && err.message ? err.message : err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-8">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <h2 className="text-xl font-black text-[#1A1A2E]">Top 5 Creators</h2>
        </div>

        <div className="flex flex-col gap-4">
          {topCreators.map((creator) => (
            <div
              key={creator.rank}
              className="flex items-center gap-3 group cursor-pointer"
              onClick={() => onCreatorClick?.(creator.raw || creator)}>

              <div className={`w-6 text-center font-black ${creator.rank === 1 ? 'text-yellow-500 text-xl' : creator.rank === 2 ? 'text-gray-400 text-lg' : creator.rank === 3 ? 'text-orange-400 text-lg' : 'text-gray-400 text-sm'}`}>
                {creator.rank}
              </div>

              <div className="relative">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  onError={(e)=>{ e.currentTarget.src = PLACEHOLDER; }}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-110 transition-transform" />

                {creator.rank <= 3 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-[#FF4654] to-[#FF7043] rounded-full flex items-center justify-center text-[8px] text-white font-bold border border-white">
                    ★
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-[#1A1A2E] text-sm group-hover:text-[#FF4654] transition-colors">
                  {creator.name}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {creator.followers} videos
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          className="w-full mt-6 py-2 text-sm font-bold text-[#FF4654] bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
          onClick={() => navigate('/leaderboard')}
        >
          View Leaderboard
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-[#FF4654]" />
          <h2 className="text-xl font-black text-[#1A1A2E]">Trending</h2>
        </div>

        <div className="flex flex-col gap-3">
          {/* trending topics list */}
          {/* ...existing trending items... */}
        </div>
      </div>
    </aside>
  );
}