import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '../../components/know-champ/Navbar';
import Footer from '../../components/know-champ/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import {
  UserCheck, Sparkles, BookOpen, Building2, Trophy, MapPin, Landmark, Crown,
  Award, Medal, Palette, Book, Mic, Lightbulb, Star, ShieldCheck, CheckCircle2,
  ArrowRight, ChevronLeft, ChevronRight, Zap, Target, Brain, HeartHandshake, Compass, Flame,
  Download, Wallet, PlayCircle, Lock, Headphones, Smartphone, BarChart2, CreditCard, Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cmsService } from '../../api/services/cmsService';
import { categoryService } from '../../api/services/categoryService';
import { initAdminSocket } from '../../api/services/adminSocketService';
import AppDownloadModal from '../../components/know-champ/AppDownloadModal';

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
  Gift: Trophy,
  Smartphone,
  CheckCircle: CheckCircle2,
  Users,
  BarChart2,
  CreditCard,
  ArrowRight,
  Lock,
  Headphones,
};

// ── Default CMS Fallback ──
const DEFAULT_DATA = {
  hero: {
    title: 'How the KnowChamp Excellence League',
    titleHighlight: 'Works',
    subtitle: 'Your Journey from School Champion to State Champion Starts Here! Discover, compete, and shine bright.',
  },
  steps: [
    { id: 1, stepNumber: '01', icon: 'UserCheck', title: 'Register', description: 'Register through your School Coordinator or directly on the KnowChamp platform with basic details and DOB.', displayOrder: 1 },
    { id: 2, stepNumber: '02', icon: 'Zap', title: 'Automatic League Selection', description: 'Based on your age, the system automatically assigns you to the appropriate Excellence League.', displayOrder: 2 },
    { id: 3, stepNumber: '03', icon: 'BookOpen', title: 'View Details & Prepare', description: 'Visit the Contest Details page to review theme, assessed skills, pattern, duration, official rules, and sample activities.', displayOrder: 3 },
    { id: 4, stepNumber: '04', icon: 'Users', title: 'School Competition', description: 'On competition day, all registered students compete at their own school in quizzes, creative arts, speaking, and problem-solving.', displayOrder: 4 },
    { id: 5, stepNumber: '05', icon: 'Trophy', title: 'School Champions', description: 'Schools announce 1st 🥇, 2nd 🥈, and 3rd 🥉 place winners per league who qualify for Sub-Division.', displayOrder: 5 },
    { id: 6, stepNumber: '06', icon: 'MapPin', title: 'Sub-Division Level', description: 'School winners across the same Sub-Division compete head-to-head, giving students a broader platform to showcase talent.', displayOrder: 6 },
    { id: 7, stepNumber: '07', icon: 'Landmark', title: 'District Championship', description: 'Top performers from Sub-Divisions advance to the District Level, competing with elite minds from across the entire district.', displayOrder: 7 },
    { id: 8, stepNumber: '08', icon: 'Crown', title: 'State Grand Finale', description: 'District champions clash at the State Grand Finale for prestigious titles, trophies, medals, certificates, and cash prizes!', displayOrder: 8 },
  ],
  callout: {
    title: 'Rules & Fair Play Guidelines',
    description: 'State-of-the-art anti-cheat detection, quick results calculation, and multi-signature security protocols ensure all contests are completely clean, secure, and 100% fair.',
    bulletPoints: ['No emulator support', 'Single device account', 'Automated anti-bot detection', '24/7 support desk'],
    ctaText: 'Start Playing Now',
    ctaLink: '/contests',
  },
};

