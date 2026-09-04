import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/know-champ/Navbar';
import Footer from '../../components/know-champ/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import {
  Download, UserCheck, Wallet, PlayCircle, Trophy, ArrowRight,
  ShieldCheck, Star, Zap, BookOpen, Gift, Smartphone, CheckCircle,
  Users, BarChart2, CreditCard, Lock, Headphones,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cmsService } from '../../api/services/cmsService';
import { initAdminSocket } from '../../api/services/adminSocketService';

// ── Map icon name strings (stored in DB) to Lucide components ──
const ICON_MAP = {
  Download,
  UserCheck,
  Wallet,
  PlayCircle,
  Trophy,
  ShieldCheck,
  Star,
  Zap,
  BookOpen,
  Gift,
  Smartphone,
  CheckCircle,
  Users,
  BarChart2,
  CreditCard,
  ArrowRight,
  Lock,
  Headphones,
};

// ── Default data (mirrors what's in cms.json) — shown while loading or on error ──
const DEFAULT_DATA = {
  hero: {
    title: 'How It',
    titleHighlight: 'Works',
    subtitle: 'Getting started is quick and easy. Follow these simple steps to learn, play, and win cash prizes daily.',
  },
  steps: [
    { id: 1, stepNumber: '01', icon: 'Download', title: 'Download & Install', description: 'Download the official KnowChamp App from our website and install it on your device.', displayOrder: 1 },
    { id: 2, stepNumber: '02', icon: 'UserCheck', title: 'Create Account', description: 'Register in seconds using your mobile number and verify via a secure OTP.', displayOrder: 2 },
    { id: 3, stepNumber: '03', icon: 'Wallet', title: 'Add Wallet Money', description: 'Deposit funds using secure payment gateways (UPI, cards, wallets) to join cash contests.', displayOrder: 3 },
    { id: 4, stepNumber: '04', icon: 'PlayCircle', title: 'Play Live Quizzes', description: 'Join active contests, answer multiple-choice questions accurately, and score points.', displayOrder: 4 },
    { id: 5, stepNumber: '05', icon: 'Trophy', title: 'Win & Withdraw', description: 'Rank high on the leaderboard, earn cash prizes, and withdraw instantly to your bank account.', displayOrder: 5 },
  ],
  callout: {
    title: 'Rules & Fair Play Guidelines',
    description: 'We employ state-of-the-art anti-cheat detection, quick results calculation, and multi-signature security protocols to ensure that all contests are completely clean, secure, and 100% fair.',
    bulletPoints: ['No emulator support', 'Single device account', 'Automated anti-bot detection', '24/7 support desk'],
    ctaText: 'Start Playing Now',
    ctaLink: '/contests',
  },
};

const HowItWorks = () => {
  const [cmsData, setCmsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const res = await cmsService.getPublicHowItWorks();
      if (res?.success && res.data) {
        setCmsData(res.data);
      } else {
        setCmsData(DEFAULT_DATA);
      }
    } catch (err) {
      console.error('HowItWorks: Failed to load CMS data, using defaults:', err);
      setCmsData(DEFAULT_DATA);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Listen for real-time admin updates via socket
    const socket = initAdminSocket();
    const handleUpdate = (updatedData) => {
      if (updatedData) setCmsData(updatedData);
    };
    socket.on('cms_how_it_works_updated', handleUpdate);
    return () => {
      socket.off('cms_how_it_works_updated', handleUpdate);
    };
  }, [loadData]);

  // Use live data or fall back to defaults while loading
  const data = cmsData || DEFAULT_DATA;
  const hero = data.hero || DEFAULT_DATA.hero;
  const steps = Array.isArray(data.steps) && data.steps.length > 0
    ? [...data.steps].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    : DEFAULT_DATA.steps;
  const callout = data.callout || DEFAULT_DATA.callout;
  const bulletPoints = Array.isArray(callout.bulletPoints) ? callout.bulletPoints : DEFAULT_DATA.callout.bulletPoints;

  return (
    <div className="min-h-screen bg-[#090b15] text-white flex flex-col font-sans select-none overflow-x-hidden">
      <ScrollToTop />
      <Navbar />

      {/* Hero Header */}
      <div className="relative pt-36 pb-20 bg-gradient-to-b from-[#0b0c16] via-[#100713] to-[#090b15] border-b border-gray-900 flex flex-col items-center text-center">
        {loading ? (
          <>
            <div className="h-12 w-64 bg-white/10 rounded-xl animate-pulse mb-4" />
            <div className="h-5 w-80 bg-white/5 rounded-lg animate-pulse" />
          </>
        ) : (
          <>
            <h1 className="text-3xl sm:text-5xl font-black mb-4 text-[#FFFFFF]">
              {hero.title}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                {hero.titleHighlight}
              </span>
            </h1>
            <p className="text-[#FFFFFF] max-w-xl mx-auto text-sm sm:text-base">
              {hero.subtitle}
            </p>
          </>
        )}
      </div>

      <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 space-y-20">

        {/* Step-by-Step Flow */}
        <div className="relative">
          {/* Connecting Line (desktop) */}
          <div className="hidden lg:block absolute top-[50%] left-10 right-10 h-0.5 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-blue-500/20 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 relative z-10">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-[#0e1121] border border-gray-800/80 rounded-2xl p-6 animate-pulse">
                    <div className="w-12 h-12 rounded-xl bg-white/5 mb-6" />
                    <div className="h-4 w-3/4 bg-white/5 rounded mb-3" />
                    <div className="h-3 w-full bg-white/5 rounded mb-2" />
                    <div className="h-3 w-5/6 bg-white/5 rounded" />
                  </div>
                ))
              : steps.map((item, idx) => {
                  const IconComponent = ICON_MAP[item.icon] || Download;
                  return (
                    <div
                      key={item.id || idx}
                      className="group relative bg-[#0e1121] border border-gray-800/80 rounded-2xl p-6 hover:border-red-500/30 transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Step number badge */}
                      <span className="absolute top-4 right-4 text-xs font-black text-red-500/20 group-hover:text-red-500/40 transition duration-300 font-mono tracking-widest text-2xl">
                        {item.stepNumber}
                      </span>

                      {/* Icon Wrapper */}
                      <div className="w-12 h-12 rounded-xl bg-red-500/5 group-hover:bg-red-500/10 border border-red-500/10 group-hover:border-red-500/30 flex items-center justify-center mb-6 transition duration-300">
                        <IconComponent className="w-6 h-6 text-red-500" />
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition duration-300">
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-gray-[#FFFFFF] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* Callout Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#140b20] to-[#0a0d24] border border-red-500/10 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-10">
          {loading ? (
            <div className="space-y-4 max-w-xl w-full">
              <div className="h-8 w-2/3 bg-white/10 rounded-xl animate-pulse" />
              <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse" />
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[1,2,3,4].map(i => <div key={i} className="h-4 bg-white/5 rounded animate-pulse" />)}
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-w-xl">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {callout.title}
                </h2>
                <p className="text-sm sm:text-base text-[#FFFFFF] leading-relaxed">
                  {callout.description}
                </p>
                {bulletPoints.length > 0 && (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#FFFFFF] pt-2 font-semibold">
                    {bulletPoints.map((point, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-red-500 font-bold">✔</span> {point}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <Link
                  to={callout.ctaLink || '/contests'}
                  className="inline-flex items-center gap-2 px-8 py-4 btn-brand-primary text-white font-bold rounded-xl shadow-lg transition-all duration-300"
                >
                  {callout.ctaText || 'Start Playing Now'}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </>
          )}
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default HowItWorks;
