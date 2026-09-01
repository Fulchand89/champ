import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Apple } from 'lucide-react';
import AppDownloadModal from './AppDownloadModal';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadPlatform, setDownloadPlatform] = useState('android');

  const handleOpenDownload = (platform) => {
    setDownloadPlatform(platform);
    setIsDownloadModalOpen(true);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Do subscription simulation
  };

  return (
    <footer className="bg-[#060810] border-t border-gray-900 pt-16 pb-8 text-gray-400">
      <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-gray-900">

          {/* Logo & Intro column */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="group inline-block w-[221px] h-[144px]">
              <img
                src="/logo_knowchamp_footer.png"
                alt="KnowChamp Logo"
                className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(239,68,68,0.15)] group-hover:scale-105 transition-all duration-300"
              />
            </Link>
            <p className="font-['Outfit'] text-[18px]  font-normal leading-none tracking-[0] text-[#FFFFFF] max-w-sm">
              India's leading quiz contest platform where knowledge meets opportunity. Join and challenge yourself to win exciting cash rewards.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-[10px] pt-2">
              <a
                href="#"
                className="w-[42.49px] h-[42.49px] shrink-0 rounded-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center text-white hover:scale-105 transition-all duration-300"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              <a
                href="#"
                className="w-[42.49px] h-[42.49px] shrink-0 rounded-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center text-white hover:scale-105 transition-all duration-300"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              <a
                href="#"
                className="w-[42.49px] h-[42.49px] shrink-0 rounded-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center text-white hover:scale-105 transition-all duration-300"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 17 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>

              <a
                href="#"
                className="w-[42.49px] h-[42.49px] shrink-0 rounded-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center text-white hover:scale-105 transition-all duration-300"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19c1.71.46 8.59.46 8.59.46s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                </svg>
              </a>
            </div>
          </div>
          {/* Quick Links Column */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="w-[157px] h-[32px] font-['Montserrat'] text-[26px] font-semibold leading-none tracking-[0] text-[#E94B4B] whitespace-nowrap">
              Quick Links
            </h4>
            <ul className="space-y-3 font-['Montserrat'] text-[18px] text-[#FFFFFF] font-medium leading-none tracking-[0]">
              <li>
                <Link
                  to="/"
                  className="w-[69px] h-[27px] inline-block hover:text-red-400 transition-colors duration-200"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/contests"
                  className="inline-block hover:text-red-400 transition-colors duration-200"
                >
                  Contests
                </Link>
              </li>

              <li>
                <Link
                  to="/how-it-works"
                  className="inline-block hover:text-red-400 transition-colors duration-200"
                >
                  How It Works
                </Link>
              </li>

              <li>
                <Link
                  to="/leaderboard"
                  className="inline-block hover:text-red-400 transition-colors duration-200"
                >
                  Leaderboard
                </Link>
              </li>

              <li>
                <Link
                  to="/excellence-league"
                  className="inline-block hover:text-red-400 transition-colors duration-200"
                >
                  Excellence League
                </Link>
              </li>

              <li>
                <Link
                  to="#"
                  className="inline-block hover:text-red-400 transition-colors duration-200"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          {/* Support Column */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="w-[157px] h-[32px] font-['Montserrat'] text-[26px] font-semibold leading-none tracking-[0] text-[#E94B4B] whitespace-nowrap">
              Support
            </h4>
            <ul className="space-y-3 font-['Montserrat'] text-[18px] text-[#FFFFFF] font-medium leading-none tracking-[0]">
              <li>
                <Link to="/how-it-works" className="inline-block hover:text-red-400 transition-colors duration-200">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="inline-block hover:text-red-400 transition-colors duration-200">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="inline-block hover:text-red-400 transition-colors duration-200">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="inline-block hover:text-red-400 transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="inline-block hover:text-red-400 transition-colors duration-200">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Newsletter Heading */}
            <h4 className="w-[147px] h-[32px] font-['Montserrat'] text-[26px] font-semibold leading-none tracking-[0] text-[#E94B4B] whitespace-nowrap">
              Newsletter
            </h4>

            {/* Description */}
            <p className="font-['Outfit'] text-[18px] font-normal leading-none tracking-[0] text-[#FFFFFF] max-w-sm">
              Get latest updates about new contests and exciting offers directly in your inbox.
            </p>

            {/* Form */}
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 sm:gap-[10px]">
              <div className="relative w-full sm:w-[300px] h-[51px]">
                <input
                  type="email"
                  required
                  placeholder="Your Email"
                  className="w-full max-w-[300px] h-[41px] px-3 bg-[#0e1121] border-[0.5px] border-gray-800 rounded-[6px] text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition duration-300"

                />
              </div>
              <button
                type="submit"
                className="w-full max-w-[111px] h-[41px] flex items-center justify-center gap-[10.59px] bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-[6px] text-[11px] transition duration-300"

              >
                Subscribe
              </button>
            </form>

            {/* App Download Badges */}
            <div className="pt-2">
              <p className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2.5">
                Download Mobile App
              </p>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => handleOpenDownload('android')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e1121] hover:bg-[#161a33] border border-gray-800 hover:border-red-500/50 text-white transition-all duration-200 cursor-pointer text-left"
                >
                  <Smartphone className="w-4 h-4 text-green-400 shrink-0" />
                  <div>
                    <span className="text-[9px] text-gray-400 block leading-none">Android</span>
                    <span className="text-xs font-bold text-white leading-tight">Download APK</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenDownload('ios')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e1121] hover:bg-[#161a33] border border-gray-800 hover:border-red-500/50 text-white transition-all duration-200 cursor-pointer text-left"
                >
                  <Apple className="w-4 h-4 text-white shrink-0" />
                  <div>
                    <span className="text-[9px] text-gray-400 block leading-none">iOS</span>
                    <span className="text-xs font-bold text-white leading-tight">App Store</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Footer Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-xs text-gray-600 gap-4 sm:gap-0">
          <div className="text-center sm:text-left space-y-1">
            <p>© {currentYear} KnowChamp Quiz. All rights reserved.</p>
            <p className="text-[11px] text-gray-500">
              Powered by <span className="text-gray-400 font-medium">Zigisa Consultancy Services Private Limited</span>
            </p>
          </div>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <Link to="/terms-conditions" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
            <Link to="/privacy-policy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-gray-400 transition-colors">Support</Link>
          </div>
        </div>

      </div>

      {/* App Download Modal */}
      <AppDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        initialPlatform={downloadPlatform}
      />
    </footer>
  );
};

export default Footer;
