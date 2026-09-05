import React, { useState, useEffect } from 'react';
import Navbar from '../../components/know-champ/Navbar';
import Footer from '../../components/know-champ/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import ContestCard from '../../components/know-champ/ContestCard';
import QuizPlayModal from '../../components/know-champ/QuizPlayModal';
import AppDownloadModal from '../../components/know-champ/AppDownloadModal';
import { Trophy, Users, ArrowRight, Star, BookOpen, Mic, Lightbulb, Palette, Search } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import cmsService from '../../api/services/cmsService';
import { categoryService } from '../../api/services/categoryService';
import { contestService } from '../../api/services/contestService';
import { getImageUrl } from '../../api/services/api';
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

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Contest & Category States
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [contests, setContests] = useState([]);
  const [contestsLoading, setContestsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuizContest, setActiveQuizContest] = useState(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  const getCategoryTheme = (catName = '', catData = {}) => {
    const nameLower = (catName || '').toLowerCase();
    const iconVal = catData?.icon || '';
    const imgVal = catData?.image ? getImageUrl(catData.image) : '';

    let img = null;
    let icon = iconVal || '📚';

    if (imgVal && typeof imgVal === 'string' && imgVal.trim() !== '') {
      img = imgVal;
    } else if (iconVal && typeof iconVal === 'string' && (iconVal.startsWith('data:') || iconVal.startsWith('/') || iconVal.startsWith('http') || iconVal.startsWith('uploads/'))) {
      img = iconVal;
    } else if (iconVal === '🔬' || nameLower.includes('science')) {
      img = '/cat-science.png';
      icon = '🔬';
    } else if (iconVal === '💻' || iconVal === '🤖' || nameLower.includes('tech') || nameLower.includes('robot') || nameLower.includes('code') || nameLower.includes('computer')) {
      img = '/cat-technology.png';
      icon = iconVal || '💻';
    } else if (iconVal === '⚽' || nameLower.includes('sport') || nameLower.includes('cricket') || nameLower.includes('football') || nameLower.includes('game')) {
      img = '/cat-sports.png';
      icon = '⚽';
    } else if (iconVal === '🎬' || nameLower.includes('entertain') || nameLower.includes('movie') || nameLower.includes('music') || nameLower.includes('cinema') || nameLower.includes('song')) {
      img = '/cat-entertainment.png';
      icon = '🎬';
    } else if (iconVal === '📜' || nameLower.includes('history') || nameLower.includes('culture') || nameLower.includes('geo') || nameLower.includes('earth')) {
      img = '/cat-history.png';
      icon = '📜';
    } else if (iconVal === '📰' || nameLower.includes('current') || nameLower.includes('news') || nameLower.includes('affair') || nameLower.includes('today')) {
      img = '/cat-current.png';
      icon = '📰';
    } else if (nameLower.includes('health') || nameLower.includes('medic') || nameLower.includes('environ') || nameLower.includes('nature')) {
      img = '/cat-science.png';
      icon = '🩺';
    } else if (nameLower.includes('brain') || nameLower.includes('math') || nameLower.includes('logic') || nameLower.includes('iq')) {
      img = '/Knowledge.png';
      icon = '🧠';
    } else {
      const presets = ['/cat-science.png', '/cat-technology.png', '/cat-sports.png', '/cat-entertainment.png', '/cat-history.png', '/cat-current.png', '/Knowledge.png'];
      const charSum = nameLower.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      img = presets[charSum % presets.length];
      icon = iconVal || '📚';
    }

    return {
      icon: icon,
      image: img,
      colorClass: 'text-red-500 bg-[#0e1121] border-red-500/20',
      borderGlowClass: catData?.colorClass || 'hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]',
    };
  };

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

    const fetchCategoriesAndContests = async () => {
      try {
        setCategoriesLoading(true);
        setContestsLoading(true);
        const [catRes, cntRes] = await Promise.all([
          categoryService.getPublicCategories(),
          contestService.getPublicContests(),
        ]);

        const fetchedCats = catRes?.success && Array.isArray(catRes.data) ? catRes.data : [];
        const fetchedCnts = cntRes?.success && Array.isArray(cntRes.data) ? cntRes.data : [];

        if (isMounted) {
          setCategories(fetchedCats);
          setContests(fetchedCnts);

          // Populate/enrich leaguesCatalog dynamically with live categories and contest metrics
          if (fetchedCats.length > 0 || fetchedCnts.length > 0) {
            setLeaguesCatalog((prev) => {
              const updated = { ...prev };

              fetchedCats.forEach((cat, idx) => {
                const catSlug = (cat.name || `cat-${idx}`).toLowerCase().replace(/\s+/g, '-');
                const catTheme = getCategoryTheme(cat.name, cat);
                const relatedContests = fetchedCnts.filter(
                  (c) => (c.category?.name || c.category || '').toLowerCase() === cat.name.toLowerCase()
                );
                const firstContest = relatedContests[0];

                const entryFeeVal = firstContest
                  ? `₹${parseFloat(firstContest.entryFee || firstContest.entry || 0).toFixed(2)}`
                  : '₹10.00';
                const maxScoreVal = firstContest
                  ? `₹${parseFloat(firstContest.prizePool || firstContest.prize || 100).toLocaleString()}`
                  : '100.00';
                const scheduleVal = firstContest?.startTime
                  ? new Date(firstContest.startTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', 10:00 AM'
                  : 'Live Competition';

                if (!updated[catSlug]) {
                  updated[catSlug] = {
                    slug: catSlug,
                    name: `${cat.name} League`,
                    tagline: `Compete in ${cat.name} quizzes, test your knowledge, and win championship rewards.`,
                    ageGroup: 'All Ages',
                    code: `K${idx + 1}`,
                    schedule: scheduleVal,
                    entryFee: entryFeeVal,
                    maxScore: maxScoreVal,
                    emoji: catTheme.icon || '🏆',
                    icon: Trophy,
                    gradient: 'from-[#0b0c16] via-[#120917] to-[#090b15]',
                    accentColor: '#EF4444',
                  };
                } else {
                  updated[catSlug] = {
                    ...updated[catSlug],
                    entryFee: firstContest ? entryFeeVal : updated[catSlug].entryFee,
                    maxScore: firstContest ? maxScoreVal : updated[catSlug].maxScore,
                    schedule: firstContest ? scheduleVal : updated[catSlug].schedule,
                  };
                }
              });

              return updated;
            });
          }
        }
      } catch (err) {
        console.error('Error fetching categories & contests:', err);
      } finally {
        if (isMounted) {
          setCategoriesLoading(false);
          setContestsLoading(false);
        }
      }
    };

    fetchExcellenceCms();
    fetchCategoriesAndContests();

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
      if (isMounted) {
        fetchExcellenceCms();
        fetchCategoriesAndContests();
      }
    }, 4000);

    const handleFocus = () => {
      if (isMounted) {
        fetchExcellenceCms();
        fetchCategoriesAndContests();
      }
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

  const filteredContests = contests.filter((contest) => {
    const catName = contest.category?.name || contest.category || 'General Knowledge';
    const matchesCategory = selectedCategory === 'All' || catName.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = contest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
                <button
                  type="button"
                  onClick={() => setIsDownloadModalOpen(true)}
                  style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #991B1B 100%)',
                    boxShadow: '0 4px 18px rgba(239, 68, 68, 0.4)',
                  }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white font-bold rounded-xl text-sm sm:text-base tracking-wide transition-all duration-300 hover:opacity-95 hover:scale-[1.02] cursor-pointer"
                >
                  <span>Register Student</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm sm:text-base border border-white/20 backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  Login to Participate
                </Link>
              </div>
            </div>

            {/* Right Information Card (Dark Website Theme Card) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="bg-[#0e1121] text-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-800/80 max-w-md w-full">

                {/* Trophy Icon */}
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Trophy className="w-8 h-8 stroke-[2.5]" />
                </div>

                <h3 className="text-xl font-extrabold text-white text-center tracking-tight">
                  {activeLeague.name}
                </h3>
                <p className="text-xs text-gray-400 font-medium text-center mb-6">
                  Answer right. Shine bright.
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#12162c] border border-gray-800/80 p-3.5 rounded-2xl">
                    <span className="text-[11px] font-semibold text-gray-400 block">Age Group</span>
                    <span className="text-xs sm:text-sm font-extrabold text-white mt-0.5 block">{activeLeague.ageGroup}</span>
                  </div>

                  <div className="bg-[#12162c] border border-gray-800/80 p-3.5 rounded-2xl">
                    <span className="text-[11px] font-semibold text-gray-400 block">Entry Fee</span>
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-400 mt-0.5 block">{activeLeague.entryFee}</span>
                  </div>

                  <div className="bg-[#12162c] border border-gray-800/80 p-3.5 rounded-2xl col-span-2">
                    <span className="text-[11px] font-semibold text-gray-400 block">Competition Schedule</span>
                    <span className="text-xs sm:text-sm font-extrabold text-white mt-0.5 block">{activeLeague.schedule}</span>
                  </div>

                  <div className="bg-[#12162c] border border-gray-800/80 p-3.5 rounded-2xl">
                    <span className="text-[11px] font-semibold text-gray-400 block">Maximum Score</span>
                    <span className="text-xs sm:text-sm font-extrabold text-white mt-0.5 block">{activeLeague.maxScore}</span>
                  </div>

                  <div className="bg-[#12162c] border border-gray-800/80 p-3.5 rounded-2xl">
                    <span className="text-[11px] font-semibold text-gray-400 block">League Code</span>
                    <span className="text-xs sm:text-sm font-extrabold text-white mt-0.5 block">{activeLeague.code}</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── 2. Active Excellence Contests Section ── */}
      <div className="w-[calc(100%-24px)] sm:w-[calc(100%-32px)] max-w-[1425px] mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-16 flex-1">
        <div className="flex flex-col gap-3 sm:gap-4 justify-between items-center mb-6 sm:mb-10 bg-[#0e1121] border border-gray-800/80 p-3 sm:p-4 rounded-2xl w-full">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search contests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#14182e] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder-gray-500 text-white focus:outline-none focus:border-red-500 transition duration-300"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-300 border whitespace-nowrap flex-shrink-0 cursor-pointer ${selectedCategory === 'All'
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'bg-[#14182e] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
                }`}
            >
              All Contests
            </button>
            {categories.map((cat, idx) => {
              const catTheme = getCategoryTheme(cat.name, cat);
              return (
                <button
                  key={cat.id || idx}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-300 border flex items-center gap-1 sm:gap-1.5 whitespace-nowrap flex-shrink-0 cursor-pointer ${selectedCategory === cat.name
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'bg-[#14182e] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
                    }`}
                >
                  <span>{catTheme.icon}</span>
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contests Cards Grid */}
        {contestsLoading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <ContestCard key={index} isLoading={true} />
            ))}
          </div>
        ) : (filteredContests || []).filter(Boolean).length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {(filteredContests || []).filter(Boolean).map((contest, index) => {
              if (!contest) return null;
              const categoryName = contest.category?.name || contest.category || 'General Knowledge';
              const catTheme = getCategoryTheme(categoryName, contest.category);
              const prize = contest.prizePool !== undefined ? parseFloat(contest.prizePool) : (contest.prize || 0);
              const entry = contest.entryFee !== undefined ? parseFloat(contest.entryFee) : (contest.entry || 0);
              const joined = contest.joined !== undefined ? contest.joined : 0;
              const image = getImageUrl(contest.image) || catTheme.image || catTheme.icon;
              const date = contest?.startTime
                ? new Date(contest.startTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', 10:00 Am'
                : (contest?.date || '');

              return (
                <ContestCard
                  key={contest.id || index}
                  id={contest.id}
                  category={categoryName}
                  title={contest.title}
                  prize={prize}
                  entry={entry}
                  joined={joined}
                  maxPlayers={contest.maxParticipants || contest.maxPlayers}
                  icon={catTheme.icon}
                  colorClass={catTheme.colorClass}
                  image={image}
                  date={date}
                  contest={contest}
                  onPlay={(selectedCnt) => {
                    setActiveQuizContest({
                      ...selectedCnt,
                      category: categoryName,
                      prize,
                      entry,
                    });
                    setIsQuizModalOpen(true);
                  }}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-20 bg-[#0e1121] rounded-2xl border border-gray-800/80">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🔍</div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1">No Contests Found</h3>
            <p className="text-xs sm:text-sm text-gray-500">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

      {/* Interactive Quiz Play Modal */}
      <QuizPlayModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        contest={activeQuizContest}
      />

      <Footer />

      {/* App Download Modal */}
      <AppDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
};

export default ExcellenceLeague;

