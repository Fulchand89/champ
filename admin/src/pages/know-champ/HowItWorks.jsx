import React, { useState, useEffect, useRef } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Zap,
  Target,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import cmsService from '../../api/services/cmsService';
import { initAdminSocket } from '../../api/services/adminSocketService';
import AppDownloadModal from '../../components/know-champ/AppDownloadModal';

// Dynamic Icon Resolver
const renderDynamicIcon = (iconName, className = "w-6 h-6") => {
  const iconMap = {
    UserCheck,
    Sparkles,
    BookOpen,
    Building2,
    Medal,
    MapPin,
    Landmark,
    Crown,
    Trophy,
    Award,
    Palette,
    Mic,
    Lightbulb,
    Star,
    Brain,
    Flame,
    Compass,
    ShieldCheck,
    CheckCircle2,
    HelpCircle,
    Download,
    Wallet,
    Play,
    Zap,
    Target,
    FileText,
  };
  const IconComponent = iconMap[iconName] || Sparkles;
  return <IconComponent className={className} />;
};

// Website-harmonious Step Card Themes
const STEP_THEMES = [
  {
    pill: 'bg-red-500/15 border border-red-500/30 text-red-400',
    iconBox: 'bg-red-500/10 border-red-500/30 text-red-400',
    border: 'border-white/10 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]',
  },
  {
    pill: 'bg-orange-500/15 border border-orange-500/30 text-orange-400',
    iconBox: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    border: 'border-white/10 hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]',
  },
  {
    pill: 'bg-amber-500/15 border border-amber-500/30 text-amber-400',
    iconBox: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    border: 'border-white/10 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
  },
  {
    pill: 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400',
    iconBox: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    border: 'border-white/10 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
  },
  {
    pill: 'bg-blue-500/15 border border-blue-500/30 text-blue-400',
    iconBox: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    border: 'border-white/10 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
  },
  {
    pill: 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400',
    iconBox: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    border: 'border-white/10 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]',
  },
  {
    pill: 'bg-purple-500/15 border border-purple-500/30 text-purple-400',
    iconBox: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    border: 'border-white/10 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]',
  },
  {
    pill: 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold',
    iconBox: 'bg-amber-500/10 border-amber-500/40 text-amber-400',
    border: 'border-amber-500/40 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]',
  },
];

// Fallback Default Content (Official KnowChamp Structure)
const DEFAULT_STEPS = [
  {
    id: 1,
    stepNumber: '01',
    icon: 'UserCheck',
    title: 'Register',
    shortDesc: 'Quick & Simple Onboarding',
    description: 'Register through your School Coordinator or directly on the KnowChamp platform. Simply enter your basic details, including your Date of Birth.',
    displayOrder: 1,
  },
  {
    id: 2,
    stepNumber: '02',
    icon: 'Sparkles',
    title: 'Automatic League Selection',
    shortDesc: 'Age-Tailored Assignment',
    description: 'Based on your age, the system automatically assigns you to the appropriate Excellence League without needing to choose yourself.',
    displayOrder: 2,
  },
  {
    id: 3,
    stepNumber: '03',
    icon: 'BookOpen',
    title: 'View Details & Prepare',
    shortDesc: 'Confident Preparation',
    description: 'Before every contest, visit the Contest Details page to view theme, assessed skills, contest pattern, duration, rules, and sample activities.',
    displayOrder: 3,
  },
  {
    id: 4,
    stepNumber: '04',
    icon: 'Building2',
    title: 'Participate at Your School',
    shortDesc: 'Campus Competition Day',
    description: 'On the scheduled competition day, all registered participants compete at their own school in quizzes, creative activities, speaking, and problem solving.',
    displayOrder: 4,
  },
  {
    id: 5,
    stepNumber: '05',
    icon: 'Trophy',
    title: 'School Champions Selected',
    shortDesc: 'Podium Qualification',
    description: 'Schools announce 1st 🥇, 2nd 🥈, and 3rd 🥉 place winners per league who advance to the Sub-Division Level. Every participant is recognized.',
    displayOrder: 5,
  },
  {
    id: 6,
    stepNumber: '06',
    icon: 'MapPin',
    title: 'Compete at Sub-Division',
    shortDesc: 'Cluster Tournament',
    description: 'Winners from participating schools within the same Sub-Division compete against one another, giving students a broader showcase platform.',
    displayOrder: 6,
  },
  {
    id: 7,
    stepNumber: '07',
    icon: 'Landmark',
    title: 'District Championship',
    shortDesc: 'Elite Regional Arena',
    description: 'Top performers from each Sub-Division qualify for the District Level, competing with the finest young minds across the entire district.',
    displayOrder: 7,
  },
  {
    id: 8,
    stepNumber: '08',
    icon: 'Crown',
    title: 'State Grand Finale',
    shortDesc: 'Championship Pinnacle',
    description: 'Highest-performing participants from every district advance to the State Grand Finale, competing for trophies, medals, and cash prizes!',
    displayOrder: 8,
  },
];

const DEFAULT_LEAGUES = [
  {
    emoji: '🎨',
    name: 'Creative League',
    age: 'Age 3–5 Years',
    slug: 'creative-league',
    desc: 'Encouraging imagination, artistic expression, observation, and creative visual thinking.',
    icon: 'Palette',
    badgeColor: 'bg-pink-500/10 text-pink-300 border-pink-500/30',
    borderColor: 'border-pink-500/30 hover:border-pink-500/60 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]',
  },
  {
    emoji: '📚',
    name: 'Knowledge League',
    age: 'Age 6–8 Years',
    slug: 'knowledge-league',
    desc: 'Encouraging practical problem solving, general awareness, critical thinking, and core knowledge.',
    icon: 'BookOpen',
    badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    borderColor: 'border-blue-500/30 hover:border-blue-500/60 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
  },
  {
    emoji: '🎤',
    name: 'Communication League',
    age: 'Age 9–12 Years',
    slug: 'communication-league',
    desc: 'Enhancing storytelling, public speaking, dynamic expression, and clear articulation.',
    icon: 'Mic',
    badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    borderColor: 'border-purple-500/30 hover:border-purple-500/60 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]',
  },
  {
    emoji: '💡',
    name: 'Innovation League',
    age: 'Age 13–16 Years',
    slug: 'innovation-league',
    desc: 'Encouraging tech concepts, scientific thinking, practical innovation, and problem solving.',
    icon: 'Lightbulb',
    badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    borderColor: 'border-amber-500/30 hover:border-amber-500/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
  },
  {
    emoji: '🌟',
    name: 'Character League',
    age: 'Age 17–19 Years',
    slug: 'character-league',
    desc: 'Building leadership principles, ethical decision making, EQ assessment, and social impact.',
    icon: 'Star',
    badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    borderColor: 'border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
  },
];

const DEFAULT_PREP_ITEMS = [
  { title: 'Contest Theme', desc: 'Core subject and creative focus for the scheduled event' },
  { title: 'Skills to be Assessed', desc: 'Clear evaluation criteria and competencies measured' },
  { title: 'Contest Pattern', desc: 'Activity rounds, quiz formats, and scoring methodology' },
  { title: 'Duration & Timing', desc: 'Exact time limits allocated for every test segment' },
  { title: 'Rules & Instructions', desc: 'Official fairness guidelines and conduct rules' },
  { title: 'Sample Activities', desc: 'Practical walkthrough examples for confident prep' },
];

const DEFAULT_COMP_ACTIVITIES = [
  'Quiz Questions',
  'Creative Activities',
  'Drawing and Craft',
  'Storytelling',
  'Public Speaking',
  'Innovation Challenges',
  'Practical Activities',
  'Problem Solving',
  'Personality Assessment',
];

