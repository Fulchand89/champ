import React from 'react';
import { motion } from 'framer-motion';

const WinnerCard = ({ name, amount, contest, rank, image }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover="hover"
      whileTap="tap"
      variants={{
        hover: { 
          y: -8, 
          scale: 1.03,
          borderColor: "rgba(239, 68, 68, 0.25)",
          boxShadow: "0px 15px 35px rgba(239, 68, 68, 0.08)"
        },
        tap: { scale: 0.98 }
      }}
      className="relative group rounded-2xl bg-[#0e1121] border border-gray-800/80 p-6 flex flex-col items-center text-center transition-colors duration-300"
    >

      {/* Crown + Avatar */}
      <div className="relative mb-5">
        {/* Golden Crown */}
        <motion.div 
          variants={{
            hover: { 
              y: -8, 
              rotate: [0, -10, 8, -5, 5, 0],
              scale: 1.15
            }
          }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 drop-shadow-[0_4px_10px_rgba(245,158,11,0.55)] origin-bottom"
        >
          <svg className="w-10 h-10 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 16L5 7L10 11L12 5L14 11L19 7L22 16H2Z" />
            <circle cx="12" cy="4" r="1.5" fill="#fcd34d" />
            <circle cx="5" cy="6" r="1" fill="#fcd34d" />
            <circle cx="19" cy="6" r="1" fill="#fcd34d" />
          </svg>
        </motion.div>

        {/* Avatar ring */}
        <motion.div 
          variants={{
            hover: { 
              scale: 1.05,
              boxShadow: "0px 0px 25px rgba(239, 68, 68, 0.45)"
            }
          }}
          transition={{ duration: 0.25 }}
          className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-amber-500 via-red-500 to-orange-500 shadow-[0_0_20px_rgba(239,68,68,0.25)]"
        >
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#0e1121] bg-gray-800">
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white uppercase">{name.charAt(0)}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Rank badge */}
        <motion.span 
          variants={{
            hover: { scale: 1.12, rotate: 10 }
          }}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-gray-950 text-xs font-black shadow-md border-2 border-[#0e1121]"
        >
          #{rank}
        </motion.span>
      </div>

      {/* Name */}
      <h4 className="text-base font-bold text-white mb-1 group-hover:text-red-400 transition duration-300">
        {name}
      </h4>

      {/* Winnings */}
      <div className="text-sm font-semibold text-gray-400 mb-2">
        Won:{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 font-extrabold text-base">
          &#8377;{amount.toLocaleString()}
        </span>
      </div>

      {/* Contest label */}
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider bg-[#14182e] border border-gray-800/80 px-3 py-1 rounded-full truncate max-w-full">
        {contest}
      </span>
    </motion.div>
  );
};

export default WinnerCard;
