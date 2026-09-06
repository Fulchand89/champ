import React, { useState, useEffect } from 'react';
import Navbar from '../../components/know-champ/Navbar';
import Footer from '../../components/know-champ/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import { 
  Trophy, 
  Users, 
  ArrowRight, 
  Info, 
  Calendar, 
  Coins, 
  Clock, 
  AlertCircle, 
  Award, 
  FileText, 
  Sparkles
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import cmsService from '../../api/services/cmsService';
import contestService from '../../api/services/contestService';
import AppDownloadModal from '../../components/know-champ/AppDownloadModal';

// ── 5 Official KnowChamp Excellence Leagues (Default Fallback Configuration) ──
const EXCELLENCE_LEAGUES_DEFAULT = [
  {
    id: 1,
    name: 'Creative League',
    slug: 'creative-league',
    icon: '🎨',
    description: 'Identification of imagination, artistic expression, observation, and creative thinking.',
    ageGroup: '3–5 Years',
    code: 'K1',
    color: 'from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-400',
    image: '/cat-science.png',
    prizePool: 30000,
    entryFee: 100,
    scheduleDate: '14 Nov 2026',
    scheduleTime: '10:00 AM',
    activities: [
      {
        emoji: '🎨',
        name: 'Drawing, Coloring & Visual Thinking',
        weightage: '33%',
        description: 'Simple pattern matching, shape identification, color recognition, and creative visual puzzles designed for toddlers.',
      },
      {
        emoji: '🧩',
        name: 'Imagination & Object Identification',
        weightage: '33%',
        description: 'Identifying everyday objects, animals, storytelling elements, and basic spatial orientation.',
      },
      {
        emoji: '💡',
        name: 'Basic Observation & Curiosity',
        weightage: '34%',
        description: 'Fun interactive observation tests, sound and picture matching, and simple logical sequence ordering.',
      },
    ],
    categories: [
      { emoji: '🎨', name: 'Visual Thinking & Coloring', weightage: '33%' },
      { emoji: '🧩', name: 'Object & Animal Identification', weightage: '33%' },
      { emoji: '💡', name: 'Observation & Pattern Puzzles', weightage: '34%' },
    ],
  },
  {
    id: 2,
    name: 'Knowledge League',
    slug: 'knowledge-league',
    icon: '📚',
    description: 'Encouraging practical problem solving, general awareness, critical thinking, and core knowledge.',
    ageGroup: '6–8 Years',
    code: 'K2',
    color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400',
    image: '/Knowledge.png',
    prizePool: 30000,
    entryFee: 100,
    scheduleDate: '15 Nov 2026',
    scheduleTime: '10:00 AM',
    activities: [
      {
        emoji: '📚',
        name: 'General Awareness & World Concepts',
        weightage: '33%',
        description: 'Fundamentals of science, nature, geography, and general knowledge tailored for early schoolers.',
      },
      {
        emoji: '🧠',
        name: 'Analytical & Practical Problem Solving',
        weightage: '33%',
        description: 'Word puzzles, mathematical logic, basic arithmetic reasoning, and real-life situational questions.',
      },
      {
        emoji: '🔍',
        name: 'Critical Thinking & Memory Recall',
        weightage: '34%',
        description: 'Reading comprehension, sequence puzzles, and quick memory recall challenges.',
      },
    ],
    categories: [
      { emoji: '📚', name: 'General Awareness & Science', weightage: '33%' },
      { emoji: '🧠', name: 'Practical Problem Solving', weightage: '33%' },
      { emoji: '🔍', name: 'Critical Thinking & Logic', weightage: '34%' },
    ],
  },
  {
    id: 3,
    name: 'Communication League',
    slug: 'communication-league',
    icon: '🎤',
    description: 'Enhancing storytelling, public speaking, dynamic expression, and clear articulation.',
    ageGroup: '9–12 Years',
    code: 'K3',
    color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400',
    image: '/cat-entertainment.png',
    prizePool: 30000,
    entryFee: 100,
    scheduleDate: '16 Nov 2026',
    scheduleTime: '10:00 AM',
    activities: [
      {
        emoji: '🎤',
        name: 'Storytelling & Dynamic Expression',
        weightage: '33%',
        description: 'Vocabulary building, sentence structuring, grammar precision, and creative narrative expression.',
      },
      {
        emoji: '📢',
        name: 'Public Speaking & Articulation Concepts',
        weightage: '33%',
        description: 'Effective communication techniques, active listening comprehension, and public speaking logic.',
      },
      {
        emoji: '✍️',
        name: 'Comprehension & Verbal Reasoning',
        weightage: '34%',
        description: 'Context analysis, passage interpretation, opinion articulation, and linguistic clarity.',
      },
    ],
    categories: [
      { emoji: '🎤', name: 'Storytelling & Vocabulary', weightage: '33%' },
      { emoji: '📢', name: 'Public Speaking Concepts', weightage: '33%' },
      { emoji: '✍️', name: 'Comprehension & Expression', weightage: '34%' },
    ],
  },
  {
    id: 4,
    name: 'Innovation League',
    slug: 'innovation-league',
    icon: '💡',
    description: 'Encouraging practical problem solving, tech concepts, innovation, and creative thinking.',
    ageGroup: '13–16 Years',
    code: 'K4',
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
    image: '/cat-technology.png',
    prizePool: 30000,
    entryFee: 100,
    scheduleDate: '17 Nov 2026',
    scheduleTime: '10:00 AM',
    activities: [
      {
        emoji: '💡',
        name: 'STEM & Technology Concepts',
        weightage: '33%',
        description: 'Fundamentals of science, technology, coding logic, robotics, and modern digital awareness.',
      },
      {
        emoji: '⚙️',
        name: 'Practical Innovation & Design Thinking',
        weightage: '33%',
        description: 'Real-world case studies, engineering logic, design thinking, and innovative problem solving.',
      },
      {
        emoji: '🔬',
        name: 'Scientific Reasoning & Analytical Aptitude',
        weightage: '34%',
        description: 'Data interpretation, hypothesis testing, logic grids, and experimental observation scenarios.',
      },
    ],
    categories: [
      { emoji: '💡', name: 'STEM & Tech Fundamentals', weightage: '33%' },
      { emoji: '⚙️', name: 'Innovation & Design Logic', weightage: '33%' },
      { emoji: '🔬', name: 'Scientific & Data Aptitude', weightage: '34%' },
    ],
  },
  {
    id: 5,
    name: 'Character League',
    slug: 'character-league',
    icon: '🌟',
    description: 'Developing personality, leadership, ethics, integrity, and character assessment.',
    ageGroup: '17–19 Years',
    code: 'K5',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    image: '/cat-history.png',
    prizePool: 30000,
    entryFee: 100,
    scheduleDate: '18 Nov 2026',
    scheduleTime: '10:00 AM',
    activities: [
      {
        emoji: '🌟',
        name: 'Leadership & Ethical Decision Making',
        weightage: '33%',
        description: 'Moral dilemma scenarios, leadership principles, integrity tests, and team management ethics.',
      },
      {
        emoji: '👑',
        name: 'Personality Assessment & EQ Skills',
        weightage: '33%',
        description: 'Emotional intelligence (EQ), interpersonal communication, self-reflection, and personal growth.',
      },
      {
        emoji: '🏆',
        name: 'Civic Responsibility & Social Impact',
        weightage: '34%',
        description: 'Environmental ethics, community leadership, civic awareness, and strategic societal problem solving.',
      },
    ],
    categories: [
      { emoji: '🌟', name: 'Leadership & Ethics', weightage: '33%' },
      { emoji: '👑', name: 'Personality & EQ Assessment', weightage: '33%' },
      { emoji: '🏆', name: 'Civic & Social Responsibility', weightage: '34%' },
    ],
  },
];

