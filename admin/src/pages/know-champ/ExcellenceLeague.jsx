import React, { useState, useEffect } from 'react';
import Navbar from '../../components/know-champ/Navbar';
import Footer from '../../components/know-champ/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import { Crown, CheckCircle2, Trophy, Users, ArrowRight, Sparkles, ShieldCheck, Calendar, DollarSign, Award, Star, BookOpen, Mic, Lightbulb, Palette } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import cmsService from '../../api/services/cmsService';
import { initAdminSocket } from '../../api/services/adminSocketService';

// ── 5 Excellence Leagues Catalog Data ──
const LEAGUES_CATALOG = {
  'creative-league': {
    slug: 'creative-league',
    name: 'Creative League',
    tagline: 'Identification of imagination, artistic expression, observation, and creative thinking.',
    ageGroup: '3–5 Years',
    code: 'K1',
    schedule: '14 Nov 2026, 10:00 AM',
    entryFee: '₹100.00',
    maxScore: '100.00',
    emoji: '🎨',
    icon: Palette,
    gradient: 'from-[#1b0a3a] via-[#3b0944] to-[#610d47]',
    accentColor: '#ec4899',
  },
  'knowledge-league': {
    slug: 'knowledge-league',
    name: 'Knowledge League',
    tagline: 'Fostering general awareness, curiosity, critical thinking, and core knowledge foundation.',
    ageGroup: '6–8 Years',
    code: 'K2',
    schedule: '15 Nov 2026, 10:00 AM',
    entryFee: '₹100.00',
    maxScore: '100.00',
    emoji: '📚',
    icon: BookOpen,
    gradient: 'from-[#0b1938] via-[#122b54] to-[#1e4079]',
    accentColor: '#3b82f6',
  },
  'communication-league': {
    slug: 'communication-league',
    name: 'Communication League',
    tagline: 'Enhancing storytelling, public speaking, dynamic expression, and clear articulation.',
    ageGroup: '9–12 Years',
    code: 'K3',
    schedule: '16 Nov 2026, 10:00 AM',
    entryFee: '₹100.00',
    maxScore: '100.00',
    emoji: '🎤',
    icon: Mic,
    gradient: 'from-[#331c08] via-[#4d2a0b] to-[#733f10]',
    accentColor: '#f59e0b',
  },
  'innovation-league': {
    slug: 'innovation-league',
    name: 'Innovation League',
    tagline: 'Encouraging practical problem solving, tech concepts, innovation, and creative thinking.',
    ageGroup: '13–16 Years',
    code: 'K4',
    schedule: '17 Nov 2026, 10:00 AM',
    entryFee: '₹100.00',
    maxScore: '100.00',
    emoji: '💡',
    icon: Lightbulb,
    gradient: 'from-[#08291b] via-[#0d422c] to-[#146142]',
    accentColor: '#10b981',
  },
  'character-league': {
    slug: 'character-league',
    name: 'Character League',
    tagline: 'Developing personality, leadership, ethics, integrity, and character assessment.',
    ageGroup: '17–19 Years',
    code: 'K5',
    schedule: '18 Nov 2026, 10:00 AM',
    entryFee: '₹100.00',
    maxScore: '100.00',
    emoji: '🌟',
    icon: Star,
    gradient: 'from-[#280838] via-[#430f5b] to-[#67178c]',
    accentColor: '#a855f7',
  },
};

