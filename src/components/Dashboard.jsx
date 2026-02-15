import React, { useRef } from 'react';
// import { User } from '../hooks/useAuth';
import  VideoCard  from './VideoCard';
import {
  ArrowLeftIcon,
  UploadIcon,
  UsersIcon,
  EyeIcon,
  HeartIcon,
  CalendarIcon,
  FilmIcon,
  DollarSign,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  Video as VideoIcon } from
'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard({
  user,
  uploadedVideos,
  onBack,
  onUpload,
  onLogout,
  onApplyCreator,
  onGoLive,
  creatorStatus,
  onSimulateApproval
}) {
  const totalViews = uploadedVideos.reduce(
    (acc, curr) => acc + (parseInt(curr.views.replace(/[^0-9]/g, '')) || 0),
    0
  );
  const totalLikes = uploadedVideos.reduce(
    (acc, curr) => acc + (parseInt(curr.likes.replace(/[^0-9]/g, '')) || 0),
    0
  );
  // Calculate mock earnings: $0.003 per view
  const totalEarnings = totalViews * 0.003;
  // Map user details safely from available sources
  const profile = user || {};
  const userData = profile.userData || {};
  const displayName = profile.name || profile.displayName || userData.name || 'Creator';
  const avatar = profile.avatar || userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`;
  const email = profile.email || userData.email || '';
  // Prefer createdAt from the DB and format with an ordinal: "12th Feb 2026"
  const joinDateRaw = userData.createdAt || null;
  const ordinal = (n) => {
    const j = n % 10, k = n % 100;
    if (k >= 11 && k <= 13) return `${n}th`;
    if (j === 1) return `${n}st`;
    if (j === 2) return `${n}nd`;
    if (j === 3) return `${n}rd`;
    return `${n}th`;
  };
  let joinDate = 'Unknown';
  if (joinDateRaw) {
    const d = new Date(joinDateRaw);
    if (!Number.isNaN(d.getTime())) {
      const day = ordinal(d.getDate());
      const month = d.toLocaleString(undefined, { month: 'short' });
      const year = d.getFullYear();
      joinDate = `${day} ${month} ${year}`;
    }
  }
  const followers = profile.followers ?? userData.followers ?? 0;
  const following = profile.following ?? userData.following ?? 0;
  const avatarInputRef = useRef(null);
  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-12">
      {/* Header / Cover */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-[#FF4654] to-[#FF7043] relative">
        <button
          onClick={onBack}
          className="absolute top-6 left-6 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30 transition-colors">

          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        {onLogout && (
        <button
          onClick={onLogout}
          className="absolute top-6 right-6 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30 transition-colors">
          Logout
        </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
        {/* Profile Card - modernized */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-3 flex items-center justify-center md:justify-start">
              <div className="relative">
                <img src={avatar} alt={displayName} className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white shadow-lg bg-gray-100 object-cover" />
                {creatorStatus === 'approved' && (
                  <>
                    <input ref={avatarInputRef} type="file" accept="image/*" onChange={(e) => {
                      const f = e.target.files && e.target.files[0];
                      if (f && typeof onUpdateAvatar === 'function') onUpdateAvatar(f);
                    }} className="hidden" />
                    <button onClick={() => avatarInputRef.current && avatarInputRef.current.click()} className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm">
                      <UploadIcon className="w-5 h-5 text-[#1A1A2E]" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="md:col-span-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#1A1A2E] flex items-center gap-3">
                {displayName}
                {creatorStatus === 'approved' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </h1>
              <p className="text-sm text-gray-500 mt-1">{email}</p>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <CalendarIcon className="w-4 h-4 text-[#FF4654]" />
                  <span>Joined {joinDate}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <UsersIcon className="w-4 h-4 text-[#FF7043]" />
                  <span>{followers} Followers</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <UsersIcon className="w-4 h-4 text-gray-400" />
                  <span>{following} Following</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 flex items-center justify-center md:justify-end">
              {creatorStatus === 'approved' ? (
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <button onClick={onUpload} className="w-full md:w-auto bg-[#1A1A2E] text-white font-bold px-6 py-3 rounded-xl hover:bg-black transition-colors flex items-center gap-2 justify-center">
                    <UploadIcon className="w-5 h-5" /> Upload
                  </button>
                  <button onClick={onGoLive} className="w-full md:w-auto bg-red-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 justify-center">
                    <VideoIcon className="w-5 h-5" /> Go Live
                  </button>
                </div>
              ) : (
                <button onClick={onApplyCreator} className="w-full md:w-auto bg-gradient-to-r from-[#FF4654] to-[#FF7043] text-white font-bold px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform">Apply Now</button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid - visible only to approved creators */}
        {creatorStatus === 'approved' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-[#FF4654]">
                <FilmIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">Total Videos</p>
                <p className="text-2xl font-black text-[#1A1A2E]">
                  {uploadedVideos.length}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                <EyeIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">Total Views</p>
                <p className="text-2xl font-black text-[#1A1A2E]">
                  {totalViews > 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-[#FF4654]">
                <HeartIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">Total Likes</p>
                <p className="text-2xl font-black text-[#1A1A2E]">
                  {totalLikes > 1000 ? `${(totalLikes / 1000).toFixed(1)}K` : totalLikes}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">Earnings</p>
                <p className="text-2xl font-black text-[#1A1A2E]">${totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500">Creator metrics</p>
                <p className="text-sm text-gray-600">Apply to become a verified creator to see detailed stats (videos, views, likes, earnings).</p>
              </div>
              <div>
                <button onClick={onApplyCreator} className="bg-gradient-to-r from-[#FF4654] to-[#FF7043] text-white font-bold px-4 py-2 rounded">Apply Now</button>
              </div>
            </div>
          </div>
        )}

        {/* Creator Status Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-black text-[#1A1A2E] mb-6">
            Creator Status
          </h2>

          {creatorStatus === 'none' &&
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FF4654]/10 to-[#FF7043]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md">
                    <Star className="w-8 h-8 text-[#FF4654] fill-[#FF4654]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#1A1A2E] mb-2">
                      Become a Creator
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      Apply to become a verified creator to upload videos, go
                      live, and earn money from your content.
                    </p>
                  </div>
                </div>
                <button
                onClick={onApplyCreator}
                className="bg-gradient-to-r from-[#FF4654] to-[#FF7043] text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-red-200/50 hover:shadow-xl hover:scale-105 transition-all">

                  Apply Now
                </button>
              </div>
            </div>
          }

          {creatorStatus === 'pending' &&
          <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-amber-500">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#1A1A2E] mb-2">
                      Application Under Review
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      Your creator application is being reviewed. You'll be
                      notified once approved.
                    </p>
                  </div>
                </div>
                {onSimulateApproval &&
              <button
                onClick={onSimulateApproval}
                className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-lg hover:bg-amber-200 transition-colors">

                    [DEV] Simulate Approval
                  </button>
              }
              </div>
            </div>
          }

          {creatorStatus === 'approved' &&
          <div className="bg-green-50 rounded-3xl p-8 border border-green-100 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-green-500">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#1A1A2E] mb-2">
                      Verified Creator ✓
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      You can upload videos and go live! Start creating content
                      for your audience.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                  onClick={onUpload}
                  className="bg-white text-[#1A1A2E] font-bold px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">

                    <UploadIcon className="w-5 h-5" />
                    Upload Video
                  </button>
                  <button
                  onClick={onGoLive}
                  className="bg-red-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex items-center gap-2">

                    <VideoIcon className="w-5 h-5" />
                    Go Live
                  </button>
                </div>
              </div>
            </div>
          }

          {creatorStatus === 'rejected' &&
          <div className="bg-red-50 rounded-3xl p-8 border border-red-100 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-red-500">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#1A1A2E] mb-2">
                      Application Not Approved
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      Unfortunately your application was not approved at this
                      time. You can try applying again later.
                    </p>
                  </div>
                </div>
                <button
                onClick={onApplyCreator}
                className="bg-white text-red-600 font-bold px-6 py-3 rounded-xl border border-red-200 hover:bg-red-50 transition-colors shadow-sm">

                  Reapply
                </button>
              </div>
            </div>
          }
        </div>

        {/* My Videos Section (visible to approved creators only) */}
        {creatorStatus === 'approved' && (
        <div className="mb-8">
          <h2 className="text-2xl font-black text-[#1A1A2E] mb-6">My Videos</h2>

          {uploadedVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploadedVideos.map((video) => (
            <VideoCard key={video.id} {...video} />
            ))}
            </div>
          ) : (

          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <UploadIcon className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">
                No videos yet
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Share your first video with the community! It will appear here and on the main feed.
              </p>
              <button
                onClick={onUpload}
                className="text-[#FF4654] font-bold hover:underline">
                  Upload your first video
              </button>
            </div>
          )}
        </div>
        )}
      </div>
    </div>);

}