import React, { useState, useEffect } from 'react';
import Navbar from '../../components/know-champ/Navbar';
import Footer from '../../components/know-champ/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import ContestCard from '../../components/know-champ/ContestCard';
import { Trophy, Users, ArrowRight, Info, Calendar, Coins, Clock, AlertCircle, Award, FileText, Sparkles } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import cmsService from '../../api/services/cmsService';
import contestService from '../../api/services/contestService';
import categoryService from '../../api/services/categoryService';
import { initAdminSocket } from '../../api/services/adminSocketService';
import AppDownloadModal from '../../components/know-champ/AppDownloadModal';
import { getImageUrl } from '../../api/services/api';

// ── Default Top 5 Preset Categories Fallback ──
const DEFAULT_CATEGORIES = [
  {
    id: 1,
    name: 'Creative League',
    slug: 'creative-league',
    icon: '🎨',
    description: 'Identification of imagination, artistic expression, observation, and creative thinking.',
    ageGroup: '3–5',
    code: 'K1',
  },
  {
    id: 2,
    name: 'Knowledge League',
    slug: 'knowledge-league',
    icon: '📚',
    description: 'Encouraging practical problem solving, general awareness, critical thinking, and core knowledge.',
    ageGroup: '6–8',
    code: 'K2',
  },
  {
    id: 3,
    name: 'Communication League',
    slug: 'communication-league',
    icon: '🎤',
    description: 'Enhancing storytelling, public speaking, dynamic expression, and clear articulation.',
    ageGroup: '9–12',
    code: 'K3',
  },
  {
    id: 4,
    name: 'Innovation League',
    slug: 'innovation-league',
    icon: '💡',
    description: 'Encouraging practical problem solving, tech concepts, innovation, and creative thinking.',
    ageGroup: '13–16',
    code: 'K4',
  },
  {
    id: 5,
    name: 'Character League',
    slug: 'character-league',
    icon: '🌟',
    description: 'Developing personality, leadership, ethics, integrity, and character assessment.',
    ageGroup: '17–19',
    code: 'K5',
  },
];

const PRESET_METRICS = [
  { ageGroup: '3–5', code: 'K1', desc: 'Identification of imagination, artistic expression, observation, and creative thinking.' },
  { ageGroup: '6–8', code: 'K2', desc: 'Encouraging practical problem solving, general awareness, critical thinking, and core knowledge.' },
  { ageGroup: '9–12', code: 'K3', desc: 'Enhancing storytelling, public speaking, dynamic expression, and clear articulation.' },
  { ageGroup: '13–16', code: 'K4', desc: 'Encouraging practical problem solving, tech concepts, innovation, and creative thinking.' },
  { ageGroup: '17–19', code: 'K5', desc: 'Developing personality, leadership, ethics, integrity, and character assessment.' },
];

