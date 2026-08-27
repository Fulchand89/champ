import React from 'react';
import Navbar from '../../components/know-champ/Navbar';
import Footer from '../../components/know-champ/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import { Download, UserCheck, Wallet, PlayCircle, Trophy, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  const steps = [
    {
      step: '01',
      icon: <Download className="w-6 h-6 text-red-500" />,
      title: 'Download & Install',
      description: 'Download the official KnowChamp App from our website and install it on your device.',
    },
    {
      step: '02',
      icon: <UserCheck className="w-6 h-6 text-red-500" />,
      title: 'Create Account',
      description: 'Register in seconds using your mobile number and verify via a secure OTP.',
    },
    {
      step: '03',
      icon: <Wallet className="w-6 h-6 text-red-500" />,
      title: 'Add Wallet Money',
      description: 'Deposit funds using secure payment gateways (UPI, cards, wallets) to join cash contests.',
    },
    {
      step: '04',
      icon: <PlayCircle className="w-6 h-6 text-red-500" />,
      title: 'Play Live Quizzes',
      description: 'Join active contests, answer multiple-choice questions accurately, and score points.',
    },
    {
      step: '05',
      icon: <Trophy className="w-6 h-6 text-red-500" />,
      title: 'Win & Withdraw',
      description: 'Rank high on the leaderboard, earn cash prizes, and withdraw instantly to your bank account.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090b15] text-white flex flex-col font-sans select-none overflow-x-hidden">
      <ScrollToTop />
      <Navbar />

      {/* Hero Header */}
      <div className="relative pt-36 pb-20 bg-gradient-to-b from-[#0b0c16] via-[#100713] to-[#090b15] border-b border-gray-900 flex flex-col items-center text-center">
        <h1 className="text-3xl sm:text-5xl font-black mb-4 text-[#FFFFFF]">
          How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Works</span>
        </h1>
        <p className="text-[#FFFFFF] max-w-xl mx-auto text-sm sm:text-base">
          Getting started is quick and easy. Follow these simple steps to learn, play, and win cash prizes daily.
        </p>
      </div>

      <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 space-y-20">

        {/* Step-by-Step Flow */}
        <div className="relative">
          {/* Connecting Line (for desktop) */}
          <div className="hidden lg:block absolute top-[50%] left-10 right-10 h-0.5 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-blue-500/20 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 relative z-10">
            {steps.map((item, idx) => (
              <div
                key={idx}
                className="group relative bg-[#0e1121] border border-gray-800/80 rounded-2xl p-6 hover:border-red-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Step number badge */}
                <span className="absolute top-4 right-4 text-xs font-black text-red-500/20 group-hover:text-red-500/40 transition duration-300 font-mono tracking-widest text-2xl">
                  {item.step}
                </span>

                {/* Icon Wrapper */}
                <div className="w-12 h-12 rounded-xl bg-red-500/5 group-hover:bg-red-500/10 border border-red-500/10 group-hover:border-red-500/30 flex items-center justify-center mb-6 transition duration-300">
                  {item.icon}
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
            ))}
          </div>
        </div>

        {/* Video / Info Callout Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#140b20] to-[#0a0d24] border border-red-500/10 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Rules & Fair Play Guidelines
            </h2>
            <p className="text-sm sm:text-base text-[#FFFFFF] leading-relaxed">
              We employ state-of-the-art anti-cheat detection, quick results calculation, and multi-signature security protocols to ensure that all contests are completely clean, secure, and 100% fair.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#FFFFFF] pt-2 font-semibold">
              <li className="flex items-center gap-2">
                <span className="text-red-500 font-bold">✔</span> No emulator support
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500 font-bold">✔</span> Single device account
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500 font-bold">✔</span> Automated anti-bot detection
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500 font-bold">✔</span> 24/7 support desk
              </li>
            </ul>
          </div>
          <div>
            <Link
              to="/contests"
              className="inline-flex items-center gap-2 px-8 py-4 btn-brand-primary text-white font-bold rounded-xl shadow-lg transition-all duration-300"
            >
              Start Playing Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default HowItWorks;
