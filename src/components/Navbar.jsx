import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Menu, X, Clock, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({
  isAuthenticated,
  user,
  onLoginClick,
  onSignUpClick,
  onDashboardClick,
  onProfileClick,
  onUploadClick,
  onHomeClick,
  creatorStatus,
  hasActiveLive,
  onGoLive,
  activeLiveId,
  onSearch
}) {
  const isCreator = creatorStatus === 'approved';
  const handleGoLiveClick = () => {
    if (hasActiveLive && activeLiveId && onProfileClick) {
      onProfileClick();
    } else if (onGoLive) {
      onGoLive(null);
    }
  };
  const handleProfileClick = () => {
    if (onProfileClick) onProfileClick();
    else if (onDashboardClick) onDashboardClick();
  };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchTab, setSearchTab] = useState('recent');
  const [searchText, setSearchText] = useState('');
  const searchRef = useRef(null);
  const searchDebounceRef = useRef(null);
  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      const target = event && event.target;
      // Ensure we only call contains with a Node to avoid TypeErrors
      if (searchRef.current && target instanceof Node && !searchRef.current.contains(target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const recentSearches = ['React tutorial', 'Gaming setup', 'Vlog camera'];
  const trendingSearches = [
  'Minecraft 1.21',
  'iPhone 16 Pro',
  'Workout music',
  'Travel vlog Japan'];

  const handleSearchSuggestionClick = (term) => {
    setSearchText(term);
    setIsSearchFocused(false);
    if (onSearch) onSearch(term);
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // flush any pending debounce
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    if (onSearch) onSearch(searchText);
    setIsSearchFocused(false);
  };
  // cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
    };
  }, []);
  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <div
          className="flex items-center gap-4 flex-shrink-0"
        >
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              if (onHomeClick) onHomeClick();
              else window.location.reload();
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4654] to-[#FF7043] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-200/30">
              L
            </div>
            <span className="text-2xl font-black tracking-tight text-[#1A1A2E] hidden md:block">
              Let<span className="text-[#FF4654]">Stream</span>
            </span>
          </div>
          <Link
            to="/tiktok"
            className="text-sm font-bold text-gray-600 hover:text-[#FF4654] transition-colors hidden md:block"
          >
            Shorts
          </Link>
        </div>

        {/* Search Bar - Desktop */}
        <div
          className="flex-1 max-w-2xl relative hidden md:block"
          ref={searchRef}>

          <form onSubmit={handleSearchSubmit} className="relative group">
            <input
              type="text"
              value={searchText}
              onChange={(e) => {
                const v = e.target.value;
                setSearchText(v);
                // debounce live search
                if (onSearch) {
                  if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                  searchDebounceRef.current = setTimeout(() => {
                    onSearch(v);
                    searchDebounceRef.current = null;
                  }, 350);
                }
              }}
              placeholder="Search for creators, videos, or vibes..."
              className="w-full bg-[#F0F2F5] text-[#1A1A2E] placeholder-gray-500 rounded-full py-3 pl-12 pr-10 focus:outline-none focus:ring-2 focus:ring-[#FF4654] focus:bg-white transition-all shadow-inner"
              onFocus={() => setIsSearchFocused(true)} />

            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#FF4654] transition-colors" />
            {searchText &&
            <button
              type="button"
              onClick={() => {
                setSearchText('');
                if (onSearch) onSearch('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 text-gray-400">

                <X className="w-4 h-4" />
              </button>
            }
          </form>

          {/* Search Dropdown */}
          <AnimatePresence>
            {isSearchFocused &&
            <motion.div
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                y: 10
              }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-2 z-50">

                {/* Tabs */}
                <div className="flex border-b border-gray-100 mb-2">
                  <button
                  onClick={() => setSearchTab('recent')}
                  className={`flex-1 pb-2 text-sm font-bold transition-colors relative ${searchTab === 'recent' ? 'text-[#FF4654]' : 'text-gray-400 hover:text-gray-600'}`}>

                    Recent
                    {searchTab === 'recent' &&
                  <motion.div
                    layoutId="searchTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4654]" />

                  }
                  </button>
                  <button
                  onClick={() => setSearchTab('trending')}
                  className={`flex-1 pb-2 text-sm font-bold transition-colors relative ${searchTab === 'trending' ? 'text-[#FF4654]' : 'text-gray-400 hover:text-gray-600'}`}>

                    Trending
                    {searchTab === 'trending' &&
                  <motion.div
                    layoutId="searchTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4654]" />

                  }
                  </button>
                </div>

                <div className="p-1">
                  {searchTab === 'recent' ?
                <>
                      {recentSearches.map((term, i) =>
                  <div
                    key={i}
                    onClick={() => handleSearchSuggestionClick(term)}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer text-gray-700">

                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{term}</span>
                        </div>
                  )}
                    </> :

                <>
                      {trendingSearches.map((term, i) =>
                  <div
                    key={i}
                    onClick={() => handleSearchSuggestionClick(term)}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer text-gray-700">

                          <TrendingUp className="w-4 h-4 text-[#FF4654]" />
                          <span className="text-sm font-medium">{term}</span>
                        </div>
                  )}
                    </>
                }
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>

        {/* Mobile Search Toggle */}
        <button
          className="md:hidden p-2 text-gray-600"
          onClick={() => setIsSearchOpen(!isSearchOpen)}>

          <Search className="w-6 h-6" />
        </button>

        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
          {isCreator && (
            <button
              type="button"
              onClick={handleGoLiveClick}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                hasActiveLive
                  ? 'bg-red-500/10 text-red-600 border border-red-500/50 hover:bg-red-500/20'
                  : 'bg-[#FF4654] text-white hover:bg-[#FF7043]'
              }`}
            >
              {hasActiveLive ? 'Back to Live' : 'Go Live'}
            </button>
          )}
          {isAuthenticated ?
          <button
            onClick={handleProfileClick}
            className="relative w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-transparent hover:border-[#FF4654] transition-all">

              <img
              src={
              user?.avatar ||
              'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'
              }
              alt="Profile"
              className="w-full h-full object-cover" />
              {hasActiveLive && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-red-600 border-2 border-white rounded-full" title="You are live" />
              )}

            </button> :

          <div className="flex items-center gap-2">
              <button
              onClick={onLoginClick}
              className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-[#FF4654] transition-colors">

                Log In
              </button>
              <button
              onClick={onSignUpClick}
              className="px-5 py-2.5 rounded-full bg-[#1A1A2E] text-white text-sm font-bold hover:bg-black transition-colors shadow-md">

                Sign Up
              </button>
            </div>
          }
        </div>
      </div>

      {/* Mobile Search Bar Expand */}
      {isSearchOpen &&
      <div className="md:hidden pt-3 pb-1 px-1">
          <form
          onSubmit={(e) => {
            e.preventDefault();
            if (onSearch) onSearch(searchText);
            setIsSearchOpen(false);
          }}>

            <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search..."
            className="w-full bg-[#F0F2F5] text-[#1A1A2E] rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#FF4654]"
            autoFocus />

          </form>
        </div>
      }
    </nav>);

}