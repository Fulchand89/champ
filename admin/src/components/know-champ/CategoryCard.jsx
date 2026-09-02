import React from 'react';
import { motion } from 'framer-motion';
import { getImageUrl } from '../../api/services/api';

const CategoryCard = ({ name = '', image, icon, colorClass, borderGlowClass, isLoading, onClick }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-between bg-[#0e1121] border border-gray-800 rounded-2xl p-3 sm:p-4 aspect-square animate-pulse w-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-800/60 rounded-full"></div>
        </div>
        <div className="h-3 bg-gray-800/60 rounded w-16 mt-1 sm:mt-2"></div>
      </div>
    );
  }

  const resolveImage = () => {
    // Apply MIME correction up-front so truthy checks work on valid URLs only
    const resolvedImage = image ? getImageUrl(image) : '';
    const resolvedIcon  = icon  ? getImageUrl(icon)  : '';

    // 1. Custom uploaded image (Data URI, /uploads/, blob, or http URL)
    if (
      resolvedImage &&
      resolvedImage.trim() !== '' &&
      resolvedImage !== '/cat-general.png' &&
      resolvedImage !== 'cat-general.png'
    ) {
      return resolvedImage;
    }
    if (
      resolvedIcon &&
      resolvedIcon.trim() !== '' &&
      (resolvedIcon.startsWith('data:') || resolvedIcon.startsWith('/') || resolvedIcon.startsWith('http') || resolvedIcon.startsWith('blob:') || resolvedIcon.startsWith('uploads/'))
    ) {
      return resolvedIcon;
    }

    // 2. Preset image matching based on category name when no custom image was uploaded
    const n = (name || '').toLowerCase();
    if (n.includes('science') || n.includes('health') || n.includes('medic') || n.includes('doctor')) {
      return '/cat-science.png';
    }
    if (n.includes('tech') || n.includes('computer') || n.includes('code') || n.includes('robot') || n.includes('software') || n.includes('programming')) {
      return '/cat-technology.png';
    }
    if (n.includes('sport') || n.includes('cricket') || n.includes('football') || n.includes('game') || n.includes('play')) {
      return '/cat-sports.png';
    }
    if (n.includes('entertain') || n.includes('movie') || n.includes('music') || n.includes('cinema') || n.includes('song') || n.includes('film')) {
      return '/cat-entertainment.png';
    }
    if (n.includes('history') || n.includes('past') || n.includes('ancient')) {
      return '/cat-history.png';
    }
    if (n.includes('current') || n.includes('news') || n.includes('affair') || n.includes('today')) {
      return '/cat-current.png';
    }
    if (n.includes('math') || n.includes('logic') || n.includes('reason')) {
      return '/Knowledge.png';
    }

    // 3. Default fallback
    return '/cat-general.png';
  };

  const finalImg = resolveImage();

  return (
    <motion.div
      onClick={onClick}
      className={`flex flex-col items-center justify-between bg-[#0e1121] border border-gray-800 rounded-2xl p-3 sm:p-4 cursor-pointer aspect-square w-full ${borderGlowClass || 'hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]'}`}
      whileHover={{ scale: 1.05, borderColor: 'rgba(239,68,68,0.4)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
      {/* Category Image */}
      <div className="flex-1 flex items-center justify-center">
        <img
          src={finalImg}
          alt={name}
          className="w-8 h-8 sm:w-12 sm:h-12 object-contain select-none"
          draggable="false"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/cat-general.png';
          }}
        />
      </div>

      {/* Category name */}
      <span className="text-[10px] sm:text-xs font-bold text-white text-center leading-tight mt-1 sm:mt-2 line-clamp-2 px-0.5">
        {name}
      </span>
    </motion.div>
  );
};

export default CategoryCard;
