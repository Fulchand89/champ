import React, { useState, useEffect } from 'react';
import Navbar from '../../components/know-champ/Navbar';
import Footer from '../../components/know-champ/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import { 
  ShieldCheck,
  FileText,
  Calendar,
  ArrowRight,
  Sparkles,
  BookOpen,
  Building2,
  Trophy,
  Medal,
  MapPin,
  Landmark,
  Crown,
  Award,
  Star,
  Compass,
  CheckCircle2,
  ChevronRight,
  UserCheck,
  Zap,
  HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import cmsService from '../../api/services/cmsService';
import { initAdminSocket } from '../../api/services/adminSocketService';

const LEAGUES_DATA = [
  {
    emoji: '🎨',
    name: 'Creative League',
    age: 'Age 3–5 Years',
    slug: 'creative-league',
    color: 'border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/10 text-pink-400',
    badge: 'bg-pink-500/10 border-pink-500/30 text-pink-300',
  },
  {
    emoji: '📚',
    name: 'Knowledge League',
    age: 'Age 6–8 Years',
    slug: 'knowledge-league',
    color: 'border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400',
    badge: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
  },
  {
    emoji: '🎤',
    name: 'Communication League',
    age: 'Age 9–12 Years',
    slug: 'communication-league',
    color: 'border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-purple-400',
    badge: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
  },
  {
    emoji: '💡',
    name: 'Innovation League',
    age: 'Age 13–16 Years',
    slug: 'innovation-league',
    color: 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400',
    badge: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  },
  {
    emoji: '🌟',
    name: 'Character League',
    age: 'Age 17–19 Years',
    slug: 'character-league',
    color: 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400',
    badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  },
];

const PREPARATION_ITEMS = [
  'Contest Theme',
  'Skills to be Assessed',
  'Contest Pattern',
  'Duration',
  'Rules and Instructions',
  'Sample Activities, where applicable',
];

const CONTEST_ACTIVITIES = [
  'Quiz Questions',
  'Creative Activities',
  'Drawing and Craft',
  'Storytelling',
  'Public Speaking',
  'Innovation Challenges',
  'Practical Activities',
  'Problem Solving',
  'Personality and Character Assessment',
];

const RECOGNITION_STAGES = [
  { icon: '🏅', title: 'Participation Certificate', desc: 'Given to every participant celebrating effort and commitment' },
  { icon: '🥈', title: 'Merit Recognition', desc: 'Special honours for high-scoring students across all categories' },
  { icon: '🏆', title: 'School Champion', desc: 'Top 3 performers in each league qualifying for Sub-Division' },
  { icon: '🏆', title: 'Sub-Division Champion', desc: 'Winners advancing to the prestigious District Championship' },
  { icon: '🏆', title: 'District Champion', desc: 'Top district finalists earning their place in the Grand Finale' },
  { icon: '👑', title: 'State Champion', desc: 'The ultimate champions winning medals, trophies, and cash prizes' },
];

const SKILLS_LIST = [
  'Creativity',
  'Knowledge',
  'Critical Thinking',
  'Communication Skills',
  'Innovation',
  'Confidence',
  'Leadership',
  'Character',
  'Problem-Solving Ability',
  'Healthy Competitive Spirit',
];

