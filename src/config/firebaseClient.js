import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Vite: set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in .env.local (see SETUP_GUIDE.md)
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || '';

let app = null;
let auth = null;
let googleProvider = null;

if (apiKey && projectId && apiKey.length > 10) {
  try {
    const firebaseConfig = {
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (err) {
    console.warn('Firebase client init failed (check API key in .env.local):', err?.message || err);
  }
} else if (typeof window !== 'undefined' && !window.__firebaseWarned) {
  window.__firebaseWarned = true;
  console.warn('Firebase not configured: add VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID to frontend .env.local');
}

export { auth, googleProvider };