const ExcellenceLeague = () => {
  const { leagueSlug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('weekly');
  const [selectedSlug, setSelectedSlug] = useState('creative-league');

  const [hero, setHero] = useState({
    title: 'Excellence League',
    subtitle: 'Compete in live timed quiz battles, climb tier rankings, and win weekly championship rewards.',
  });

  const [leagueLeaders, setLeagueLeaders] = useState([]);
  const [leagueTiers, setLeagueTiers] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync selected league slug from route or default
  useEffect(() => {
    if (leagueSlug && LEAGUES_CATALOG[leagueSlug]) {
      setSelectedSlug(leagueSlug);
    } else {
      setSelectedSlug('creative-league');
    }
  }, [leagueSlug]);

  const activeLeague = LEAGUES_CATALOG[selectedSlug] || LEAGUES_CATALOG['creative-league'];

  const handleSelectLeague = (slug) => {
    setSelectedSlug(slug);
    navigate(`/excellence-leagues/${slug}`, { replace: true });
  };

  useEffect(() => {
    let isMounted = true;

    const fetchExcellenceCms = async () => {
      try {
        const res = await cmsService.getPublicExcellenceLeague();
        if (isMounted && res?.success && res.data) {
          if (res.data.hero?.title) setHero(res.data.hero);
          if (Array.isArray(res.data.tiers)) setLeagueTiers(res.data.tiers);
          if (Array.isArray(res.data.leaders)) setLeagueLeaders(res.data.leaders);
          if (Array.isArray(res.data.rules)) setRules(res.data.rules);
        }
      } catch (err) {
        console.error('Error fetching Excellence League CMS:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchExcellenceCms();

    // Socket listener for instant updates
    const socket = initAdminSocket();
    const handleCmsUpdate = (updatedData) => {
      if (updatedData) {
        if (updatedData.hero?.title) setHero(updatedData.hero);
        if (Array.isArray(updatedData.tiers)) setLeagueTiers(updatedData.tiers);
        if (Array.isArray(updatedData.leaders)) setLeagueLeaders(updatedData.leaders);
        if (Array.isArray(updatedData.rules)) setRules(updatedData.rules);
      }
    };
    socket.on('cms_excellence_league_updated', handleCmsUpdate);

    // Polling fallback
    const pollInterval = setInterval(() => {
      if (isMounted) fetchExcellenceCms();
    }, 4000);

    const handleFocus = () => {
      if (isMounted) fetchExcellenceCms();
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      isMounted = false;
      socket.off('cms_excellence_league_updated', handleCmsUpdate);
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  const sortedLeaders = [...leagueLeaders].sort((a, b) => (a.rank || 0) - (b.rank || 0));
  const podium = [
    sortedLeaders[1], // Rank 2
    sortedLeaders[0], // Rank 1
    sortedLeaders[2], // Rank 3
  ];

  return (
    <div className="min-h-screen bg-[#090b15] text-white flex flex-col font-sans select-none overflow-x-hidden">
      <ScrollToTop />
      <Navbar />

      {/* ── 1. Hero Section (Matching Creative League Reference Screenshot) ── */}
      <div className={`relative pt-32 pb-20 bg-gradient-to-br ${activeLeague.gradient} overflow-hidden border-b border-purple-950/60 shadow-2xl`}>

        {/* Ambient Background Glow Circles */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* League Switcher Selector Bar */}
          <div className="mb-8 flex flex-wrap items-center justify-center lg:justify-start gap-2 bg-black/30 p-2 rounded-2xl border border-white/10 backdrop-blur-md max-w-fit">
            {Object.values(LEAGUES_CATALOG).map((lg) => (
              <button
                key={lg.slug}
                onClick={() => handleSelectLeague(lg.slug)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedSlug === lg.slug
                    ? 'bg-white text-gray-950 shadow-lg scale-105 font-black'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{lg.emoji}</span>
                <span>{lg.name}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Left Content Area */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-sm">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Excellence League</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight font-['Montserrat']">
                {activeLeague.name}
              </h1>

              {/* Subtitle Tagline */}
              <p className="text-gray-200 text-sm sm:text-base lg:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                {activeLeague.tagline}
              </p>

              {/* Status Badges Row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Registration Open
                </span>

                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-blue-500/20 text-blue-200 border border-blue-500/30 backdrop-blur-md">
                  <Users className="w-4 h-4 text-blue-300" />
                  {activeLeague.ageGroup}
                </span>

                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-white/10 text-white border border-white/20 backdrop-blur-md">
                  # {activeLeague.code}
                </span>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/login"
                  style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #991B1B 100%)',
                    boxShadow: '0 4px 18px rgba(239, 68, 68, 0.4)',
                  }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white font-bold rounded-xl text-sm sm:text-base tracking-wide transition-all duration-300 hover:opacity-95 hover:scale-[1.02] cursor-pointer"
                >
                  <span>Login to Participate</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-xl text-sm sm:text-base shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  Register Student
                </Link>
              </div>
            </div>

            {/* Right Information Card (Matching Reference Screenshot White Box) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="bg-white text-gray-900 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 max-w-md w-full">
                
                {/* Trophy Icon */}
                <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Trophy className="w-8 h-8 stroke-[2.5]" />
                </div>

                <h3 className="text-xl font-extrabold text-gray-900 text-center tracking-tight">
                  {activeLeague.name}
                </h3>
                <p className="text-xs text-gray-500 font-medium text-center mb-6">
                  Answer right. Shine bright.
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 border border-gray-150 p-3.5 rounded-2xl">
                    <span className="text-[11px] font-semibold text-gray-500 block">Age Group</span>
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900 mt-0.5 block">{activeLeague.ageGroup}</span>
                  </div>

                  <div className="bg-gray-50 border border-gray-150 p-3.5 rounded-2xl">
                    <span className="text-[11px] font-semibold text-gray-500 block">Entry Fee</span>
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900 mt-0.5 block">{activeLeague.entryFee}</span>
                  </div>

                  <div className="bg-gray-50 border border-gray-150 p-3.5 rounded-2xl col-span-2">
                    <span className="text-[11px] font-semibold text-gray-500 block">Competition Schedule</span>
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900 mt-0.5 block">{activeLeague.schedule}</span>
                  </div>

                  <div className="bg-gray-50 border border-gray-150 p-3.5 rounded-2xl">
                    <span className="text-[11px] font-semibold text-gray-500 block">Maximum Score</span>
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900 mt-0.5 block">{activeLeague.maxScore}</span>
                  </div>

                  <div className="bg-gray-50 border border-gray-150 p-3.5 rounded-2xl">
                    <span className="text-[11px] font-semibold text-gray-500 block">League Code</span>
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900 mt-0.5 block">{activeLeague.code}</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>

      <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 space-y-16">

        {/* ── 2. Top 3 Podium Section ── */}
        <div className="flex flex-col sm:flex-row items-end justify-center gap-6 pt-6 pb-4 max-w-4xl mx-auto w-full">

          {/* Rank 2 */}
          {podium[0] && (
            <div className="flex flex-col items-center flex-1 order-2 sm:order-1 bg-[#0e1121] border border-gray-800 rounded-2xl p-6 relative w-full sm:w-auto h-[260px] justify-between shadow-lg">
              <span className="absolute -top-3 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/20 text-slate-400 border border-slate-500/20">
                Rank 2
              </span>
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-400 bg-gray-800 flex items-center justify-center">
                {podium[0].image ? (
                  <img
                    src={podium[0].image}
                    alt={podium[0].name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <span className="text-lg font-bold text-white">{podium[0].name ? podium[0].name.charAt(0) : 'P'}</span>
                )}
              </div>
              <div className="text-center">
                <h4 className="font-bold text-white">{podium[0].name}</h4>
                <p className="text-xs text-gray-400">{podium[0].contest}</p>
              </div>
              <div className="text-slate-400 font-extrabold text-lg">
                ₹{Number(podium[0].amount || 0).toLocaleString()}
              </div>
            </div>
          )}

          {/* Rank 1 (Middle, taller) */}
          {podium[1] && (
            <div className="flex flex-col items-center flex-1 order-1 sm:order-2 bg-[#12162c] border border-amber-500/30 rounded-3xl p-8 relative w-full sm:w-auto h-[320px] justify-between shadow-[0_15px_30px_rgba(245,158,11,0.08)]">
              {/* Crown symbol */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 drop-shadow-lg transform -rotate-12">
                <Crown className="w-12 h-12 text-amber-400" />
              </div>
              <span className="absolute -top-3 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/20">
                Rank 1
              </span>
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-amber-400 bg-gray-800 flex items-center justify-center">
                {podium[1].image ? (
                  <img
                    src={podium[1].image}
                    alt={podium[1].name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">{podium[1].name ? podium[1].name.charAt(0) : 'P'}</span>
                )}
              </div>
              <div className="text-center">
                <h4 className="font-black text-white text-lg">{podium[1].name}</h4>
                <p className="text-xs text-gray-400">{podium[1].contest}</p>
              </div>
              <div className="text-amber-400 font-black text-2xl">
                ₹{Number(podium[1].amount || 0).toLocaleString()}
              </div>
            </div>
          )}

          {/* Rank 3 */}
          {podium[2] && (
            <div className="flex flex-col items-center flex-1 order-3 sm:order-3 bg-[#0e1121] border border-gray-800 rounded-2xl p-6 relative w-full sm:w-auto h-[240px] justify-between shadow-lg">
              <span className="absolute -top-3 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-700/25 text-amber-600 border border-amber-700/25">
                Rank 3
              </span>
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-600 bg-gray-800 flex items-center justify-center">
                {podium[2].image ? (
                  <img
                    src={podium[2].image}
                    alt={podium[2].name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <span className="text-base font-bold text-white">{podium[2].name ? podium[2].name.charAt(0) : 'P'}</span>
                )}
              </div>
              <div className="text-center">
                <h4 className="font-bold text-white">{podium[2].name}</h4>
                <p className="text-xs text-gray-400">{podium[2].contest}</p>
              </div>
              <div className="text-amber-600 font-extrabold text-base">
                ₹{Number(podium[2].amount || 0).toLocaleString()}
              </div>
            </div>
          )}

        </div>

        {/* ── 3. League Tier Divisions Grid ── */}
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">League Tier Divisions</h2>
          {leagueTiers.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#0e1121] border border-gray-800 text-center text-gray-400 text-sm">
              {loading ? 'Loading league tier divisions...' : 'No league tier divisions configured.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {leagueTiers.map((tier, idx) => (
                <div
                  key={tier.id || idx}
                  className="p-5 rounded-2xl bg-[#0e1121] border border-gray-800 flex flex-col justify-between space-y-3 hover:border-gray-700 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{tier.icon || '🏆'}</span>
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
                        {tier.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{tier.name}</h3>
                    <p className="text-xs font-semibold text-amber-400 mt-0.5">{tier.minRating}</p>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">{tier.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs">
                    <span className="text-gray-500">Prize Share</span>
                    <span className="font-bold text-white">{tier.poolShare}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 4. Global Standings Table ── */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">League Standings</h2>

            {/* Filter Tabs */}
            <div className="inline-flex p-1 rounded-xl bg-[#0e1121] border border-gray-800">
              {['daily', 'weekly', 'all-time'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-[#EF4444] text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#0e1121] border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-800 bg-[#12162c] text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Player</th>
                    <th className="px-6 py-4">Tier</th>
                    <th className="px-6 py-4">Points</th>
                    <th className="px-6 py-4 text-right">Winnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {sortedLeaders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                        {loading ? 'Loading league standings...' : 'No league standings available.'}
                      </td>
                    </tr>
                  ) : (
                    sortedLeaders.map((player, idx) => (
                      <tr key={player.id || idx} className="hover:bg-gray-800/20 transition duration-200">
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            (player.rank || idx + 1) === 1 ? 'bg-amber-400 text-gray-950 font-black' :
                            (player.rank || idx + 1) === 2 ? 'bg-slate-400 text-white font-black' :
                            (player.rank || idx + 1) === 3 ? 'bg-amber-600 text-white font-black' :
                            'text-gray-400'
                          }`}>
                            {player.rank || idx + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-800 border border-gray-700 flex items-center justify-center text-xs text-gray-300 shrink-0">
                            {player.image ? (
                              <img
                                src={player.image}
                                alt={player.name}
                                className="w-full h-full object-cover object-top"
                              />
                            ) : (
                              <span>{player.name ? player.name.charAt(0) : 'P'}</span>
                            )}
                          </div>
                          <div>
                            <p className="leading-tight">{player.name}</p>
                            <span className="text-[11px] text-gray-400 font-normal">{player.city || 'India'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300 text-xs font-semibold">{player.tier || 'Pro Master'}</td>
                        <td className="px-6 py-4 text-amber-400 font-bold">{player.points || '10,000 PTS'}</td>
                        <td className="px-6 py-4 text-right font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                          ₹{Number(player.amount || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── 5. Rules Section ── */}
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">League Rules & Fair Play</h2>
          {rules.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#0e1121] border border-gray-800 text-center text-gray-400 text-sm">
              {loading ? 'Loading league rules...' : 'No league rules configured.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rules.map((rule, idx) => (
                <div key={rule.id || idx} className="p-4 rounded-xl bg-[#0e1121] border border-gray-800 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{rule.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default ExcellenceLeague;

