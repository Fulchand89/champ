import React from 'react';
import Navbar from '../../components/know-champ/Navbar';
import Footer from '../../components/know-champ/Footer';
import ScrollToTop from '../../components/common/ScrollToTop';
import { 
  ShieldCheck, 
  FileText, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Trophy, 
  Medal, 
  Award, 
  Crown,
  Target,
  BookOpen,
  Users,
  Compass,
  Zap,
  Brain,
  Lightbulb
} from 'lucide-react';
import { Link } from 'react-router-dom';

const LEAGUES_DATA = [
  { emoji: '🎨', name: 'Creative League', age: 'Age 3–5 Years', code: 'K1', color: 'from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-400', slug: 'creative-league' },
  { emoji: '📚', name: 'Knowledge League', age: 'Age 6–8 Years', code: 'K2', color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400', slug: 'knowledge-league' },
  { emoji: '🎤', name: 'Communication League', age: 'Age 9–12 Years', code: 'K3', color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400', slug: 'communication-league' },
  { emoji: '💡', name: 'Innovation League', age: 'Age 13–16 Years', code: 'K4', color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400', slug: 'innovation-league' },
  { emoji: '🌟', name: 'Character League', age: 'Age 17–19 Years', code: 'K5', color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400', slug: 'character-league' },
];

const RECOGNITION_STAGES = [
  { icon: Medal, title: 'Participation Certificate', desc: 'Awarded to all participants for taking part', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { icon: Award, title: 'Merit Recognition', desc: 'Special commendation for commendable scores', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { icon: Trophy, title: 'School Champion', desc: 'Top 3 positions selected from every participating school', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { icon: Trophy, title: 'Sub-Division Champion', desc: 'Top winners competing at the sub-divisional round', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  { icon: Trophy, title: 'District Champion', desc: 'Best performers qualifying across district level', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { icon: Crown, title: 'State Champion', desc: 'Highest achievers in the State Grand Finale', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
];

const SKILLS_DEVELOPMENT = [
  { name: 'Creativity', emoji: '🎨' },
  { name: 'Knowledge', emoji: '📚' },
  { name: 'Critical Thinking', emoji: '🧠' },
  { name: 'Communication Skills', emoji: '🎤' },
  { name: 'Innovation', emoji: '💡' },
  { name: 'Confidence', emoji: '⚡' },
  { name: 'Leadership', emoji: '👑' },
  { name: 'Character', emoji: '🌟' },
  { name: 'Problem-Solving Ability', emoji: '🔍' },
  { name: 'Healthy Competitive Spirit', emoji: '🏆' },
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-[#090b15] text-white flex flex-col font-sans overflow-x-hidden">
      <ScrollToTop />
      <Navbar />

      {/* Page Hero Section */}
      <section className="relative pt-36 pb-16 bg-gradient-to-b from-[#0b0c16] via-[#100713] to-[#090b15] border-b border-gray-900 flex flex-col items-center text-center px-4">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Legal Information</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            How the KnowChamp Excellence League Works
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Important information about using the KnowChamp Answer Right. Shine Bright website and services.
          </p>
        </div>
      </section>

      {/* Main Document Section */}
      <section className="w-[calc(100%-32px)] max-w-[1050px] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 min-w-0">
        <article className="bg-[#0f111d] rounded-3xl border border-white/10 p-6 sm:p-10 shadow-2xl space-y-8 overflow-hidden max-w-full">
          
          {/* Official Document Header */}
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

            <div className="inline-flex items-center gap-2 text-xs font-semibold text-white/70 bg-white/5 px-4 py-2 rounded-xl border border-white/10 shrink-0 self-start sm:self-auto">
              <Calendar className="w-4 h-4 text-red-400" />
              <span>Last updated 06 Aug 2026</span>
            </div>
          </div>

          {/* Document Tagline Banner */}
          <div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 border border-red-500/20 rounded-2xl p-5 sm:p-6 text-center sm:text-left space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-amber-400">
              Your Journey from School Champion to State Champion Starts Here!
            </h3>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              The KnowChamp Excellence League is designed to be simple, exciting, and fair.
              Every participant gets the opportunity to learn, compete, and progress through
              multiple levels while developing valuable life skills.
            </p>
          </div>

          {/* Document Content Body - Exact Match with Uploaded HTML */}
          <div className="prose prose-invert max-w-none text-white/90 leading-relaxed space-y-8 break-words [&>p]:text-sm sm:[&>p]:text-base [&>p]:leading-relaxed [&>h3]:text-lg sm:[&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-8 [&>h3]:mb-3 [&_strong]:text-white">
            
            {/* Step 1 */}
            <div className="bg-[#131626] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold text-sm shrink-0">1</span>
                <h3 className="!mt-0 !mb-0 text-lg sm:text-xl font-bold text-white">Step 1: Register</h3>
              </div>
              <p className="text-gray-300 text-sm sm:text-base">
                Register through your School Coordinator or directly on the KnowChamp platform, where applicable.
              </p>
              <p className="text-gray-300 text-sm sm:text-base">
                Simply enter your basic details, including your Date of Birth.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#131626] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold text-sm shrink-0">2</span>
                <h3 className="!mt-0 !mb-0 text-lg sm:text-xl font-bold text-white">Step 2: Your League is Selected Automatically</h3>
              </div>
              <p className="text-gray-300 text-sm sm:text-base">
                Based on your age, the system will automatically assign you to the appropriate Excellence League.
              </p>
              <p className="text-amber-400 font-semibold text-sm">
                You do not have to choose your league yourself.
              </p>

              <div className="pt-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">The available leagues are:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {LEAGUES_DATA.map((lg, idx) => (
                    <Link 
                      key={idx} 
                      to={`/excellence-leagues/${lg.slug}`}
                      className={`bg-gradient-to-br ${lg.color} p-4 rounded-xl border flex items-center gap-3 transition-all hover:scale-[1.02] cursor-pointer group`}
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">{lg.emoji}</span>
                      <div>
                        <strong className="block text-white text-sm font-bold">{lg.name}</strong>
                        <span className="text-xs text-white/70">{lg.age}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <p className="text-gray-300 text-sm sm:text-base pt-2">
                Each league is specially designed with engaging, age-appropriate activities that help participants learn while enjoying the competition.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#131626] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold text-sm shrink-0">3</span>
                <h3 className="!mt-0 !mb-0 text-lg sm:text-xl font-bold text-white">Step 3: View Contest Details and Prepare</h3>
              </div>
              <p className="text-gray-300 text-sm sm:text-base">
                Before every contest, you can visit the Contest Details page to view:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {[
                  'Contest Theme',
                  'Skills to be Assessed',
                  'Contest Pattern',
                  'Duration',
                  'Rules and Instructions',
                  'Sample Activities, where applicable'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <p className="text-gray-300 text-sm sm:text-base pt-1">
                This allows every participant to prepare with confidence.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#131626] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold text-sm shrink-0">4</span>
                <h3 className="!mt-0 !mb-0 text-lg sm:text-xl font-bold text-white">Step 4: Participate at Your School</h3>
              </div>
              <p className="text-gray-300 text-sm sm:text-base">
                On the scheduled competition day, all registered participants compete at their own school.
              </p>
              <p className="text-gray-300 text-sm sm:text-base font-semibold">
                Depending on the league, the contest may include:
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  'Quiz Questions',
                  'Creative Activities',
                  'Drawing and Craft',
                  'Storytelling',
                  'Public Speaking',
                  'Innovation Challenges',
                  'Practical Activities',
                  'Problem Solving',
                  'Personality and Character Assessment'
                ].map((act, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-semibold text-red-300">
                    ✨ {act}
                  </span>
                ))}
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-[#131626] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold text-sm shrink-0">5</span>
                <h3 className="!mt-0 !mb-0 text-lg sm:text-xl font-bold text-white">Step 5: School Champions are Selected</h3>
              </div>
              <p className="text-gray-300 text-sm sm:text-base">
                After evaluation, every participating school announces:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2">
                <div className="bg-gradient-to-b from-amber-500/20 to-amber-500/5 border border-amber-500/30 p-4 rounded-xl text-center space-y-1">
                  <span className="text-3xl">🥇</span>
                  <h4 className="font-bold text-white text-sm sm:text-base">First Place</h4>
                </div>
                <div className="bg-gradient-to-b from-slate-400/20 to-slate-400/5 border border-slate-400/30 p-4 rounded-xl text-center space-y-1">
                  <span className="text-3xl">🥈</span>
                  <h4 className="font-bold text-white text-sm sm:text-base">Second Place</h4>
                </div>
                <div className="bg-gradient-to-b from-amber-700/20 to-amber-700/5 border border-amber-700/30 p-4 rounded-xl text-center space-y-1">
                  <span className="text-3xl">🥉</span>
                  <h4 className="font-bold text-white text-sm sm:text-base">Third Place</h4>
                </div>
              </div>

              <p className="text-gray-300 text-sm sm:text-base">
                These top three participants from each league qualify for the Sub-Division Level.
              </p>
              <p className="text-emerald-400 font-semibold text-sm">
                Every participant receives recognition for taking part.
              </p>
            </div>

            {/* Step 6 */}
            <div className="bg-[#131626] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold text-sm shrink-0">6</span>
                <h3 className="!mt-0 !mb-0 text-lg sm:text-xl font-bold text-white">Step 6: Compete at the Sub-Division Level</h3>
              </div>
              <p className="text-gray-300 text-sm sm:text-base">
                The winners from participating schools within the same Sub-Division compete against one another.
              </p>
              <p className="text-gray-300 text-sm sm:text-base">
                This round gives students a broader platform to showcase their talent.
              </p>
            </div>

            {/* Step 7 */}
            <div className="bg-[#131626] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold text-sm shrink-0">7</span>
                <h3 className="!mt-0 !mb-0 text-lg sm:text-xl font-bold text-white">Step 7: Advance to the District Championship</h3>
              </div>
              <p className="text-gray-300 text-sm sm:text-base">
                Top performers from each Sub-Division qualify for the District Level, where they compete with the best participants from across the district.
              </p>
            </div>

            {/* Step 8 */}
            <div className="bg-[#131626] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold text-sm shrink-0">8</span>
                <h3 className="!mt-0 !mb-0 text-lg sm:text-xl font-bold text-white">Step 8: Reach the State Grand Finale</h3>
              </div>
              <p className="text-gray-300 text-sm sm:text-base">
                The highest-performing participants from every district advance to the State-Level Grand Finale.
              </p>
              <p className="text-gray-300 text-sm sm:text-base">
                Here, students compete for prestigious titles, medals, trophies, certificates, and exciting cash prizes while earning statewide recognition.
              </p>
            </div>

            {/* Recognition at Every Stage */}
            <div className="pt-4 space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Recognition at Every Stage</span>
              </h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Every participant's effort is valued and celebrated.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {RECOGNITION_STAGES.map((stg, idx) => {
                  const IconComp = stg.icon;
                  return (
                    <div key={idx} className={`p-4 rounded-xl border ${stg.color} flex items-start gap-3`}>
                      <div className="p-2 rounded-lg bg-white/10 shrink-0">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="block text-white text-sm font-bold">{stg.title}</strong>
                        <p className="text-xs text-gray-300 mt-0.5">{stg.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-gray-300 text-sm sm:text-base pt-1">
                Outstanding performers receive certificates, medals, trophies, cash prizes, and the honor of becoming part of the KnowChamp Champions Community.
              </p>
            </div>

            {/* More Than Just a Competition */}
            <div className="pt-4 space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-400" />
                <span>More Than Just a Competition</span>
              </h3>
              <p className="text-gray-300 text-sm sm:text-base">
                The KnowChamp Excellence League is not just about winning prizes. It is about discovering potential and building lifelong skills.
              </p>
              <p className="text-gray-300 text-sm sm:text-base font-semibold">
                Every contest is designed to develop:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {SKILLS_DEVELOPMENT.map((sk, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-xl text-center flex flex-col items-center justify-center space-y-1">
                    <span className="text-2xl">{sk.emoji}</span>
                    <span className="text-xs font-bold text-white">{sk.name}</span>
                  </div>
                ))}
              </div>

              <p className="text-gray-300 text-sm sm:text-base pt-1">
                These are essential life skills that help children succeed in school and beyond.
              </p>
            </div>

            {/* Your Journey to Excellence Flow Banner */}
            <div className="bg-gradient-to-r from-red-600/20 via-orange-600/20 to-amber-600/20 border border-red-500/30 rounded-2xl p-6 text-center space-y-3">
              <h3 className="!mt-0 text-xl font-black text-white">Your Journey to Excellence</h3>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-bold text-amber-300">
                <span>Register</span>
                <span>→</span>
                <span>Get Your League Automatically</span>
                <span>→</span>
                <span>Prepare</span>
                <span>→</span>
                <span>Compete at School</span>
                <span>→</span>
                <span>Qualify for Sub-Division</span>
                <span>→</span>
                <span>District</span>
                <span>→</span>
                <span>State</span>
                <span>→</span>
                <span className="text-white bg-red-600 px-3 py-1 rounded-full shadow-lg">Become a KnowChamp Champion!</span>
              </div>
            </div>

            {/* Brand Signature */}
            <div className="pt-6 border-t border-white/10 text-center sm:text-left space-y-1">
              <h3 className="!mt-0 !mb-1 text-xl font-bold text-white">KnowChamp Excellence League</h3>
              <p className="text-gray-300 font-medium text-sm sm:text-base">India's First Holistic Child Excellence League</p>
              <p className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-500">
                Answer Right. Shine Bright.
              </p>
            </div>

          </div>

          {/* Document Footer / Contact Query */}
          <div className="border-t border-white/10 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/60 text-sm mb-0">
              Have a question about this document?
            </p>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:opacity-95 hover:scale-105 cursor-pointer text-sm"
            >
              <span>Contact KnowChamp</span>
              <ArrowRight className="w-4 h-4 ms-1" />
            </Link>
          </div>

        </article>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;

