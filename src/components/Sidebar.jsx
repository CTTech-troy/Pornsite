import React from 'react';
import { Crown, TrendingUp, Hash } from 'lucide-react';

const topCreators = [
{
  rank: 1,
  name: 'PewDiePie',
  followers: '111M',
  avatar:
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100'
},
{
  rank: 2,
  name: 'MrBeast',
  followers: '105M',
  avatar:
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&h=100'
},
{
  rank: 3,
  name: 'DudePerfect',
  followers: '58M',
  avatar:
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100'
},
{
  rank: 4,
  name: 'Markiplier',
  followers: '34M',
  avatar:
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&h=100'
},
{
  rank: 5,
  name: 'Vanoss',
  followers: '25M',
  avatar:
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=100&h=100'
}];

const trendingTopics = [
{
  tag: 'MinecraftUpdate',
  posts: '450K'
},
{
  tag: 'SpaceXLaunch',
  posts: '120K'
},
{
  tag: 'NewiPhone',
  posts: '89K'
},
{
  tag: 'WorldCup2026',
  posts: '340K'
},
{
  tag: 'CyberpunkDLC',
  posts: '56K'
},
{
  tag: 'HealthyEating',
  posts: '23K'
}];

export default function Sidebar({ onCreatorClick }) {
  return (
    <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-8">
      {/* Top Creators Leaderboard */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <h2 className="text-xl font-black text-[#1A1A2E]">Top Creators</h2>
        </div>

        <div className="flex flex-col gap-4">
          {topCreators.map((creator) =>
          <div
            key={creator.rank}
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => onCreatorClick?.(creator)}>

              <div
              className={`w-6 text-center font-black ${creator.rank === 1 ? 'text-yellow-500 text-xl' : creator.rank === 2 ? 'text-gray-400 text-lg' : creator.rank === 3 ? 'text-orange-400 text-lg' : 'text-gray-400 text-sm'}`}>

                {creator.rank}
              </div>
              <div className="relative">
                <img
                src={creator.avatar}
                alt={creator.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-110 transition-transform" />

                {creator.rank <= 3 &&
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-[#FF4654] to-[#FF7043] rounded-full flex items-center justify-center text-[8px] text-white font-bold border border-white">
                    ★
                  </div>
              }
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#1A1A2E] text-sm group-hover:text-[#FF4654] transition-colors">
                  {creator.name}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {creator.followers} followers
                </p>
              </div>
            </div>
          )}
        </div>
        <button className="w-full mt-6 py-2 text-sm font-bold text-[#FF4654] bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
          View Leaderboard
        </button>
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-[#FF4654]" />
          <h2 className="text-xl font-black text-[#1A1A2E]">Trending</h2>
        </div>

        <div className="flex flex-col gap-3">
          {trendingTopics.map((topic, i) =>
          <div
            key={i}
            className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-colors">

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#FF4654] group-hover:text-white transition-colors">
                  <Hash className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A2E] text-sm group-hover:text-[#FF4654] transition-colors">
                    {topic.tag}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {topic.posts} posts
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>);

}