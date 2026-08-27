import React, { useState } from 'react';
import { Users, Trophy, Gift, Smile } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppDownloadModal from './AppDownloadModal';
import AppStoreButtons from './AppStoreButtons';

const Hero = () => {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadPlatform, setDownloadPlatform] = useState('android');

  const handleOpenDownload = (platform) => {
    setDownloadPlatform(platform);
    setIsDownloadModalOpen(true);
  };

  const stats = [
    { icon: <Users className="w-5 h-5" />, count: '50K+', label: 'Active Users' },
    { icon: <Trophy className="w-5 h-5" />, count: '1000+', label: 'Contests' },
    { icon: <Gift className="w-5 h-5" />, count: '50L+', label: 'Rewards Won' },
    { icon: <Smile className="w-5 h-5" />, count: '98%', label: 'Happy Users' },
  ];

  return (
    <div className="relative overflow-hidden bg-[#010914] pt-[98px] pb-[42px]">
      <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-8 lg:py-0">

          {/* Left — Text content */}
          <div className="space-y-6 text-center lg:text-left">

            {/* Headline */}
            <div className="space-y-3">
              <p className="font-['Montserrat'] font-semibold text-[26px] sm:text-[32px] lg:text-[40px] leading-tight text-[#FFFFFF]">
                Play Quiz.<br />Challenge Yourself.
              </p>
              <h1 className="font-['Montserrat'] font-bold text-[38px] sm:text-[50px] lg:text-[62px] leading-tight text-red-500">
                Win Real Cash!
              </h1>
            </div>

            {/* Description */}
            <p className="text-[#FFFFFF] text-base max-w-md mx-auto lg:mx-0 leading-relaxed">
              Join India's most trusted quiz contest platform. Compete, learn and win exciting rewards.
            </p>

            {/* Buttons & Store Badges */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link
                  to="/contests"
                  className="h-[46px] px-6 flex items-center justify-center rounded-xl btn-brand-primary text-white font-bold text-sm shadow-lg shadow-red-500/20 hover:opacity-95 transition-all"
                >
                  Explore Contests
                </Link>
                <AppStoreButtons
                  onDownload={handleOpenDownload}
                  size="md"
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-8 justify-center lg:justify-start pt-1">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-red-500">{stat.icon}</span>
                  <span className="text-sm font-bold text-white">{stat.count}</span>
                  <span className="text-[11px] text-[#FFFFFF] font-medium uppercase tracking-wide">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Trophy image */}
          <div className="flex justify-center items-center relative">
            <img
              src="/trophy-hero.png"
              alt="Trophy"
              className="w-[260px] sm:w-[360px] lg:w-[460px] h-auto select-none drop-shadow-[0_20px_50px_rgba(239,68,68,0.18)]"
              draggable="false"
            />
          </div>

        </div>
      </div>

      {/* App Download Modal */}
      <AppDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        initialPlatform={downloadPlatform}
      />
    </div>
  );
};

export default Hero;
