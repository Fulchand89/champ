import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Award,
  Save,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import cmsService from '../../api/services/cmsService';

// Module-level cache — persists for the entire browser session
let _excellenceLeagueCache = null;

const DEFAULT_LEAGUES = {
  'creative-league': {
    slug: 'creative-league',
    name: 'Creative League',
    tagline: 'Identification of imagination, artistic expression, observation, and creative thinking.',
    ageGroup: '3–5 Years',
    code: 'K1',
    schedule: '14 Nov 2026, 10:00 AM',
    entryFee: '₹100.00',
    maxScore: '100.00',
    emoji: '🎨',
  },
  'knowledge-league': {
    slug: 'knowledge-league',
    name: 'Knowledge League',
    tagline: 'Fostering general awareness, curiosity, critical thinking, and core knowledge foundation.',
    ageGroup: '6–8 Years',
    code: 'K2',
    schedule: '15 Nov 2026, 10:00 AM',
    entryFee: '₹100.00',
    maxScore: '100.00',
    emoji: '📚',
  },
  'communication-league': {
    slug: 'communication-league',
    name: 'Communication League',
    tagline: 'Enhancing storytelling, public speaking, dynamic expression, and clear articulation.',
    ageGroup: '9–12 Years',
    code: 'K3',
    schedule: '16 Nov 2026, 10:00 AM',
    entryFee: '₹100.00',
    maxScore: '100.00',
    emoji: '🎤',
  },
  'innovation-league': {
    slug: 'innovation-league',
    name: 'Innovation League',
    tagline: 'Encouraging practical problem solving, tech concepts, innovation, and creative thinking.',
    ageGroup: '13–16 Years',
    code: 'K4',
    schedule: '17 Nov 2026, 10:00 AM',
    entryFee: '₹100.00',
    maxScore: '100.00',
    emoji: '💡',
  },
  'character-league': {
    slug: 'character-league',
    name: 'Character League',
    tagline: 'Developing personality, leadership, ethics, integrity, and character assessment.',
    ageGroup: '17–19 Years',
    code: 'K5',
    schedule: '18 Nov 2026, 10:00 AM',
    entryFee: '₹100.00',
    maxScore: '100.00',
    emoji: '🌟',
  },
};

const ManageExcellenceLeague = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('leagues');

  // Form State
  const [heroTitle, setHeroTitle] = useState('Excellence League');
  const [heroSubtitle, setHeroSubtitle] = useState('Compete in live timed quiz battles, climb tier rankings, and win weekly championship rewards.');
  const [leagues, setLeagues] = useState(DEFAULT_LEAGUES);

  // Populate state from a data object (cache or API response)
  const applyData = (data) => {
    if (!data) return;
    setHeroTitle(data.hero?.title || 'Excellence League');
    setHeroSubtitle(data.hero?.subtitle || '');
    if (data.leagues && typeof data.leagues === 'object') {
      setLeagues({ ...DEFAULT_LEAGUES, ...data.leagues });
    }
  };

  // Fetch data — instant from cache, silent background refresh
  const fetchData = async (showSpinner = true) => {
    if (_excellenceLeagueCache) {
      applyData(_excellenceLeagueCache);
      setLoading(false);
      try {
        const res = await cmsService.getAdminExcellenceLeague();
        if (res?.success && res.data) {
          _excellenceLeagueCache = res.data;
          applyData(res.data);
        }
      } catch (_) {}
      return;
    }
    if (showSpinner) setLoading(true);
    try {
      const res = await cmsService.getAdminExcellenceLeague();
      if (res?.success && res.data) {
        _excellenceLeagueCache = res.data;
        applyData(res.data);
      }
    } catch (err) {
      console.error('Error fetching Excellence League CMS:', err);
      toast.error('Failed to load Excellence League content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save all changes
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload = {
        hero: {
          title: heroTitle,
          subtitle: heroSubtitle,
        },
        leagues,
      };

      const res = await cmsService.updateAdminExcellenceLeague(payload);
      if (res?.success) {
        toast.success('Excellence League CMS content saved successfully!');
        if (res.data) {
          if (res.data.hero?.title) setHeroTitle(res.data.hero.title);
          if (res.data.hero?.subtitle) setHeroSubtitle(res.data.hero.subtitle);
          if (res.data.leagues) setLeagues({ ...DEFAULT_LEAGUES, ...res.data.leagues });
        }
      } else {
        toast.error(res?.message || 'Failed to save changes');
      }
    } catch (err) {
      console.error('Error saving Excellence League CMS:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'An error occurred while saving';
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f1117] p-6 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-white">Manage Excellence League Page</h1>
            <p className="text-xs text-gray-400">Manage hero header and details for all 5 Excellence Leagues</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)}
            disabled={loading || saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving || loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 transition-all duration-200 ease-out cursor-pointer select-none hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-red-500/35 active:translate-y-0 active:scale-[0.97] text-white text-xs font-bold disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0f1117] rounded-2xl border border-white/10 space-y-3">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-400">Loading Excellence League Content...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
            {[
              { id: 'leagues', label: '5 Excellence Leagues Catalog', icon: Award },
              { id: 'hero', label: 'Hero Header', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-red-600/20 border border-red-500/40 text-red-400'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: 5 LEAGUES CATALOG */}
          {activeTab === 'leagues' && (
            <div className="space-y-6">
              {Object.keys(leagues).map((slug) => {
                const lg = leagues[slug];
                return (
                  <div key={slug} className="bg-[#0f1117] p-6 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{lg.emoji}</span>
                        <h3 className="text-base font-bold text-white">{lg.name} ({lg.code})</h3>
                      </div>
                      <span className="text-xs font-mono text-gray-500">/{lg.slug}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">League Name</label>
                        <input
                          type="text"
                          value={lg.name || ''}
                          onChange={(e) => setLeagues({
                            ...leagues,
                            [slug]: { ...lg, name: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Age Group</label>
                        <input
                          type="text"
                          value={lg.ageGroup || ''}
                          onChange={(e) => setLeagues({
                            ...leagues,
                            [slug]: { ...lg, ageGroup: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">League Code</label>
                        <input
                          type="text"
                          value={lg.code || ''}
                          onChange={(e) => setLeagues({
                            ...leagues,
                            [slug]: { ...lg, code: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Schedule</label>
                        <input
                          type="text"
                          value={lg.schedule || ''}
                          onChange={(e) => setLeagues({
                            ...leagues,
                            [slug]: { ...lg, schedule: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Entry Fee</label>
                        <input
                          type="text"
                          value={lg.entryFee || ''}
                          onChange={(e) => setLeagues({
                            ...leagues,
                            [slug]: { ...lg, entryFee: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Max Score</label>
                        <input
                          type="text"
                          value={lg.maxScore || ''}
                          onChange={(e) => setLeagues({
                            ...leagues,
                            [slug]: { ...lg, maxScore: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Tagline / Description</label>
                        <textarea
                          rows="2"
                          value={lg.tagline || ''}
                          onChange={(e) => setLeagues({
                            ...leagues,
                            [slug]: { ...lg, tagline: e.target.value }
                          })}
                          className="w-full px-3.5 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: HERO HEADER */}
          {activeTab === 'hero' && (
            <div className="bg-[#0f1117] p-6 rounded-2xl border border-white/10 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
                <Sparkles className="w-4 h-4 text-red-500" />
                Hero Header Content
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Page Title</label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="Excellence League"
                    className="w-full px-4 py-2.5 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Subtitle / Description</label>
                  <input
                    type="text"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="Compete in live timed quiz battles..."
                    className="w-full px-4 py-2.5 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageExcellenceLeague;
