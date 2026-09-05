import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/know-champ/Navbar';
import Footer from '../../components/know-champ/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import {
  ShieldCheck, FileText, Calendar, UserCheck, Sparkles, BookOpen, Building2,
  Medal, MapPin, Landmark, Crown, Trophy, Award, CheckCircle2, ArrowRight,
  Palette, Book, Mic, Lightbulb, Star, Brain, Flame, Compass, ChevronRight,
  Zap, HeartHandshake, Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cmsService } from '../../api/services/cmsService';
import AppDownloadModal from '../../components/know-champ/AppDownloadModal';

// ── Default Content strictly matching KnowChamp Excellence League document ──
const DEFAULT_DATA = {
  hero: {
    badge: 'Legal Information',
    title: 'How the KnowChamp Excellence League Works',
    subtitle: 'Important information about using the KnowChamp Answer Right. Shine Bright website and services.',
  },
  document: {
    kicker: 'Official Document',
    title: 'How the KnowChamp Excellence League Works',
    lastUpdated: '06 Aug 2026',
    introHeadline: 'Your Journey from School Champion to State Champion Starts Here!',
    introDesc: 'The KnowChamp Excellence League is designed to be simple, exciting, and fair. Every participant gets the opportunity to learn, compete, and progress through multiple levels while developing valuable life skills.',
  },
};

