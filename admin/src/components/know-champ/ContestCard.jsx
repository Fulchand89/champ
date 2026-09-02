import React from 'react';
import { Calendar, Users, Download } from 'lucide-react';
import { getImageUrl } from '../../api/services/api';
import toast from 'react-hot-toast';

const ContestCard = ({
  id,
  category,
  title,
  prize,
  entry,
  joined,
  image,
  date,
  isLoading,
  contest,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-[#0d0f1f] border border-gray-800/60 flex flex-col h-full overflow-hidden animate-pulse">
        {/* Top row skeleton — Category name + image */}
        <div className="px-4 sm:px-5 flex items-center justify-between gap-3 h-[80px] sm:h-[90px] min-h-[80px] sm:min-h-[90px] max-h-[80px] sm:max-h-[90px] bg-gray-800/20">
          <div className="h-4 sm:h-5 bg-gray-800/60 rounded-md w-2/3"></div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-800/60 rounded-full shrink-0"></div>
        </div>

        {/* Bottom Content Section skeleton */}
        <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-4 sm:pb-5 flex flex-col gap-2.5 sm:gap-3 flex-1">
          {/* Contest title skeleton */}
          <div className="flex flex-col gap-2 h-[44px] sm:h-[48px]">
            <div className="h-3.5 sm:h-4 bg-gray-800/60 rounded-md w-full"></div>
            <div className="h-3.5 sm:h-4 bg-gray-800/60 rounded-md w-4/5"></div>
          </div>

          {/* Prize Pool + Entry Fee skeleton */}
          <div className="flex items-start justify-between gap-2 mt-1">
            <div>
              <div className="h-2.5 bg-gray-800/40 rounded w-12 mb-1"></div>
              <div className="h-4 sm:h-5 bg-gray-800/60 rounded-md w-16"></div>
            </div>
            <div className="flex flex-col items-end">
              <div className="h-2.5 bg-gray-800/40 rounded w-12 mb-1"></div>
              <div className="h-4 sm:h-5 bg-gray-800/60 rounded-md w-10"></div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-800/80" />

          {/* Date + Players skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 w-1/2">
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gray-800/60 rounded-full shrink-0"></div>
              <div className="h-2.5 bg-gray-800/60 rounded w-full"></div>
            </div>
            <div className="flex items-center gap-1.5 w-1/4 justify-end">
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gray-800/60 rounded-full shrink-0"></div>
              <div className="h-2.5 bg-gray-800/60 rounded w-12"></div>
            </div>
          </div>

          {/* Button skeleton */}
          <div className="w-full h-[38px] sm:h-[44px] bg-gray-800/60 rounded-xl mt-auto"></div>
        </div>
      </div>
    );
  }

  const effectiveImage =
    (image && typeof image === 'string' && image.trim() !== '') ? image :
    (contest?.image && typeof contest.image === 'string' && contest.image.trim() !== '') ? contest.image :
    (contest?.category?.image && typeof contest.category.image === 'string' && contest.category.image.trim() !== '') ? contest.category.image :
    (contest?.category?.icon && typeof contest.category.icon === 'string' && contest.category.icon.trim() !== '') ? contest.category.icon :
    '/cat-general.png';

  const headerBgColor = (() => {
    const cat = (category || '').toLowerCase();
    const img = (typeof effectiveImage === 'string' ? effectiveImage : '').toLowerCase();

    if (cat.includes('science') || img.includes('science')) return 'bg-[#052420]';
    if (cat.includes('technology') || cat.includes('tech') || img.includes('tech')) return 'bg-[#292e1a]';
    if (cat.includes('sports') || cat.includes('sport') || img.includes('sport')) return 'bg-[#0b162f]';
    if (cat.includes('current') || cat.includes('news') || img.includes('current')) return 'bg-[#2b1d0a]';
    if (cat.includes('entertainment') || img.includes('entertainment')) return 'bg-[#2c0e22]';
    if (cat.includes('history') || img.includes('history')) return 'bg-[#281b0a]';
    if (cat.includes('math') || cat.includes('logic')) return 'bg-[#1a1c38]';
    if (cat.includes('geo')) return 'bg-[#0f2824]';
    if (cat.includes('art')) return 'bg-[#30162e]';
    if (cat.includes('environ') || cat.includes('nature')) return 'bg-[#142918]';
    if (cat.includes('business') || cat.includes('finance')) return 'bg-[#2b2410]';
    if (cat.includes('health') || cat.includes('medical')) return 'bg-[#2b1318]';
    return 'bg-[#0b122c]';
  })();

  const handleDownloadAppClick = () => {
    toast('Download the KnowChamp Mobile App to play and participate in live contests!', {
      icon: '📲',
      duration: 3500,
    });
  };

  const isImageSrc = effectiveImage && typeof effectiveImage === 'string' && (
    effectiveImage.startsWith('/') ||
    effectiveImage.startsWith('http') ||
    effectiveImage.startsWith('data:') ||
    effectiveImage.startsWith('uploads/')
  );

  return (
    <div className="rounded-2xl bg-[#0d0f1f] border border-gray-800/60 flex flex-col hover:border-gray-700/80 transition-all duration-300 h-full overflow-hidden group">
      {/* Top row — Category name + image */}
      <div
        className={`px-4 sm:px-5 flex items-center justify-between gap-3 h-[80px] sm:h-[90px] min-h-[80px] sm:min-h-[90px] max-h-[80px] sm:max-h-[90px] ${headerBgColor}`}
      >
        <h3 className="text-[14px] sm:text-[16px] font-bold text-white leading-tight truncate max-w-[calc(100%-68px)] sm:max-w-[calc(100%-72px)]">
          {category}
        </h3>
        <img
          src={getImageUrl(effectiveImage || '/cat-general.png')}
          alt={category}
          className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0 select-none group-hover:scale-105 transition-transform duration-300"
          draggable="false"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/cat-general.png';
          }}
        />
      </div>

      {/* Bottom Content Section */}
      <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-4 sm:pb-5 flex flex-col gap-2.5 sm:gap-3 flex-1">
        {/* Contest title */}
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-white leading-tight h-[44px] sm:h-[48px] line-clamp-2 overflow-hidden">
          {title}
        </h2>

        {/* Prize Pool + Entry Fee */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] sm:text-[11px] font-medium text-gray-400 mb-0.5">Price Pool</p>
            <p className="text-[16px] sm:text-[18px] font-extrabold text-red-500">
              ₹{(prize || 0).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] sm:text-[11px] font-medium text-gray-400 mb-0.5">Entry Fee</p>
            <p className="text-[16px] sm:text-[18px] font-extrabold text-white">₹{entry || 0}</p>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-800/80" />

        {/* Date + Players */}
        <div className="flex items-center justify-between text-gray-400">
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-medium truncate">{date}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-medium">
              {(joined || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Button Area */}
        <div className="mt-auto pt-1">
          <button
            type="button"
            onClick={handleDownloadAppClick}
            className="w-full py-2.5 sm:py-3 bg-[#4f6ef7] hover:bg-[#3d5ef0] text-white font-bold rounded-xl text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 hover:opacity-95"
          >
            <Download size={15} className="shrink-0" /> Download App
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContestCard;