import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { VideoFeedProvider } from './context/VideoFeedContext.jsx';
import { AdManagerProvider } from './context/AdManagerContext.jsx';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <VideoFeedProvider>
      <AdManagerProvider>
        <App />
      </AdManagerProvider>
    </VideoFeedProvider>
  </BrowserRouter>
);
