import React from 'react';
import Navbar from '../../components/know-champ/Navbar';
import Footer from '../../components/know-champ/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import { Award, Zap, Trophy, ShieldAlert } from 'lucide-react';
import { KNOW_CHAMP_WINNERS } from '../../constants/knowChampData';
import { motion } from 'framer-motion';

const Leaderboard = () => {
  // Sort winners by rank/amount
  const sortedLeaders = [...KNOW_CHAMP_WINNERS].sort((a, b) => a.rank - b.rank);
  const podium = [
    sortedLeaders[1], // Rank 2
    sortedLeaders[0], // Rank 1
    sortedLeaders[2], // Rank 3
  ];



  return (
    <div className="min-h-screen bg-[#090b15] text-white flex flex-col font-sans select-none overflow-x-hidden">
      <ScrollToTop />
      <Navbar />

      {/* Hero Header */}
      <div className="relative pt-32 pb-16 bg-gradient-to-b from-[#0a0715] via-[#100810] to-[#090b15] border-b border-gray-900 flex flex-col items-center text-center">
        <h1 className="text-3xl sm:text-5xl font-black mb-4 text-[#FFFFFF]">
          Leaderboard
        </h1>
        <p className="text-[#FFFFFF] max-w-xl mx-auto text-sm sm:text-base">
          Track top earners and compare your scores with other global players.
        </p>
      </div>

      <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 space-y-16">

        {/* Top 3 Podium section */}
        <div className="flex flex-col sm:flex-row items-end justify-center gap-6 pt-10 pb-4 max-w-4xl mx-auto w-full">

          {/* Rank 2 */}
          {podium[0] && (
            <div className="flex flex-col items-center flex-1 order-2 sm:order-1 bg-[#0e1121] border border-gray-800 rounded-2xl p-6 relative w-full sm:w-auto h-[260px] justify-between">
              <span className="absolute -top-3 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/20 text-slate-400 border border-slate-500/20">
                Rank 2
              </span>
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-400 bg-gray-800 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{podium[0].name.charAt(0)}</span>
              </div>
              <div className="text-center">
                <h4 className="font-bold text-white">{podium[0].name}</h4>
                <p className="text-xs text-[#FFFFFF]">{podium[0].contest}</p>
              </div>
              <div className="text-slate-400 font-extrabold text-lg">
                ₹{podium[0].amount.toLocaleString()}
              </div>
            </div>
          )}

          {/* Rank 1 (Middle, taller) */}
          {podium[1] && (
            <div className="flex flex-col items-center flex-1 order-1 sm:order-2 bg-[#12162c] border border-amber-500/30 rounded-3xl p-8 relative w-full sm:w-auto h-[320px] justify-between shadow-[0_15px_30px_rgba(245,158,11,0.05)]">
              {/* Crown symbol */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 drop-shadow-lg transform -rotate-12">
                <svg className="w-12 h-12 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 16L5 7L10 11L12 5L14 11L19 7L22 16H2Z" />
                </svg>
              </div>
              <span className="absolute -top-3 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/20">
                Rank 1
              </span>
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-amber-400 bg-gray-800 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{podium[1].name.charAt(0)}</span>
              </div>
              <div className="text-center">
                <h4 className="font-black text-white text-lg">{podium[1].name}</h4>
                <p className="text-xs text-[#FFFFFF]">{podium[1].contest}</p>
              </div>
              <div className="text-amber-400 font-black text-2xl">
                ₹{podium[1].amount.toLocaleString()}
              </div>
            </div>
          )}

          {/* Rank 3 */}
          {podium[2] && (
            <div className="flex flex-col items-center flex-1 order-3 sm:order-3 bg-[#0e1121] border border-gray-800 rounded-2xl p-6 relative w-full sm:w-auto h-[240px] justify-between">
              <span className="absolute -top-3 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-700/25 text-amber-600 border border-amber-700/25">
                Rank 3
              </span>
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-600 bg-gray-800 flex items-center justify-center">
                <span className="text-base font-bold text-white">{podium[2].name.charAt(0)}</span>
              </div>
              <div className="text-center">
                <h4 className="font-bold text-white">{podium[2].name}</h4>
                <p className="text-xs text-[#FFFFFF]">{podium[2].contest}</p>
              </div>
              <div className="text-amber-600 font-extrabold text-base">
                ₹{podium[2].amount.toLocaleString()}
              </div>
            </div>
          )}

        </div>



        {/* Global Standings Table */}
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Global Standings</h2>
          <div className="bg-[#0e1121] border border-gray-800/80 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-800 bg-[#12162c] text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Player</th>
                    <th className="px-6 py-4">Latest Contest</th>
                    <th className="px-6 py-4 text-right">Winnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {sortedLeaders.map((player, idx) => (
                    <tr key={idx} className="hover:bg-gray-800/20 transition duration-200">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${player.rank === 1 ? 'bg-amber-400 text-gray-950 font-black' :
                          player.rank === 2 ? 'bg-slate-400 text-[#FFFFFF] font-black' :
                            player.rank === 3 ? 'bg-amber-600 text-[#FFFFFF] font-black' :
                              'text-'
                          }`}>
                          {player.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 border border-gray-700 flex items-center justify-center text-xs text-gray-300">
                          {player.name.charAt(0)}
                        </div>
                        {player.name}
                      </td>
                      <td className="px-6 py-4 text-[#FFFFFF]">{player.contest}</td>
                      <td className="px-6 py-4 text-right font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                        ₹{player.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default Leaderboard;
