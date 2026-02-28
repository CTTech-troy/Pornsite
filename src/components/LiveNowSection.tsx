import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { listActiveLives } from '../api/liveApi';

const defaultThumbnails = [
  'bg-gradient-to-br from-purple-600 to-blue-500',
  'bg-gradient-to-br from-pink-500 to-rose-500',
  'bg-gradient-to-br from-orange-400 to-red-500',
  'bg-gradient-to-br from-teal-400 to-emerald-500',
  'bg-gradient-to-br from-indigo-500 to-purple-700',
];

function mapLiveToStream(live: { id: string; host_id: string; host_display_name?: string | null; viewers_count?: number }, index: number) {
  const hostId = live.host_id || live.id;
  const displayName = live.host_display_name?.trim() || hostId.slice(0, 12);
  return {
    id: live.id,
    host_id: hostId,
    streamer: displayName,
    title: 'Live',
    viewers: live.viewers_count ?? 0,
    category: 'Live',
    thumbnail: defaultThumbnails[index % defaultThumbnails.length],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(hostId)}`,
  };
}

export default function LiveNowSection({ onStreamClick }: { onStreamClick?: (stream: Record<string, unknown>) => void }) {
  const [streams, setStreams] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listActiveLives()
      .then((list) => {
        const arr = Array.isArray(list) ? list : [];
        setStreams(arr.map((live: { id: string; host_id: string; host_display_name?: string | null; viewers_count?: number }, i: number) => mapLiveToStream(live, i)));
      })
      .catch(() => setStreams([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full bg-white border-b border-gray-200 py-5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-black text-[#1A1A2E] uppercase tracking-wider">
            Live Now
          </h2>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
        </div>

        {loading ? (
          <p className="text-xs text-gray-500">Loading...</p>
        ) : (
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0">
            {streams.map((stream) => (
              <div
                key={String(stream.id)}
                className="flex flex-col items-center gap-2 flex-shrink-0 snap-start cursor-pointer group w-[72px]"
                onClick={() => onStreamClick?.(stream)}
              >
                <div className="relative w-16 h-16 md:w-[72px] md:h-[72px] rounded-full p-[3px] bg-gradient-to-tr from-[#FF4654] to-[#FF7043] group-hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden relative bg-gray-100">
                    <img
                      src={String(stream.avatar)}
                      alt={String(stream.streamer)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 shadow-sm border border-white">
                    <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                    LIVE
                  </div>
                </div>
                <div className="text-center max-w-[72px]">
                  <span className="text-[11px] font-bold text-gray-700 truncate block group-hover:text-[#FF4654] transition-colors">
                    {String(stream.streamer)}
                  </span>
                  <span className="text-[9px] text-gray-400 font-medium flex items-center justify-center gap-0.5">
                    <Users className="w-2.5 h-2.5" />
                    {stream.viewers}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && streams.length === 0 && (
          <p className="text-xs text-gray-500">No live streams right now.</p>
        )}
      </div>
    </div>
  );
}
