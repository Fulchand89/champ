import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import AppDownloadModal from "./AppDownloadModal";
import AppStoreButtons from "./AppStoreButtons";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadPlatform, setDownloadPlatform] = useState('android');
  const location = useLocation();

  // Lock background scroll when mobile side panel is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Contests", path: "/contests" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "Leaderboard", path: "/leaderboard" },
    { name: "Excellence League", path: "/excellence-league" },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleOpenDownload = (platform) => {
    setDownloadPlatform(platform);
    setIsDownloadModalOpen(true);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#090b15]/95 backdrop-blur-md border-b border-gray-800/50">
        <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link
                to="/"
                onClick={closeMenu}
                className="flex items-center group"
              >
                <img
                  src="/logo_knowchamp.png"
                  alt="KnowChamp Logo"
                  className="h-14 w-auto drop-shadow-[0_2px_8px_rgba(239,68,68,0.15)] group-hover:scale-105 transition-all duration-300"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-12">
              {navLinks.map((link, idx) => {
                const active = isActive(link.path);

                return (
                  <Link
                    key={idx}
                    to={link.path}
                    className={`relative py-2 text-base font-semibold tracking-wide transition-all duration-300 hover:text-red-500 ${active
                      ? "text-red-500 font-bold"
                      : "text-[#FFFFFF]"
                      }`}
                  >
                    {link.name}

                    {active && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Store Download Buttons */}
            <div className="hidden md:flex items-center">
              <AppStoreButtons
                onDownload={handleOpenDownload}
                size="sm"
              />
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label="Toggle menu"
                aria-expanded={isOpen}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none transition duration-150"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Background Overlay - website visible with blur */}
      <div
        className={`fixed inset-0 z-30 md:hidden bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
        aria-hidden="true"
        onClick={closeMenu}
      />

      {/* Mobile Side Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 md:hidden w-72 max-w-[85vw] bg-[#0a0d1e] border-r border-gray-800/60 shadow-2xl flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        aria-label="Mobile navigation"
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800/60">
          <img
            src="/logo_knowchamp.png"
            alt="KnowChamp Logo"
            className="h-10 w-auto"
          />

          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close menu"
            className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Navigation Links */}
        <div className="flex-1 px-4 pt-4 pb-6 space-y-1">
          {navLinks.map((link, idx) => {
            const active = isActive(link.path);

            return (
              <Link
                key={idx}
                to={link.path}
                onClick={closeMenu}
                className={`block px-4 py-3 rounded-lg text-base font-semibold transition duration-150 ${active
                  ? "bg-red-500/10 text-red-500 border-l-4 border-red-500"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Mobile Download Application & iOS Buttons */}
        <div className="px-5 py-5 border-t border-gray-800/60">
          <AppStoreButtons
            onDownload={(platform) => {
              closeMenu();
              handleOpenDownload(platform);
            }}
            vertical
            size="sm"
            buttonClassName="w-full justify-center"
          />
        </div>
      </aside>

      {/* App Download Modal */}
      <AppDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        initialPlatform={downloadPlatform}
      />
    </>
  );
};

export default Navbar;