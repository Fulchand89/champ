import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Globe,
  ListOrdered,
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  X,
  ChevronUp,
  ChevronDown,
  Award,
  BookOpen,
  Trophy,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Medal,
  Crown,
  Palette,
  Book,
  Mic,
  Lightbulb,
  Star,
  Brain,
  Flame,
  Compass,
  Link as LinkIcon,
} from 'lucide-react';
import cmsService from '../../api/services/cmsService';
import ConfirmModal from '../../components/common/ConfirmModal';

const AVAILABLE_ICONS = [
  { value: 'UserCheck', label: 'UserCheck — Register' },
  { value: 'Sparkles', label: 'Sparkles — Selection / Auto' },
  { value: 'BookOpen', label: 'BookOpen — Preparation / Knowledge' },
  { value: 'Building2', label: 'Building2 — School Competition' },
  { value: 'Medal', label: 'Medal — School Winner' },
  { value: 'MapPin', label: 'MapPin — Sub-Division' },
  { value: 'Landmark', label: 'Landmark — District' },
  { value: 'Crown', label: 'Crown — State Grand Finale' },
  { value: 'Trophy', label: 'Trophy — Champion / Winner' },
  { value: 'Award', label: 'Award — Merit / Recognition' },
  { value: 'Palette', label: 'Palette — Creative / Arts' },
  { value: 'Mic', label: 'Mic — Communication / Speaking' },
  { value: 'Lightbulb', label: 'Lightbulb — Innovation / Tech' },
  { value: 'Star', label: 'Star — Character / Excellence' },
  { value: 'Brain', label: 'Brain — Critical Thinking' },
  { value: 'Flame', label: 'Flame — Confidence' },
  { value: 'Compass', label: 'Compass — Problem Solving' },
  { value: 'ShieldCheck', label: 'ShieldCheck — Security / Fair Play' },
  { value: 'Download', label: 'Download — Install' },
  { value: 'Wallet', label: 'Wallet — Money / Rewards' },
];

const TABS = [
  { id: 'hero', label: 'Hero Header', icon: Globe },
  { id: 'steps', label: '8-Step Roadmap', icon: ListOrdered },
  { id: 'leagues', label: '5 Excellence Leagues', icon: Award },
  { id: 'prep', label: 'Prep & Competition', icon: BookOpen },
  { id: 'recognition', label: 'Recognition & Skills', icon: Trophy },
  { id: 'callout', label: 'Callout & Summary', icon: Megaphone },
];

const inputClass = 'block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]';
const labelClass = 'block text-xs font-bold text-gray-300 mb-1.5';

const DEFAULT_STEPS = [
  { id: 1, stepNumber: '01', icon: 'UserCheck', title: 'Register', shortDesc: 'Quick & Simple Onboarding', description: 'Register through your School Coordinator or directly on the KnowChamp platform with basic details and DOB.', displayOrder: 1 },
  { id: 2, stepNumber: '02', icon: 'Sparkles', title: 'Automatic League Selection', shortDesc: 'Age-Tailored Assignment', description: 'Based on your age, the system automatically assigns you to the appropriate Excellence League.', displayOrder: 2 },
  { id: 3, stepNumber: '03', icon: 'BookOpen', title: 'View Details & Prepare', shortDesc: 'Confident Preparation', description: 'Visit the Contest Details page to review theme, assessed skills, pattern, duration, official rules, and sample activities.', displayOrder: 3 },
  { id: 4, stepNumber: '04', icon: 'Building2', title: 'School Competition', shortDesc: 'Compete at Your School', description: 'On competition day, all registered students compete at their own school in quizzes, creative arts, speaking, and problem-solving.', displayOrder: 4 },
  { id: 5, stepNumber: '05', icon: 'Medal', title: 'School Champions', shortDesc: 'Top 3 Qualifiers', description: 'Schools announce 1st 🥇, 2nd 🥈, and 3rd 🥉 place winners per league who qualify for Sub-Division.', displayOrder: 5 },
  { id: 6, stepNumber: '06', icon: 'MapPin', title: 'Sub-Division Level', shortDesc: 'Broader Stage Platform', description: 'School winners across the same Sub-Division compete head-to-head, giving students a broader platform to showcase talent.', displayOrder: 6 },
  { id: 7, stepNumber: '07', icon: 'Landmark', title: 'District Championship', shortDesc: 'Best Across District', description: 'Top performers from Sub-Divisions advance to the District Level, competing with elite minds from across the entire district.', displayOrder: 7 },
  { id: 8, stepNumber: '08', icon: 'Crown', title: 'State Grand Finale', shortDesc: 'Grand Pinnacle Event', description: 'District champions clash at the State Grand Finale for prestigious titles, trophies, medals, certificates, and cash prizes!', displayOrder: 8 },
];

