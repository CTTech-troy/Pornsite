import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft,
  Send,
  Users,
  Heart,
  Share2,
  MoreHorizontal,
  Smile,
  Gift } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdBanner  from './AdBanner';

const MOCK_MESSAGES = [
'This is amazing! 🔥',
'Hello from Brazil! 🇧🇷',
'Can you show that again?',
'First time here, loving the vibe',
'PogChamp',
'What camera are you using?',
'Notice me senpai',
'LOL 😂',
'Keep it up!',
'Sound is a bit low',
'Wow, never knew that',
'Subscribed!'];

const MOCK_USERS = [
'AlexGamer',
'SarahVlogs',
'Mike_Check',
'JenYoga',
'CoolDude99',
'PixelArt',
'CodeNinja',
'TravelBug'];

export default function LiveStreamPage({ stream, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const chatContainerRef = useRef(null);
  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  // Mock incoming messages
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMsg =
      MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)];
      const randomUser =
      MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
      const colors = [
      'text-blue-500',
      'text-green-500',
      'text-purple-500',
      'text-orange-500',
      'text-pink-500'];

      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setMessages((prev) => [
      ...prev.slice(-50),
      {
        id: Date.now(),
        user: randomUser,
        text: randomMsg,
        color: randomColor
      }]
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setMessages((prev) => [
    ...prev,
    {
      id: Date.now(),
      user: 'You',
      text: inputValue,
      color: 'text-[#FF4654]'
    }]
    );
    setInputValue('');
  };
  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors">

          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={stream.avatar}
              alt={stream.streamer}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#FF4654]" />

            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#1A1A2E]">
              {stream.streamer}
            </h1>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
              LIVE • {stream.viewers} watching
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isFollowing ? 'bg-gray-100 text-gray-700' : 'bg-[#FF4654] text-white hover:bg-[#FF7043]'}`}>

            {isFollowing ? 'Following' : 'Follow'}
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-80px)]">
        {/* Left: Video Player Area */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div
            className={`w-full aspect-video rounded-2xl ${stream.thumbnail} relative overflow-hidden shadow-lg group`}>

            {/* Live Badge Overlay */}
            <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              LIVE
            </div>

            {/* Viewer Count Overlay */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1.5">
              <Users className="w-3 h-3" />
              {stream.viewers}
            </div>

            {/* Play Button (Mock) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1"></div>
              </div>
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex justify-between items-center text-white">
                <div className="flex gap-4 text-sm font-bold">
                  <button>Play</button>
                  <button>Volume</button>
                </div>
                <div className="flex gap-4 text-sm font-bold">
                  <button>Settings</button>
                  <button>Fullscreen</button>
                </div>
              </div>
            </div>
          </div>

          {/* Stream Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black text-[#1A1A2E] mb-2">
              {stream.title}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <span className="text-[#FF4654] font-bold">
                {stream.category}
              </span>
              <span>•</span>
              <span>Started 2 hours ago</span>
            </div>
            <div className="flex gap-2">
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                English
              </span>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                1080p
              </span>
            </div>
          </div>

          <AdBanner size="leaderboard" />
        </div>

        {/* Right: Live Chat */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-[#1A1A2E]">Live Chat</h3>
            <Users className="w-4 h-4 text-gray-400" />
          </div>

          {/* Messages Area */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">

            <div className="text-center text-xs text-gray-400 py-4">
              Welcome to the chat room!
              <br />
              Be nice and have fun.
            </div>
            {messages.map((msg) =>
            <motion.div
              key={msg.id}
              initial={{
                opacity: 0,
                x: -10
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              className="text-sm">

                <span className={`font-bold ${msg.color} mr-2`}>
                  {msg.user}:
                </span>
                <span className="text-gray-700">{msg.text}</span>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/30">
            <form onSubmit={handleSendMessage} className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Send a message..."
                className="w-full bg-white border border-gray-200 rounded-full py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4654] focus:border-transparent" />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full">

                  <Smile className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="p-1.5 bg-[#FF4654] text-white rounded-full hover:bg-[#FF7043] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">

                  <Send className="w-3 h-3" />
                </button>
              </div>
            </form>
            <div className="flex justify-between items-center mt-3 px-1">
              <div className="flex gap-2">
                <button className="text-xs font-bold text-[#FF4654] flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors">
                  <Heart className="w-3 h-3" />
                  Points: 450
                </button>
              </div>
              <button className="text-xs font-bold text-gray-500 flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors">
                <Gift className="w-3 h-3" />
                Gift
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>);

}