const ExcellenceLeague = () => {
  const { leagueSlug } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [contests, setContests] = useState([]);

  const [hero, setHero] = useState({
    title: 'Excellence League',
    subtitle: 'Compete in live timed quiz battles, climb tier rankings, and win weekly championship rewards.',
  });

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch top 5 categories & public contests dynamically (same API as /contests page)
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        // 1. Fetch categories from backend
        const catRes = await categoryService.getPublicCategories();
        if (isMounted && catRes?.success && Array.isArray(catRes.data) && catRes.data.length > 0) {
          const top5 = catRes.data.slice(0, 5);
          setCategories(top5);
        }

        // 2. Fetch contests from backend
        const cntRes = await contestService.getPublicContests();
        if (isMounted && cntRes?.success && Array.isArray(cntRes.data)) {
          setContests(cntRes.data);
        }
      } catch (err) {
        console.error('Error loading categories or contests for Excellence League:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(() => {
      if (isMounted) loadData();
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Compute active categories list (top 5 categories)
  const activeCategoriesList = (categories && categories.length > 0) ? categories.slice(0, 5) : DEFAULT_CATEGORIES;

  // Sync selected slug from route or set default to top 1 category
  useEffect(() => {
    if (activeCategoriesList.length > 0) {
      if (leagueSlug) {
        const found = activeCategoriesList.find(
          (c) => (c.slug || c.name.toLowerCase()) === leagueSlug.toLowerCase()
        );
        if (found) {
          setSelectedSlug((found.slug || found.name).toLowerCase());
          return;
        }
      }
      setSelectedSlug((activeCategoriesList[0].slug || activeCategoriesList[0].name).toLowerCase());
    }
  }, [leagueSlug, categories]);

  const activeCategoryIndex = Math.max(
    0,
    activeCategoriesList.findIndex(
      (c) => (c.slug || c.name).toLowerCase() === (selectedSlug || '').toLowerCase()
    )
  );

  const rawActiveCategory = activeCategoriesList[activeCategoryIndex] || activeCategoriesList[0];

  const activeCategory = {
    ...rawActiveCategory,
    ageGroup: rawActiveCategory.ageGroup || PRESET_METRICS[activeCategoryIndex % 5].ageGroup,
    code: rawActiveCategory.code || PRESET_METRICS[activeCategoryIndex % 5].code,
    description: rawActiveCategory.description || PRESET_METRICS[activeCategoryIndex % 5].desc,
  };

  const handleSelectCategory = (cat) => {
    const slugVal = (cat.slug || cat.name).toLowerCase();
    setSelectedSlug(slugVal);
    navigate(`/excellence-leagues/${slugVal}`, { replace: true });
  };

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
    } else if (iconVal === '🎨' || nameLower.includes('creative') || nameLower.includes('art')) {
      img = '/cat-science.png';
      icon = '🎨';
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
    } else if (iconVal === '🎤' || nameLower.includes('speak') || nameLower.includes('communication')) {
      img = '/Knowledge.png';
      icon = '🎤';
    } else {
      const presets = ['/cat-science.png', '/cat-technology.png', '/cat-sports.png', '/cat-entertainment.png', '/cat-history.png', '/cat-current.png', '/Knowledge.png'];
      const charSum = nameLower.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      img = presets[charSum % presets.length];
      icon = iconVal || '📚';
    }

    return {
      icon: icon,
      image: img,
      colorClass: 'text-red-500 bg-red-500/10 border-red-500/20',
    };
  };

  const getMatchedContest = (catObj, contestsList) => {
    if (!catObj) return null;
    const catName = (catObj.name || '').toLowerCase();
    const catSlug = (catObj.slug || '').toLowerCase();

    // 1. Search for public contest matching this category
    let matched = Array.isArray(contestsList) ? contestsList.find((c) => {
      if (!c) return false;
      const title = (c.title || '').toLowerCase();
      const contestCatName = (c.category?.name || c.category || '').toLowerCase();

      return contestCatName.includes(catName) || title.includes(catName) || (catSlug && contestCatName.includes(catSlug));
    }) : null;

    // 2. Fallback matching by index
    if (!matched && Array.isArray(contestsList) && contestsList.length > 0) {
      const idx = activeCategoriesList.findIndex(
        (c) => (c.slug || c.name).toLowerCase() === (catObj.slug || catObj.name).toLowerCase()
      );
      if (idx !== -1 && contestsList[idx]) {
        matched = contestsList[idx];
      } else {
        matched = contestsList[0];
      }
    }

    // 3. Fallback object if no backend contests exist
    if (!matched) {
      matched = {
        id: catObj.id || catObj.slug,
        title: `${catObj.name} Champions`,
        category: { name: catObj.name, icon: catObj.icon, image: catObj.image },
        prizePool: 30000,
        entryFee: 100,
        joined: 0,
        startTime: new Date('2026-11-14T10:00:00Z'),
      };
    }

    return matched;
  };

  // Helper to generate dynamic content sections based on matched Contest data
  const getLeagueFullDetails = (activeCat, matchedContest) => {
    const catName = activeCat?.name || 'Contest';
    const contestTitle = matchedContest?.title || `${catName} Champions`;
    const contestDesc = matchedContest?.description || activeCat?.description || 'Test your knowledge, speed, and accuracy in this live timed contest battle.';

    const entryFeeVal = matchedContest?.entryFee !== undefined ? parseFloat(matchedContest.entryFee) : 100;
    const entryFeeFormatted = typeof entryFeeVal === 'number' && !isNaN(entryFeeVal) ? `₹${entryFeeVal.toFixed(2)}` : '₹100.00';

    const startTimeVal = matchedContest?.startTime ? new Date(matchedContest.startTime) : new Date('2026-11-14T10:00:00Z');
    const compDateFormatted = startTimeVal.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const compTimeFormatted = startTimeVal.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) || '10:00 AM';

    // Registration closes 1 day prior at 11:59 PM
    const regCloseDate = new Date(startTimeVal.getTime() - 1 * 24 * 60 * 60 * 1000);
    const regCloseFormatted = regCloseDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', 11:59 PM';

    const ageGroupClean = (activeCat?.ageGroup || '3–5').replace(/\s*Years?/gi, '').trim();
    const durationMins = matchedContest?.durationMinutes || 30;
    const totalQuestions = matchedContest?.numQuestions || 10;
    const maxScoreVal = matchedContest?.maxScore || '100.00';

    return {
      overview: contestDesc,
      scheduleInfo: {
        ageGroup: ageGroupClean || '3–5',
        entryFee: entryFeeFormatted,
        date: compDateFormatted,
        startTime: compTimeFormatted,
        registrationClose: regCloseFormatted,
        maxScore: maxScoreVal,
      },
      instructions: {
        intro: `Competition Structure of ${contestTitle} (${catName})`,
        description: `Each participant will solve ${totalQuestions} questions within the allocated duration of ${durationMins} minutes across 3 core evaluation rounds.`,
        categories: [
          { emoji: '⚡', name: 'Speed & Accuracy Round', weightage: '33%' },
          { emoji: '🧠', name: 'Core Knowledge & Concepts', weightage: '33%' },
          { emoji: '🔍', name: 'Logical Reasoning & Problem Solving', weightage: '34%' },
        ],
        objective: `This competition evaluates speed, accuracy, and depth of understanding in ${catName}. Complete all ${totalQuestions} questions within ${durationMins} minutes to achieve maximum score and rank on the global leaderboard.`,
      },
      activities: [
        {
          emoji: '⚡',
          name: 'Speed & Accuracy Round',
          weightage: '33%',
          description: `Rapid response questions testing quick recall and precision under time pressure (${durationMins} minutes total limit).`,
        },
        {
          emoji: '🧠',
          name: 'Core Knowledge & Concepts',
          weightage: '33%',
          description: `Multiple choice questions covering key fundamental principles, facts, and syllabus topics of ${catName}.`,
        },
        {
          emoji: '🔍',
          name: 'Logical Reasoning & Problem Solving',
          weightage: '34%',
          description: 'Analytical questions, scenario-based problems, and pattern recognition to measure critical thinking abilities.',
        },
      ],
    };
  };

  const matchedContestObj = getMatchedContest(activeCategory, contests);
  const fullDetails = getLeagueFullDetails(activeCategory, matchedContestObj);

  return (
    <div className="min-h-screen bg-[#090b15] text-white flex flex-col font-sans select-none overflow-x-hidden">
      <ScrollToTop />
      <Navbar />

      {/* ── 1. Hero Section ── */}
      <div className="relative pt-32 pb-20 bg-gradient-to-b from-[#0b0c16] via-[#120917] to-[#090b15] overflow-hidden border-b border-gray-900 shadow-2xl">

        {/* Ambient Background Glow Circles */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Dynamic Top 5 Categories Switcher Bar */}
          <div className="mb-8 flex flex-wrap items-center justify-center lg:justify-start gap-2 bg-black/30 p-2 rounded-2xl border border-white/10 backdrop-blur-md max-w-fit">
            {activeCategoriesList.map((cat, idx) => {
              const catSlug = (cat.slug || cat.name).toLowerCase();
              const currentSlug = (selectedSlug || activeCategoriesList[0]?.slug || activeCategoriesList[0]?.name).toLowerCase();
              const isSelected = currentSlug === catSlug;
              const theme = getCategoryTheme(cat.name, cat);

              return (
                <button
                  key={cat.id || catSlug || idx}
                  onClick={() => handleSelectCategory(cat)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSelected
                      ? 'bg-white text-gray-950 shadow-lg scale-105 font-black'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <span>{theme.icon || '📚'}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          <div className="max-w-4xl space-y-6 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-sm">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Excellence League</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight font-['Montserrat']">
              {activeCategory.name}
            </h1>

            {/* Subtitle Tagline */}
            <p className="text-gray-200 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              {activeCategory.description}
            </p>

            {/* Status Badges Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Registration Open
              </span>

              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-white/10 text-white border border-white/20 backdrop-blur-md">
                # {activeCategory.code}
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
        </div>

      </div>

      {/* ── 2. Detailed Content Section (Full-Width, 4 Sections in Exact Order) ── */}
      <section className="py-12 sm:py-16 bg-[#090b15]">
        <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">

            {/* Full Width Column (4 Sections in Order) */}
            <div className="lg:col-span-12 space-y-8">

              {/* SECTION 1: League Overview */}
              <div className="bg-[#0e1121] border border-gray-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center gap-3.5 mb-4">
                  <span className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Info className="w-6 h-6" />
                  </span>
                  <div>
                    <span className="text-blue-400 font-semibold text-xs tracking-wider uppercase block">About the Competition</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">League Overview</h2>
                  </div>
                </div>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-medium">
                  {fullDetails.overview}
                </p>
              </div>

              {/* SECTION 2: Schedule & Eligibility */}
              <div className="bg-[#0e1121] border border-gray-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center gap-3.5 mb-6">
                  <span className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6" />
                  </span>
                  <div>
                    <span className="text-amber-400 font-semibold text-xs tracking-wider uppercase block">Important Information</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Schedule</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-[#12162c] border border-gray-800/80 p-4 rounded-2xl flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <small className="block text-gray-400 text-xs font-medium mb-0.5">Participation Fee</small>
                      <strong className="text-white text-sm sm:text-base font-bold">{fullDetails.scheduleInfo.entryFee}</strong>
                    </div>
                  </div>

                  <div className="bg-[#12162c] border border-gray-800/80 p-4 rounded-2xl flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <small className="block text-gray-400 text-xs font-medium mb-0.5">Competition Date</small>
                      <strong className="text-white text-sm sm:text-base font-bold">{fullDetails.scheduleInfo.date}</strong>
                    </div>
                  </div>

                  <div className="bg-[#12162c] border border-gray-800/80 p-4 rounded-2xl flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <small className="block text-gray-400 text-xs font-medium mb-0.5">Start Time</small>
                      <strong className="text-white text-sm sm:text-base font-bold">{fullDetails.scheduleInfo.startTime}</strong>
                    </div>
                  </div>

                  <div className="bg-[#12162c] border border-gray-800/80 p-4 rounded-2xl flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <small className="block text-gray-400 text-xs font-medium mb-0.5">Registration Closes</small>
                      <strong className="text-white text-sm sm:text-base font-bold">{fullDetails.scheduleInfo.registrationClose}</strong>
                    </div>
                  </div>

                  <div className="bg-[#12162c] border border-gray-800/80 p-4 rounded-2xl flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <small className="block text-gray-400 text-xs font-medium mb-0.5">Maximum Score</small>
                      <strong className="text-white text-sm sm:text-base font-bold">{fullDetails.scheduleInfo.maxScore}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Instructions */}
              <div className="bg-[#0e1121] border border-gray-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center gap-3.5 mb-6">
                  <span className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </span>
                  <div>
                    <span className="text-purple-400 font-semibold text-xs tracking-wider uppercase block">Participation Guidelines</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Instructions</h2>
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {fullDetails.instructions.intro}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 font-medium">
                    {fullDetails.instructions.description}
                  </p>

                  {/* Category Weightage Table */}
                  <div className="bg-[#12162c] border border-gray-800/80 rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-12 bg-white/5 p-3.5 px-4 border-b border-gray-800 font-bold text-xs text-gray-400 uppercase tracking-wider">
                      <div className="col-span-8">Category</div>
                      <div className="col-span-4 text-right">Weightage</div>
                    </div>
                    {fullDetails.instructions.categories.map((cat, idx) => (
                      <div key={idx} className="grid grid-cols-12 p-3.5 px-4 border-b border-gray-800/60 last:border-0 text-xs sm:text-sm font-semibold items-center text-white">
                        <div className="col-span-8 flex items-center gap-2">
                          <span className="text-base">{cat.emoji}</span>
                          <span>{cat.name}</span>
                        </div>
                        <div className="col-span-4 text-right text-emerald-400 font-extrabold">{cat.weightage}</div>
                      </div>
                    ))}
                  </div>

                  {/* Objective Box */}
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 sm:p-5 rounded-2xl text-xs sm:text-sm text-amber-200/90 leading-relaxed font-medium space-y-1">
                    <strong className="block text-amber-400 font-bold text-sm">Objective :</strong>
                    <p>{fullDetails.instructions.objective}</p>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Type of Activities */}
              <div className="bg-[#0e1121] border border-gray-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center gap-3.5 mb-6">
                  <span className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </span>
                  <div>
                    <span className="text-emerald-400 font-semibold text-xs tracking-wider uppercase block">Assessed Skills & Tasks</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Type of Activities</h2>
                  </div>
                </div>

                <div className="space-y-4">
                  {fullDetails.activities.map((act, idx) => (
                    <div key={idx} className="bg-[#12162c] border border-gray-800/80 p-4 sm:p-5 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                          <span>{act.emoji}</span>
                          <span>{act.name}</span>
                        </h4>
                        {act.weightage && (
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold shrink-0">
                            {act.weightage} Weightage
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
                        {act.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

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

