import { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import cmsService from '../../api/services/cmsService';
import { initAdminSocket } from '../../api/services/adminSocketService';

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

  // Fetch CMS data from Admin API on mount, with real-time socket + 4s polling sync
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

    // Polling fallback to keep data dynamically updated (every 4 seconds)
    const pollInterval = setInterval(() => {
      if (isMounted) fetchCmsData();
    }, 4000);

    // Immediate refetch on tab focus or visibility change
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

  // 100% Dynamic Data fields from CMS API
  const heroTitle = cmsData?.hero?.title || '';
  const heroHighlight = cmsData?.hero?.titleHighlight || '';
  const heroSubtitle = cmsData?.hero?.subtitle || '';

  const stepsList = Array.isArray(cmsData?.steps)
    ? [...cmsData.steps].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    : [];

  const leaguesList = Array.isArray(cmsData?.leagues) ? cmsData.leagues : [];

  const prepTitle = cmsData?.preparation?.title || '';
  const prepSubtitle = cmsData?.preparation?.subtitle || '';
  const prepItems = Array.isArray(cmsData?.preparation?.items) ? cmsData.preparation.items : [];
  const prepFooterNote = cmsData?.preparation?.footerNote || '';

  const compTitle = cmsData?.competition?.title || '';
  const compSubtitle = cmsData?.competition?.subtitle || '';
  const compActivities = Array.isArray(cmsData?.competition?.activities) ? cmsData.competition.activities : [];
  const compNote = cmsData?.competition?.progressionNote || '';

  const recTitle = cmsData?.recognition?.title || '';
  const recSubtitle = cmsData?.recognition?.subtitle || '';
  const recStages = Array.isArray(cmsData?.recognition?.stages) ? cmsData.recognition.stages : [];
  const commTitle = cmsData?.recognition?.communityTitle || '';
  const commDesc = cmsData?.recognition?.communityDesc || '';

  const skillsTitle = cmsData?.skills?.title || '';
  const skillsDesc = cmsData?.skills?.description || '';
  const skillsList = Array.isArray(cmsData?.skills?.items) ? cmsData.skills.items : [];

  const calloutTitle = cmsData?.callout?.title || '';
  const calloutDesc = cmsData?.callout?.description || '';
  const ctaText = cmsData?.callout?.ctaText || '';
  const ctaLink = cmsData?.callout?.ctaLink || '/contests';

  const summaryTitle = cmsData?.summaryBanner?.title || '';
  const summaryTagline = cmsData?.summaryBanner?.titleTagline || '';
  const summarySubTagline = cmsData?.summaryBanner?.subTagline || '';
  const summaryMotto = cmsData?.summaryBanner?.motto || '';

  if (loading && !cmsData) {
    return (
      <div className="min-h-screen bg-[#060913] text-white flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/50 text-sm">Loading How It Works Content...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] text-white flex flex-col font-sans select-none overflow-x-hidden">
      <ScrollToTop />
      <Navbar />

      {/* ── 1. PAGE HERO SECTION ── */}
      {(heroTitle || heroSubtitle) && (
        <section className="relative pt-32 pb-16 bg-[#060913] border-b border-gray-900 flex flex-col items-center text-center px-4 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-4xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              {heroTitle}{' '}
              {heroHighlight && (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-500">
                  {heroHighlight}
                </span>
              )}
            </h1>

            {heroSubtitle && (
              <p className="text-gray-400 max-w-3xl mx-auto text-sm sm:text-base leading-relaxed font-medium">
                {heroSubtitle}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── 2. STEP-BY-STEP ROADMAP GRID ── */}
      {stepsList.length > 0 && (
        <section className="py-12 sm:py-16 bg-[#060913]">
          <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
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
      )}

      {/* ── 3. POPULAR EXCELLENCE LEAGUES SECTION ── */}
      {leaguesList.length > 0 && (
        <section className="py-16 bg-[#040711] border-t border-b border-white/5">
          <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {leaguesList.map((lg, idx) => (
                <Link
                  key={lg.slug || idx}
                  to={`/excellence-leagues/${lg.slug}`}
                  className={`bg-[#0a0e1c] border rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-300 group hover:scale-[1.02] cursor-pointer relative overflow-hidden ${lg.borderColor || 'border-white/10'}`}
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
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
                      {lg.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. CONTEST PREPARATION & SCHOOL COMPETITION DETAILS ── */}
      {(prepTitle || compTitle || prepItems.length > 0 || compActivities.length > 0) && (
        <section className="py-16 bg-[#060913]">
          <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Card 1: View Contest Details & Prepare */}
              {(prepTitle || prepItems.length > 0) && (
                <div className="bg-[#0a0e1c] border border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-black text-white">{prepTitle}</h3>
                    </div>

                    {prepSubtitle && <p className="text-sm text-gray-300 leading-relaxed">{prepSubtitle}</p>}

                    {prepItems.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {prepItems.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5">
                            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-xs font-bold text-white">{item.title}</h4>
                              {item.desc && <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{item.desc}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {prepFooterNote && (
                    <div className="pt-4 border-t border-white/5 text-xs text-amber-400/90 font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>{prepFooterNote}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Card 2: Participate at Your School */}
              {(compTitle || compActivities.length > 0) && (
                <div className="bg-[#0a0e1c] border border-emerald-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-black text-white">{compTitle}</h3>
                    </div>

                    {compSubtitle && <p className="text-sm text-gray-300 leading-relaxed">{compSubtitle}</p>}

                    {compActivities.length > 0 && (
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
                    )}
                  </div>

                  {compNote && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-xs text-emerald-200 font-bold flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                      <span>{compNote}</span>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* ── 5. RECOGNITION AT EVERY STAGE SECTION ── */}
      {(recTitle || recStages.length > 0) && (
        <section className="py-16 bg-[#040711] border-t border-b border-white/5">
          <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            {recTitle && (
              <div className="text-center space-y-3 max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                  {recTitle}
                </h2>
                {recSubtitle && (
                  <p className="text-gray-300 text-sm sm:text-base font-medium leading-relaxed">
                    {recSubtitle}
                  </p>
                )}
              </div>
            )}

            {recStages.length > 0 && (
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
            )}

            {/* Champions Community Banner */}
            {(commTitle || commDesc) && (
              <div className="bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-blue-900/30 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                <div className="space-y-2 max-w-2xl">
                  {commTitle && <h3 className="text-xl sm:text-2xl font-black text-white">{commTitle}</h3>}
                  {commDesc && <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{commDesc}</p>}
                </div>

                <Link
                  to="/register/student"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-sm tracking-wide shadow-lg transition-all duration-300 hover:scale-105 shrink-0"
                >
                  <span>Register as Student</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

          </div>
        </section>
      )}

      {/* ── 6. MORE THAN JUST A COMPETITION (HOLISTIC GROWTH SKILLS) ── */}
      {(skillsTitle || skillsList.length > 0) && (
        <section className="py-16 bg-[#060913]">
          <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            {skillsTitle && (
              <div className="text-center space-y-3 max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                  {skillsTitle}
                </h2>
                {skillsDesc && (
                  <p className="text-gray-300 text-sm sm:text-base font-medium leading-relaxed">
                    {skillsDesc}
                  </p>
                )}
              </div>
            )}

            {skillsList.length > 0 && (
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
            )}

          </div>
        </section>
      )}

      {/* ── 7. YOUR JOURNEY TO EXCELLENCE (FLOW BANNER) ── */}
      {(summaryTitle || summaryMotto) && (
        <section className="py-12 bg-[#040711] border-t border-b border-white/5">
          <div className="w-[calc(100%-32px)] max-w-[1425px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-red-950/40 via-[#0a0e1c] to-amber-950/40 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-center">
              
              <div className="space-y-2">
                {summaryTitle && <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">{summaryTitle}</h3>}
                {summaryTagline && <p className="text-amber-400 text-xs sm:text-sm font-bold uppercase tracking-wider">{summaryTagline}</p>}
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
                {summarySubTagline && <p className="text-gray-300 text-xs sm:text-sm font-semibold">{summarySubTagline}</p>}
                {summaryMotto && (
                  <p className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-orange-400 text-base sm:text-lg font-black">
                    {summaryMotto}
                  </p>
                )}
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ── 8. FAIR PLAY CALLOUT BANNER ── */}
      {calloutTitle && (
        <section className="py-12 bg-[#060913]">
          <div className="w-[calc(100%-32px)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-red-600/20 via-orange-600/20 to-amber-600/20 border border-red-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {calloutTitle}
                </h3>
                {calloutDesc && <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{calloutDesc}</p>}
              </div>

              {ctaText && (
                <Link
                  to={ctaLink}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-xl text-sm tracking-wide shadow-lg transition-all duration-300 hover:scale-105 shrink-0"
                >
                  <span>{ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── 9. OFFICIAL DOCUMENT / CONTACT KNOWCHAMP BOX ── */}
      <section className="pb-16 bg-[#060913]">
        <div className="w-[calc(100%-32px)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0a0e1c] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-sm font-semibold text-gray-300">
              Have a question about the KnowChamp Excellence League document?
            </p>

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

