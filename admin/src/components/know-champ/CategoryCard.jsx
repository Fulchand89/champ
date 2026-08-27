import React from 'react';
import { motion } from 'framer-motion';
import { getImageUrl } from '../../api/services/api';

const CategoryCard = ({ name, image, colorClass, borderGlowClass, isLoading, onClick }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-between bg-[#0e1121] border border-gray-800 rounded-2xl p-3 sm:p-4 aspect-square animate-pulse w-full">
        {/* Image placeholder */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-800/60 rounded-full"></div>
        </div>

        {/* Category name placeholder */}
        <div className="h-3 bg-gray-800/60 rounded w-16 mt-1 sm:mt-2"></div>
      </div>
    );
  }

  const rawImg = image || '/cat-general.png';

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
          src={getImageUrl(rawImg)}
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
