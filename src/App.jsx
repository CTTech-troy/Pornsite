import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Navbar';
import MainPage from './pages/mainpage.jsx';
import Leaderboard65 from './pages/Leaderboard65.jsx';

export default function App() {
  return (
    <>
      {/* <Header /> */}
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/leaderboard" element={<Leaderboard65 />} />
      </Routes>
    </>
  );
}