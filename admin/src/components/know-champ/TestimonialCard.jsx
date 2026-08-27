import React from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const TestimonialCard = ({ rating, text, name, title, image }) => {
  return (
    <motion.div
      whileHover={{
        y: -4,
        borderColor: "rgba(239, 68, 68, 0.25)",
        boxShadow: "0px 12px 30px rgba(239, 68, 68, 0.06)",
      }}
      whileTap={{ scale: 0.98 }}
      className="rounded-2xl bg-[#0d0f1f] border border-gray-800/60 flex flex-col p-4 sm:p-6 h-full"
    >
      {/* Stars */}
      <div className="flex gap-1 mb-3 sm:mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-red-500 text-red-500" />
        ))}
      </div>

      {/* Testimonial Text */}
      <p className="text-xs sm:text-sm md:text-base [#FFFFFF] leading-relaxed flex-1 mb-4 sm:mb-6">
        {text}"
      </p>

      {/* User Bio */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-gray-800 border border-gray-700 flex-shrink-0 flex items-center justify-center">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <span className="text-xs sm:text-sm font-bold text-white uppercase">
              {name?.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <h5 className="text-sm sm:text-base font-bold text-white leading-none">
            {name}
          </h5>
          <span className="text-[10px] sm:text-xs text-[#FFFFFF] mt-1 block">
            {title}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
