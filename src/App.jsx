import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainPage from './pages/mainpage.jsx';
import Leaderboard65 from './pages/Leaderboard65.jsx';
import VideoDetailRoute from './pages/VideoDetailRoute.jsx';
import CreatorPage from './pages/CreatorPage.jsx';
import TikTokFeedRoute from './pages/TikTokFeedRoute.jsx';
import TikTokVideoRoute from './pages/TikTokVideoRoute.jsx';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/video/:videoId" element={<VideoDetailRoute />} />
        <Route path="/leaderboard" element={<Leaderboard65 />} />
        <Route path="/creator/:slug" element={<CreatorPage />} />
        <Route path="/tiktok" element={<TikTokFeedRoute />} />
        <Route path="/tiktok/video/:videoId" element={<TikTokVideoRoute />} />
      </Routes>
    </>
  );
}