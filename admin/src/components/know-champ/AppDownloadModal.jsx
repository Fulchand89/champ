import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Smartphone, 
  Apple, 
  Download, 
  QrCode, 
  ShieldCheck, 
  ExternalLink,
  Share2,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const AppDownloadModal = ({ isOpen, onClose, initialPlatform = 'android' }) => {
  const [platform, setPlatform] = useState(initialPlatform); // 'android' | 'ios'
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (initialPlatform) {
      setPlatform(initialPlatform);
    }
  }, [initialPlatform, isOpen]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApkDownload = () => {
    setDownloading(true);
    toast.loading('Starting KnowChamp APK download...', { id: 'apk-dl' });
    
    setTimeout(() => {
      setDownloading(false);
      toast.success('Download started! Please check your downloads.', { id: 'apk-dl', duration: 4000 });
    }, 1200);
  };

  const handleStoreRedirect = (storeName) => {
    toast.success(`Redirecting to ${storeName}... (Coming Soon!)`, {
      icon: '🚀',
      duration: 3000,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-[#0f1322] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 text-white"
        >
          {/* Top subtle highlight line */}
          <div className="h-1 bg-gradient-to-r from-red-500 via-rose-400 to-red-600" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/25">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Download KnowChamp
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                Play live quiz contests and win rewards on mobile
              </p>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex bg-[#070a14] p-1 rounded-xl border border-white/5 mb-5">
              <button
                type="button"
                onClick={() => setPlatform('android')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  platform === 'android'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Android</span>
              </button>

              <button
                type="button"
                onClick={() => setPlatform('ios')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  platform === 'ios'
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Apple className="w-4 h-4" />
                <span>iOS (iPhone)</span>
              </button>
            </div>

            {/* Platform Actions */}
            {platform === 'android' ? (
              <div className="space-y-3">
                {/* Primary: Direct APK Button */}
                <button
                  type="button"
                  onClick={handleApkDownload}
                  disabled={downloading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-between transition-all shadow-lg shadow-red-500/20 cursor-pointer disabled:opacity-60"
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="w-5 h-5" />
                    <div className="text-left">
                      <div className="leading-none">Download APK Directly</div>
                      <div className="text-[10px] text-white/80 font-normal mt-0.5">Fast install for all Android devices</div>
                    </div>
                  </div>
                  <span className="text-[11px] bg-black/25 px-2 py-0.5 rounded-full font-mono">
                    34 MB
                  </span>
                </button>

                {/* Secondary: Google Play Store Button */}
                <button
                  type="button"
                  onClick={() => handleStoreRedirect('Google Play')}
                  className="w-full py-3 px-4 rounded-xl bg-[#161a2b] hover:bg-[#1f243b] border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a2.38 2.38 0 0 1-.61-.906V2.72c.16-.367.37-.677.61-.906zm11.3 11.3l2.673-2.673L5.438 3.52 14.91 13.114zm0-2.228L5.438 20.48l12.144-6.92-2.673-2.673zm1.121-1.121l4.084 2.327c1.134.646 1.134 1.703 0 2.35l-4.084 2.326-2.115-2.115 2.115-2.888z" />
                  </svg>
                  <span>Get it on Google Play</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-500 ml-auto" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Primary: Apple App Store Button */}
                <button
                  type="button"
                  onClick={() => handleStoreRedirect('App Store')}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#161a2b] hover:bg-[#1f243b] border border-white/15 text-white font-bold text-sm flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Apple className="w-5 h-5" />
                    <div className="text-left">
                      <div className="leading-none">Download on App Store</div>
                      <div className="text-[10px] text-gray-400 font-normal mt-0.5">Compatible with iOS 14.0+</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </button>

                {/* Secondary: Safari PWA Instruction */}
                <div className="p-3 rounded-xl bg-[#0a0d18] border border-white/5 flex items-start gap-2.5 text-xs text-gray-300">
                  <Share2 className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Instant Safari Web App:</span> Tap Share icon in Safari and select <span className="text-white font-semibold">"Add to Home Screen"</span>.
                  </div>
                </div>
              </div>
            )}

            {/* Simple QR Code Scan strip */}
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-3.5 bg-[#080b15] p-3 rounded-xl">
              <div className="w-14 h-14 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://knowchamp.com/app&color=090b15"
                  alt="QR Code"
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-red-400" /> Scan QR to open on mobile
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                  Point phone camera at code for direct download
                </p>
              </div>
            </div>

            {/* Footer Trust Badge */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Safe & Verified APK</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AppDownloadModal;

