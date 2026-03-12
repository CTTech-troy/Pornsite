import React, { useEffect, useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SITE_NAME = 'LetStream';

export default function AuthModal({
  isOpen,
  onClose,
  onLogin,
  onSignUp,
  initialTab = 'login',
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setError('');
      setSuccessMessage('');
      setEmail('');
      setPassword('');
      setName('');
      setConfirmPassword('');
    }
  }, [isOpen, initialTab]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!name || !name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!email || !email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      if (typeof onSignUp === 'function') {
        const resp = await onSignUp(name.trim(), email.trim().toLowerCase(), password);
        if (resp && resp.success) {
          setSuccessMessage('Account created. You are now signed in.');
          setIsLoading(false);
          setTimeout(() => onClose(), 1000);
          return;
        }
        setError(resp && resp.message ? resp.message : 'Signup failed.');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Signup failed.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Account created. Complete age consent to finish registration.');
      setIsLoading(false);
      if (typeof onSignUp === 'function') {
        try {
          await onSignUp(name.trim(), email.trim().toLowerCase(), password);
        } catch (e) {}
      }
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!email || !email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);
    try {
      if (typeof onLogin === 'function') {
        const resp = await onLogin(email.trim().toLowerCase(), password);
        if (resp && resp.success) {
          setSuccessMessage('Login successful!');
          setIsLoading(false);
          setTimeout(() => onClose(), 1000);
          return;
        }
        setError(resp && resp.message ? resp.message : 'Login failed.');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Login failed.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Login successful!');
      setIsLoading(false);
      if (typeof onLogin === 'function') {
        try {
          await onLogin(email.trim().toLowerCase(), password);
        } catch (e) {}
      }
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#1A1A2E]/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-[420px] bg-[#F0F2F5] rounded-2xl shadow-2xl overflow-hidden border border-[#1A1A2E]/10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-[#1A1A2E]/50 hover:bg-[#1A1A2E]/10 hover:text-[#1A1A2E] transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="pt-8 pb-6 px-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF4654] to-[#FF7043] text-white font-black text-2xl shadow-lg shadow-[#FF4654]/25 mb-5">
                L
              </div>
              <h2 className="text-xl font-black text-[#1A1A2E] tracking-tight">
                {activeTab === 'login' ? 'Log in to ' + SITE_NAME : 'Create your account'}
              </h2>
              <p className="text-[#1A1A2E]/60 text-sm mt-1.5">
                {activeTab === 'login'
                  ? 'Enter your email and password to continue'
                  : 'Sign up with your email to get started'}
              </p>
            </div>

            {/* Tabs */}
            <div className="relative flex px-8 border-b border-[#1A1A2E]/10">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(''); setSuccessMessage(''); }}
                className={`flex-1 pb-3.5 text-sm font-bold transition-colors ${
                  activeTab === 'login'
                    ? 'text-[#FF4654]'
                    : 'text-[#1A1A2E]/50 hover:text-[#1A1A2E]/80'
                }`}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('signup'); setError(''); setSuccessMessage(''); }}
                className={`flex-1 pb-3.5 text-sm font-bold transition-colors ${
                  activeTab === 'signup'
                    ? 'text-[#FF4654]'
                    : 'text-[#1A1A2E]/50 hover:text-[#1A1A2E]/80'
                }`}
              >
                Sign up
              </button>
              <motion.div
                className="absolute bottom-0 h-0.5 bg-[#FF4654]"
                initial={false}
                animate={{
                  left: activeTab === 'login' ? '2rem' : '50%',
                  right: activeTab === 'login' ? '50%' : '2rem',
                }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              />
            </div>

            <form
              onSubmit={activeTab === 'login' ? handleLogin : handleSignup}
              className="p-8 space-y-4"
            >
              {activeTab === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A2E]/70 uppercase tracking-wider mb-1.5">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A1A2E]/40" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-white border border-[#1A1A2E]/15 rounded-xl py-3 pl-11 pr-4 text-[#1A1A2E] placeholder-[#1A1A2E]/40 focus:outline-none focus:ring-2 focus:ring-[#FF4654]/50 focus:border-[#FF4654] transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1A1A2E]/70 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A1A2E]/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white border border-[#1A1A2E]/15 rounded-xl py-3 pl-11 pr-4 text-[#1A1A2E] placeholder-[#1A1A2E]/40 focus:outline-none focus:ring-2 focus:ring-[#FF4654]/50 focus:border-[#FF4654] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A2E]/70 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A1A2E]/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-[#1A1A2E]/15 rounded-xl py-3 pl-11 pr-11 text-[#1A1A2E] placeholder-[#1A1A2E]/40 focus:outline-none focus:ring-2 focus:ring-[#FF4654]/50 focus:border-[#FF4654] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#1A1A2E]/40 hover:text-[#1A1A2E]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {activeTab === 'signup' && (
                  <p className="text-[11px] text-[#1A1A2E]/50 mt-1">At least 8 characters</p>
                )}
              </div>

              {activeTab === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A2E]/70 uppercase tracking-wider mb-1.5">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A1A2E]/40" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-[#1A1A2E]/15 rounded-xl py-3 pl-11 pr-11 text-[#1A1A2E] placeholder-[#1A1A2E]/40 focus:outline-none focus:ring-2 focus:ring-[#FF4654]/50 focus:border-[#FF4654] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#1A1A2E]/40 hover:text-[#1A1A2E]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl text-center">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="text-sm font-medium text-green-700 bg-green-50 border border-green-100 px-3 py-2.5 rounded-xl text-center">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#FF4654] to-[#FF7043] shadow-lg shadow-[#FF4654]/25 hover:shadow-[#FF4654]/30 hover:opacity-95 active:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {activeTab === 'login' ? 'Log in' : 'Create account'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
