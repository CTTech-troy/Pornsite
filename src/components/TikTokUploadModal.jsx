import React, { useState } from 'react';
import { X, Upload, Type, FileText, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as tiktokApi from '../api/tiktokApi';

export default function TikTokUploadModal({
  isOpen,
  onClose,
  onSuccess,
  getToken,
  isAuthenticated,
  onLoginClick,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = title.trim() && videoFile && !isLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (!isAuthenticated) {
      onLoginClick?.();
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      const token = getToken ? await getToken() : null;
      if (!token) throw new Error('Not authenticated');
      await tiktokApi.uploadVideo(formData, token);
      setTitle('');
      setDescription('');
      setVideoFile(null);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.message || 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setVideoFile(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="px-8 pt-8 pb-6 border-b border-gray-100">
            <h2 className="text-2xl font-black text-[#1A1A2E] flex items-center gap-2">
              <Upload className="w-6 h-6 text-[#FF4654]" />
              Upload Video (TikTok)
            </h2>
            <p className="text-gray-500 mt-1 text-sm">Stored in Supabase; metadata saved.</p>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto flex-1">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Title *</label>
              <div className="relative">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Video title"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#FF4654]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Description</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  maxLength={500}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-[#FF4654]"
                />
                <span className="absolute bottom-2 right-3 text-xs text-gray-400">{description.length}/500</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Video File *</label>
              <input
                type="file"
                accept="video/*"
                required
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#FF4654]/10 file:text-[#FF4654] file:font-bold"
              />
              {videoFile && (
                <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5" />
                  {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-gradient-to-r from-[#FF4654] to-[#FF7043] text-white font-bold py-3.5 rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
