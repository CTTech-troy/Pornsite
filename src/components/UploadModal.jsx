import React, { useState } from 'react';
import {
  X,
  Upload,
  Clock,
  Type,
  Image as ImageIcon,
  FileText,
  ShieldCheck,
  Link,
  CheckCircle2 } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GRADIENT_OPTIONS = [
{
  name: 'Sunset',
  value: 'bg-gradient-to-br from-orange-400 to-red-500'
},
{
  name: 'Ocean',
  value: 'bg-gradient-to-br from-blue-400 to-indigo-600'
},
{
  name: 'Forest',
  value: 'bg-gradient-to-br from-green-400 to-emerald-600'
},
{
  name: 'Berry',
  value: 'bg-gradient-to-br from-purple-500 to-pink-600'
},
{
  name: 'Midnight',
  value: 'bg-gradient-to-br from-slate-600 to-slate-800'
},
{
  name: 'Gold',
  value: 'bg-gradient-to-br from-yellow-300 to-orange-400'
}];

export default function UploadModal({ isOpen, onClose, onUpload }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(
    GRADIENT_OPTIONS[0].value
  );
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [consentOwnership, setConsentOwnership] = useState(false);
  const [consentGuidelines, setConsentGuidelines] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const canSubmit = title && consentOwnership && consentGuidelines;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsLoading(true);
    setTimeout(() => {
      onUpload({
        title,
        description,
        duration: duration || '10:00',
        thumbnailColor: selectedGradient,
        thumbnailUrl: thumbnailUrl || undefined
      });
      setIsLoading(false);
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setDuration('');
      setSelectedGradient(GRADIENT_OPTIONS[0].value);
      setThumbnailUrl('');
      setConsentOwnership(false);
      setConsentGuidelines(false);
    }, 1500);
  };
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
          onClick={onClose} />


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
                  Description
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell viewers what your video is about..."
                  maxLength={500}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-[#FF4654] focus:border-transparent transition-all" />

                  <span className="absolute bottom-2 right-3 text-xs text-gray-400">
                    {description.length}/500
                  </span>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Duration
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 12:45"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#FF4654] focus:border-transparent transition-all" />

                </div>
              </div>

              {/* Thumbnail Section */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">
                  Thumbnail
                </label>

                {/* Custom Thumbnail URL (optional) */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">
                    Add a custom thumbnail URL (optional)
                  </p>
                  <div className="relative">
                    <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://example.com/thumbnail.jpg"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#FF4654] focus:border-transparent transition-all" />

                  </div>
                </div>

                {/* Or pick a style */}
                <p className="text-xs text-gray-500">
                  Or choose a thumbnail style
                </p>
                <div className="grid grid-cols-6 gap-2">
                  {GRADIENT_OPTIONS.map((opt) =>
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => setSelectedGradient(opt.value)}
                  className={`aspect-square rounded-xl ${opt.value} transition-all ${selectedGradient === opt.value ? 'ring-2 ring-[#FF4654] ring-offset-2 scale-110' : 'hover:scale-105 opacity-70'}`}
                  title={opt.name} />

                )}
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Preview
                </label>
                <div
                className={`aspect-video rounded-2xl overflow-hidden relative ${thumbnailUrl ? 'bg-gray-900' : selectedGradient} flex items-center justify-center shadow-inner`}>

                  {thumbnailUrl ?
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    ;(e).style.display = 'none';
                  }} /> :

                null}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                    </div>
                  </div>
                  {title &&
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white text-sm font-bold truncate">
                        {title}
                      </p>
                    </div>
                }
                </div>
              </div>

              {/* Consent Section */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-5 h-5 text-[#FF4654]" />
                  <span className="text-sm font-bold text-[#1A1A2E]">
                    Creator Consent
                  </span>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                  type="checkbox"
                  checked={consentOwnership}
                  onChange={(e) => setConsentOwnership(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#FF4654] focus:ring-[#FF4654] cursor-pointer mt-0.5 flex-shrink-0" />

                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors leading-tight">
                    I confirm that I own or have rights to this content and
                    authorize letstream to distribute it on the platform.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                  type="checkbox"
                  checked={consentGuidelines}
                  onChange={(e) => setConsentGuidelines(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#FF4654] focus:ring-[#FF4654] cursor-pointer mt-0.5 flex-shrink-0" />

                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors leading-tight">
                    I agree that this content follows letstream Community
                    Guidelines and does not violate any laws.
                  </span>
                </label>
              </div>

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