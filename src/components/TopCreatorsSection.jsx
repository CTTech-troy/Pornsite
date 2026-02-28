import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ChevronRight } from 'lucide-react';

export default function TopCreatorsSection({ creators = [], loading }) {
  const navigate = useNavigate();
  const top5 = creators.slice(0, 5);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-[#1A1A2E] flex items-center gap-2">
          <Trophy className="w-6 h-6 text-[#FF4654]" />
          Top Creators
        </h2>
        <button
          type="button"
          onClick={() => navigate('/leaderboard')}
          className="flex items-center gap-1 text-sm font-bold text-[#FF4654] hover:text-[#ff5564] transition-colors"
        >
          View Leaderboard
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {loading && (
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0 w-24 animate-pulse">
              <div className="w-24 h-24 rounded-full bg-gray-200" />
              <div className="h-3 bg-gray-200 rounded mt-2 w-20" />
            </div>
          ))}
        </div>
      )}
      {!loading && top5.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {top5.map((c, index) => (
            <button
              key={c.id || index}
              type="button"
              onClick={() => navigate(`/creator/${encodeURIComponent(c.slug || c.id)}`)}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-colors text-left"
            >
              <div className="relative">
                <img
                  src={c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.name || c.id)}`}
                  alt={c.name}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-white shadow-md"
                />
                <span className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-[#FF4654] text-white text-xs font-black flex items-center justify-center">
                  {index + 1}
                </span>
              </div>
              <span className="text-sm font-bold text-[#1A1A2E] max-w-[100px] truncate">
                {c.name || c.star_name || 'Creator'}
              </span>
              <span className="text-xs text-gray-500">{c.videosCount ?? 0} videos</span>
            </button>
          ))}
        </div>
      )}
      {!loading && top5.length === 0 && (
        <p className="text-gray-500 text-sm py-4">No creators to show yet.</p>
      )}
    </section>
  );
}
