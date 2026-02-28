import { useState, useEffect } from 'react';
import authApi from './authController';
import { auth } from '../config/firebaseClient';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('letstreamUser');
    const storedVideos = localStorage.getItem('letstreamVideos');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }

    if (storedVideos) {
      setUploadedVideos(JSON.parse(storedVideos));
    }
  }, []);

  const login = async (email, password) => {
    try {
      const resp = await authApi.loginWithEmail(email, password);
      if (resp.ok && resp.body && resp.body.success) {
        const payload = resp.body;
        if (payload.token) {
          try {
            const { auth } = await import('../config/firebaseClient');
            const { signInWithCustomToken } = await import('firebase/auth');
            if (auth) await signInWithCustomToken(auth, payload.token);
          } catch (err) {
            console.warn('Sign in with custom token after login:', err?.message || err);
          }
        }
        const ud = payload.userData || {};
        const creatorFromDb = !!ud.creator;
        const creatorStatusFromDb = ud.creatorStatus || (creatorFromDb ? 'approved' : 'none');
        const userObj = {
          uid: payload.uid,
          email: payload.email,
          name: payload.displayName || ud.name || email.split('@')[0],
          avatar: ud.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          emailVerified: payload.emailVerified,
          creator: creatorFromDb,
          creatorStatus: creatorStatusFromDb,
        };
        setUser(userObj);
        setIsAuthenticated(true);
        localStorage.setItem('letstreamUser', JSON.stringify(userObj));
        return { success: true, data: payload };
      }

      return { success: false, message: resp.body && resp.body.message ? resp.body.message : 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const resp = await authApi.signupWithEmail(name, email, password);
      if (resp.ok && resp.body && resp.body.success) {
        const payload = resp.body;
        // If backend returned a Firebase custom token, sign in with it
        if (payload.token) {
          try {
            const { auth } = await import('../config/firebaseClient');
            const { signInWithCustomToken } = await import('firebase/auth');
            await signInWithCustomToken(auth, payload.token);
          } catch (err) {
            console.warn('Failed to sign in with custom token:', err && err.message ? err.message : err);
          }
        }

        const ud = payload.userData || {};
        const creatorFromDb = !!ud.creator;
        const userObj = {
          uid: payload.uid,
          email: payload.email,
          name: payload.displayName || name,
          avatar: ud.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          emailVerified: payload.emailVerified,
          creator: creatorFromDb,
          creatorStatus: ud.creatorStatus || (creatorFromDb ? 'approved' : 'none'),
        };
        setUser(userObj);
        setIsAuthenticated(true);
        localStorage.setItem('letstreamUser', JSON.stringify(userObj));
        return { success: true, data: payload };
      }

      return { success: false, message: resp.body && resp.body.message ? resp.body.message : 'Signup failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Signup failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('letstreamUser');
  };

  const uploadVideo = async (payload) => {
    if (!user) return { success: false, message: 'Not authenticated' };

    const isPublish = payload && payload.file != null && typeof payload.consentGiven === 'boolean';
    if (isPublish) {
      const formData = new FormData();
      formData.append('video', payload.file);
      formData.append('title', payload.title || '');
      formData.append('description', payload.description || '');
      formData.append('consentGiven', payload.consentGiven === true);
      let idToken = null;
      if (auth?.currentUser?.getIdToken) idToken = await auth.currentUser.getIdToken();
      const resp = await authApi.uploadVideoPublish(formData, idToken);
      if (resp.ok && resp.body && resp.body.success) {
        const { videoId, videoUrl, isLive } = resp.body;
        const newVideo = {
          id: videoId,
          videoSrc: videoUrl,
          url: videoUrl,
          title: payload.title,
          channel: user.name || user.email,
          views: 0,
          time: 'Just now',
          likes: '0',
          comments: '0',
          avatar: user.avatar,
          isLive,
        };
        const updatedVideos = [newVideo, ...uploadedVideos];
        setUploadedVideos(updatedVideos);
        localStorage.setItem('letstreamVideos', JSON.stringify(updatedVideos));
        return { success: true, data: resp.body };
      }
      return { success: false, message: resp.body && resp.body.message ? resp.body.message : 'Upload failed' };
    }

    try {
      const formData = payload instanceof FormData ? payload : new FormData();
      if (payload && !(payload instanceof FormData)) {
        if (payload.file) formData.append('file', payload.file);
        if (payload.uid) formData.append('uid', payload.uid);
        if (payload.title) formData.append('title', payload.title);
      }
      const resp = await authApi.uploadMedia(formData);
      if (resp.ok && resp.body && resp.body.success) {
        const newVideo = {
          id: Date.now(),
          url: resp.body.url,
          channel: user.creatorProfile?.stageName || user.name,
          views: '0',
          time: 'Just now',
          likes: '0',
          comments: '0',
          avatar: user.avatar,
        };
        const updatedVideos = [newVideo, ...uploadedVideos];
        setUploadedVideos(updatedVideos);
        localStorage.setItem('letstreamVideos', JSON.stringify(updatedVideos));
        return { success: true, data: resp.body };
      }
      return { success: false, message: resp.body && resp.body.message ? resp.body.message : 'Upload failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Upload failed' };
    }
  };

  const applyAsCreator = async (applicationData) => {
    if (!user || !user.uid) return { success: false, message: 'Not authenticated' };

    try {
      let idToken = null;
      if (auth?.currentUser?.getIdToken) {
        idToken = await auth.currentUser.getIdToken();
      }
      const resp = await authApi.applyCreator(user.uid, applicationData, idToken);
      if (resp.ok && resp.body && resp.body.success) {
        const updatedUser = { ...user, creatorStatus: 'pending' };
        setUser(updatedUser);
        localStorage.setItem('letstreamUser', JSON.stringify(updatedUser));
        return { success: true };
      }
      return { success: false, message: resp.body && resp.body.message ? resp.body.message : 'Application failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Application failed' };
    }
  };

  const approveCreator = async (adminSecret) => {
    if (!user || !user.uid) return { success: false, message: 'Not authenticated' };
    try {
      const resp = await authApi.approveCreator(adminSecret, user.uid, true);
      if (resp.ok && resp.body && resp.body.success) {
        const updatedUser = { ...user, creatorStatus: 'approved', creator: true };
        setUser(updatedUser);
        localStorage.setItem('letstreamUser', JSON.stringify(updatedUser));
        return { success: true };
      }
      return { success: false, message: resp.body && resp.body.message ? resp.body.message : 'Approve failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Approve failed' };
    }
  };

  const getIdToken = async () => {
    if (auth?.currentUser?.getIdToken) return auth.currentUser.getIdToken();
    return null;
  };

  return {
    user,
    isAuthenticated,
    uploadedVideos,
    login,
    signup,
    logout,
    uploadVideo,
    applyAsCreator,
    approveCreator,
    getIdToken,
  };
}