// ── Journey Steps 8-Stage Pipeline Data ──
const JOURNEY_STEPS = [
  {
    step: '01',
    title: 'Register',
    shortDesc: 'Quick & Simple Onboarding',
    desc: 'Register through your School Coordinator or directly on the KnowChamp platform. Simply enter basic details including your Date of Birth.',
    icon: UserCheck,
    color: 'from-red-500 to-rose-600',
    badge: 'Step 1'
  },
  {
    step: '02',
    title: 'Automatic League Selection',
    shortDesc: 'Age-Tailored Assignment',
    desc: 'Based on your age, the system automatically assigns you to the appropriate Excellence League. No manual choice needed!',
    icon: Sparkles,
    color: 'from-amber-500 to-orange-600',
    badge: 'Step 2'
  },
  {
    step: '03',
    title: 'View Details & Prepare',
    shortDesc: 'Confident Preparation',
    desc: 'Visit the Contest Details page to review theme, assessed skills, pattern, duration, official rules, and sample practice activities.',
    icon: BookOpen,
    color: 'from-yellow-500 to-amber-600',
    badge: 'Step 3'
  },
  {
    step: '04',
    title: 'School Competition',
    shortDesc: 'Compete at Your School',
    desc: 'On competition day, all registered students compete at their own school in quizzes, creative arts, speaking, and problem-solving.',
    icon: Building2,
    color: 'from-emerald-500 to-teal-600',
    badge: 'Step 4'
  },
  {
    step: '05',
    title: 'School Champions',
    shortDesc: 'Top 3 Qualifiers',
    desc: 'Schools announce 1st 🥇, 2nd 🥈, and 3rd 🥉 place winners per league who qualify for Sub-Division. Every participant gets recognized!',
    icon: Medal,
    color: 'from-cyan-500 to-blue-600',
    badge: 'Step 5'
  },
  {
    step: '06',
    title: 'Sub-Division Level',
    shortDesc: 'Broader Stage Platform',
    desc: 'School winners across the same Sub-Division compete head-to-head, giving students a broader platform to showcase talent.',
    icon: MapPin,
    color: 'from-blue-500 to-indigo-600',
    badge: 'Step 6'
  },
  {
    step: '07',
    title: 'District Championship',
    shortDesc: 'Best Across District',
    desc: 'Top performers from Sub-Divisions advance to the District Level, competing with elite minds from across the entire district.',
    icon: Landmark,
    color: 'from-indigo-500 to-purple-600',
    badge: 'Step 7'
  },
  {
    step: '08',
    title: 'State Grand Finale',
    shortDesc: 'Grand Pinnacle Event',
    desc: 'District champions clash at the State Grand Finale for prestigious titles, trophies, medals, certificates, and cash prizes!',
    icon: Crown,
    color: 'from-purple-500 to-pink-600',
    badge: 'Step 8'
  },
];

// ── 5 Excellence Leagues ──
const EXCELLENCE_LEAGUES = [
  {
    slug: 'creative-league',
    emoji: '🎨',
    icon: Palette,
    name: 'Creative League',
    age: 'Age 3–5',
    desc: 'Engaging, age-appropriate activities, craft & drawing to ignite early imagination and creative confidence.',
    accent: 'border-pink-500/30 hover:border-pink-500 text-pink-400 bg-pink-500/5',
    badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/20'
  },
  {
    slug: 'knowledge-league',
    emoji: '📚',
    icon: Book,
    name: 'Knowledge League',
    age: 'Age 6–8',
    desc: 'Interactive quizzes, curious exploration, and general awareness designed to build foundational understanding.',
    accent: 'border-blue-500/30 hover:border-blue-500 text-blue-400 bg-blue-500/5',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  },
  {
    slug: 'communication-league',
    emoji: '🎤',
    icon: Mic,
    name: 'Communication League',
    age: 'Age 9–12',
    desc: 'Storytelling, public speaking, dynamic expression, and clear articulation to cultivate confident speakers.',
    accent: 'border-amber-500/30 hover:border-amber-500 text-amber-400 bg-amber-500/5',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  },
  {
    slug: 'innovation-league',
    emoji: '💡',
    icon: Lightbulb,
    name: 'Innovation League',
    age: 'Age 13–16',
    desc: 'Practical problem solving, innovation challenges, and creative thinking for future-ready problem solvers.',
    accent: 'border-emerald-500/30 hover:border-emerald-500 text-emerald-400 bg-emerald-500/5',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  },
  {
    slug: 'character-league',
    emoji: '🌟',
    icon: Star,
    name: 'Character League',
    age: 'Age 17–19',
    desc: 'Personality and character assessment, ethics, leadership, and emotional intelligence for young leaders.',
    accent: 'border-purple-500/30 hover:border-purple-500 text-purple-400 bg-purple-500/5',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  },
];