const LEAGUES_LIST = [
  {
    name: 'Creative League',
    age: 'Age 3–5 Years',
    emoji: '🎨',
    desc: 'Engaging, age-appropriate activities and artistic exploration.',
    color: 'from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-400',
    icon: Palette,
  },
  {
    name: 'Knowledge League',
    age: 'Age 6–8 Years',
    emoji: '📚',
    desc: 'General awareness, curiosity, and foundational concepts.',
    color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400',
    icon: Book,
  },
  {
    name: 'Communication League',
    age: 'Age 9–12 Years',
    emoji: '🎤',
    desc: 'Storytelling, public speaking, dynamic expression & articulation.',
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
    icon: Mic,
  },
  {
    name: 'Innovation League',
    age: 'Age 13–16 Years',
    emoji: '💡',
    desc: 'Practical problem solving, innovation challenges & tech concepts.',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    icon: Lightbulb,
  },
  {
    name: 'Character League',
    age: 'Age 17–19 Years',
    emoji: '🌟',
    desc: 'Personality development, ethics, leadership & character assessment.',
    color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400',
    icon: Star,
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

const SCHOOL_ACTIVITIES = [
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

const RECOGNITION_ITEMS = [
  { title: 'Participation Certificate', emoji: '🏅', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { title: 'Merit Recognition', emoji: '🥈', color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
  { title: 'School Champion', emoji: '🏆', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { title: 'Sub-Division Champion', emoji: '🏆', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { title: 'District Champion', emoji: '🏆', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { title: 'State Champion', emoji: '👑', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
];

const SKILLS_DEVELOPED = [
  { name: 'Creativity', icon: Palette },
  { name: 'Knowledge', icon: BookOpen },
  { name: 'Critical Thinking', icon: Brain },
  { name: 'Communication Skills', icon: Mic },
  { name: 'Innovation', icon: Lightbulb },
  { name: 'Confidence', icon: Flame },
  { name: 'Leadership', icon: Crown },
  { name: 'Character', icon: Star },
  { name: 'Problem-Solving Ability', icon: Compass },
  { name: 'Healthy Competitive Spirit', icon: Trophy },
];

const STEPS_ROADMAP = [
  {
    step: '01',
    title: 'Step 1: Register',
    badge: 'Step 1',
    icon: UserCheck,
    desc: 'Register through your School Coordinator or directly on the KnowChamp platform, where applicable. Simply enter your basic details, including your Date of Birth.',
    color: 'from-red-500 to-rose-600',
  },
  {
    step: '02',
    title: 'Step 2: Your League is Selected Automatically',
    badge: 'Step 2',
    icon: Sparkles,
    desc: 'Based on your age, the system will automatically assign you to the appropriate Excellence League. You do not have to choose your league yourself.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    step: '03',
    title: 'Step 3: View Contest Details and Prepare',
    badge: 'Step 3',
    icon: BookOpen,
    desc: 'Before every contest, you can visit the Contest Details page to review the contest theme, assessed skills, pattern, duration, rules, and sample activities to prepare with confidence.',
    color: 'from-yellow-500 to-amber-600',
  },
  {
    step: '04',
    title: 'Step 4: Participate at Your School',
    badge: 'Step 4',
    icon: Building2,
    desc: 'On the scheduled competition day, all registered participants compete right at their own school in quizzes, creative arts, public speaking, and problem solving.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    step: '05',
    title: 'Step 5: School Champions are Selected',
    badge: 'Step 5',
    icon: Medal,
    desc: 'After evaluation, every participating school announces First Place 🥇, Second Place 🥈, and Third Place 🥉. These top three participants qualify for the Sub-Division Level.',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    step: '06',
    title: 'Step 6: Compete at the Sub-Division Level',
    badge: 'Step 6',
    icon: MapPin,
    desc: 'The winners from participating schools within the same Sub-Division compete against one another, giving students a broader regional platform to showcase talent.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    step: '07',
    title: 'Step 7: Advance to the District Championship',
    badge: 'Step 7',
    icon: Landmark,
    desc: 'Top performers from each Sub-Division qualify for the District Level, where they compete with the best participants from across the entire district.',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    step: '08',
    title: 'Step 8: Reach the State Grand Finale',
    badge: 'Step 8',
    icon: Crown,
    desc: 'The highest-performing participants from every district advance to the State-Level Grand Finale to compete for prestigious titles, medals, trophies, certificates, and cash prizes!',
    color: 'from-purple-500 to-pink-600',
  },
];

const HowItWorks = () => {
  const [cmsData, setCmsData] = useState(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await cmsService.getPublicHowItWorks();
      if (res?.success && res.data) {
        setCmsData(res.data);
      } else {
        setCmsData(DEFAULT_DATA);
      }
    } catch {
      setCmsData(DEFAULT_DATA);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const hero = {
    badge: cmsData?.hero?.badge || DEFAULT_DATA.hero.badge,
    title: cmsData?.hero?.title || DEFAULT_DATA.hero.title,
    subtitle: cmsData?.hero?.subtitle || DEFAULT_DATA.hero.subtitle,
  };

  return (
    <div className="min-h-screen bg-[#090b15] text-white flex flex-col font-sans overflow-x-hidden">
      <ScrollToTop />
      <Navbar />

      {/* ── 1. Page Hero Section (Legal Information Header) ── */}
      <section className="relative pt-36 pb-16 bg-gradient-to-b from-[#0b0c16] via-[#100713] to-[#090b15] border-b border-gray-900 flex flex-col items-center text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
          <ShieldCheck className="w-4 h-4" />
          {hero.badge}
        </div>

        <h1 className="text-3xl sm:text-5xl font-black mb-4 text-white max-w-4xl leading-tight">
          {hero.title}
        </h1>

        <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          {hero.subtitle}
        </p>
      </section>

      {/* ── 2. Official Document Article Section ── */}
      <section className="w-[calc(100%-32px)] max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 min-w-0">
        <article className="bg-[#0f111d] rounded-3xl border border-white/10 p-6 sm:p-10 shadow-2xl space-y-10 overflow-hidden max-w-full">
          
          {/* Document Title Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400 mb-1.5">
                <FileText className="w-4 h-4" />
                Official Document
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white">
                How the KnowChamp Excellence League Works
              </h2>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 bg-white/5 px-3.5 py-2 rounded-xl border border-white/10 shrink-0 self-start sm:self-auto">
              <Calendar className="w-3.5 h-3.5 text-red-400" />
              Last updated 06 Aug 2026
            </div>
          </div>

          {/* Intro Section */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/5 to-purple-500/10 border border-red-500/20 space-y-3">
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              Your Journey from School Champion to State Champion Starts Here!
            </h3>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-medium">
              The KnowChamp Excellence League is designed to be simple, exciting, and fair.
              Every participant gets the opportunity to learn, compete, and progress through
              multiple levels while developing valuable life skills.
            </p>
          </div>

          {/* 8 Step Pipeline Details */}
          <div className="space-y-8">
            <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-400" />
              The 8-Stage Competition Process
            </h3>

            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-[#12162c] border border-gray-800 space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-xs font-black rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  Step 1
                </span>
                <h4 className="text-lg font-bold text-white">Step 1: Register</h4>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Register through your School Coordinator or directly on the KnowChamp platform, where applicable.
              </p>
              <p className="text-sm text-gray-400 font-medium">
                Simply enter your basic details, including your Date of Birth.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-[#12162c] border border-gray-800 space-y-5">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-xs font-black rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Step 2
                </span>
                <h4 className="text-lg font-bold text-white">Step 2: Your League is Selected Automatically</h4>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Based on your age, the system will automatically assign you to the appropriate Excellence League.
                You do not have to choose your league yourself.
              </p>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  The available leagues are:
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {LEAGUES_LIST.map((lg, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl bg-gradient-to-br ${lg.color} border flex items-start gap-3`}
                    >
                      <span className="text-2xl shrink-0">{lg.emoji}</span>
                      <div>
                        <strong className="block text-sm font-bold text-white">{lg.name}</strong>
                        <span className="text-xs font-semibold text-gray-300">{lg.age}</span>
                        <p className="text-[11px] text-gray-400 mt-1 leading-snug">{lg.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-amber-300/90 font-medium pt-1">
                💡 Each league is specially designed with engaging, age-appropriate activities that help participants learn while enjoying the competition.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-[#12162c] border border-gray-800 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-xs font-black rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  Step 3
                </span>
                <h4 className="text-lg font-bold text-white">Step 3: View Contest Details and Prepare</h4>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Before every contest, you can visit the Contest Details page to view:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PREPARATION_ITEMS.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-semibold text-gray-200">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-emerald-400 font-semibold pt-1">
                This allows every participant to prepare with confidence.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-[#12162c] border border-gray-800 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-xs font-black rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Step 4
                </span>
                <h4 className="text-lg font-bold text-white">Step 4: Participate at Your School</h4>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                On the scheduled competition day, all registered participants compete at their own school. Depending on the league, the contest may include:
              </p>
              <div className="flex flex-wrap gap-2.5">
                {SCHOOL_ACTIVITIES.map((act, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-200 flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-red-400" />
                    {act}
                  </span>
                ))}
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-6 rounded-2xl bg-[#12162c] border border-gray-800 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-xs font-black rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Step 5
                </span>
                <h4 className="text-lg font-bold text-white">Step 5: School Champions are Selected</h4>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                After evaluation, every participating school announces:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <span className="text-2xl">🥇</span>
                  <strong className="block text-sm text-amber-300 font-bold mt-1">1st Place</strong>
                  <small className="text-[11px] text-gray-400">School Gold Medalist</small>
                </div>
                <div className="p-4 rounded-xl bg-slate-400/10 border border-slate-400/20 text-center">
                  <span className="text-2xl">🥈</span>
                  <strong className="block text-sm text-slate-300 font-bold mt-1">2nd Place</strong>
                  <small className="text-[11px] text-gray-400">School Silver Medalist</small>
                </div>
                <div className="p-4 rounded-xl bg-amber-700/10 border border-amber-700/20 text-center">
                  <span className="text-2xl">🥉</span>
                  <strong className="block text-sm text-amber-500 font-bold mt-1">3rd Place</strong>
                  <small className="text-[11px] text-gray-400">School Bronze Medalist</small>
                </div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                These top three participants from each league qualify for the Sub-Division Level. Every participant receives recognition for taking part.
              </p>
            </div>

            {/* Step 6 */}
            <div className="p-6 rounded-2xl bg-[#12162c] border border-gray-800 space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-xs font-black rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Step 6
                </span>
                <h4 className="text-lg font-bold text-white">Step 6: Compete at the Sub-Division Level</h4>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                The winners from participating schools within the same Sub-Division compete against one another. This round gives students a broader platform to showcase their talent.
              </p>
            </div>

            {/* Step 7 */}
            <div className="p-6 rounded-2xl bg-[#12162c] border border-gray-800 space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-xs font-black rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Step 7
                </span>
                <h4 className="text-lg font-bold text-white">Step 7: Advance to the District Championship</h4>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Top performers from each Sub-Division qualify for the District Level, where they compete with the best participants from across the district.
              </p>
            </div>

            {/* Step 8 */}
            <div className="p-6 rounded-2xl bg-[#12162c] border border-purple-500/30 space-y-3 bg-gradient-to-r from-purple-900/10 to-pink-900/10">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-xs font-black rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  Step 8
                </span>
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Step 8: Reach the State Grand Finale</span>
                  <Crown className="w-5 h-5 text-amber-400" />
                </h4>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                The highest-performing participants from every district advance to the State-Level Grand Finale.
              </p>
              <p className="text-xs sm:text-sm text-amber-300 font-semibold">
                🏆 Here, students compete for prestigious titles, medals, trophies, certificates, and exciting cash prizes while earning statewide recognition.
              </p>
            </div>
          </div>

          {/* Recognition at Every Stage */}
          <div className="space-y-6 pt-4 border-t border-gray-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                Honors & Celebrations
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Recognition at Every Stage
              </h3>
              <p className="text-sm text-gray-300 mt-1">
                Every participant's effort is valued and celebrated.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {RECOGNITION_ITEMS.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border ${item.color} flex flex-col items-center text-center justify-center space-y-1.5`}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-xs font-bold leading-tight">{item.title}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
              Outstanding performers receive certificates, medals, trophies, cash prizes, and the honor of becoming part of the <strong>KnowChamp Champions Community</strong>.
            </p>
          </div>

          {/* More Than Just a Competition */}
          <div className="space-y-6 pt-4 border-t border-gray-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                Holistic Child Development
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                More Than Just a Competition
              </h3>
              <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                The KnowChamp Excellence League is not just about winning prizes. It is about discovering potential and building lifelong skills. Every contest is designed to develop:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {SKILLS_DEVELOPED.map((sk, idx) => {
                const SkillIcon = sk.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#12162c] border border-gray-800 flex items-center gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                      <SkillIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-gray-200">{sk.name}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-emerald-400 font-semibold">
              These are essential life skills that help children succeed in school and beyond.
            </p>
          </div>

          {/* Your Journey to Excellence Summary Flow */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#140b20] to-[#0e1121] border border-amber-500/30 text-center space-y-5">
            <h3 className="text-2xl font-black text-white">
              Your Journey to Excellence
            </h3>

            {/* Step sequence */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-amber-300 max-w-3xl mx-auto">
              <span>Register</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              <span>Get Your League Automatically</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              <span>Prepare</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              <span>Compete at School</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              <span>Sub-Division</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              <span>District</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              <span>State</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-red-400 font-extrabold">Become a KnowChamp Champion!</span>
            </div>

            <div className="pt-2 space-y-1">
              <h4 className="text-lg font-black text-white">KnowChamp Excellence League</h4>
              <p className="text-xs text-gray-400 font-semibold">India's First Holistic Child Excellence League</p>
              <p className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500 pt-1">
                Answer Right. Shine Bright.
              </p>
            </div>
          </div>

          {/* Bottom Card Footer: Have a question? */}
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Have a question about this document?</h4>
              <p className="text-xs text-gray-400 mt-0.5">Reach out to our support team for any inquiries or clarification.</p>
            </div>

            <Link
              to="/contact"
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #991B1B 100%)',
                boxShadow: '0 4px 18px rgba(239, 68, 68, 0.4)',
              }}
              className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg transition-all duration-200 hover:opacity-95 cursor-pointer shrink-0"
            >
              <span>Contact KnowChamp</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </article>
      </section>

      <Footer />

      <AppDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
};

export default HowItWorks;
