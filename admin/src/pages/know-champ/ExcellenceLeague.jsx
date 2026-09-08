import React, { useState, useEffect } from 'react';
import Navbar from '../../components/know-champ/Navbar';
import Footer from '../../components/know-champ/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import {
  Sparkles,
  ExternalLink,
  Globe,
  Award,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import cmsService from '../../api/services/cmsService';

const ExcellenceLeague = () => {
  const [cmsData, setCmsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCmsData = async () => {
      try {
        const res = await cmsService.getPublicExcellenceLeague();
        if (isMounted && res?.success && res.data) {
          setCmsData(res.data);
        }
      } catch (err) {
        console.error('Error fetching Excellence League CMS:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCmsData();
  }, []);

  const title = cmsData?.hero?.title || 'Excellence League';
  const subtitle = cmsData?.hero?.subtitle || 'Access the official Excellence League platform.';
  const linkUrl = cmsData?.linkUrl || 'https://knowchamp.com/excellence-league';
  const buttonText = cmsData?.buttonText || 'Visit Excellence League';

  const handleLinkClick = () => {
    if (linkUrl) {
      if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
        window.open(linkUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = linkUrl;
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-between selection:bg-red-500/30 selection:text-red-200">
      <ScrollToTop />
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Background Decorative Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-3xl w-full mx-auto relative z-10 text-center space-y-8">
          {/* Heading & Subtitle */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              {title}
            </h1>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Main Action Box */}
          {loading ? (
            <div className="p-12 rounded-3xl bg-[#0f1117]/80 border border-white/10 flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-gray-400">Loading Excellence League Portal...</p>
            </div>
          ) : (
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#131722] to-[#0b0d14] border border-white/10 shadow-2xl space-y-8 backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400 shadow-inner">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Join the Excellence League
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
                  Click below to access the official page and participate in the Excellence League.
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleLinkClick}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 cursor-pointer"
                >
                  <Globe className="w-5 h-5" />
                  <span>{buttonText}</span>
                  <ExternalLink className="w-5 h-5 ml-1" />
                </button>
              </div>

              {/* Displayed Link Box */}
              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 overflow-hidden max-w-full">
                  <Globe className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="font-mono text-gray-300 truncate">{linkUrl}</span>
                </div>
                <button
                  onClick={handleLinkClick}
                  className="flex items-center gap-1 text-red-400 font-semibold hover:text-red-300 transition-colors cursor-pointer shrink-0"
                >
                  <span>Open Link</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Verified Official KnowChamp Excellence League Platform</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ExcellenceLeague;