const HowItWorks = () => {
  const [cmsData, setCmsData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-[#090b15] text-white flex flex-col font-sans select-none overflow-x-hidden">
      <ScrollToTop />
      <Navbar />

      {/* ── 1. PAGE HERO SECTION ── */}
      <section className="relative pt-36 pb-16 bg-gradient-to-b from-[#0b0c16] via-[#100713] to-[#090b15] border-b border-gray-900 flex flex-col items-center text-center px-4 overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            Legal Information
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            How the KnowChamp Excellence League{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-500">
              Works
            </span>
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base font-medium leading-relaxed">
            Important information about using the KnowChamp Answer Right. Shine Bright website and services.
          </p>
        </div>
      </section>

      {/* ── 2. FORM SECTION / OFFICIAL DOCUMENT CARD ── */}
      <section className="w-[calc(100%-32px)] max-w-[1050px] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 min-w-0">
        <article className="bg-[#0f111d] rounded-2xl sm:rounded-3xl border border-white/10 p-6 sm:p-10 lg:p-12 shadow-2xl space-y-10 relative overflow-hidden backdrop-blur-xl">
          
          {/* Document Top Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5" />
                Official Document
              </span>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                How the KnowChamp Excellence League Works
              </h2>
            </div>

            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-400 shrink-0">
              <Calendar className="w-4 h-4 text-red-400" />
              <span>Last updated 06 Aug 2026</span>
            </div>
          </div>

          {/* Document Body Content */}
          <div className="space-y-10 text-gray-300 text-sm sm:text-base leading-relaxed">

            {/* Intro Highlight Box */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-red-500/10 via-orange-500/5 to-amber-500/10 border border-red-500/20 space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Your Journey from School Champion to State Champion Starts Here!</span>
              </h3>
              <p className="text-gray-300 leading-relaxed">
                The KnowChamp Excellence League is designed to be simple, exciting, and fair.
                Every participant gets the opportunity to learn, compete, and progress through
                multiple levels while developing valuable life skills.
              </p>
            </div>

            {/* Step 1: Register */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 font-extrabold text-sm flex items-center justify-center shrink-0">
                  01
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Step 1: Register</h3>
              </div>

              <div className="pl-11 space-y-2">
                <p>
                  Register through your School Coordinator or directly on the KnowChamp platform,
                  where applicable.
                </p>
                <p className="text-gray-400">
                  Simply enter your basic details, including your Date of Birth.
                </p>

                <div className="pt-2">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-red-400 hover:text-red-300 transition-colors"
                  >
                    <span>Register Student Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Step 2: Your League is Selected Automatically */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-extrabold text-sm flex items-center justify-center shrink-0">
                  02
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Step 2: Your League is Selected Automatically
                </h3>
              </div>

              <div className="pl-11 space-y-4">
                <p>
                  Based on your age, the system will automatically assign you to the appropriate
                  Excellence League.
                </p>
                <p className="text-amber-400/90 font-semibold text-xs sm:text-sm">
                  You do not have to choose your league yourself.
                </p>

                <div className="space-y-2 pt-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    The available leagues are:
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                    {LEAGUES_DATA.map((lg) => (
                      <Link
                        key={lg.slug}
                        to={`/excellence-leagues/${lg.slug}`}
                        className={`p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 group ${lg.color}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-2xl group-hover:scale-110 transition-transform shrink-0">
                            {lg.emoji}
                          </span>
                          <div className="min-w-0">
                            <strong className="block text-sm font-bold text-white truncate">
                              {lg.name}
                            </strong>
                            <span className="text-xs text-gray-400 font-medium">
                              {lg.age}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed pt-1">
                  Each league is specially designed with engaging, age-appropriate activities that
                  help participants learn while enjoying the competition.
                </p>
              </div>
            </div>

            {/* Step 3: View Contest Details and Prepare */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 font-extrabold text-sm flex items-center justify-center shrink-0">
                  03
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Step 3: View Contest Details and Prepare
                </h3>
              </div>

              <div className="pl-11 space-y-4">
                <p>
                  Before every contest, you can visit the Contest Details page to view:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PREPARATION_ITEMS.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-200">{item}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-gray-400">
                  This allows every participant to prepare with confidence.
                </p>
              </div>
            </div>

            {/* Step 4: Participate at Your School */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold text-sm flex items-center justify-center shrink-0">
                  04
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Step 4: Participate at Your School
                </h3>
              </div>

              <div className="pl-11 space-y-4">
                <p>
                  On the scheduled competition day, all registered participants compete at their
                  own school.
                </p>

                <p className="text-xs sm:text-sm text-gray-400">
                  Depending on the league, the contest may include:
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {CONTEST_ACTIVITIES.map((act, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      {act}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 5: School Champions are Selected */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 font-extrabold text-sm flex items-center justify-center shrink-0">
                  05
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Step 5: School Champions are Selected
                </h3>
              </div>

              <div className="pl-11 space-y-4">
                <p>
                  After evaluation, every participating school announces:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
                    <span className="text-2xl">🥇</span>
                    <div>
                      <strong className="block text-white text-sm font-bold">First Place</strong>
                      <span className="text-[11px] text-amber-300 font-medium">Sub-Division Qualifier</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-500/10 border border-gray-400/30 flex items-center gap-3">
                    <span className="text-2xl">🥈</span>
                    <div>
                      <strong className="block text-white text-sm font-bold">Second Place</strong>
                      <span className="text-[11px] text-gray-300 font-medium">Sub-Division Qualifier</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-700/10 border border-amber-700/30 flex items-center gap-3">
                    <span className="text-2xl">🥉</span>
                    <div>
                      <strong className="block text-white text-sm font-bold">Third Place</strong>
                      <span className="text-[11px] text-amber-500 font-medium">Sub-Division Qualifier</span>
                    </div>
                  </div>
                </div>

                <p>
                  These top three participants from each league qualify for the Sub-Division Level.
                </p>

                <p className="text-xs sm:text-sm text-emerald-400/90 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Every participant receives recognition for taking part.</span>
                </p>
              </div>
            </div>

            {/* Step 6: Compete at the Sub-Division Level */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 font-extrabold text-sm flex items-center justify-center shrink-0">
                  06
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Step 6: Compete at the Sub-Division Level
                </h3>
              </div>

              <div className="pl-11 space-y-2">
                <p>
                  The winners from participating schools within the same Sub-Division compete
                  against one another.
                </p>
                <p className="text-gray-400">
                  This round gives students a broader platform to showcase their talent.
                </p>
              </div>
            </div>

            {/* Step 7: Advance to the District Championship */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 font-extrabold text-sm flex items-center justify-center shrink-0">
                  07
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Step 7: Advance to the District Championship
                </h3>
              </div>

              <div className="pl-11 space-y-2">
                <p>
                  Top performers from each Sub-Division qualify for the District Level, where they
                  compete with the best participants from across the district.
                </p>
              </div>
            </div>

            {/* Step 8: Reach the State Grand Finale */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                  08
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Step 8: Reach the State Grand Finale
                </h3>
              </div>

              <div className="pl-11 space-y-2">
                <p>
                  The highest-performing participants from every district advance to the
                  State-Level Grand Finale.
                </p>
                <p className="text-amber-400 font-medium">
                  Here, students compete for prestigious titles, medals, trophies, certificates,
                  and exciting cash prizes while earning statewide recognition.
                </p>
              </div>
            </div>

            {/* ── RECOGNITION AT EVERY STAGE ── */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-center gap-2.5">
                <Award className="w-6 h-6 text-amber-400 shrink-0" />
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Recognition at Every Stage
                </h3>
              </div>

              <p className="text-gray-400">
                Every participant's effort is valued and celebrated.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {RECOGNITION_STAGES.map((stg, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3 hover:border-amber-500/40 transition-colors"
                  >
                    <span className="text-2xl shrink-0">{stg.icon}</span>
                    <div className="space-y-1">
                      <strong className="block text-sm font-bold text-white">
                        {stg.title}
                      </strong>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {stg.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pt-2">
                Outstanding performers receive certificates, medals, trophies, cash prizes, and the
                honor of becoming part of the KnowChamp Champions Community.
              </p>
            </div>

            {/* ── MORE THAN JUST A COMPETITION ── */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-6 h-6 text-red-400 shrink-0" />
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  More Than Just a Competition
                </h3>
              </div>

              <p>
                The KnowChamp Excellence League is not just about winning prizes. It is about
                discovering potential and building lifelong skills.
              </p>

              <p className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Every contest is designed to develop:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
                {SKILLS_LIST.map((skill, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#0a0e1c] border border-white/10 text-center flex flex-col items-center justify-center gap-2 hover:border-red-500/40 transition-colors group"
                  >
                    <Star className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-gray-200 group-hover:text-white">
                      {skill}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed pt-2">
                These are essential life skills that help children succeed in school and beyond.
              </p>
            </div>

            {/* ── YOUR JOURNEY TO EXCELLENCE (FLOW) ── */}
            <div className="pt-6 border-t border-white/10 space-y-6">
              <div className="flex items-center gap-2.5">
                <Compass className="w-6 h-6 text-amber-400 shrink-0" />
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Your Journey to Excellence
                </h3>
              </div>

              {/* Visual Flow Path */}
              <div className="p-5 rounded-2xl bg-[#0a0e1c] border border-white/10 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold">
                <span className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30">
                  Register
                </span>
                <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
                <span className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Auto League
                </span>
                <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
                <span className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Prepare
                </span>
                <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
                <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Compete at School
                </span>
                <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
                <span className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Sub-Division
                </span>
                <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
                <span className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  District
                </span>
                <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
                <span className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold shadow-md">
                  State Champion! 👑
                </span>
              </div>

              {/* Branding Motto */}
              <div className="text-center pt-2 space-y-1">
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  KnowChamp Excellence League
                </h4>
                <p className="text-xs sm:text-sm text-gray-400 font-medium">
                  India's First Holistic Child Excellence League
                </p>
                <p className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-amber-400 pt-1">
                  Answer Right. Shine Bright.
                </p>
              </div>
            </div>

          </div>

          {/* ── DOCUMENT FOOTER: QUESTION / CONTACT KNOWCHAMP ── */}
          <div className="border-t border-white/10 pt-6 mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-300">
                Have a question about this document?
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Our support desk is available to assist students, parents, and school coordinators.
              </p>
            </div>

            <Link
              to="/contact-us"
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #991B1B 100%)',
                boxShadow: '0 4px 18px rgba(239, 68, 68, 0.4)',
              }}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-white font-bold rounded-xl text-sm tracking-wide transition-all duration-300 hover:opacity-95 hover:scale-[1.02] cursor-pointer shrink-0"
            >
              <span>Contact KnowChamp</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </article>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;
