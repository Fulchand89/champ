import React from 'react';

/**
 * AppStoreButtons component renders stylized "GET IT ON Google Play" 
 * and "Download on the App Store" buttons matching store badge guidelines.
 * 
 * @param {Object} props
 * @param {Function} props.onDownload - Callback function with platform ('android' | 'ios')
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {string} props.className - Additional class names for container
 * @param {string} props.buttonClassName - Additional class names for each button
 * @param {boolean} props.vertical - If true, stacks buttons vertically
 */
const AppStoreButtons = ({
  onDownload,
  size = 'md',
  className = '',
  buttonClassName = '',
  vertical = false
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  // Responsive and size-specific dimensions
  const containerClasses = vertical
    ? 'flex flex-col gap-2.5'
    : 'flex flex-wrap items-center gap-3';

  const btnPadding = isSm
    ? 'px-3 py-1.5 min-h-[38px] rounded-xl'
    : isLg
    ? 'px-5 py-2.5 min-h-[52px] rounded-2xl'
    : 'px-4 py-2 min-h-[46px] rounded-xl';

  const iconSize = isSm ? 'w-4 h-4' : isLg ? 'w-6 h-6' : 'w-5 h-5';
  const subtitleSize = isSm ? 'text-[8.5px]' : isLg ? 'text-[11px]' : 'text-[9.5px]';
  const titleSize = isSm ? 'text-xs font-bold' : isLg ? 'text-base font-bold' : 'text-[13px] font-bold';

  return (
    <div className={`${containerClasses} ${className}`}>
      {/* Google Play Button */}
      <button
        type="button"
        onClick={() => onDownload && onDownload('android')}
        className={`group relative flex items-center gap-2.5 bg-black/80 hover:bg-black text-white border border-white/20 hover:border-white/40 shadow-lg shadow-black/40 hover:shadow-green-500/10 active:scale-97 transition-all duration-200 cursor-pointer ${btnPadding} ${buttonClassName}`}
        aria-label="Get it on Google Play"
      >
        {/* Android Green Robot Icon */}
        <svg
          className={`${iconSize} text-[#3DDC84] fill-current shrink-0 group-hover:scale-110 transition-transform duration-200`}
          viewBox="0 0 24 24"
        >
          <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.411 13.8533 8.125 12 8.125s-3.5902.286-5.1368.8247L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.343 14.6589 0 18.761h24c-.343-4.1021-2.6889-7.5743-6.1185-9.4396" />
        </svg>

        {/* Text Block */}
        <div className="text-left flex flex-col justify-center leading-tight">
          <span className={`${subtitleSize} text-gray-400 uppercase tracking-wider font-semibold`}>
            GET IT ON
          </span>
          <span className={`${titleSize} text-white tracking-wide font-sans`}>
            Google Play
          </span>
        </div>
      </button>

      {/* Apple App Store Button */}
      <button
        type="button"
        onClick={() => onDownload && onDownload('ios')}
        className={`group relative flex items-center gap-2.5 bg-black/80 hover:bg-black text-white border border-white/20 hover:border-white/40 shadow-lg shadow-black/40 hover:shadow-white/10 active:scale-97 transition-all duration-200 cursor-pointer ${btnPadding} ${buttonClassName}`}
        aria-label="Download on the App Store"
      >
        {/* Apple Logo Icon */}
        <svg
          className={`${iconSize} text-white fill-current shrink-0 group-hover:scale-110 transition-transform duration-200`}
          viewBox="0 0 24 24"
        >
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.07 1.71-.93 2.73 1.01.08 2.02-.49 2.63-1.23z" />
        </svg>

        {/* Text Block */}
        <div className="text-left flex flex-col justify-center leading-tight">
          <span className={`${subtitleSize} text-gray-400 tracking-wider font-semibold`}>
            Download on the
          </span>
          <span className={`${titleSize} text-white tracking-wide font-sans`}>
            App Store
          </span>
        </div>
      </button>
    </div>
  );
};

export default AppStoreButtons;