const DEFAULT_RECOGNITION_STAGES = [
  { icon: 'Award', title: 'Participation Certificate', desc: 'Awarded to every registered participant celebrating effort and courage.' },
  { icon: 'Medal', title: 'Merit Recognition', desc: 'Special honors for high-scoring students across all league categories.' },
  { icon: 'Trophy', title: 'School Champion', desc: 'Top 3 performers in each league qualifying for the Sub-Division round.' },
  { icon: 'Trophy', title: 'Sub-Division Champion', desc: 'Cluster winners advancing to the prestigious District Championship.' },
  { icon: 'Trophy', title: 'District Champion', desc: 'District finalists earning their honored spot in the State Grand Finale.' },
  { icon: 'Crown', title: 'State Champion', desc: 'Statewide title winners awarded medals, trophies, certificates, and cash prizes.' },
];

const DEFAULT_SKILLS = [
  { name: 'Creativity', icon: 'Palette' },
  { name: 'Knowledge', icon: 'BookOpen' },
  { name: 'Critical Thinking', icon: 'Brain' },
  { name: 'Communication', icon: 'Mic' },
  { name: 'Innovation', icon: 'Lightbulb' },
  { name: 'Confidence', icon: 'Flame' },
  { name: 'Leadership', icon: 'Crown' },
  { name: 'Character', icon: 'Star' },
  { name: 'Problem Solving', icon: 'Compass' },
  { name: 'Competitive Spirit', icon: 'Trophy' },
];

