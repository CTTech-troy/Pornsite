import React from 'react';
import { Users } from 'lucide-react';
// Export for use in App.tsx
export const liveStreams = [
{
  id: 1,
  streamer: 'GamingPro_99',
  title: 'Ranked Matches 🎮',
  viewers: '12.4K',
  category: 'Gaming',
  thumbnail: 'bg-gradient-to-br from-purple-600 to-blue-500',
  avatar:
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&h=100'
},
{
  id: 2,
  streamer: 'SarahCodes',
  title: 'React from Scratch 💻',
  viewers: '3.2K',
  category: 'Tech',
  thumbnail: 'bg-gradient-to-br from-pink-500 to-rose-500',
  avatar:
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100'
},
{
  id: 3,
  streamer: 'ChefMike',
  title: 'Sunday Brunch 🍳',
  viewers: '8.9K',
  category: 'Food',
  thumbnail: 'bg-gradient-to-br from-orange-400 to-red-500',
  avatar:
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100'
},
{
  id: 4,
  streamer: 'YogaWithJen',
  title: 'Morning Flow 🧘‍♀️',
  viewers: '5.1K',
  category: 'Health',
  thumbnail: 'bg-gradient-to-br from-teal-400 to-emerald-500',
  avatar:
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100'
},
{
  id: 5,
  streamer: 'DJ_Beats',
  title: 'Live Mix Session 🎧',
  viewers: '6.7K',
  category: 'Music',
  thumbnail: 'bg-gradient-to-br from-indigo-500 to-purple-700',
  avatar:
  'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=100&h=100'
},
{
  id: 6,
  streamer: 'ArtByLuna',
  title: 'Painting Session 🎨',
  viewers: '2.1K',
  category: 'Art',
  thumbnail: 'bg-gradient-to-br from-rose-400 to-red-600',
  avatar:
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100'
},
{
  id: 7,
  streamer: 'FitKing',
  title: 'HIIT Workout 💪',
  viewers: '4.3K',
  category: 'Fitness',
  thumbnail: 'bg-gradient-to-br from-green-400 to-emerald-600',
  avatar:
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100'
},
{
  id: 8,
  streamer: 'TravelMax',
  title: 'Exploring Bali 🌴',
  viewers: '9.8K',
  category: 'Travel',
  thumbnail: 'bg-gradient-to-br from-yellow-300 to-orange-400',
  avatar:
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&h=100'
}];


export default function LiveNowSection({ onStreamClick }) {
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

        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0">
          {liveStreams.map((stream) =>
          <div
            key={stream.id}
            className="flex flex-col items-center gap-2 flex-shrink-0 snap-start cursor-pointer group w-[72px]"
            onClick={() => onStreamClick?.(stream)}>

              <div className="relative w-16 h-16 md:w-[72px] md:h-[72px] rounded-full p-[3px] bg-gradient-to-tr from-[#FF4654] to-[#FF7043] group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full rounded-full border-2 border-white overflow-hidden relative bg-gray-100">
                  <img
                  src={stream.avatar}
                  alt={stream.streamer}
                  className="w-full h-full object-cover" />

                </div>
                {/* LIVE badge */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 shadow-sm border border-white">
                  <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                  LIVE
                </div>
              </div>
              <div className="text-center max-w-[72px]">
                <span className="text-[11px] font-bold text-gray-700 truncate block group-hover:text-[#FF4654] transition-colors">
                  {stream.streamer}
                </span>
                <span className="text-[9px] text-gray-400 font-medium flex items-center justify-center gap-0.5">
                  <Users className="w-2.5 h-2.5" />
                  {stream.viewers}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>);

}