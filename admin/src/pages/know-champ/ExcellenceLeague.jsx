import React, { useState, useEffect } from 'react';
import Navbar from '../../components/know-champ/Navbar';
import Footer from '../../components/know-champ/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import ContestCard from '../../components/know-champ/ContestCard';
import { Trophy, Users, ArrowRight } from 'lucide-react';
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
    name: 'Science',
    slug: 'science',
    icon: '🔬',
    description: 'Identification of imagination, scientific inquiry, observation, and logical thinking.',
    ageGroup: '3–5 Years',
    code: 'K1',
  },
  {
    id: 2,
    name: 'Technology',
    slug: 'technology',
    icon: '💻',
    description: 'Encouraging practical problem solving, tech concepts, coding, and innovation.',
    ageGroup: '6–8 Years',
    code: 'K2',
  },
  {
    id: 3,
    name: 'Sports',
    slug: 'sports',
    icon: '⚽',
    description: 'Enhancing team spirit, athletic knowledge, strategy, and quick decision making.',
    ageGroup: '9–12 Years',
    code: 'K3',
  },
  {
    id: 4,
    name: 'Entertainment',
    slug: 'entertainment',
    icon: '🎬',
    description: 'Fostering creative arts, music, cinema, pop culture, and dynamic expression.',
    ageGroup: '13–16 Years',
    code: 'K4',
  },
  {
    id: 5,
    name: 'History',
    slug: 'history',
    icon: '📜',
    description: 'Exploring ancient civilizations, historical events, heritage, and global culture.',
    ageGroup: '17–19 Years',
    code: 'K5',
  },
];

const PRESET_METRICS = [
  { ageGroup: '3–5 Years', code: 'K1', desc: 'Identification of imagination, scientific inquiry, observation, and logical thinking.' },
  { ageGroup: '6–8 Years', code: 'K2', desc: 'Encouraging practical problem solving, tech concepts, coding, and innovation.' },
  { ageGroup: '9–12 Years', code: 'K3', desc: 'Enhancing team spirit, athletic knowledge, strategy, and quick decision making.' },
  { ageGroup: '13–16 Years', code: 'K4', desc: 'Fostering creative arts, music, cinema, pop culture, and dynamic expression.' },
  { ageGroup: '17–19 Years', code: 'K5', desc: 'Exploring ancient civilizations, historical events, heritage, and global culture.' },
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
        entryFee: 15,
        joined: 0,
        startTime: new Date('2026-08-22T10:00:00Z'),
      };
    }

    return matched;
  };

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
                {activeCategory.name}
              </h1>

              {/* Subtitle Tagline */}
              <p className="text-gray-200 text-sm sm:text-base lg:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                {activeCategory.description}
              </p>

              {/* Status Badges Row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Registration Open
                </span>

                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-blue-500/20 text-blue-200 border border-blue-500/30 backdrop-blur-md">
                  <Users className="w-4 h-4 text-blue-300" />
                  {activeCategory.ageGroup}
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

            {/* Right Side Contest Card (Same card component used on /contests) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-sm">
                {(() => {
                  const contest = getMatchedContest(activeCategory, contests);
                  const categoryName = contest.category?.name || contest.category || activeCategory.name;
                  const catTheme = getCategoryTheme(categoryName, contest.category);
                  const prize = contest.prizePool !== undefined ? parseFloat(contest.prizePool) : (contest.prize || 0);
                  const entry = contest.entryFee !== undefined ? parseFloat(contest.entryFee) : (contest.entry || 0);
                  const joined = contest.joined !== undefined ? contest.joined : 0;
                  const image = getImageUrl(contest.image) || catTheme.image || catTheme.icon;
                  const date = contest?.startTime
                    ? new Date(contest.startTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', 10:00 Am'
                    : (contest?.date || 'Aug 22, 2026, 10:00 Am');

                  return (
                    <ContestCard
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
                    />
                  );
                })()}
              </div>
            </div>

          </div>
        </div>

      </div>

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