// ── Preparation Details ──
const PREPARATION_ITEMS = [
  { title: 'Contest Theme', desc: 'Detailed theme overview provided beforehand so students can research effectively.' },
  { title: 'Skills Assessed', desc: 'Clear list of key competencies and skills evaluated during the challenge.' },
  { title: 'Contest Pattern', desc: 'Full pattern details so participants know the exact structure of the competition.' },
  { title: 'Time Duration', desc: 'Explicit duration guidelines to help manage time wisely during live rounds.' },
  { title: 'Rules & Instructions', desc: 'Comprehensive instructions ensuring fair play, compliance, and clarity.' },
  { title: 'Sample Activities', desc: 'Practice examples and sample tasks where applicable for hands-on practice.' },
];

// ── Competition Activities ──
const COMPETITION_ACTIVITIES = [
  'Quiz Questions', 'Creative Activities', 'Drawing & Craft',
  'Storytelling', 'Public Speaking', 'Innovation Challenges',
  'Practical Activities', 'Problem Solving', 'Character Assessment'
];

// ── Recognition Stages ──
const RECOGNITION_STAGES = [
  { icon: Medal, title: 'Participation Certificate', desc: 'Awarded to every student to value and celebrate their effort and courage.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: Award, title: 'Merit Recognition', desc: 'Special certificates acknowledging commendable performance and effort.', color: 'text-teal-400', bg: 'bg-teal-500/10' },
  { icon: Trophy, title: 'School Champion', desc: '1st, 2nd, and 3rd place winners per league qualify for the Sub-Division level.', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { icon: MapPin, title: 'Sub-Division Champion', desc: 'Sub-Division winners gain regional honors and advance to the District round.', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { icon: Landmark, title: 'District Champion', desc: 'Top performers in each district earn prestige and qualify for the State Grand Finale.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Crown, title: 'State Champion', desc: 'Grand trophies, gold medals, certificates, cash prizes, and Champions Community entry.', color: 'text-red-400', bg: 'bg-red-500/10' },
];

// ── Skills Developed ──
const SKILLS_DEVELOPED = [
  { name: 'Creativity', icon: Palette },
  { name: 'Knowledge', icon: BookOpen },
  { name: 'Critical Thinking', icon: Brain },
  { name: 'Communication', icon: Mic },
  { name: 'Innovation', icon: Lightbulb },
  { name: 'Confidence', icon: Flame },
  { name: 'Leadership', icon: Crown },
  { name: 'Character', icon: Star },
  { name: 'Problem Solving', icon: Compass },
  { name: 'Competitive Spirit', icon: Trophy },
];

const HowItWorks = () => {
  const [cmsData, setCmsData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const stepsContainerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getPublicCategories();
        if (isMounted && res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setCategories(res.data.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching categories in HowItWorks:', err);
      }
    };
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

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
    let isMounted = true;

    loadData();

    // Socket listener for instant updates from admin CMS
    const socket = initAdminSocket();
    const handleUpdate = (updatedData) => {
      if (isMounted && updatedData) setCmsData(updatedData);
    };
    socket.on('cms_how_it_works_updated', handleUpdate);

    // Polling fallback — refetches every 4 seconds to ensure dynamic updates work even without sockets
    const pollInterval = setInterval(() => {
      if (isMounted) loadData();
    }, 4000);

    // Immediate refetch on tab focus or visibility change
    const handleFocus = () => {
      if (isMounted) loadData();
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      isMounted = false;
      socket.off('cms_how_it_works_updated', handleUpdate);
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [loadData]);

  const data = cmsData || DEFAULT_DATA;
  const hero = {
    badgeText: "India's First Holistic Child Excellence League",
    title: 'How the KnowChamp',
    titleHighlight: 'Works',
    subtitle: 'Your Journey from School Champion to State Champion Starts Here! Simple, exciting, and fair — every participant gets the opportunity to learn, compete, and shine bright.',
    ...(data.hero || {})
  };
  const callout = {
    title: 'Rules & Fair Play Guidelines',
    description: 'State-of-the-art anti-cheat detection, quick results calculation, and multi-signature security protocols ensure all contests are completely clean, secure, and 100% fair.',
    bulletPoints: ['No emulator support', 'Single device account', 'Automated anti-bot detection', '24/7 support desk'],
    ctaText: 'Start Playing Now',
    ctaLink: '/contests',
    ...(data.callout || {})
  };
  const preparation = {
    title: 'Contest Preparation Details',
    subtitle: 'Before every contest, participants can visit the Contest Details page to prepare with full clarity and confidence:',
    items: PREPARATION_ITEMS,
    footerNote: '💡 Sample activities provided where applicable to boost student confidence!',
    ...(data.preparation || {})
  };
  const competition = {
    title: 'Participate at Your School',
    subtitle: 'On competition day, registered participants compete right at their own school. Depending on the league, challenges include:',
    activities: COMPETITION_ACTIVITIES,
    progressionNote: '🏆 School Winner Progression: Top 3 participants (1st 🥇, 2nd 🥈, 3rd 🥉) from each league qualify for the Sub-Division level!',
    ...(data.competition || {})
  };
  const recognition = {
    badge: 'Celebrated Endeavors',
    title: 'Recognition at Every Stage',
    subtitle: "Every participant's effort is valued and celebrated at every step of their journey.",
    stages: RECOGNITION_STAGES,
    communityTitle: 'KnowChamp Champions Community',
    communityDesc: 'Outstanding performers receive certificates, medals, trophies, cash prizes, and the honor of joining our Champions Community.',
    ...(data.recognition || {})
  };
  const skills = {
    badge: 'Holistic Growth',
    title: 'More Than Just a Competition',
    description: 'The KnowChamp Excellence League is not just about winning prizes. It is about discovering potential and building lifelong skills that help children succeed in school and beyond.',
    items: SKILLS_DEVELOPED,
    ...(data.skills || {})
  };
  const summaryBanner = {
    title: 'Your Journey to Excellence',
    titleTagline: 'KnowChamp Excellence League',
    subTagline: "India's First Holistic Child Excellence League",
    motto: 'Answer Right. Shine Bright.',
    ...(data.summaryBanner || {})
  };

  const bulletPoints = Array.isArray(callout.bulletPoints) && callout.bulletPoints.length > 0
    ? callout.bulletPoints
    : ['No emulator support', 'Single device account', 'Automated anti-bot detection', '24/7 support desk'];

  // Dynamically map CMS steps or fallback to 8-stage journey
  const rawCmsSteps = Array.isArray(data.steps) && data.steps.length > 0
    ? [...data.steps].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    : [];

  const displaySteps = rawCmsSteps.length > 0
    ? rawCmsSteps.map((s, idx) => {
      const IconComponent = ICON_MAP[s.icon] || UserCheck;
      const fallbackStep = JOURNEY_STEPS[idx] || {};
      return {
        step: s.stepNumber || String(idx + 1).padStart(2, '0'),
        title: s.title,
        shortDesc: s.shortDesc || fallbackStep.shortDesc || `Stage ${idx + 1}`,
        desc: s.description,
        icon: IconComponent,
        color: s.color || fallbackStep.color || 'from-red-500 to-rose-600',
        badge: s.badge || `Step ${idx + 1}`,
      };
    })
    : JOURNEY_STEPS;

  const rawLeaguesList = (categories && categories.length > 0)
    ? categories.slice(0, 5)
    : (Array.isArray(data.leagues) && data.leagues.length > 0 ? data.leagues : EXCELLENCE_LEAGUES);

  const displayLeagues = rawLeaguesList.map((lg, idx) => {
    const preset = EXCELLENCE_LEAGUES[idx % EXCELLENCE_LEAGUES.length] || {};
    const slugVal = (lg.slug || lg.name || '').toLowerCase().replace(/\s+/g, '-');
    const IconComponent = ICON_MAP[lg.icon] || preset.icon || Palette;
    const nameVal = lg.name || preset.name;
    const ageVal = lg.ageGroup || lg.age || preset.age;
    const descVal = lg.description || lg.desc || preset.desc;
    const emojiVal = lg.emoji || preset.emoji || '📚';
    const accentVal = lg.accent || preset.accent || 'border-pink-500/30 hover:border-pink-500 text-pink-400 bg-pink-500/5';
    const badgeBgVal = lg.badgeBg || preset.badgeBg || 'bg-pink-500/10 text-pink-400 border-pink-500/20';

    return {
      slug: slugVal,
      name: nameVal,
      age: ageVal,
      desc: descVal,
      emoji: emojiVal,
      icon: IconComponent,
      accent: accentVal,
      badgeBg: badgeBgVal,
      id: lg.id || slugVal,
    };
  });

  const displayPrepItems = Array.isArray(preparation.items) && preparation.items.length > 0
    ? preparation.items
    : PREPARATION_ITEMS;

  const displayActivities = Array.isArray(competition.activities) && competition.activities.length > 0
    ? competition.activities
    : COMPETITION_ACTIVITIES;

  const displayRecognitionStages = Array.isArray(recognition.stages) && recognition.stages.length > 0
    ? recognition.stages.map((stg, idx) => ({
      ...RECOGNITION_STAGES[idx],
      ...stg,
      icon: ICON_MAP[stg.icon] || RECOGNITION_STAGES[idx]?.icon || Medal
    }))
    : RECOGNITION_STAGES;

  const displaySkills = Array.isArray(skills.items) && skills.items.length > 0
    ? skills.items.map((sk, idx) => ({
      ...SKILLS_DEVELOPED[idx],
      ...sk,
      icon: ICON_MAP[sk.icon] || SKILLS_DEVELOPED[idx]?.icon || Palette
    }))
    : SKILLS_DEVELOPED;

  return (
    <div className="min-h-screen bg-[#090b15] text-white flex flex-col font-sans select-none overflow-x-hidden">
      <ScrollToTop />
      <Navbar />

      {/* ── 1. Hero Header ── */}
      <div className="relative pt-36 pb-20 bg-gradient-to-b from-[#0b0c16] via-[#120917] to-[#090b15] border-b border-gray-900 flex flex-col items-center text-center px-4">


        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-4 text-[#FFFFFF] max-w-4xl leading-tight">
          {hero.title}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-500">
            {hero.titleHighlight}
          </span>
        </h1>

        <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed">
          Follow this clear 8-stage roadmap from registration at your school all the way to statewide glory!
        </p>


      </div>

      <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 space-y-24">

        {/* ── 2. The 8-Step Visual Journey Roadmap ── */}
        <section className="space-y-12">
          <div className="text-center space-y-3">

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              The KnowChamp Excellence Journey
            </h2>
          </div>

          {/* Single-Line Horizontal Scroller for Steps (3 cards per screen) */}
          <div className="relative">
            <div
              ref={stepsContainerRef}
              className="flex flex-nowrap gap-6 overflow-x-auto pb-6 pt-2 scroll-smooth"
              style={{
                scrollbarWidth: 'auto',
                scrollbarColor: '#ef4444 #111827',
              }}
            >
              {displaySteps.map((item, idx) => {
                const StepIcon = item.icon || UserCheck;
                return (
                  <div
                    key={idx}
                    className="group/card relative bg-[#0e1121] border border-gray-800/80 hover:border-red-500/40 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(239,68,68,0.15)] flex flex-col justify-between w-[85vw] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] shrink-0"
                  >
                    {/* Step Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-xs font-black px-3 py-1 rounded-full text-white bg-gradient-to-r ${item.color}`}>
                        {item.badge}
                      </span>
                      <span className="text-3xl font-black text-gray-800 group-hover/card:text-gray-700 font-mono transition duration-300">
                        {item.step}
                      </span>
                    </div>

                    {/* Icon - Always RED outline & text */}
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 border-2 border-red-500 text-red-500 mb-5 shadow-md shadow-red-500/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover/card:scale-105">
                      <StepIcon className="w-7 h-7 text-red-500" />
                    </div>

                    {/* Body */}
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-bold text-white group-hover/card:text-red-400 transition duration-200">
                        {item.title}
                      </h3>
                      <p className="text-xs font-semibold text-amber-400/90">{item.shortDesc}</p>
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pt-1">
                        {item.desc}
                      </p>
                    </div>

                    {/* Step Connector Indicator for Next Step */}
                    {idx < displaySteps.length - 1 && (
                      <div className="mt-4 pt-3 border-t border-gray-800/50 flex items-center text-[11px] font-semibold text-gray-500 group-hover/card:text-red-400 transition">
                        <span>Next Stage</span>
                        <ArrowRight className="w-3.5 h-3.5 ms-auto" />
                      </div>
                    )}
                    {idx === displaySteps.length - 1 && (
                      <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center text-[11px] font-bold text-amber-400">
                        <span>Crown Champion!</span>
                        <Crown className="w-3.5 h-3.5 ms-auto" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 3. Five Excellence Leagues Section ── */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Popular Excellence Leagues
            </h2>

            <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
              Our system automatically assigns participants to the appropriate league
              based on their age — no manual choice required!
            </p>
          </div>

          {/* Single-Line 4-Card Horizontal Scroller (Excellence League Card Style, No Buttons) */}
          <div className="relative">
            <div
              className="flex flex-nowrap gap-6 overflow-x-auto pb-6 pt-2 scroll-smooth"
              style={{
                scrollbarWidth: 'auto',
                scrollbarColor: '#ef4444 #111827',
              }}
            >
              {displayLeagues.map((league, idx) => {
                const LeagueIcon = league.icon || Palette;
                const redirectUrl = league.slug ? `/excellence-league/${league.slug}` : "/excellence-league";

                return (
                  <Link
                    key={league.id || idx}
                    to={redirectUrl}
                    className="group relative bg-[#0e1121] border border-gray-800/80 hover:border-red-500/50 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_35px_rgba(239,68,68,0.18)] cursor-pointer w-[85vw] sm:w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)] shrink-0 h-[290px]"
                  >
                    <div className="space-y-4">
                      {/* Emoji + Age Badge */}
                      <div className="flex items-center justify-between">
                        <span className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-2xl flex items-center justify-center shadow-md">
                          {league.emoji || '🏆'}
                        </span>

                        {league.age && (
                          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {(league.age || '').replace(/\s*Years?/gi, '').trim()}
                          </span>
                        )}
                      </div>

                      {/* League Name */}
                      <div className="flex items-center gap-2 pt-1">
                        <LeagueIcon className="w-5 h-5 text-red-500 shrink-0" />
                        <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors leading-tight font-['Montserrat']">
                          {league.name}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-300 leading-relaxed line-clamp-3 font-medium">
                        {league.desc}
                      </p>
                    </div>

                    {/* Bottom Link Action */}
                    <div className="pt-3 border-t border-gray-800/60 flex items-center text-xs font-bold text-red-400 group-hover:text-red-300 transition-colors">
                      <span>Explore League</span>
                      <ArrowRight className="w-4 h-4 ms-auto group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
        {/* ── 4. Preparation & Competition Details Section ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contest Preparation Card */}
          <div className="bg-[#0e1121] border border-gray-800 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {preparation.title || 'Contest Preparation Details'}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {preparation.subtitle || 'Before every contest, participants can visit the Contest Details page to prepare with full clarity and confidence:'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {displayPrepItems.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#12162c] border border-gray-800/80 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-800 text-xs text-amber-400/90 font-medium">
              {preparation.footerNote || '💡 Sample activities provided where applicable to boost student confidence!'}
            </div>
          </div>

          {/* School Competition & Activities Card */}
          <div className="bg-[#0e1121] border border-gray-800 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {competition.title || 'Participate at Your School'}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {competition.subtitle || 'On competition day, registered participants compete right at their own school. Depending on the league, challenges include:'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {displayActivities.map((activity, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-2 rounded-xl bg-[#12162c] border border-gray-700/60 text-xs font-semibold text-gray-200 hover:text-white hover:border-red-500/40 transition duration-200 flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-red-400" />
                  {activity}
                </span>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed">
              {competition.progressionNote || '🏆 School Winner Progression: Top 3 participants (1st 🥇, 2nd 🥈, 3rd 🥉) from each league qualify for the Sub-Division level!'}
            </div>
          </div>
        </section>

        {/* ── 5. Recognition at Every Stage ── */}
        <section className="space-y-10">
          <div className="text-center space-y-3">

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              {recognition.title || 'Recognition at Every Stage'}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
              {recognition.subtitle || "Every participant's effort is valued and celebrated at every step of their journey."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayRecognitionStages.map((stage, idx) => {
              const StageIcon = stage.icon || Medal;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-[#0e1121] border border-gray-800 hover:border-gray-700 transition duration-300 flex items-start gap-4"
                >
                  <div className={`w-12 h-12 rounded-2xl ${stage.bg || 'bg-blue-500/10'} flex items-center justify-center shrink-0`}>
                    <StageIcon className={`w-6 h-6 ${stage.color || 'text-blue-400'}`} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">{stage.title}</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">{stage.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#140b20] via-[#0e1121] to-[#0a0d24] border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                {recognition.communityTitle || 'KnowChamp Champions Community'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300">
                {recognition.communityDesc || 'Outstanding performers receive certificates, medals, trophies, cash prizes, and the honor of joining our Champions Community.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDownloadModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #991B1B 100%)',
                boxShadow: '0 4px 18px rgba(239, 68, 68, 0.4)',
              }}
              className="px-6 py-3 btn-brand-primary text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg whitespace-nowrap transition duration-200 cursor-pointer"
            >
              Join Champions
            </button>
          </div>
        </section>

        {/* ── 6. More Than Just a Competition & Skills Developed ── */}
        <section className="bg-[#0e1121] border border-gray-800 rounded-3xl p-8 sm:p-12 space-y-10">
          <div className="max-w-3xl space-y-3">

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              {skills.title || 'More Than Just a Competition'}
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              {skills.description || 'The KnowChamp Excellence League is not just about winning prizes. It is about discovering potential and building lifelong skills that help children succeed in school and beyond.'}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Essential Skills Developed:
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {displaySkills.map((skill, idx) => {
                const SkillIcon = skill.icon || Palette;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#12162c] border border-gray-800/80 flex items-center gap-3 hover:border-red-500/30 transition duration-200 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                      <SkillIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-gray-200 group-hover:text-white">
                      {skill.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 7. Rules & Fair Play Callout Banner (Preserving existing Callout CMS & CTA) ── */}
        <section className="rounded-3xl bg-gradient-to-r from-[#140b20] to-[#0a0d24] border border-red-500/20 p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-4 max-w-2xl">


            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {callout.title || 'Rules & Fair Play Guidelines'}
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              {callout.description || 'We employ state-of-the-art anti-cheat detection, quick results calculation, and multi-signature security protocols to ensure that all contests are completely clean, secure, and 100% fair.'}
            </p>

            {bulletPoints.length > 0 && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-gray-200 pt-2 font-semibold">
                {bulletPoints.map((point, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-red-500 font-bold">✔</span> {point}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => setIsDownloadModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #991B1B 100%)',
                boxShadow: '0 4px 18px rgba(239, 68, 68, 0.4)',
              }}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 btn-brand-primary text-white font-bold rounded-xl shadow-lg transition-all duration-300 cursor-pointer"
            >
              <span>Register Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <Link
              to={callout.ctaLink || '/contests'}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#12162c] hover:bg-gray-800 text-white font-bold rounded-xl border border-gray-700 transition-all duration-300"
            >
              <span>{callout.ctaText || 'Explore Contests'}</span>
            </Link>
          </div>
        </section>

        {/* ── 8. Final Roadmap Summary Banner ── */}
        <section className="text-center bg-gradient-to-b from-[#0e1121] to-[#0a0d1e] border border-gray-800 rounded-3xl p-8 sm:p-12 space-y-6">
          <h3 className="text-xl sm:text-3xl font-black text-white">
            {summaryBanner.title || 'Your Journey to Excellence'}
          </h3>



          <div className="space-y-1">
            <p className="text-lg font-bold text-white">{summaryBanner.titleTagline || 'KnowChamp Excellence League'}</p>
            <p className="text-sm text-gray-400">{summaryBanner.subTagline || "India's First Holistic Child Excellence League"}</p>
            <p className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 pt-2">
              {summaryBanner.motto || 'Answer Right. Shine Bright.'}
            </p>
          </div>
        </section>

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

export default HowItWorks;