const HowItWorks = () => {
  const [cmsData, setCmsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const stepsScrollRef = useRef(null);

  const scrollSteps = (direction) => {
    if (stepsScrollRef.current) {
      const containerWidth = stepsScrollRef.current.clientWidth;
      const scrollAmount = direction === 'left' ? -containerWidth * 0.75 : containerWidth * 0.75;
      stepsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const fetchCmsData = async () => {
    try {
      const res = await cmsService.getPublicHowItWorks();
      if (res?.success && res.data) {
        setCmsData(res.data);
      }
    } catch (err) {
      console.error('Error loading HowItWorks CMS content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchCmsData();

    // Socket listener for instant CMS update from Admin Panel
    const socket = initAdminSocket();
    const handleCmsUpdate = (updatedData) => {
      if (updatedData) {
        setCmsData(updatedData);
      }
    };
    socket.on('cms_how_it_works_updated', handleCmsUpdate);

    const pollInterval = setInterval(() => {
      if (isMounted) fetchCmsData();
    }, 4000);

    const handleFocus = () => {
      if (isMounted) fetchCmsData();
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      isMounted = false;
      socket.off('cms_how_it_works_updated', handleCmsUpdate);
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  // Merge CMS dynamic content with official defaults
  const heroTitle = cmsData?.hero?.title || 'How the KnowChamp Excellence League';
  const heroHighlight = cmsData?.hero?.titleHighlight || 'Works';
  const heroSubtitle = cmsData?.hero?.subtitle || 'Your Journey from School Champion to State Champion Starts Here! Discover, compete, and shine bright.';

  const stepsList = Array.isArray(cmsData?.steps) && cmsData.steps.length > 0
    ? [...cmsData.steps].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    : DEFAULT_STEPS;

  const leaguesList = Array.isArray(cmsData?.leagues) && cmsData.leagues.length > 0
    ? cmsData.leagues
    : DEFAULT_LEAGUES;

  const prepTitle = cmsData?.preparation?.title || 'View Contest Details and Prepare';
  const prepSubtitle = cmsData?.preparation?.subtitle || 'Before every contest, participants can review complete competition guidelines to prepare with full confidence.';
  const prepItems = Array.isArray(cmsData?.preparation?.items) && cmsData.preparation.items.length > 0
    ? cmsData.preparation.items
    : DEFAULT_PREP_ITEMS;
  const prepFooterNote = cmsData?.preparation?.footerNote || 'Comprehensive syllabus & sample questions available on each League page.';

  const compTitle = cmsData?.competition?.title || 'Participate at Your School';
  const compSubtitle = cmsData?.competition?.subtitle || 'On the scheduled competition day, all registered participants compete at their own school.';
  const compActivities = Array.isArray(cmsData?.competition?.activities) && cmsData.competition.activities.length > 0
    ? cmsData.competition.activities
    : DEFAULT_COMP_ACTIVITIES;
  const compNote = cmsData?.competition?.progressionNote || 'Top 3 performers from each league qualify for the Sub-Division Level.';

  const recTitle = cmsData?.recognition?.title || 'Recognition at Every Stage';
  const recSubtitle = cmsData?.recognition?.subtitle || "Every participant's effort is valued, recognized, and celebrated across every level of the championship.";
  const recStages = Array.isArray(cmsData?.recognition?.stages) && cmsData.recognition.stages.length > 0
    ? cmsData.recognition.stages
    : DEFAULT_RECOGNITION_STAGES;
  const commTitle = cmsData?.recognition?.communityTitle || 'KnowChamp Champions Community';
  const commDesc = cmsData?.recognition?.communityDesc || 'Outstanding performers receive certificates, medals, trophies, cash prizes, and become part of the KnowChamp Champions Community.';

  const skillsTitle = cmsData?.skills?.title || 'More Than Just a Competition';
  const skillsDesc = cmsData?.skills?.description || 'The KnowChamp Excellence League is not just about winning prizes. It is about discovering potential and building lifelong skills.';
  const skillsList = Array.isArray(cmsData?.skills?.items) && cmsData.skills.items.length > 0
    ? cmsData.skills.items
    : DEFAULT_SKILLS;

  const calloutTitle = cmsData?.callout?.title || 'Rules & Fair Play Guidelines';
  const calloutDesc = cmsData?.callout?.description || 'The KnowChamp Excellence League is designed to be simple, exciting, and fair. Every participant gets an equal opportunity to shine.';
  const ctaText = cmsData?.callout?.ctaText || 'Start Exploring Contests';
  const ctaLink = cmsData?.callout?.ctaLink || '/contests';

  const summaryTitle = cmsData?.summaryBanner?.title || 'Your Journey to Excellence';
  const summaryTagline = cmsData?.summaryBanner?.titleTagline || 'From School Champion to State Champion';
  const summarySubTagline = cmsData?.summaryBanner?.subTagline || "India's First Holistic Child Excellence League";
  const summaryMotto = cmsData?.summaryBanner?.motto || 'Answer Right. Shine Bright.';

  return (
    <div className="min-h-screen bg-[#090b15] text-white flex flex-col font-sans select-none overflow-x-hidden">
      <ScrollToTop />
      <Navbar />

      {/* ── 1. PAGE HERO SECTION ── */}
      <section className="relative pt-36 pb-20 bg-gradient-to-b from-[#0b0c16] via-[#100713] to-[#090b15] border-b border-gray-900 flex flex-col items-center text-center px-4 overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-4xl mx-auto">
          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            {heroTitle}{' '}
            {heroHighlight && (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-500">
                {heroHighlight}
              </span>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base font-medium leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* ── 2. STEP-BY-STEP ROADMAP (SINGLE ROW HORIZONTAL SCROLLER) ── */}
      <section className="py-16 bg-[#090b15]">
        <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Section Header: Centered without scroll buttons */}
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              The 8-Stage Championship Journey
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm">
              Simple, exciting, and fair progression from school level to the statewide grand finale.
            </p>
          </div>

          {/* Single Row Horizontal Scroll Container - 3 cards visible per view on desktop */}
          <div
            ref={stepsScrollRef}
            className="flex items-stretch gap-5 overflow-x-auto no-scrollbar scroll-smooth py-3 px-1 snap-x snap-mandatory"
          >
            {stepsList.map((step, idx) => {
              const theme = STEP_THEMES[idx % STEP_THEMES.length];
              const stepNo = step.stepNumber || String(idx + 1).padStart(2, '0');

              return (
                <div
                  key={step.id || idx}
                  className={`w-[85%] sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)] flex-shrink-0 snap-start bg-[#0f111d] border rounded-3xl p-6 shadow-2xl flex flex-col justify-between transition-all duration-300 relative group overflow-hidden ${theme.border}`}
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
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                      {step.description}
                    </p>
                  </div>

                  {/* Card Bottom Link / Action */}
                  <div className="pt-5 mt-4 border-t border-white/5">
                    {idx === 0 ? (
                      <button
                        type="button"
                        onClick={() => setIsDownloadModalOpen(true)}
                        className="w-full flex items-center justify-between text-xs font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Download className="w-3.5 h-3.5" />
                          Register Now
                        </span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    ) : (
                      <div className="flex items-center justify-between text-xs font-bold text-gray-400 group-hover:text-red-400 transition-colors">
                        <span>Next Stage</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. POPULAR EXCELLENCE LEAGUES SECTION ── */}
      <section className="py-16 bg-[#0c0e18] border-t border-b border-white/5">
        <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              5 Age-Appropriate Excellence Leagues
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm">
              Each league is specially designed with engaging activities that help participants learn while enjoying the competition.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {leaguesList.map((lg, idx) => (
              <Link
                key={lg.slug || idx}
                to={`/excellence-leagues/${lg.slug}`}
                className={`bg-[#0f111d] border rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-300 group hover:scale-[1.02] cursor-pointer relative overflow-hidden ${lg.borderColor || 'border-white/10 hover:border-red-500/40'}`}
              >
                <div className="space-y-4">
                  {/* Top Bar: Emoji on Left, Age Badge on Right */}
                  <div className="flex items-center justify-between">
                    <span className="text-3xl group-hover:scale-110 transition-transform">
                      {lg.emoji}
                    </span>
                    {lg.age && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${lg.badgeColor || 'bg-white/10 text-white border-white/20'}`}>
                        {lg.age}
                      </span>
                    )}
                  </div>

                  {/* Title & Icon Header */}
                  <div className="flex items-center gap-2 pt-2">
                    {renderDynamicIcon(lg.icon || 'Sparkles', "w-5 h-5 text-gray-300")}
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                      {lg.name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                    {lg.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-red-400 group-hover:text-red-300 transition-colors">
                  <span>Explore League</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. CONTEST PREPARATION & SCHOOL COMPETITION DETAILS ── */}
      <section className="py-16 bg-[#090b15]">
        <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Card 1: View Contest Details & Prepare */}
            <div className="bg-[#0f111d] border border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-white">{prepTitle}</h3>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed">{prepSubtitle}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {prepItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/30 transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-white">{typeof item === 'string' ? item : item.title}</h4>
                        {item.desc && <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{item.desc}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {prepFooterNote && (
                <div className="pt-4 border-t border-white/5 text-xs text-amber-400/90 font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>{prepFooterNote}</span>
                </div>
              )}
            </div>

            {/* Card 2: Participate at Your School */}
            <div className="bg-[#0f111d] border border-emerald-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-white">{compTitle}</h3>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed">{compSubtitle}</p>

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

              {compNote && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 font-bold flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>{compNote}</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── 5. RECOGNITION AT EVERY STAGE SECTION ── */}
      <section className="py-16 bg-[#0c0e18] border-t border-b border-white/5">
        <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {recTitle}
            </h2>
            <p className="text-gray-300 text-sm sm:text-base font-medium leading-relaxed">
              {recSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recStages.map((stage, idx) => (
              <div
                key={idx}
                className="bg-[#0f111d] border border-white/10 rounded-3xl p-6 shadow-xl flex items-start gap-4 hover:border-amber-500/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                  {renderDynamicIcon(stage.icon || 'Medal', "w-6 h-6")}
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white tracking-tight">
                    {stage.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                    {stage.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Champions Community Banner */}
          <div className="bg-gradient-to-r from-red-950/30 via-[#0f111d] to-amber-950/30 border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-2 max-w-2xl">
              <h3 className="text-xl sm:text-2xl font-black text-white">{commTitle}</h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{commDesc}</p>
            </div>

            <button
              type="button"
              onClick={() => setIsDownloadModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #991B1B 100%)',
                boxShadow: '0 4px 18px rgba(239, 68, 68, 0.4)',
              }}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white font-bold rounded-xl text-sm tracking-wide transition-all duration-300 hover:opacity-95 hover:scale-[1.02] cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Register Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* ── 6. MORE THAN JUST A COMPETITION (HOLISTIC GROWTH SKILLS) ── */}
      <section className="py-16 bg-[#090b15]">
        <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {skillsTitle}
            </h2>
            <p className="text-gray-300 text-sm sm:text-base font-medium leading-relaxed">
              {skillsDesc}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {skillsList.map((skill, idx) => (
              <div
                key={idx}
                className="bg-[#0f111d] border border-white/10 rounded-2xl p-4 sm:p-5 text-center space-y-3 hover:border-red-500/40 hover:scale-105 transition-all group"
              >
                <div className="w-10 h-10 mx-auto rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                  {renderDynamicIcon(skill.icon || 'Star', "w-5 h-5")}
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {typeof skill === 'string' ? skill : skill.name}
                </h3>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 7. YOUR JOURNEY TO EXCELLENCE (FLOW BANNER) ── */}
      <section className="py-12 bg-[#0c0e18] border-t border-b border-white/5">
        <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-950/40 via-[#0f111d] to-amber-950/40 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-center">
            
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">{summaryTitle}</h3>
              <p className="text-amber-400 text-xs sm:text-sm font-bold uppercase tracking-wider">{summaryTagline}</p>
            </div>

            {/* Step Flow Path */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-extrabold">
              <span className="px-4 py-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30">Register</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className="px-4 py-2 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-500/30">Auto League</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">Prepare</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Compete at School</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">Sub-Division</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">District</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black shadow-lg">State Champion! 👑</span>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col items-center justify-center space-y-1">
              <p className="text-gray-300 text-xs sm:text-sm font-semibold">{summarySubTagline}</p>
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-orange-400 text-base sm:text-lg font-black">
                {summaryMotto}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── 8. FAIR PLAY CALLOUT BANNER ── */}
      <section className="py-12 bg-[#090b15]">
        <div className="w-[calc(100%-32px)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-600/20 via-orange-600/20 to-amber-600/20 border border-red-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {calloutTitle}
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{calloutDesc}</p>
            </div>

            <Link
              to={ctaLink}
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #991B1B 100%)',
                boxShadow: '0 4px 18px rgba(239, 68, 68, 0.4)',
              }}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white font-bold rounded-xl text-sm tracking-wide transition-all duration-300 hover:opacity-95 hover:scale-[1.02] cursor-pointer shrink-0"
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 9. OFFICIAL DOCUMENT / CONTACT KNOWCHAMP BOX ── */}
      <section className="pb-16 bg-[#090b15]">
        <div className="w-[calc(100%-32px)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0f111d] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="text-sm font-semibold text-gray-200">
                Have a question about the KnowChamp Excellence League?
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Our team is here to assist schools, parents, and students at every stage.
              </p>
            </div>

            <Link
              to="/contact-us"
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #991B1B 100%)',
                boxShadow: '0 4px 18px rgba(239, 68, 68, 0.4)',
              }}
              className="inline-flex items-center gap-2 px-7 py-3.5 text-white font-bold rounded-xl text-sm tracking-wide transition-all duration-300 hover:opacity-95 hover:scale-[1.02] cursor-pointer shrink-0"
            >
              <span>Contact KnowChamp</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* App Download Modal */}
      <AppDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />

      <Footer />
    </div>
  );
};

export default HowItWorks;
