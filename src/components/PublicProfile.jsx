import React, { useState } from 'react';
import {
  ArrowLeft,
  Users,
  Video as VideoIcon,
  CheckCircle2,
  Bell } from
'lucide-react';
import  VideoCard  from './VideoCard';
// import { Video } from '../hooks/useAuth';
export default function PublicProfile({
  creator,
  videos,
  onBack,
  onVideoClick
}) {
  const [isFollowing, setIsFollowing] = useState(false);
  return (
    <div className="min-h-screen bg-[#F8F8FA] pb-12">
      {/* Cover Image */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-gray-800 to-gray-900 relative">
        <button
          onClick={onBack}
          className="absolute top-6 left-6 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30 transition-colors z-10">

          <ArrowLeft className="w-6 h-6" />
        </button>
        {creator.coverImage &&
        <img
          src={creator.coverImage}
          alt="Cover"
          className="w-full h-full object-cover opacity-60" />

        }
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
          <div className="relative">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg bg-gray-100 object-cover" />

            <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left mb-2">
            <h1 className="text-3xl font-black text-gray-900 mb-1 flex items-center justify-center md:justify-start gap-2">
              {creator.name}
            </h1>
            <p className="text-gray-500 font-medium mb-4 max-w-md mx-auto md:mx-0">
              {creator.bio ||
              `Creating amazing content for the ${creator.name} community. New videos every week!`}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                <Users className="w-4 h-4 text-[#FF6B6B]" />
                <span>{creator.followers} Followers</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                <VideoIcon className="w-4 h-4 text-[#845EF7]" />
                <span>{videos.length} Videos</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${isFollowing ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-black shadow-gray-200'}`}>

            {isFollowing ?
            <>
                <CheckCircle2 className="w-5 h-5" />
                Following
              </> :

            <>
                <Bell className="w-5 h-5" />
                Follow
              </>
            }
          </button>
        </div>

        {/* Videos Grid */}
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            Latest Videos
          </h2>
          {videos.length > 0 ?
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) =>
            <VideoCard
              key={video.id}
              {...video}
              onClick={() => onVideoClick(video)} />

            )}
            </div> :

          <div className="text-center py-20 text-gray-500">
              No videos available yet.
            </div>
          }
        </div>
      </div>
    </div>);

}