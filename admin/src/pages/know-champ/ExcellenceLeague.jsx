import React, { useState, useEffect } from 'react';
import Navbar from '../../components/know-champ/Navbar';
import Footer from '../../components/know-champ/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import { Trophy, Users, ArrowRight, Star, BookOpen, Mic, Lightbulb, Palette } from 'lucide-react';
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
    gradient: 'from-[#0b0c16] via-[#120917] to-[#090b15]',
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
    gradient: 'from-[#0b0c16] via-[#120917] to-[#090b15]',
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
    gradient: 'from-[#0b0c16] via-[#120917] to-[#090b15]',
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
    gradient: 'from-[#0b0c16] via-[#120917] to-[#090b15]',
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
    gradient: 'from-[#0b0c16] via-[#120917] to-[#090b15]',
    accentColor: '#a855f7',
  },
};

const ExcellenceLeague = () => {
  const { leagueSlug } = useParams();
  const navigate = useNavigate();
  const [selectedSlug, setSelectedSlug] = useState('creative-league');

  const [leaguesCatalog, setLeaguesCatalog] = useState(LEAGUES_CATALOG);

  const [hero, setHero] = useState({
    title: 'Excellence League',
    subtitle: 'Compete in live timed quiz battles, climb tier rankings, and win weekly championship rewards.',
  });

  const [loading, setLoading] = useState(true);

  // Sync selected league slug from route or default
  useEffect(() => {
    if (leagueSlug && leaguesCatalog[leagueSlug]) {
      setSelectedSlug(leagueSlug);
    } else {
      setSelectedSlug('creative-league');
    }
  }, [leagueSlug, leaguesCatalog]);

  const activeLeague = leaguesCatalog[selectedSlug] || leaguesCatalog['creative-league'];

  const handleSelectLeague = (slug) => {
    setSelectedSlug(slug);
    navigate(`/excellence-leagues/${slug}`, { replace: true });
  };

  useEffect(() => {
    let isMounted = true;

    const processCmsData = (data) => {
      if (!data) return;
      if (data.hero?.title) setHero(data.hero);
      if (data.leagues && typeof data.leagues === 'object') {
        setLeaguesCatalog((prev) => {
          const updated = { ...prev };
          Object.keys(data.leagues).forEach((key) => {
            if (updated[key]) {
              updated[key] = { ...updated[key], ...data.leagues[key] };
            } else {
              updated[key] = data.leagues[key];
            }
          });
          return updated;
        });
      }
    };

    const fetchExcellenceCms = async () => {
      try {
        const res = await cmsService.getPublicExcellenceLeague();
        if (isMounted && res?.success && res.data) {
          processCmsData(res.data);
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
        processCmsData(updatedData);
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

  return (
    <div className="min-h-screen bg-[#090b15] text-white flex flex-col font-sans select-none overflow-x-hidden">
      <ScrollToTop />
      <Navbar />

      {/* ── 1. Hero Section (Matching Website Design Background) ── */}
      <div className={`relative pt-32 pb-20 bg-gradient-to-b ${activeLeague.gradient || 'from-[#0b0c16] via-[#120917] to-[#090b15]'} overflow-hidden border-b border-gray-900 shadow-2xl`}>

        {/* Ambient Background Glow Circles */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* League Switcher Selector Bar */}
          <div className="mb-8 flex flex-wrap items-center justify-center lg:justify-start gap-2 bg-black/30 p-2 rounded-2xl border border-white/10 backdrop-blur-md max-w-fit">
            {Object.values(leaguesCatalog).map((lg) => (
              <button
                key={lg.slug}
                onClick={() => handleSelectLeague(lg.slug)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedSlug === lg.slug
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
                  to="/register"
                  style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #991B1B 100%)',
                    boxShadow: '0 4px 18px rgba(239, 68, 68, 0.4)',
                  }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white font-bold rounded-xl text-sm sm:text-base tracking-wide transition-all duration-300 hover:opacity-95 hover:scale-[1.02] cursor-pointer"
                >
                  <span>Register Student</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm sm:text-base border border-white/20 backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  Login to Participate
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

      <Footer />
    </div>
  );
};

export default ExcellenceLeague;
