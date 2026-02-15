import React, { useEffect, useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Backend API URL (adjust if not localhost:5000)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AuthModal({
  isOpen,
  onClose,
  onLogin, // function provided by parent (useAuth.login)
  onSignUp, // function provided by parent (useAuth.signup)
  onGoogleSuccess,
  initialTab = 'login'
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

  // Reset state when modal opens/closes or tab changes
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

  // Handle signup with email/password
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validate
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

      // fallback to direct API call
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

      // Call onSignUpSuccess callback with user data
      if (typeof onSignUp === 'function') {
        // if parent provided onSignUp, call it to finalize auth
        try {
          await onSignUp(name.trim(), email.trim().toLowerCase(), password);
        } catch (e) {}
      }

      // Close modal after 2 seconds
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle login with email/password
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
        try { await onLogin(email.trim().toLowerCase(), password); } catch (e) {}
      }

      setTimeout(() => onClose(), 1000);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle Google sign-in via Firebase client and then inform backend
  const handleGoogle = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Dynamically import Firebase client to avoid bundling issues if not configured
      const { signInWithPopup } = await import('firebase/auth');
      const { auth, googleProvider } = await import('../config/firebaseClient');

      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      const payload = {
        email: googleUser.email,
        displayName: googleUser.displayName,
        photoURL: googleUser.photoURL,
      };

      // Send to backend to create/return app user
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Google sign-in failed on server.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Google login successful!');
      setIsLoading(false);

      if (typeof onGoogleSuccess === 'function') {
        onGoogleSuccess({ uid: data.uid, email: data.email, displayName: data.displayName, userData: data.userData });
      }

      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess({ uid: data.uid, email: data.email, displayName: data.displayName, userData: data.userData });
      }

      setTimeout(() => onClose(), 1000);
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-6 text-center">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-[#FF4654] to-[#FF7043] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-200/30 mb-4">
                V
              </div>
              <h2 className="text-2xl font-black text-[#1A1A2E]">
                {activeTab === 'login' ? 'Welcome Back!' : 'Join VibeStream'}
              </h2>
              <p className="text-gray-500 mt-2 text-sm">
                {activeTab === 'login'
                  ? 'Enter your details to access your account'
                  : 'Create an account to start sharing your vibes'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex px-8 border-b border-gray-100">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 pb-4 text-sm font-bold transition-colors relative ${
                  activeTab === 'login'
                    ? 'text-[#FF4654]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Log In
                {activeTab === 'login' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4654]"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 pb-4 text-sm font-bold transition-colors relative ${
                  activeTab === 'signup'
                    ? 'text-[#FF4654]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Sign Up
                {activeTab === 'signup' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4654]"
                  />
                )}
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={activeTab === 'login' ? handleLogin : handleSignup}
              className="p-6 sm:p-8 space-y-4"
            >
              {activeTab === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#FF4654] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@example.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#FF4654] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-[#FF4654] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {activeTab === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Confirm Password
                  </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-[#FF4654] focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                </div>
              )}

              {error && (
                <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg text-center">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="text-green-600 text-sm font-medium bg-green-50 p-3 rounded-lg text-center">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#FF4654] to-[#FF7043] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-200/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {activeTab === 'login' ? 'Log In' : 'Create Account'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Social sign-in */}
              <div className="mt-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-100" />
                  <div className="text-xs text-gray-400 uppercase font-bold">or continue with</div>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={isLoading}
                  className="mt-3 w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <div className="w-5 h-5 rounded-sm bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC05] flex items-center justify-center text-white font-bold text-xs">
                    G
                  </div>
                  <span className="text-sm font-bold text-gray-700">Continue with Google</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}