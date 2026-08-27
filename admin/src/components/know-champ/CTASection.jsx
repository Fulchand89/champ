import React, { useState } from "react";
import { Link } from "react-router-dom";
import AppDownloadModal from "./AppDownloadModal";

const CTASection = () => {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadPlatform, setDownloadPlatform] = useState('android');

  const handleOpenDownload = (platform) => {
    setDownloadPlatform(platform);
    setIsDownloadModalOpen(true);
  };
  return (
    <section className="w-full bg-[#010914] px-0 py-8">
      {/* CTA Container */}
      <div
        className="
          relative
          mx-auto
          w-[calc(100%-32px)]
          max-w-[1425px]
          overflow-hidden
          rounded-[15px]
          bg-gradient-to-r
          from-[#261012]
          via-[#1C1018]
          to-[#130D13]
        "
      >
        <div className="relative flex flex-col lg:flex-row lg:h-[391px]">

          {/* ================= LEFT CONTENT ================= */}
          <div className="flex w-full flex-col justify-center px-5 py-8 sm:px-10 sm:py-10 lg:ml-[65px] lg:w-[648px] lg:flex-none lg:px-0 lg:py-0">

            {/* Content Wrapper */}
            <div className="flex flex-col gap-8 sm:gap-10 lg:gap-[52px]">

              {/* Heading + Description */}
              <div>
                {/* Heading */}
                <h2
                  className="
                    w-full
                    font-['Montserrat']
                    text-[26px]
                    font-semibold
                    leading-[110%]
                    tracking-[0]
                    text-[#EF5752]
                    sm:text-[34px]
                    lg:h-[102px]
                    lg:w-[648px]
                    lg:text-[42px]
                    lg:leading-[100%]
                  "
                >
                  Ready to Become the Next
                  <br />
                  Champion
                </h2>

                {/* Description */}
                <p
                  className="
                    mt-3
                    sm:mt-5
                    w-full
                    font-['Montserrat']
                    text-[13px]
                    font-medium
                    leading-[150%]
                    tracking-[0]
                    text-[#D8D8DC]
                    sm:text-[16px]
                    lg:h-[48px]
                    lg:w-[648px]
                    lg:text-[20px]
                    lg:leading-[100%]
                  "
                >
                  Compete in live quiz contests, sharpen your knowledge,
                  <br className="hidden lg:block" />
                  and win real cash rewards everyday.
                </p>
              </div>

              {/* ================= BUTTONS ================= */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-[20px]">
                  {/* Join Today Contests */}
                  <Link
                    to="/contests"
                    className="
                      flex
                      h-[48px]
                      sm:h-[54px]
                      w-full
                      max-w-[280px]
                      sm:max-w-none
                      items-center
                      justify-center
                      gap-[10px]
                      rounded-[6.35px]
                      bg-gradient-to-r
                      from-[#E94B4B]
                      to-[#B52B2B]
                      px-6
                      font-['Montserrat']
                      text-[14px]
                      sm:text-[16px]
                      font-semibold
                      leading-none
                      tracking-[0]
                      whitespace-nowrap
                      text-white
                      transition-all
                      duration-300
                      hover:shadow-[0_0_20px_rgba(233,75,75,0.35)]
                      sm:w-[254px]
                    "
                  >
                    Join Today Contests
                  </Link>

                  {/* Explore Contests */}
                  <Link
                    to="/contests"
                    className="
                      flex
                      h-[48px]
                      sm:h-[54px]
                      w-full
                      max-w-[280px]
                      sm:max-w-none
                      items-center
                      justify-center
                      gap-[10px]
                      rounded-[6.35px]
                      border-[1.06px]
                      border-[#E94B4B]
                      bg-transparent
                      px-6
                      font-['Montserrat']
                      text-[14px]
                      sm:text-[16px]
                      font-semibold
                      leading-none
                      tracking-[0]
                      whitespace-nowrap
                      text-white
                      transition-all
                      duration-300
                      hover:bg-[#E94B4B]/10
                      hover:border-[#EF5752]
                      sm:w-[222px]
                    "
                  >
                    Explore Contests
                  </Link>
                </div>

                {/* App Download Badges Row */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Or Download App:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenDownload('android')}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/90 border border-white/15 hover:border-red-500/50 text-white transition-all cursor-pointer shadow-md group"
                  >
                    <svg className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.411 13.8533 8.125 12 8.125s-3.5902.286-5.1368.8247L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.343 14.6589 0 18.761h24c-.343-4.1021-2.6889-7.5743-6.1185-9.4396"/>
                    </svg>
                    <div className="text-left">
                      <p className="text-[9px] text-gray-400 leading-none">GET IT ON</p>
                      <p className="text-xs font-bold text-white leading-tight">Google Play</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenDownload('ios')}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/90 border border-white/15 hover:border-red-500/50 text-white transition-all cursor-pointer shadow-md group"
                  >
                    <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.07 1.71-.93 2.73 1.01.08 2.02-.49 2.63-1.23z"/>
                    </svg>
                    <div className="text-left">
                      <p className="text-[9px] text-gray-400 leading-none">Download on the</p>
                      <p className="text-xs font-bold text-white leading-tight">App Store</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT TROPHY IMAGE ================= */}
          <div
            className="
              relative
              flex
              w-full
              items-end
              justify-center
              min-h-[220px]
              sm:min-h-[280px]
              lg:ml-auto
              lg:mr-[100px]
              lg:min-h-[391px]
              lg:w-auto
            "
          >
            {/* Background Glow */}
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-[200px] w-[200px] sm:h-[260px] sm:w-[260px] -translate-x-1/2 rounded-full bg-red-600/10 blur-[90px]" />

            {/* Trophy Image */}
            <img
              src="/Home-images.png"
              alt="Know Champ Trophy"
              className="
                relative
                z-10
                h-auto
                w-[170px]
                sm:w-[220px]
                md:w-[260px]
                object-contain
                lg:h-[379px]
                lg:w-[299px]
              "
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
    </section>
  );
};

export default CTASection;
