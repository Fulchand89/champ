import React, { useState, useEffect } from 'react';
import Navbar from '../../components/know-champ/Navbar';
import Footer from '../../components/know-champ/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import { 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Download,
  UserCheck,
  Wallet,
  Play,
  Trophy,
  BookOpen,
  Building2,
  Medal,
  MapPin,
  Landmark,
  Crown,
  Palette,
  Mic,
  Lightbulb,
  Star,
  Award,
  Brain,
  Flame,
  Compass,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  FileText,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import cmsService from '../../api/services/cmsService';

// Dynamic Icon Resolver
const renderDynamicIcon = (iconName, className = "w-6 h-6") => {
  const iconMap = {
    Download,
    UserCheck,
    Wallet,
    Play,
    Trophy,
    Sparkles,
    BookOpen,
    Building2,
    Medal,
    MapPin,
    Landmark,
    Crown,
    Palette,
    Mic,
    Lightbulb,
    Star,
    Award,
    Brain,
    Flame,
    Compass,
    ShieldCheck,
    CheckCircle2,
    HelpCircle,
  };
  const IconComponent = iconMap[iconName] || Sparkles;
  return <IconComponent className={className} />;
};

// Step Card Color Themes
const STEP_THEMES = [
  {
    pill: 'bg-red-600 text-white',
    iconBox: 'bg-red-500/10 border-red-500/40 text-red-500',
    border: 'border-red-500/20 hover:border-red-500/50',
  },
  {
    pill: 'bg-amber-600 text-white',
    iconBox: 'bg-amber-500/10 border-amber-500/40 text-amber-500',
    border: 'border-amber-500/50 ring-1 ring-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
  },
  {
    pill: 'bg-amber-500 text-black font-extrabold',
    iconBox: 'bg-amber-500/10 border-amber-500/40 text-amber-400',
    border: 'border-amber-500/20 hover:border-amber-500/50',
  },
  {
    pill: 'bg-emerald-500 text-black font-extrabold',
    iconBox: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400',
    border: 'border-emerald-500/20 hover:border-emerald-500/50',
  },
  {
    pill: 'bg-blue-600 text-white',
    iconBox: 'bg-blue-500/10 border-blue-500/40 text-blue-400',
    border: 'border-blue-500/20 hover:border-blue-500/50',
  },
  {
    pill: 'bg-purple-600 text-white',
    iconBox: 'bg-purple-500/10 border-purple-500/40 text-purple-400',
    border: 'border-purple-500/20 hover:border-purple-500/50',
  },
  {
    pill: 'bg-indigo-600 text-white',
    iconBox: 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400',
    border: 'border-indigo-500/20 hover:border-indigo-500/50',
  },
  {
    pill: 'bg-rose-600 text-white',
    iconBox: 'bg-rose-500/10 border-rose-500/40 text-rose-400',
    border: 'border-rose-500/20 hover:border-rose-500/50',
  },
];

// Default 8-step roadmap configuration matching official specs
const DEFAULT_STEPS = [
  {
    id: 1,
    stepNumber: '01',
    icon: 'UserCheck',
    title: 'Step 1: Register',
    shortDesc: 'Quick & Simple Onboarding',
    description: 'Register through your School Coordinator or directly on the KnowChamp platform with basic details and Date of Birth.',
    displayOrder: 1,
  },
  {
    id: 2,
    stepNumber: '02',
    icon: 'Sparkles',
    title: 'Step 2: Automatic League Selection',
    shortDesc: 'Age-Tailored Assignment',
    description: 'Based on your age, the system automatically assigns you to the appropriate Excellence League — no manual choice required!',
    displayOrder: 2,
  },
  {
    id: 3,
    stepNumber: '03',
    icon: 'BookOpen',
    title: 'Step 3: View Details & Prepare',
    shortDesc: 'Confident Preparation',
    description: 'Visit the Contest Details page to review theme, assessed skills, pattern, duration, official rules, and sample activities.',
    displayOrder: 3,
  },
  {
    id: 4,
    stepNumber: '04',
    icon: 'Building2',
    title: 'Step 4: Participate at Your School',
    shortDesc: 'Compete at Your School',
    description: 'On competition day, all registered students compete right at their school in quizzes, creative arts, speaking, and problem-solving.',
    displayOrder: 4,
  },
  {
    id: 5,
    stepNumber: '05',
    icon: 'Medal',
    title: 'Step 5: School Champions Selected',
    shortDesc: 'Top 3 Qualifiers',
    description: 'Schools announce 1st 🥇, 2nd 🥈, and 3rd 🥉 place winners per league who qualify for the Sub-Division Level.',
    displayOrder: 5,
  },
  {
    id: 6,
    stepNumber: '06',
    icon: 'MapPin',
    title: 'Step 6: Sub-Division Level',
    shortDesc: 'Broader Stage Platform',
    description: 'School winners across the same Sub-Division compete head-to-head, giving students a broader platform to showcase talent.',
    displayOrder: 6,
  },
  {
    id: 7,
    stepNumber: '07',
    icon: 'Landmark',
    title: 'Step 7: District Championship',
    shortDesc: 'Best Across District',
    description: 'Top performers from Sub-Divisions advance to the District Level, competing with elite minds across the district.',
    displayOrder: 7,
  },
  {
    id: 8,
    stepNumber: '08',
    icon: 'Crown',
    title: 'Step 8: State Grand Finale',
    shortDesc: 'Grand Pinnacle Event',
    description: 'District champions clash at the State Grand Finale for prestigious titles, trophies, medals, certificates, and cash prizes!',
    displayOrder: 8,
  },
];