const DEFAULT_LEAGUES = [
  { slug: 'creative-league', emoji: '🎨', icon: 'Palette', name: 'Creative League', age: 'Age 3–5 Years', desc: 'Engaging, age-appropriate activities, craft & drawing to ignite early imagination and creative confidence.' },
  { slug: 'knowledge-league', emoji: '📚', icon: 'BookOpen', name: 'Knowledge League', age: 'Age 6–8 Years', desc: 'Interactive quizzes, curious exploration, and general awareness designed to build foundational understanding.' },
  { slug: 'communication-league', emoji: '🎤', icon: 'Mic', name: 'Communication League', age: 'Age 9–12 Years', desc: 'Storytelling, public speaking, dynamic expression, and clear articulation to cultivate confident speakers.' },
  { slug: 'innovation-league', emoji: '💡', icon: 'Lightbulb', name: 'Innovation League', age: 'Age 13–16 Years', desc: 'Practical problem solving, innovation challenges, and creative thinking for future-ready problem solvers.' },
  { slug: 'character-league', emoji: '🌟', icon: 'Star', name: 'Character League', age: 'Age 17–19 Years', desc: 'Personality and character assessment, ethics, leadership, and emotional intelligence for young leaders.' },
];

const DEFAULT_PREP_ITEMS = [
  { title: 'Contest Theme', desc: 'Detailed theme overview provided beforehand so students can research effectively.' },
  { title: 'Skills Assessed', desc: 'Clear list of key competencies and skills evaluated during the challenge.' },
  { title: 'Contest Pattern', desc: 'Full pattern details so participants know the exact structure of the competition.' },
  { title: 'Time Duration', desc: 'Explicit duration guidelines to help manage time wisely during live rounds.' },
  { title: 'Rules & Instructions', desc: 'Comprehensive instructions ensuring fair play, compliance, and clarity.' },
  { title: 'Sample Activities', desc: 'Practice examples and sample tasks where applicable for hands-on practice.' },
];

const DEFAULT_ACTIVITIES = [
  'Quiz Questions', 'Creative Activities', 'Drawing & Craft',
  'Storytelling', 'Public Speaking', 'Innovation Challenges',
  'Practical Activities', 'Problem Solving', 'Character Assessment'
];