const ExcellenceLeague = () => {
  const { leagueSlug } = useParams();
  const navigate = useNavigate();

  const [selectedSlug, setSelectedSlug] = useState('creative-league');
  const [contests, setContests] = useState([]);
  const [cmsData, setCmsData] = useState(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Sync route param slug to selected league
  useEffect(() => {
    if (leagueSlug) {
      const cleanSlug = leagueSlug.toLowerCase().trim();
      const found = EXCELLENCE_LEAGUES_DEFAULT.find(
        (lg) =>
          lg.slug === cleanSlug ||
          lg.name.toLowerCase() === cleanSlug ||
          lg.name.toLowerCase().replace(/\s+/g, '-') === cleanSlug
      );
      if (found) {
        setSelectedSlug(found.slug);
        return;
      }
    }
    setSelectedSlug('creative-league');
  }, [leagueSlug]);

  // Fetch CMS data dynamically controlled by Admin Panel
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
      }
    };

    fetchCmsData();
  }, []);

  // Fetch optional backend contests to enrich live contest cards
  useEffect(() => {
    let isMounted = true;
    const loadContests = async () => {
      try {
        const cntRes = await contestService.getPublicContests();
        if (isMounted && cntRes?.success && Array.isArray(cntRes.data)) {
          setContests(cntRes.data);
        }
      } catch (err) {
        console.error('Error fetching contests for Excellence League:', err);
      }
    };

    loadContests();
  }, []);

  // Dynamically merge Admin CMS settings with default config
  const excellenceLeaguesList = EXCELLENCE_LEAGUES_DEFAULT.map((lg) => {
    const cmsLg = cmsData?.leagues?.[lg.slug] || {};
    return {
      ...lg,
      name: cmsLg.name || lg.name,
      description: cmsLg.tagline || lg.description,
      ageGroup: cmsLg.ageGroup 
        ? (cmsLg.ageGroup.includes('Year') || cmsLg.ageGroup.includes('Years') ? cmsLg.ageGroup : `${cmsLg.ageGroup} Years`) 
        : lg.ageGroup,
      code: cmsLg.code || lg.code,
      icon: cmsLg.emoji || lg.icon,
      schedule: cmsLg.schedule || `${lg.scheduleDate}, ${lg.scheduleTime}`,
      entryFeeText: cmsLg.entryFee || `₹${lg.entryFee}.00`,
      maxScoreText: cmsLg.maxScore || '100.00',
    };
  });

  const activeLeague = excellenceLeaguesList.find((lg) => lg.slug === selectedSlug) || excellenceLeaguesList[0];

  const handleSelectLeague = (lg) => {
    setSelectedSlug(lg.slug);
    navigate(`/excellence-leagues/${lg.slug}`, { replace: true });
  };

  // Find optional matching contest from backend if available
  const getMatchedContest = (lg) => {
    if (!lg) return null;
    const nameLower = lg.name.toLowerCase();
    const slugLower = lg.slug.toLowerCase();

    let matched = Array.isArray(contests)
      ? contests.find((c) => {
          if (!c) return false;
          const title = (c.title || '').toLowerCase();
          const catName = (c.category?.name || c.category || '').toLowerCase();
          return (catName.includes(nameLower) || title.includes(nameLower) || catName.includes(slugLower)) && title.includes('league');
        })
      : null;

    if (!matched) {
      matched = {
        id: lg.slug,
        title: `${lg.name} Challenge`,
        category: { name: lg.name, icon: lg.icon },
        prizePool: lg.prizePool || 30000,
        entryFee: lg.entryFee || 100,
        joined: 0,
        startTime: new Date(`${lg.scheduleDate || '14 Nov 2026'} 10:00 AM`),
      };
    }
    return matched;
  };

  const matchedContestObj = getMatchedContest(activeLeague);

  const getLeagueFullDetails = (lg, matchedContest) => {
    const contestTitle = `${lg.name} Challenge`;
    const contestDesc = matchedContest?.description || lg.description;

    const entryFeeFormatted = lg.entryFeeText || (matchedContest?.entryFee !== undefined && matchedContest.entryFee >= 50
      ? `₹${parseFloat(matchedContest.entryFee).toFixed(2)}`
      : '₹100.00');

    const scheduleParts = (lg.schedule || '14 Nov 2026, 10:00 AM').split(',');
    const dateFormatted = scheduleParts[0]?.trim() || lg.scheduleDate || '14 Nov 2026';
    const timeFormatted = scheduleParts[1]?.trim() || lg.scheduleTime || '10:00 AM';

    const regCloseFormatted = `${dateFormatted}, 11:59 PM`;

    return {
      overview: contestDesc,
      scheduleInfo: {
        ageGroup: lg.ageGroup,
        entryFee: entryFeeFormatted,
        date: dateFormatted,
        startTime: timeFormatted,
        registrationClose: regCloseFormatted,
        maxScore: lg.maxScoreText || '100.00',
      },
      instructions: {
        intro: `Competition Structure of ${contestTitle} (${lg.name})`,
        description: `Each participant will solve 10 questions within the allocated duration of 30 minutes across 3 core evaluation rounds tailored for ${lg.name}.`,
        categories: lg.categories || [
          { emoji: '⚡', name: 'Speed & Accuracy Round', weightage: '33%' },
          { emoji: '🧠', name: 'Core Knowledge & Concepts', weightage: '33%' },
          { emoji: '🔍', name: 'Logical Reasoning & Problem Solving', weightage: '34%' },
        ],
        objective: `This competition evaluates speed, accuracy, creative thinking, and depth of understanding in ${lg.name}. Complete all questions within 30 minutes to achieve maximum score and rank on the global leaderboard.`,
      },
      activities: lg.activities || [
        {
          emoji: '⚡',
          name: 'Speed & Accuracy Round',
          weightage: '33%',
          description: 'Rapid response questions testing quick recall and precision under time pressure (30 minutes total limit).',
        },
        {
          emoji: '🧠',
          name: 'Core Knowledge & Concepts',
          weightage: '33%',
          description: `Multiple choice questions covering key fundamental principles, facts, and syllabus topics of ${lg.name}.`,
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

  const fullDetails = getLeagueFullDetails(activeLeague, matchedContestObj);

  return (
    <div className="min-h-screen bg-[#010914] text-white flex flex-col font-sans select-none overflow-x-hidden">
      <ScrollToTop />
      <Navbar />

      {/* ── 1. Hero Section (Matching Exact Excellence League Layout) ── */}
      <div className="relative pt-32 pb-20 bg-[#010914] border-b border-gray-900 shadow-2xl overflow-hidden">

        {/* Ambient Background Glow Circles */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* 5 Official Excellence Leagues Tab Switcher Bar */}
          <div className="mb-8 flex flex-wrap items-center justify-center lg:justify-start gap-2 bg-black/40 p-2 rounded-2xl border border-white/10 backdrop-blur-md max-w-fit shadow-xl">
            {excellenceLeaguesList.map((lg) => {
              const isSelected = activeLeague.slug === lg.slug;

              return (
                <button
                  key={lg.slug}
                  onClick={() => handleSelectLeague(lg)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-black font-extrabold shadow-lg scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{lg.icon}</span>
                  <span>{lg.name}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Left Content Area Header */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-sm">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>{cmsData?.hero?.title || 'Excellence League'}</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight font-['Montserrat']">
                {activeLeague.name}
              </h1>

              {/* Subtitle Tagline */}
              <p className="text-gray-200 text-sm sm:text-base lg:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                {activeLeague.description}
              </p>

              {/* Status Badges Row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Registration Open
                </span>

                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-md">
                  <Users className="w-3.5 h-3.5" />
                  {activeLeague.ageGroup}
                </span>

                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-white/10 text-white border border-white/20 backdrop-blur-md">
                  # {activeLeague.code}
                </span>
              </div>

              {/* Action Buttons */}
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

            {/* Right Side Excellence League Showcase Card (Custom Card Design) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-sm bg-[#0b101f] border border-blue-900/40 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden backdrop-blur-xl">
                {/* Header Icon + Title */}
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-400 shadow-inner">
                    <Trophy className="w-7 h-7 text-amber-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {activeLeague.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">
                    Answer right. Shine bright.
                  </p>
                </div>

                {/* Info Box 1: Age Group & Entry Fee */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#10172a] border border-white/5 p-3.5 rounded-2xl">
                    <span className="block text-[11px] text-gray-400 font-medium mb-1">Age Group</span>
                    <strong className="text-sm font-extrabold text-white">{activeLeague.ageGroup}</strong>
                  </div>
                  <div className="bg-[#10172a] border border-white/5 p-3.5 rounded-2xl">
                    <span className="block text-[11px] text-gray-400 font-medium mb-1">Entry Fee</span>
                    <strong className="text-sm font-extrabold text-emerald-400">{fullDetails.scheduleInfo.entryFee}</strong>
                  </div>
                </div>

                {/* Info Box 2: Competition Schedule */}
                <div className="bg-[#10172a] border border-white/5 p-3.5 rounded-2xl">
                  <span className="block text-[11px] text-gray-400 font-medium mb-1">Competition Schedule</span>
                  <strong className="text-sm font-extrabold text-white">{fullDetails.scheduleInfo.date}, {fullDetails.scheduleInfo.startTime}</strong>
                </div>

                {/* Info Box 3: Maximum Score & League Code */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#10172a] border border-white/5 p-3.5 rounded-2xl">
                    <span className="block text-[11px] text-gray-400 font-medium mb-1">Maximum Score</span>
                    <strong className="text-sm font-extrabold text-white">{fullDetails.scheduleInfo.maxScore}</strong>
                  </div>
                  <div className="bg-[#10172a] border border-white/5 p-3.5 rounded-2xl">
                    <span className="block text-[11px] text-gray-400 font-medium mb-1">League Code</span>
                    <strong className="text-sm font-extrabold text-white">{activeLeague.code}</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── 2. Selected League Deep-Dive Section (Uniform Specifications Across All 5 Leagues) ── */}
      <section className="py-12 sm:py-16 bg-[#010914]">
        <div className="w-[calc(100%-32px)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="border-b border-gray-800 pb-4">
              <span className="text-red-400 font-bold text-xs uppercase tracking-wider block mb-1">Selected Category Details</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                {activeLeague.name} Specifications
              </h2>
            </div>

            {/* SECTION 1: League Overview */}
            <div className="bg-[#0e1121] border border-gray-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3.5 mb-4">
                <span className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Info className="w-6 h-6" />
                </span>
                <div>
                  <span className="text-blue-400 font-semibold text-xs tracking-wider uppercase block">About the Competition</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">League Overview</h3>
                </div>
              </div>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-medium">
                {fullDetails.overview}
              </p>
            </div>

            {/* SECTION 2: Schedule & Rules */}
            <div className="bg-[#0e1121] border border-gray-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3.5 mb-6">
                <span className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6" />
                </span>
                <div>
                  <span className="text-amber-400 font-semibold text-xs tracking-wider uppercase block">Important Information</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Schedule & Rules</h3>
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

            {/* SECTION 3: Instructions & Pattern */}
            <div className="bg-[#0e1121] border border-gray-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3.5 mb-6">
                <span className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </span>
                <div>
                  <span className="text-purple-400 font-semibold text-xs tracking-wider uppercase block">Participation Guidelines</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Instructions & Pattern</h3>
                </div>
              </div>

              <div className="space-y-5">
                <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {fullDetails.instructions.intro}
                </h4>
                <p className="text-xs sm:text-sm text-gray-300 font-medium">
                  {fullDetails.instructions.description}
                </p>

                {/* Category Weightage Table */}
                <div className="bg-[#12162c] border border-gray-800/80 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-12 bg-white/5 p-3.5 px-4 border-b border-gray-800 font-bold text-xs text-gray-400 uppercase tracking-wider">
                    <div className="col-span-8">Evaluation Category</div>
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
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Type of Activities</h3>
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