// Default 5 Excellence Leagues configuration
const DEFAULT_LEAGUES = [
  {
    slug: 'creative-league',
    emoji: '🎨',
    icon: 'Palette',
    name: 'Creative League',
    age: 'Age 3–5 Years',
    desc: 'Engaging, age-appropriate activities, craft & drawing to ignite early imagination and creative confidence.',
    borderColor: 'border-pink-900/30 hover:border-pink-500/50',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  },
  {
    slug: 'knowledge-league',
    emoji: '📚',
    icon: 'BookOpen',
    name: 'Knowledge League',
    age: 'Age 6–8 Years',
    desc: 'Interactive quizzes, curious exploration, and general awareness designed to build foundational understanding.',
    borderColor: 'border-blue-900/30 hover:border-blue-500/50',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  {
    slug: 'communication-league',
    emoji: '🎤',
    icon: 'Mic',
    name: 'Communication League',
    age: 'Age 9–12 Years',
    desc: 'Storytelling, public speaking, dynamic expression, and clear articulation to cultivate confident speakers.',
    borderColor: 'border-amber-500/80 ring-1 ring-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.2)]',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    featured: true,
  },
  {
    slug: 'innovation-league',
    emoji: '💡',
    icon: 'Lightbulb',
    name: 'Innovation League',
    age: 'Age 13–16 Years',
    desc: 'Practical problem solving, innovation challenges, and creative thinking for future-ready problem solvers.',
    borderColor: 'border-teal-900/30 hover:border-teal-500/50',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  },
  {
    slug: 'character-league',
    emoji: '🌟',
    icon: 'Star',
    name: 'Character League',
    age: 'Age 17–19 Years',
    desc: 'Personality and character assessment, ethics, leadership, and emotional intelligence for young leaders.',
    borderColor: 'border-purple-900/30 hover:border-purple-500/50',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
];

// Preparation Features List
const DEFAULT_PREP_ITEMS = [
  { title: 'Contest Theme', desc: 'Detailed theme overview provided beforehand so students can research effectively.' },
  { title: 'Skills Assessed', desc: 'Clear list of key competencies and skills evaluated during the challenge.' },
  { title: 'Contest Pattern', desc: 'Full pattern details so participants know the exact structure of the competition.' },
  { title: 'Duration', desc: 'Explicit duration guidelines to help manage time wisely during live rounds.' },
  { title: 'Rules & Instructions', desc: 'Comprehensive instructions ensuring fair play, compliance, and clarity.' },
  { title: 'Sample Activities', desc: 'Practice examples and sample tasks where applicable for hands-on practice.' },
];

// Competition Activities Tags
const DEFAULT_ACTIVITIES = [
  'Quiz Questions',
  'Creative Activities',
  'Drawing and Craft',
  'Storytelling',
  'Public Speaking',
  'Innovation Challenges',
  'Practical Activities',
  'Problem Solving',
  'Personality and Character Assessment'
];

// Recognition Stages List
const DEFAULT_RECOGNITION_STAGES = [
  { icon: 'Medal', title: 'Participation Certificate 🏅', desc: 'Awarded to every student to value and celebrate their effort and courage.' },
  { icon: 'Award', title: 'Merit Recognition 🥈', desc: 'Special certificates acknowledging commendable performance and effort.' },
  { icon: 'Trophy', title: 'School Champion 🏆', desc: '1st, 2nd, and 3rd place winners per league qualify for the Sub-Division level.' },
  { icon: 'MapPin', title: 'Sub-Division Champion 🏆', desc: 'Sub-Division winners gain regional honors and advance to the District round.' },
  { icon: 'Landmark', title: 'District Champion 🏆', desc: 'Top performers in each district earn prestige and qualify for the State Grand Finale.' },
  { icon: 'Crown', title: 'State Champion 👑', desc: 'Grand trophies, gold medals, certificates, cash prizes, and Champions Community entry.' },
];

// Holistic Growth Skills List
const DEFAULT_SKILLS = [
  { name: 'Creativity', icon: 'Palette' },
  { name: 'Knowledge', icon: 'BookOpen' },
  { name: 'Critical Thinking', icon: 'Brain' },
  { name: 'Communication Skills', icon: 'Mic' },
  { name: 'Innovation', icon: 'Lightbulb' },
  { name: 'Confidence', icon: 'Flame' },
  { name: 'Leadership', icon: 'Crown' },
  { name: 'Character', icon: 'Star' },
  { name: 'Problem-Solving Ability', icon: 'Compass' },
  { name: 'Healthy Competitive Spirit', icon: 'Trophy' },
];

const HowItWorks = () => {
  const [cmsData, setCmsData] = useState(null);

  // Fetch CMS data from Admin API
  useEffect(() => {
    let isMounted = true;
    const fetchCms = async () => {
      try {
        const res = await cmsService.getPublicHowItWorks();
        if (isMounted && res?.success && res.data) {
          setCmsData(res.data);
        }
      } catch (err) {
        console.error('Error loading HowItWorks CMS content:', err);
      }
    };

    fetchCms();
  }, []);

  // Merge Admin CMS data with default values
  const heroBadge = cmsData?.hero?.badgeText || "India's First Holistic Child Excellence League";
  const heroTitle = cmsData?.hero?.title || 'How the KnowChamp Excellence League';
  const heroHighlight = cmsData?.hero?.titleHighlight || 'Works';
  const heroSubtitle = cmsData?.hero?.subtitle || 'Your Journey from School Champion to State Champion Starts Here! Simple, exciting, and fair — every participant gets the opportunity to learn, compete, and progress through multiple levels while developing valuable life skills.';

  const stepsList = Array.isArray(cmsData?.steps) && cmsData.steps.length > 0
    ? [...cmsData.steps].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    : DEFAULT_STEPS;

  const leaguesList = Array.isArray(cmsData?.leagues) && cmsData.leagues.length > 0
    ? cmsData.leagues.map((lg, idx) => {
        const defLg = DEFAULT_LEAGUES.find(d => d.slug === lg.slug) || DEFAULT_LEAGUES[idx % DEFAULT_LEAGUES.length];
        return {
          ...defLg,
          ...lg,
        };
      })
    : DEFAULT_LEAGUES;

  const prepItems = Array.isArray(cmsData?.preparation?.items) && cmsData.preparation.items.length > 0
    ? cmsData.preparation.items
    : DEFAULT_PREP_ITEMS;

  const compActivities = Array.isArray(cmsData?.competition?.activities) && cmsData.competition.activities.length > 0
    ? cmsData.competition.activities
    : DEFAULT_ACTIVITIES;

  const recStages = Array.isArray(cmsData?.recognition?.stages) && cmsData.recognition.stages.length > 0
    ? cmsData.recognition.stages
    : DEFAULT_RECOGNITION_STAGES;

  const skillsList = Array.isArray(cmsData?.skills?.items) && cmsData.skills.items.length > 0
    ? cmsData.skills.items
    : DEFAULT_SKILLS;

  return (
    <div className="min-h-screen bg-[#060913] text-white flex flex-col font-sans select-none overflow-x-hidden">
      <ScrollToTop />
      <Navbar />

      {/* ── 1. PAGE HERO SECTION ── */}
      <section className="relative pt-32 pb-16 bg-[#060913] border-b border-gray-900 flex flex-col items-center text-center px-4 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm font-semibold uppercase tracking-wider backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>{heroBadge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            {heroTitle}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-500">
              {heroHighlight}
            </span>
          </h1>

          <p className="text-gray-400 max-w-3xl mx-auto text-sm sm:text-base leading-relaxed font-medium">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* ── 2. STEP-BY-STEP ROADMAP GRID (8-Step Cards) ── */}
      <section className="py-12 sm:py-16 bg-[#060913]">
        <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              Step-by-Step Excellence Roadmap
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Your Path to Becoming a Champion
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stepsList.map((step, idx) => {
              const theme = STEP_THEMES[idx % STEP_THEMES.length];
              const stepNo = step.stepNumber || String(idx + 1).padStart(2, '0');

              return (
                <div
                  key={step.id || idx}
                  className={`bg-[#0a0e1c] border rounded-3xl p-6 shadow-2xl flex flex-col justify-between transition-all duration-300 relative group overflow-hidden ${theme.border}`}
                >
                  <div className="space-y-4 relative z-10">
                    {/* Top Row: Step Badge & Step Number */}
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${theme.pill}`}>
                        Step {idx + 1}
                      </span>
                      <span className="text-2xl font-black text-white/20 font-mono">
                        {stepNo}
                      </span>
                    </div>

                    {/* Icon Box */}
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${theme.iconBox}`}>
                      {renderDynamicIcon(step.icon || 'Sparkles', "w-6 h-6")}
                    </div>

                    {/* Titles */}
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-white tracking-tight">
                        {step.title}
                      </h3>
                      {step.shortDesc && (
                        <p className="text-xs font-bold text-amber-400">
                          {step.shortDesc}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
                      {step.description}
                    </p>
                  </div>

                  {/* Card Bottom Link */}
                  <div className="pt-6 border-t border-white/5 flex items-center justify-between text-xs font-bold text-gray-400 group-hover:text-white transition-colors">
                    <span>Next Stage</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. POPULAR EXCELLENCE LEAGUES SECTION (5 Leagues Grid) ── */}
      <section className="py-16 bg-[#040711] border-t border-b border-white/5">
        <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Section Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Popular Excellence Leagues
            </h2>
            <p className="text-gray-300 text-sm sm:text-base font-medium leading-relaxed">
              Based on your age, the system automatically assigns you to the appropriate Excellence League — no manual choice required!
            </p>
          </div>

          {/* 5 Horizontal League Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {leaguesList.map((lg, idx) => (
              <Link
                key={lg.slug || idx}
                to={`/excellence-leagues/${lg.slug}`}
                className={`bg-[#0a0e1c] border rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-300 group hover:scale-[1.02] cursor-pointer relative overflow-hidden ${lg.borderColor || 'border-white/10'}`}
              >
                <div className="space-y-4">
                  {/* Top Bar: Icon on Left, Age Badge on Right */}
                  <div className="flex items-center justify-between">
                    <span className="text-3xl group-hover:scale-110 transition-transform">
                      {lg.emoji}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${lg.badgeColor || 'bg-white/10 text-white border-white/20'}`}>
                      {lg.age}
                    </span>
                  </div>

                  {/* Title & Icon Header */}
                  <div className="flex items-center gap-2 pt-2">
                    {renderDynamicIcon(lg.icon || 'Sparkles', "w-5 h-5 text-gray-300")}
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                      {lg.name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
                    {lg.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. CONTEST PREPARATION & SCHOOL COMPETITION DETAILS ── */}
      <section className="py-16 bg-[#060913]">
        <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Card 1: View Contest Details & Prepare */}
            <div className="bg-[#0a0e1c] border border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 3 Details</span>
                    <h3 className="text-2xl font-black text-white">View Contest Details & Prepare</h3>
                  </div>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed">
                  Before every contest, you can visit the Contest Details page to view all key competition parameters so every participant can prepare with confidence:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {prepItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-white">{item.title}</h4>
                        <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 text-xs text-amber-400/90 font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Sample activities provided where applicable to boost participant confidence!</span>
              </div>
            </div>

            {/* Card 2: Participate at Your School */}
            <div className="bg-[#0a0e1c] border border-emerald-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 4 Details</span>
                    <h3 className="text-2xl font-black text-white">Participate at Your School</h3>
                  </div>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed">
                  On scheduled competition days, registered participants compete right at their own school. Depending on the league, the contest includes:
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {compActivities.map((act, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      {act}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-xs text-emerald-200 font-bold flex items-center gap-3">
                <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                <span>School Champions: 🥇 First Place, 🥈 Second Place, 🥉 Third Place winners qualify for the Sub-Division Level!</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 5. RECOGNITION AT EVERY STAGE SECTION ── */}
      <section className="py-16 bg-[#040711] border-t border-b border-white/5">
        <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Celebrated Endeavors
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Recognition at Every Stage
            </h2>
            <p className="text-gray-300 text-sm sm:text-base font-medium leading-relaxed">
              Every participant's effort is valued and celebrated at every single step of their journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recStages.map((stage, idx) => (
              <div
                key={idx}
                className="bg-[#0a0e1c] border border-white/10 rounded-3xl p-6 shadow-xl flex items-start gap-4 hover:border-amber-500/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                  {renderDynamicIcon(stage.icon || 'Medal', "w-6 h-6")}
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white tracking-tight">
                    {stage.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
                    {stage.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Champions Community Banner */}
          <div className="bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-blue-900/30 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>KnowChamp Champions Community</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Join India's Elite League of Young Champions
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                Outstanding performers receive certificates, medals, trophies, cash prizes, and the honor of becoming part of the prestigious KnowChamp Champions Community!
              </p>
            </div>

            <Link
              to="/register/student"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-sm tracking-wide shadow-lg transition-all duration-300 hover:scale-105 shrink-0"
            >
              <span>Register as Student</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* ── 6. MORE THAN JUST A COMPETITION (HOLISTIC GROWTH SKILLS) ── */}
      <section className="py-16 bg-[#060913]">
        <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              Holistic Growth
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              More Than Just a Competition
            </h2>
            <p className="text-gray-300 text-sm sm:text-base font-medium leading-relaxed">
              The KnowChamp Excellence League is not just about winning prizes. It is about discovering potential and building essential lifelong skills that help children succeed in school and beyond.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {skillsList.map((skill, idx) => (
              <div
                key={idx}
                className="bg-[#0a0e1c] border border-white/10 rounded-2xl p-4 sm:p-5 text-center space-y-3 hover:border-red-500/40 hover:scale-105 transition-all group"
              >
                <div className="w-10 h-10 mx-auto rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                  {renderDynamicIcon(skill.icon || 'Star', "w-5 h-5")}
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {skill.name}
                </h3>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 7. YOUR JOURNEY TO EXCELLENCE (FLOW BANNER) ── */}
      <section className="py-12 bg-[#040711] border-t border-b border-white/5">
        <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-950/40 via-[#0a0e1c] to-amber-950/40 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-center">
            
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Your Journey to Excellence
              </h3>
              <p className="text-amber-400 text-xs sm:text-sm font-bold uppercase tracking-wider">
                Simple • Exciting • Transparent • Fair
              </p>
            </div>

            {/* Step Flow Path */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-extrabold">
              <span className="px-4 py-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30">Register</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">Auto League</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">Prepare</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Compete at School</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">Sub-Division</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className="px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">District</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black shadow-lg">State Champion! 👑</span>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col items-center justify-center space-y-1">
              <p className="text-gray-300 text-xs sm:text-sm font-semibold">
                KnowChamp Excellence League — India's First Holistic Child Excellence League
              </p>
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-orange-400 text-base sm:text-lg font-black">
                Answer Right. Shine Bright.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── 8. FAIR PLAY CALLOUT BANNER ── */}
      <section className="py-12 bg-[#060913]">
        <div className="w-[calc(100%-32px)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-600/20 via-orange-600/20 to-amber-600/20 border border-red-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Fair Play & Anti-Cheat</span>
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {cmsData?.callout?.title || 'Rules & Fair Play Guidelines'}
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                {cmsData?.callout?.description || 'State-of-the-art anti-cheat detection, quick results calculation, and multi-signature security protocols ensure all contests are completely clean, secure, and 100% fair.'}
              </p>
            </div>

            <Link
              to={cmsData?.callout?.ctaLink || '/contests'}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-xl text-sm tracking-wide shadow-lg transition-all duration-300 hover:scale-105 shrink-0"
            >
              <span>{cmsData?.callout?.ctaText || 'Start Playing Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 9. OFFICIAL DOCUMENT / CONTACT KNOWCHAMP BOX ── */}
      <section className="pb-16 bg-[#060913]">
        <div className="w-[calc(100%-32px)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0a0e1c] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-red-400" />
                <span>Official Document</span>
              </div>
              <p className="text-sm font-semibold text-gray-300">
                Have a question about the KnowChamp Excellence League document?
              </p>
            </div>

            <Link
              to="/contact-us"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white text-xs sm:text-sm font-bold shadow-md hover:scale-105 transition-transform"
            >
              <span>Contact KnowChamp</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;

