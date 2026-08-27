import React, { useRef } from "react";
import {
  ShieldCheck,
  Gift,
  BookOpen,
  Lock,
  Trophy,
  Zap,
  Star,
  Users,
  Wallet,
  BarChart2,
  Headphones,
  Smartphone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const IconMap = {
  ShieldCheck,
  Gift,
  BookOpen,
  Lock,
  Trophy,
  Zap,
  Star,
  Users,
  Wallet,
  BarChart2,
  Headphones,
  Smartphone,
};

const WhyChooseUs = ({ isLoading, features = [] }) => {
  const featuresScrollRef = useRef(null);

  const scrollFeatures = (direction) => {
    if (featuresScrollRef.current) {
      const containerWidth = featuresScrollRef.current.clientWidth;
      const scrollAmount = direction === "left" ? -containerWidth : containerWidth;
      featuresScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const getIcon = (feature) => {
    // If feature already provides a JSX icon
    if (feature.icon && React.isValidElement(feature.icon)) {
      return feature.icon;
    }

    // Dynamic icon from iconName
    const IconComponent = IconMap[feature.iconName] || ShieldCheck;
    const colorClass = feature.colorClass || "text-[#E94B4B]";

    return (
      <IconComponent
        className={`w-6 h-6 sm:w-7 sm:h-7 ${colorClass}`}
      />
    );
  };

  return (
    <section className="py-6 sm:py-8 bg-[#010914] border-t border-[#1B2230]">
      <div className="w-[calc(100%-24px)] sm:w-[calc(100%-32px)] max-w-[1425px] mx-auto px-3 sm:px-6 lg:px-8">

        {/* Section Heading & Scroll Buttons */}
        <div className="flex items-end justify-between mb-5 sm:mb-6 pb-3 border-b border-gray-800/40">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight relative inline-block">
            Why Choose Know Champ?
            <span className="absolute bottom-[-13px] left-0 w-14 sm:w-16 h-1 bg-red-600 rounded-full" />
          </h2>

          {/* Arrow Scroll Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollFeatures("left")}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0e1121] border border-gray-800 hover:border-red-500/60 hover:bg-gray-800/80 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
              aria-label="Previous features"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollFeatures("right")}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0e1121] border border-gray-800 hover:border-red-500/60 hover:bg-gray-800/80 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
              aria-label="Next features"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feature Horizontal Scroller */}
        <div 
          ref={featuresScrollRef}
          className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-2 px-0.5"
        >
          {isLoading ? (
            /* Skeleton Loading */
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="w-[85%] xs:w-[calc((100%-1rem)/2)] sm:w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-2*1.5rem)/3)] lg:w-[calc((100%-3*1.5rem)/4)] flex-shrink-0 bg-[#0e1121] border border-gray-800/70 p-4 sm:p-5 rounded-2xl flex flex-col gap-3 sm:gap-4 animate-pulse"
              >
                {/* Icon + Title Skeleton */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gray-800/60 shrink-0" />
                  <div className="h-4 bg-gray-800/60 rounded-md w-1/2" />
                </div>

                {/* Description Skeleton */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="h-3 bg-gray-800/60 rounded-md w-full" />
                  <div className="h-3 bg-gray-800/60 rounded-md w-5/6" />
                  <div className="h-3 bg-gray-800/60 rounded-md w-2/3" />
                </div>
              </div>
            ))
          ) : features.length > 0 ? (
            /* Dynamic Features */
            features.map((feature, idx) => (
              <div
                key={feature.id || idx}
                className="w-[85%] xs:w-[calc((100%-1rem)/2)] sm:w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-2*1.5rem)/3)] lg:w-[calc((100%-3*1.5rem)/4)] flex-shrink-0 bg-[#0e1121] border border-gray-800/70 p-4 sm:p-5 rounded-2xl flex flex-col gap-3 sm:gap-4 relative hover:border-red-500/40 transition-all duration-300"
              >
                {/* Icon + Title + Badges */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
                    {getIcon(feature)}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {feature.title}
                    </h3>

                    {feature.contest?.title && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {feature.contest.title}
                      </span>
                    )}

                    {feature.badgeText && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E94B4B]/20 text-[#E94B4B] border border-[#E94B4B]/30">
                        {feature.badgeText}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))
          ) : (
            <div className="w-full text-center py-8 text-gray-500 text-sm">
              No features available.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;