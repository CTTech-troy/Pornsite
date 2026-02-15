import React from 'react';

export default function AdBanner({ className = '', size = 'banner' }) {
  const heightClass =
  size === 'leaderboard' ?
  'h-[90px]' :
  size === 'video' ?
  'h-[60px]' :
  'h-[100px] md:h-[120px]';
  return (
    <div
      className={`w-full flex justify-center items-center my-6 ${className}`}>

      <div
        className={`w-full max-w-5xl bg-gradient-to-br from-gray-50 to-gray-100 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 relative overflow-hidden group cursor-pointer hover:bg-gray-50 transition-colors ${heightClass}`}>

        <span className="text-[10px] font-bold uppercase tracking-widest mb-1 text-gray-500">
          Advertisement
        </span>
        <span className="text-sm font-medium text-gray-600">
          Place your ad here
        </span>

        {/* Shine effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"></div>
      </div>
    </div>);

}