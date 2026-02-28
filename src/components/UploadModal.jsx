import React, { useState } from 'react';
import {
  X,
  Upload,
  Type,
  FileText,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CONSENT_QUESTION = 'Do you confirm you have permission to post this video?';

export default function UploadModal({ isOpen, onClose, onUpload }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = title.trim() && description.trim() && videoFile && !isLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setIsLoading(true);
    try {
      const result = await onUpload({
        title: title.trim(),
        description: description.trim(),
        file: videoFile,
        consentGiven,
      });
      if (result && result.success) {
        resetForm();
        onClose();
      } else {
        setError(result?.message || 'Upload failed');
      }
    } catch (err) {
      setError(err?.message || 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setVideoFile(null);
    setConsentGiven(null);
    setError('');
  };
  const handleClose = () => { resetForm(); onClose(); };
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      {isOpen &&
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose} />


          <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
            y: 20
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: 20
          }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            {/* Close Button */}
            <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors z-10">

              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-2xl font-black text-[#1A1A2E] flex items-center gap-2">
                <Upload className="w-6 h-6 text-[#FF4654]" />
                Upload Video
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                Share your vibe with the world
              </p>
            </div>

            {/* Scrollable Form */}
            <form
            onSubmit={handleSubmit}
            className="p-8 space-y-5 overflow-y-auto flex-1">

              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Video Title *
                </label>
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., My Amazing Trip to Bali"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#FF4654] focus:border-transparent transition-all" />

                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Description *
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell viewers what your video is about..."
                    maxLength={500}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-[#FF4654] focus:border-transparent transition-all"
                  />
                  <span className="absolute bottom-2 right-3 text-xs text-gray-400">
                    {description.length}/500
                  </span>
                </div>
              </div>

              {/* Video File */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Video File *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="video/*"
                    required
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#FF4654]/10 file:text-[#FF4654] file:font-bold hover:file:bg-[#FF4654]/20"
                  />
                  {videoFile && (
                    <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <Video className="w-3.5 h-3.5" />
                      {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>

              {/* Mandatory Consent */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-5 h-5 text-[#FF4654]" />
                  <span className="text-sm font-bold text-[#1A1A2E]">
                    Mandatory consent
                  </span>
                </div>
                <p className="text-sm text-gray-700">{CONSENT_QUESTION}</p>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="consent"
                      checked={consentGiven === true}
                      onChange={() => setConsentGiven(true)}
                      className="w-4 h-4 text-[#FF4654] focus:ring-[#FF4654]"
                    />
                    <span className="text-sm font-medium text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="consent"
                      checked={consentGiven === false}
                      onChange={() => setConsentGiven(false)}
                      className="w-4 h-4 text-[#FF4654] focus:ring-[#FF4654]"
                    />
                    <span className="text-sm font-medium text-gray-700">No (save as draft)</span>
                  </label>
                </div>
                {consentGiven === false && (
                  <p className="text-xs text-amber-600">
                    Video will be saved as draft and will not appear in the public feed.
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
              disabled={isLoading || !canSubmit}
              className="w-full bg-gradient-to-r from-[#FF4654] to-[#FF7043] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-200/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">

                {isLoading ?
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> :

              <>
                    <Upload className="w-5 h-5" />
                    Upload Video
                  </>
              }
              </button>
            </form>
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}