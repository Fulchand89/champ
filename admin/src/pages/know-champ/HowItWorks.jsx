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
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import cmsService from '../../api/services/cmsService';

// Lightweight Icon Resolver
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
  };
  const IconComponent = iconMap[iconName] || Sparkles;
  return <IconComponent className={className} />;
};

// Step Card Color Themes matching Screenshot 1
const STEP_THEMES = [
  {
    pill: 'bg-red-600 text-white',
    iconBox: 'bg-red-500/10 border-red-500/40 text-red-500',
    border: 'border-red-500/20 hover:border-red-500/50',
  },
  {
    pill: 'bg-amber-600 text-white',
    iconBox: 'bg-amber-500/10 border-amber-500/40 text-amber-500',
    border: 'border-amber-500/50 ring-1 ring-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]', // Highlighted Card 2 in Screenshot 1
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

// Default 8-step roadmap configuration matching Screenshot 1
const DEFAULT_STEPS = [
  {
    id: 1,
    stepNumber: '01',
    icon: 'Download',
    title: 'Download & Install',
    shortDesc: 'Quick & Simple Onboarding',
    description: 'Download the official KnowChamp App from our website and install it on your device.',
    displayOrder: 1,
  },
  {
    id: 2,
    stepNumber: '02',
    icon: 'UserCheck',
    title: 'Create Account',
    shortDesc: 'Age-Tailored Assignment',
    description: 'Register in seconds using your mobile number and verify via a secure OTP.',
    displayOrder: 2,
  },
  {
    id: 3,
    stepNumber: '03',
    icon: 'Wallet',
    title: 'Add Wallet Money',
    shortDesc: 'Confident Preparation',
    description: 'Deposit funds using secure payment gateways (UPI, cards, wallets) to join cash contests.',
    displayOrder: 3,
  },
  {
    id: 4,
    stepNumber: '04',
    icon: 'Play',
    title: 'Play Live Quizzes',
    shortDesc: 'Compete at Your School',
    description: 'Join active contests, answer multiple-choice questions accurately, and score points.',
    displayOrder: 4,
  },
  {
    id: 5,
    stepNumber: '05',
    icon: 'Trophy',
    title: 'School Champions',
    shortDesc: 'Top 3 Qualifiers',
    description: 'Schools announce 1st 🥇, 2nd 🥈, and 3rd 🥉 place winners per league who qualify for Sub-Division.',
    displayOrder: 5,
  },
  {
    id: 6,
    stepNumber: '06',
    icon: 'MapPin',
    title: 'Sub-Division Level',
    shortDesc: 'Broader Stage Platform',
    description: 'School winners across the same Sub-Division compete head-to-head, giving students a broader platform.',
    displayOrder: 6,
  },
  {
    id: 7,
    stepNumber: '07',
    icon: 'Landmark',
    title: 'District Championship',
    shortDesc: 'Best Across District',
    description: 'Top performers from Sub-Divisions advance to the District Level, competing with elite minds across district.',
    displayOrder: 7,
  },
  {
    id: 8,
    stepNumber: '08',
    icon: 'Crown',
    title: 'State Grand Finale',
    shortDesc: 'Grand Pinnacle Event',
    description: 'District champions clash at the State Grand Finale for prestigious titles, trophies, medals, certificates, and cash prizes!',
    displayOrder: 8,
  },
];

// Default 5 Excellence Leagues configuration matching Screenshot 2
const DEFAULT_LEAGUES = [
  {
    slug: 'creative-league',
    emoji: '🎨',
    icon: 'Palette',
    name: 'Creative League',
    age: 'Age 3–5',
    desc: 'Engaging, age-appropriate activities, craft & drawing to ignite early imagination and creative confidence.',
    borderColor: 'border-pink-900/30 hover:border-pink-500/50',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  },
  {
    slug: 'knowledge-league',
    emoji: '📚',
    icon: 'BookOpen',
    name: 'Knowledge League',
    age: 'Age 6–8',
    desc: 'Interactive quizzes, curious exploration, and general awareness designed to build foundational understanding.',
    borderColor: 'border-blue-900/30 hover:border-blue-500/50',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  {
    slug: 'communication-league',
    emoji: '🎤',
    icon: 'Mic',
    name: 'Communication League',
    age: 'Age 9–12',
    desc: 'Storytelling, public speaking, dynamic expression, and clear articulation to cultivate confident speakers.',
    borderColor: 'border-amber-500/80 ring-1 ring-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.2)]', // Highlighted card in Screenshot 2
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    featured: true,
  },
  {
    slug: 'innovation-league',
    emoji: '💡',
    icon: 'Lightbulb',
    name: 'Innovation League',
    age: 'Age 13–16',
    desc: 'Practical problem solving, innovation challenges, and creative thinking for future-ready problem solvers.',
    borderColor: 'border-teal-900/30 hover:border-teal-500/50',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  },
  {
    slug: 'character-league',
    emoji: '🌟',
    icon: 'Star',
    name: 'Character League',
    age: 'Age 17–19',
    desc: 'Personality and character assessment, ethics, leadership, and emotional intelligence for young leaders.',
    borderColor: 'border-purple-900/30 hover:border-purple-500/50',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
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
  const heroTitle = cmsData?.hero?.title || 'How the KnowChamp';
  const heroHighlight = cmsData?.hero?.titleHighlight || 'Works';
  const heroSubtitle = cmsData?.hero?.subtitle || 'Your Journey from School Champion to State Champion Starts Here! Simple, exciting, and fair — every participant gets the opportunity to learn, compete, and shine bright.';

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

  return (
    <div className="min-h-screen bg-[#060913] text-white flex flex-col font-sans select-none overflow-x-hidden">
      <ScrollToTop />
      <Navbar />

      {/* ── Page Hero Section ── */}
      <section className="relative pt-32 pb-16 bg-[#060913] border-b border-gray-900 flex flex-col items-center text-center px-4 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm font-semibold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span>{heroBadge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            {heroTitle}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-500">
              {heroHighlight}
            </span>
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-medium">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* ── 1. STEP-BY-STEP ROADMAP GRID (Matching Screenshot 1 Layout) ── */}
      <section className="py-12 sm:py-16 bg-[#060913]">
        <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* ── 2. POPULAR EXCELLENCE LEAGUES SECTION (Matching Screenshot 2 Layout) ── */}
      <section className="py-16 bg-[#040711] border-t border-b border-white/5">
        <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Section Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Popular Excellence Leagues
            </h2>
            <p className="text-gray-300 text-sm sm:text-base font-medium leading-relaxed">
              Our system automatically assigns participants to the appropriate league based on their age — no manual choice required!
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

      {/* ── 3. FAIR PLAY CALLOUT BANNER ── */}
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

      <Footer />
    </div>
  );
};

export default HowItWorks;