const DEFAULT_RECOGNITION_STAGES = [
  { icon: 'Medal', title: 'Participation Certificate', desc: 'Awarded to every student to value and celebrate their effort and courage.' },
  { icon: 'Award', title: 'Merit Recognition', desc: 'Special certificates acknowledging commendable performance and effort.' },
  { icon: 'Trophy', title: 'School Champion', desc: '1st, 2nd, and 3rd place winners per league qualify for the Sub-Division level.' },
  { icon: 'MapPin', title: 'Sub-Division Champion', desc: 'Sub-Division winners gain regional honors and advance to the District round.' },
  { icon: 'Landmark', title: 'District Champion', desc: 'Top performers in each district earn prestige and qualify for the State Grand Finale.' },
  { icon: 'Crown', title: 'State Champion', desc: 'Grand trophies, gold medals, certificates, cash prizes, and Champions Community entry.' },
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

const ManageHowItWorks = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  // 1. Hero
  const [heroBadge, setHeroBadge] = useState("India's First Holistic Child Excellence League");
  const [heroTitle, setHeroTitle] = useState('How the KnowChamp');
  const [heroHighlight, setHeroHighlight] = useState('Works');
  const [heroSubtitle, setHeroSubtitle] = useState('Your Journey from School Champion to State Champion Starts Here! Simple, exciting, and fair — every participant gets the opportunity to learn, compete, and shine bright.');

  // 2. Steps
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [stepForm, setStepForm] = useState({ stepNumber: '', icon: 'UserCheck', title: '', shortDesc: '', description: '', displayOrder: 1 });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 3. Leagues
  const [leagues, setLeagues] = useState(DEFAULT_LEAGUES);

  // 4. Preparation & Competition
  const [prepTitle, setPrepTitle] = useState('Contest Preparation Details');
  const [prepSubtitle, setPrepSubtitle] = useState('Before every contest, participants can visit the Contest Details page to prepare with full clarity and confidence:');
  const [prepItems, setPrepItems] = useState(DEFAULT_PREP_ITEMS);
  const [prepFooterNote, setPrepFooterNote] = useState('💡 Sample activities provided where applicable to boost student confidence!');

  const [compTitle, setCompTitle] = useState('Participate at Your School');
  const [compSubtitle, setCompSubtitle] = useState('On competition day, registered participants compete right at their own school. Depending on the league, challenges include:');
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [newActivity, setNewActivity] = useState('');
  const [compNote, setCompNote] = useState('🏆 School Winner Progression: Top 3 participants (1st 🥇, 2nd 🥈, 3rd 🥉) from each league qualify for the Sub-Division level!');

  // 5. Recognition & Skills
  const [recBadge, setRecBadge] = useState('Celebrated Endeavors');
  const [recTitle, setRecTitle] = useState('Recognition at Every Stage');
  const [recSubtitle, setRecSubtitle] = useState("Every participant's effort is valued and celebrated at every step of their journey.");
  const [recStages, setRecStages] = useState(DEFAULT_RECOGNITION_STAGES);
  const [commTitle, setCommTitle] = useState('KnowChamp Champions Community');
  const [commDesc, setCommDesc] = useState('Outstanding performers receive certificates, medals, trophies, cash prizes, and the honor of joining our Champions Community.');

  const [skillsBadge, setSkillsBadge] = useState('Holistic Growth');
  const [skillsTitle, setSkillsTitle] = useState('More Than Just a Competition');
  const [skillsDesc, setSkillsDesc] = useState('The KnowChamp Excellence League is not just about winning prizes. It is about discovering potential and building lifelong skills that help children succeed in school and beyond.');
  const [skillsList, setSkillsList] = useState(DEFAULT_SKILLS);

  // 6. Callout & Summary
  const [calloutTitle, setCalloutTitle] = useState('Rules & Fair Play Guidelines');
  const [calloutDesc, setCalloutDesc] = useState('State-of-the-art anti-cheat detection, quick results calculation, and multi-signature security protocols ensure all contests are completely clean, secure, and 100% fair.');
  const [bulletPoints, setBulletPoints] = useState(['No emulator support', 'Single device account', 'Automated anti-bot detection', '24/7 support desk']);
  const [ctaText, setCtaText] = useState('Start Playing Now');
  const [ctaLink, setCtaLink] = useState('/contests');

  const [sumTitle, setSumTitle] = useState('Your Journey to Excellence');
  const [sumTagline, setSumTagline] = useState('KnowChamp Excellence League');
  const [sumSubTagline, setSumSubTagline] = useState("India's First Holistic Child Excellence League");
  const [sumMotto, setSumMotto] = useState('Answer Right. Shine Bright.');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await cmsService.getAdminHowItWorks();
      if (res?.success && res.data) {
        const d = res.data;
        if (d.hero) {
          setHeroBadge(d.hero.badgeText || "India's First Holistic Child Excellence League");
          setHeroTitle(d.hero.title || 'How the KnowChamp');
          setHeroHighlight(d.hero.titleHighlight || 'Works');
          setHeroSubtitle(d.hero.subtitle || 'Your Journey from School Champion to State Champion Starts Here! Simple, exciting, and fair — every participant gets the opportunity to learn, compete, and shine bright.');
        }
        
        if (Array.isArray(d.steps) && d.steps.length > 0) {
          setSteps([...d.steps].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
        }

        if (Array.isArray(d.leagues) && d.leagues.length > 0) {
          setLeagues(d.leagues);
        }

        if (d.preparation) {
          setPrepTitle(d.preparation.title || 'Contest Preparation Details');
          setPrepSubtitle(d.preparation.subtitle || 'Before every contest, participants can visit the Contest Details page to prepare with full clarity and confidence:');
          if (Array.isArray(d.preparation.items)) setPrepItems(d.preparation.items);
          setPrepFooterNote(d.preparation.footerNote || '💡 Sample activities provided where applicable to boost student confidence!');
        }

        if (d.competition) {
          setCompTitle(d.competition.title || 'Participate at Your School');
          setCompSubtitle(d.competition.subtitle || 'On competition day, registered participants compete right at their own school. Depending on the league, challenges include:');
          if (Array.isArray(d.competition.activities)) setActivities(d.competition.activities);
          setCompNote(d.competition.progressionNote || '🏆 School Winner Progression: Top 3 participants (1st 🥇, 2nd 🥈, 3rd 🥉) from each league qualify for the Sub-Division level!');
        }

        if (d.recognition) {
          setRecBadge(d.recognition.badge || 'Celebrated Endeavors');
          setRecTitle(d.recognition.title || 'Recognition at Every Stage');
          setRecSubtitle(d.recognition.subtitle || "Every participant's effort is valued and celebrated at every step of their journey.");
          if (Array.isArray(d.recognition.stages)) setRecStages(d.recognition.stages);
          setCommTitle(d.recognition.communityTitle || 'KnowChamp Champions Community');
          setCommDesc(d.recognition.communityDesc || 'Outstanding performers receive certificates, medals, trophies, cash prizes, and the honor of joining our Champions Community.');
        }

        if (d.skills) {
          setSkillsBadge(d.skills.badge || 'Holistic Growth');
          setSkillsTitle(d.skills.title || 'More Than Just a Competition');
          setSkillsDesc(d.skills.description || 'The KnowChamp Excellence League is not just about winning prizes. It is about discovering potential and building lifelong skills that help children succeed in school and beyond.');
          if (Array.isArray(d.skills.items)) setSkillsList(d.skills.items);
        }

        if (d.callout) {
          setCalloutTitle(d.callout.title || 'Rules & Fair Play Guidelines');
          setCalloutDesc(d.callout.description || 'State-of-the-art anti-cheat detection, quick results calculation, and multi-signature security protocols ensure all contests are completely clean, secure, and 100% fair.');
          if (Array.isArray(d.callout.bulletPoints)) setBulletPoints(d.callout.bulletPoints);
          setCtaText(d.callout.ctaText || 'Start Playing Now');
          setCtaLink(d.callout.ctaLink || '/contests');
        }

        if (d.summaryBanner) {
          setSumTitle(d.summaryBanner.title || 'Your Journey to Excellence');
          setSumTagline(d.summaryBanner.titleTagline || 'KnowChamp Excellence League');
          setSumSubTagline(d.summaryBanner.subTagline || "India's First Holistic Child Excellence League");
          setSumMotto(d.summaryBanner.motto || 'Answer Right. Shine Bright.');
        }
      }
    } catch (err) {
      console.error('Error fetching How It Works CMS:', err);
      toast.error('Failed to load How It Works CMS content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload = {
        hero: {
          badgeText: heroBadge.trim(),
          title: heroTitle.trim(),
          titleHighlight: heroHighlight.trim(),
          subtitle: heroSubtitle.trim()
        },
        steps: steps.map((s, idx) => ({ ...s, displayOrder: s.displayOrder ?? idx + 1 })),
        leagues,
        preparation: {
          title: prepTitle.trim(),
          subtitle: prepSubtitle.trim(),
          items: prepItems.filter(i => i.title.trim() !== ''),
          footerNote: prepFooterNote.trim()
        },
        competition: {
          title: compTitle.trim(),
          subtitle: compSubtitle.trim(),
          activities: activities.filter(a => a.trim() !== ''),
          progressionNote: compNote.trim()
        },
        recognition: {
          badge: recBadge.trim(),
          title: recTitle.trim(),
          subtitle: recSubtitle.trim(),
          stages: recStages.filter(s => s.title.trim() !== ''),
          communityTitle: commTitle.trim(),
          communityDesc: commDesc.trim()
        },
        skills: {
          badge: skillsBadge.trim(),
          title: skillsTitle.trim(),
          description: skillsDesc.trim(),
          items: skillsList.filter(s => s.name.trim() !== '')
        },
        callout: {
          title: calloutTitle.trim(),
          description: calloutDesc.trim(),
          bulletPoints: bulletPoints.filter((b) => b.trim() !== ''),
          ctaText: ctaText.trim(),
          ctaLink: ctaLink.trim(),
        },
        summaryBanner: {
          title: sumTitle.trim(),
          titleTagline: sumTagline.trim(),
          subTagline: sumSubTagline.trim(),
          motto: sumMotto.trim()
        }
      };

      const res = await cmsService.updateAdminHowItWorks(payload);
      if (res?.success) {
        toast.success('How It Works website content saved successfully!');
      } else {
        toast.error(res?.message || 'Failed to save changes');
      }
    } catch (err) {
      console.error('Error saving How It Works CMS:', err);
      toast.error(err?.response?.data?.message || err?.message || 'An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  // ── Step Modal Handlers ──
  const openAddStep = () => {
    setEditingStep(null);
    setStepForm({ stepNumber: String(steps.length + 1).padStart(2, '0'), icon: 'UserCheck', title: '', shortDesc: '', description: '', displayOrder: steps.length + 1 });
    setStepModalOpen(true);
  };

  const openEditStep = (step) => {
    setEditingStep(step);
    setStepForm({ stepNumber: step.stepNumber || '', icon: step.icon || 'UserCheck', title: step.title || '', shortDesc: step.shortDesc || '', description: step.description || '', displayOrder: step.displayOrder ?? 1 });
    setStepModalOpen(true);
  };

  const handleStepSubmit = (e) => {
    e.preventDefault();
    if (!stepForm.title.trim()) { toast.error('Step title is required'); return; }
    if (editingStep) {
      setSteps((prev) => prev.map((s) => s.id === editingStep.id ? { ...s, ...stepForm, displayOrder: Number(stepForm.displayOrder) || s.displayOrder } : s));
      toast.success('Step updated — click Save All to persist');
    } else {
      setSteps((prev) => [...prev, { ...stepForm, id: Date.now(), displayOrder: Number(stepForm.displayOrder) || prev.length + 1 }]);
      toast.success('Step added — click Save All to persist');
    }
    setStepModalOpen(false);
  };

  const openDeleteStep = (step) => { setStepToDelete(step); setDeleteModalOpen(true); };

  const handleConfirmDelete = async () => {
    if (!stepToDelete) return;
    setDeleting(true);
    try {
      setSteps((prev) => prev.filter((s) => s.id !== stepToDelete.id));
      toast.success('Step removed — click Save All to persist');
      setDeleteModalOpen(false);
      setStepToDelete(null);
    } finally { setDeleting(false); }
  };

  const moveStep = (idx, direction) => {
    setSteps((prev) => {
      const arr = [...prev];
      const swapIdx = idx + direction;
      if (swapIdx < 0 || swapIdx >= arr.length) return arr;
      [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
      return arr.map((s, i) => ({ ...s, displayOrder: i + 1 }));
    });
  };

  // ── Bullet / Prep / Activity Helpers ──
  const addBullet = () => setBulletPoints((prev) => [...prev, '']);
  const removeBullet = (idx) => setBulletPoints((prev) => prev.filter((_, i) => i !== idx));
  const updateBullet = (idx, val) => setBulletPoints((prev) => prev.map((b, i) => (i === idx ? val : b)));

  const addPrepItem = () => setPrepItems((prev) => [...prev, { title: '', desc: '' }]);
  const removePrepItem = (idx) => setPrepItems((prev) => prev.filter((_, i) => i !== idx));
  const updatePrepItem = (idx, field, val) => setPrepItems((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: val } : p));

  const addActivity = () => {
    if (!newActivity.trim()) return;
    setActivities((prev) => [...prev, newActivity.trim()]);
    setNewActivity('');
  };
  const removeActivity = (idx) => setActivities((prev) => prev.filter((_, i) => i !== idx));

  const addRecStage = () => setRecStages((prev) => [...prev, { icon: 'Medal', title: 'New Stage', desc: 'Stage details...' }]);
  const removeRecStage = (idx) => setRecStages((prev) => prev.filter((_, i) => i !== idx));
  const updateRecStage = (idx, field, val) => setRecStages((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));

  const addSkill = () => setSkillsList((prev) => [...prev, { name: 'New Skill', icon: 'Star' }]);
  const removeSkill = (idx) => setSkillsList((prev) => prev.filter((_, i) => i !== idx));
  const updateSkill = (idx, field, val) => setSkillsList((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3">
        <div className="w-8 h-8 border-4 border-[#E94B4B] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400">Loading How It Works Website CMS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page Top Header ── */}
      <div className="bg-[#0f1117] text-white p-5 rounded-2xl shadow-sm border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold">Manage How It Works Page</h1>
          <p className="text-xs text-gray-400 mt-1">Make all website sections dynamic — Hero, 8-Step Roadmap, Excellence Leagues, Prep, Recognition, Skills & Banners.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-800 rounded-lg text-sm font-semibold transition-all cursor-pointer">
            <RotateCcw size={15} /> Refresh
          </button>
          <button onClick={handleSaveAll} disabled={saving} className="flex items-center gap-2 px-5 py-2 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer hover:opacity-90 disabled:opacity-60" style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}>
            <Save size={15} /> {saving ? 'Saving…' : 'Save All Changes'}
          </button>
        </div>
      </div>

      {/* ── Main Tabbed Content Card ── */}
      <div className="bg-[#0f1117] border border-white/10 rounded-2xl overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#E94B4B] border-b-2 border-[#E94B4B] bg-[#E94B4B]/5'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* ── TAB 1: HERO HEADER ── */}
          {activeTab === 'hero' && (
            <div className="space-y-6 max-w-3xl">
              <p className="text-xs text-gray-400">Configure the top Hero Header section displayed at the top of the public website.</p>
              
              <div>
                <label className={labelClass}>Top Pill Badge Text</label>
                <input type="text" value={heroBadge} onChange={(e) => setHeroBadge(e.target.value)} className={inputClass} placeholder="e.g. India's First Holistic Child Excellence League" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Main Title (Plain Text)</label>
                  <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className={inputClass} placeholder="e.g. How the KnowChamp" />
                </div>
                <div>
                  <label className={labelClass}>Highlighted Title (Red Gradient)</label>
                  <input type="text" value={heroHighlight} onChange={(e) => setHeroHighlight(e.target.value)} className={inputClass} placeholder="e.g. Excellence League Works" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Hero Subtitle Text</label>
                <textarea rows="3" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} className={inputClass} placeholder="Enter main hero subtitle text..." />
              </div>

              {/* Live Preview Box */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-[#090b15] p-6 text-center space-y-3">
                <span className="text-[11px] text-gray-500 uppercase font-mono tracking-widest block text-left">Live Website Hero Preview</span>
                
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{heroBadge}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {heroTitle}{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-500">
                    {heroHighlight}
                  </span>
                </h1>

                <p className="text-xs sm:text-sm text-gray-300 max-w-lg mx-auto leading-relaxed">
                  {heroSubtitle}
                </p>
              </div>
            </div>
          )}

          {/* ── TAB 2: 8-STEP ROADMAP ── */}
          {activeTab === 'steps' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-gray-400">Manage the 8-stage step-by-step roadmap cards displayed on the website. Drag or use arrows to reorder.</p>
                <button onClick={openAddStep} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer hover:opacity-90 shrink-0 self-start sm:self-auto" style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}>
                  <Plus size={15} /> Add Step
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-12">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-16">Badge</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-24">Icon</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Step Title</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Short Subtitle</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider w-24">Order</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {steps.map((step, idx) => (
                      <tr key={step.id || idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{idx + 1}</td>
                        <td className="px-4 py-3"><span className="text-xs font-black text-red-400 font-mono tracking-widest">{step.stepNumber}</span></td>
                        <td className="px-4 py-3 text-gray-300 font-mono text-xs">{step.icon}</td>
                        <td className="px-4 py-3 font-semibold text-white">{step.title}</td>
                        <td className="px-4 py-3 text-amber-400/90 text-xs">{step.shortDesc}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => moveStep(idx, -1)} disabled={idx === 0} className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"><ChevronUp size={15} /></button>
                            <button onClick={() => moveStep(idx, 1)} disabled={idx === steps.length - 1} className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"><ChevronDown size={15} /></button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => openEditStep(step)} className="p-1 text-gray-400 hover:text-white rounded cursor-pointer" title="Edit"><Edit2 size={15} /></button>
                            <button onClick={() => openDeleteStep(step)} className="p-1 text-red-500/70 hover:text-red-500 rounded cursor-pointer" title="Delete"><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB 3: 5 EXCELLENCE LEAGUES ── */}
          {activeTab === 'leagues' && (
            <div className="space-y-6">
              <p className="text-xs text-gray-400">Manage the 5 Excellence League cards shown on the website (Creative, Knowledge, Communication, Innovation, Character).</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leagues.map((lg, idx) => (
                  <div key={lg.slug || idx} className="bg-[#090b15] border border-white/10 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{lg.emoji}</span>
                        <h3 className="text-sm font-bold text-white">{lg.name}</h3>
                      </div>
                      <span className="text-xs font-mono text-gray-500">/{lg.slug}</span>
                    </div>

                    <div>
                      <label className={labelClass}>League Name</label>
                      <input
                        type="text"
                        value={lg.name || ''}
                        onChange={(e) => setLeagues(prev => prev.map((l, i) => i === idx ? { ...l, name: e.target.value } : l))}
                        className={inputClass}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={labelClass}>Age Group</label>
                        <input
                          type="text"
                          value={lg.age || ''}
                          onChange={(e) => setLeagues(prev => prev.map((l, i) => i === idx ? { ...l, age: e.target.value } : l))}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Emoji</label>
                        <input
                          type="text"
                          value={lg.emoji || ''}
                          onChange={(e) => setLeagues(prev => prev.map((l, i) => i === idx ? { ...l, emoji: e.target.value } : l))}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Description</label>
                      <textarea
                        rows="3"
                        value={lg.desc || ''}
                        onChange={(e) => setLeagues(prev => prev.map((l, i) => i === idx ? { ...l, desc: e.target.value } : l))}
                        className={inputClass}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 4: PREPARATION & COMPETITION ── */}
          {activeTab === 'prep' && (
            <div className="space-y-8">
              {/* Contest Preparation Details */}
              <div className="bg-[#090b15] border border-white/10 p-6 rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  Contest Preparation Card Settings
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Section Title</label>
                    <input type="text" value={prepTitle} onChange={(e) => setPrepTitle(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Footer Note</label>
                    <input type="text" value={prepFooterNote} onChange={(e) => setPrepFooterNote(e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Subtitle Description</label>
                  <textarea rows="2" value={prepSubtitle} onChange={(e) => setPrepSubtitle(e.target.value)} className={inputClass} />
                </div>

                {/* Prep Items List */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-300">Preparation Feature Items ({prepItems.length})</span>
                    <button type="button" onClick={addPrepItem} className="text-xs text-[#E94B4B] hover:text-red-400 font-semibold flex items-center gap-1 cursor-pointer">
                      <Plus size={13} /> Add Feature
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {prepItems.map((item, idx) => (
                      <div key={idx} className="p-3 bg-[#0f1117] border border-white/10 rounded-xl space-y-2 relative group">
                        <button type="button" onClick={() => removePrepItem(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-300 cursor-pointer">
                          <X size={14} />
                        </button>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updatePrepItem(idx, 'title', e.target.value)}
                          placeholder="Feature Title"
                          className={inputClass + ' font-bold text-xs'}
                        />
                        <input
                          type="text"
                          value={item.desc}
                          onChange={(e) => updatePrepItem(idx, 'desc', e.target.value)}
                          placeholder="Short Description"
                          className={inputClass + ' text-xs'}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* School Competition & Activities Card */}
              <div className="bg-[#090b15] border border-white/10 p-6 rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  School Competition Card Settings
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Section Title</label>
                    <input type="text" value={compTitle} onChange={(e) => setCompTitle(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Progression Highlight Banner</label>
                    <input type="text" value={compNote} onChange={(e) => setCompNote(e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Subtitle Description</label>
                  <textarea rows="2" value={compSubtitle} onChange={(e) => setCompSubtitle(e.target.value)} className={inputClass} />
                </div>

                {/* Activities Tags List */}
                <div className="space-y-3 pt-2">
                  <label className={labelClass}>Competition Activity Tags ({activities.length})</label>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    {activities.map((act, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-xl bg-[#0f1117] border border-white/10 text-xs font-semibold text-gray-200 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-red-400" />
                        {act}
                        <button type="button" onClick={() => removeActivity(idx)} className="text-gray-400 hover:text-red-400 cursor-pointer">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 max-w-md">
                    <input
                      type="text"
                      value={newActivity}
                      onChange={(e) => setNewActivity(e.target.value)}
                      placeholder="Add new challenge activity tag..."
                      className={inputClass}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addActivity(); } }}
                    />
                    <button type="button" onClick={addActivity} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shrink-0 cursor-pointer">
                      Add Tag
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 5: RECOGNITION & SKILLS ── */}
          {activeTab === 'recognition' && (
            <div className="space-y-8">
              {/* Recognition Stages Section */}
              <div className="bg-[#090b15] border border-white/10 p-6 rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Medal className="w-5 h-5 text-amber-400" />
                  Recognition at Every Stage Settings
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Top Badge Text</label>
                    <input type="text" value={recBadge} onChange={(e) => setRecBadge(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Section Title</label>
                    <input type="text" value={recTitle} onChange={(e) => setRecTitle(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Community Banner Title</label>
                    <input type="text" value={commTitle} onChange={(e) => setCommTitle(e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Section Subtitle</label>
                  <input type="text" value={recSubtitle} onChange={(e) => setRecSubtitle(e.target.value)} className={inputClass} />
                </div>

                {/* Recognition Stage Cards List */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-300">Recognition Stage Cards ({recStages.length})</span>
                    <button type="button" onClick={addRecStage} className="text-xs text-[#E94B4B] hover:text-red-400 font-semibold flex items-center gap-1 cursor-pointer">
                      <Plus size={13} /> Add Stage Card
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {recStages.map((stage, idx) => (
                      <div key={idx} className="p-3 bg-[#0f1117] border border-white/10 rounded-xl space-y-2 relative">
                        <button type="button" onClick={() => removeRecStage(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-300 cursor-pointer">
                          <X size={14} />
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={stage.title}
                            onChange={(e) => updateRecStage(idx, 'title', e.target.value)}
                            placeholder="Stage Title"
                            className={inputClass + ' font-bold text-xs'}
                          />
                          <select
                            value={stage.icon || 'Medal'}
                            onChange={(e) => updateRecStage(idx, 'icon', e.target.value)}
                            className={inputClass + ' text-xs'}
                          >
                            {AVAILABLE_ICONS.map((ic) => (
                              <option key={ic.value} value={ic.value}>{ic.value}</option>
                            ))}
                          </select>
                        </div>

                        <textarea
                          rows="2"
                          value={stage.desc}
                          onChange={(e) => updateRecStage(idx, 'desc', e.target.value)}
                          placeholder="Stage description..."
                          className={inputClass + ' text-xs'}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Holistic Growth & Skills Developed */}
              <div className="bg-[#090b15] border border-white/10 p-6 rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-emerald-400" />
                  Skills Developed Section Settings
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Badge Text</label>
                    <input type="text" value={skillsBadge} onChange={(e) => setSkillsBadge(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Section Title</label>
                    <input type="text" value={skillsTitle} onChange={(e) => setSkillsTitle(e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Section Description</label>
                  <textarea rows="2" value={skillsDesc} onChange={(e) => setSkillsDesc(e.target.value)} className={inputClass} />
                </div>

                {/* Skills Grid Editor */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-300">Essential Skills Developed ({skillsList.length})</span>
                    <button type="button" onClick={addSkill} className="text-xs text-[#E94B4B] hover:text-red-400 font-semibold flex items-center gap-1 cursor-pointer">
                      <Plus size={13} /> Add Skill
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {skillsList.map((skill, idx) => (
                      <div key={idx} className="p-2 bg-[#0f1117] border border-white/10 rounded-xl space-y-1.5 relative">
                        <button type="button" onClick={() => removeSkill(idx)} className="absolute top-1 right-1 text-red-400 hover:text-red-300 cursor-pointer">
                          <X size={12} />
                        </button>

                        <input
                          type="text"
                          value={skill.name}
                          onChange={(e) => updateSkill(idx, 'name', e.target.value)}
                          placeholder="Skill Name"
                          className={inputClass + ' text-xs font-bold px-2 py-1'}
                        />
                        <select
                          value={skill.icon || 'Star'}
                          onChange={(e) => updateSkill(idx, 'icon', e.target.value)}
                          className={inputClass + ' text-[11px] px-1 py-1'}
                        >
                          {AVAILABLE_ICONS.map((ic) => (
                            <option key={ic.value} value={ic.value}>{ic.value}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 6: CALLOUT & SUMMARY BANNERS ── */}
          {activeTab === 'callout' && (
            <div className="space-y-8">
              {/* Rules & Fair Play Callout Banner */}
              <div className="bg-[#090b15] border border-white/10 p-6 rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-red-400" />
                  Rules & Fair Play Callout Banner
                </h3>

                <div>
                  <label className={labelClass}>Banner Title</label>
                  <input type="text" value={calloutTitle} onChange={(e) => setCalloutTitle(e.target.value)} className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Description Text</label>
                  <textarea rows="3" value={calloutDesc} onChange={(e) => setCalloutDesc(e.target.value)} className={inputClass} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelClass + ' mb-0'}>Fair Play Bullet Points</label>
                    <button type="button" onClick={addBullet} className="flex items-center gap-1 text-xs text-[#E94B4B] hover:text-red-400 font-semibold cursor-pointer">
                      <Plus size={13} /> Add Point
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {bulletPoints.map((bp, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-red-500 font-bold text-sm">✔</span>
                        <input type="text" value={bp} onChange={(e) => updateBullet(idx, e.target.value)} placeholder={`Bullet point ${idx + 1}…`} className={inputClass + ' flex-1'} />
                        <button type="button" onClick={() => removeBullet(idx)} disabled={bulletPoints.length === 1} className="p-1 text-red-500/60 hover:text-red-500 disabled:opacity-30 cursor-pointer"><X size={15} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className={labelClass}>CTA Button Text</label>
                    <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>CTA Button Target Link</label>
                    <input type="text" value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Final Summary Banner */}
              <div className="bg-[#090b15] border border-white/10 p-6 rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  Final Roadmap Summary Banner
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Banner Title</label>
                    <input type="text" value={sumTitle} onChange={(e) => setSumTitle(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Footer Tagline</label>
                    <input type="text" value={sumTagline} onChange={(e) => setSumTagline(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Sub Tagline</label>
                    <input type="text" value={sumSubTagline} onChange={(e) => setSumSubTagline(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Motto Tagline (Red Gradient)</label>
                    <input type="text" value={sumMotto} onChange={(e) => setSumMotto(e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Step Edit / Add Modal ── */}
      {stepModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 shrink-0">
              <h2 className="text-lg font-bold text-white">{editingStep ? 'Edit Step' : 'Add New Step'}</h2>
              <button onClick={() => setStepModalOpen(false)} className="text-gray-400 hover:text-white transition-colors cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleStepSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Step Number Badge</label>
                  <input type="text" value={stepForm.stepNumber} onChange={(e) => setStepForm((f) => ({ ...f, stepNumber: e.target.value }))} placeholder="e.g. 01" maxLength={4} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Display Order</label>
                  <input type="number" min="1" value={stepForm.displayOrder} onChange={(e) => setStepForm((f) => ({ ...f, displayOrder: e.target.value }))} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Icon</label>
                <select value={stepForm.icon} onChange={(e) => setStepForm((f) => ({ ...f, icon: e.target.value }))} className={inputClass}>
                  {AVAILABLE_ICONS.map((ic) => (<option key={ic.value} value={ic.value}>{ic.label}</option>))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Step Title</label>
                <input required type="text" value={stepForm.title} onChange={(e) => setStepForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Register" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Short Subtitle</label>
                <input type="text" value={stepForm.shortDesc} onChange={(e) => setStepForm((f) => ({ ...f, shortDesc: e.target.value }))} placeholder="e.g. Quick & Simple Onboarding" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Full Description</label>
                <textarea required rows="3" value={stepForm.description} onChange={(e) => setStepForm((f) => ({ ...f, description: e.target.value }))} placeholder="Enter description of this step…" className={inputClass} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setStepModalOpen(false)} className="px-4 py-2 border border-gray-600 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer hover:opacity-90" style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}>{editingStep ? 'Update Step' : 'Add Step'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { if (!deleting) { setDeleteModalOpen(false); setStepToDelete(null); } }}
        onConfirm={handleConfirmDelete}
        title="Delete Step?"
        message={`Are you sure you want to delete "${stepToDelete?.title || 'this step'}"?\nThis will be removed when you Save All Changes.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={deleting}
      />
    </div>
  );
};

export default ManageHowItWorks;
