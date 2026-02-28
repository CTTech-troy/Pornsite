import React, { createContext, useContext, useCallback, useState } from 'react';

const STORAGE_KEY = 'videoAdWatchCount';
const AD_INTERVAL = 3;

function getStoredCount() {
  try {
    const n = parseInt(sessionStorage.getItem(STORAGE_KEY) || '0', 10);
    return Number.isNaN(n) ? 0 : Math.max(0, n);
  } catch {
    return 0;
  }
}

function setStoredCount(count) {
  try {
    sessionStorage.setItem(STORAGE_KEY, String(count));
  } catch {}
}

const AdManagerContext = createContext(null);

export function AdManagerProvider({ children }) {
  const [count, setCount] = useState(getStoredCount);

  const shouldShowAd = count % AD_INTERVAL === 0;

  const recordVideoWatched = useCallback(() => {
    setCount((prev) => {
      const next = prev + 1;
      setStoredCount(next);
      return next;
    });
  }, []);

  const value = {
    shouldShowAd,
    recordVideoWatched,
    videosWatchedCount: count,
  };

  return (
    <AdManagerContext.Provider value={value}>
      {children}
    </AdManagerContext.Provider>
  );
}

export function useAdManager() {
  const ctx = useContext(AdManagerContext);
  return ctx || { shouldShowAd: true, recordVideoWatched: () => {}, videosWatchedCount: 0 };
}
