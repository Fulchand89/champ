import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Award,
  Trophy,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  User,
  Layers,
} from 'lucide-react';
import cmsService from '../../api/services/cmsService';

const ManageExcellenceLeague = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  // Form State
  const [heroTitle, setHeroTitle] = useState('Excellence League');
  const [heroSubtitle, setHeroSubtitle] = useState('Compete in live timed quiz battles, climb tier rankings, and win weekly championship rewards.');
  const [tiers, setTiers] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [rules, setRules] = useState([]);

  // Modal Controls
  const [modalType, setModalType] = useState(null); // 'tier' | 'leader' | 'rule'
  const [editingItem, setEditingItem] = useState(null);

  // Form Field States
  const [tierForm, setTierForm] = useState({ name: '', icon: '🥇', badge: '', minRating: '', poolShare: '', desc: '' });
  const [leaderForm, setLeaderForm] = useState({ rank: 1, name: '', contest: '', amount: '', points: '', tier: '', city: '', image: '' });
  const [ruleForm, setRuleForm] = useState({ title: '', desc: '' });

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await cmsService.getAdminExcellenceLeague();
      if (res?.success && res.data) {
        setHeroTitle(res.data.hero?.title || 'Excellence League');
        setHeroSubtitle(res.data.hero?.subtitle || '');
        setTiers(res.data.tiers || []);
        setLeaders(res.data.leaders || []);
        setRules(res.data.rules || []);
      }
    } catch (err) {
      console.error('Error fetching Excellence League CMS:', err);
      toast.error('Failed to load Excellence League CMS content');
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
        tiers,
        leaders: leaders.map((item, idx) => ({
          ...item,
          rank: Number(item.rank) || idx + 1,
          amount: Number(item.amount) || 0,
        })),
        rules,
      };

      const res = await cmsService.updateAdminExcellenceLeague(payload);
      if (res?.success) {
        toast.success('Excellence League CMS content saved successfully!');
        if (res.data) {
          if (res.data.hero?.title) setHeroTitle(res.data.hero.title);
          if (res.data.hero?.subtitle) setHeroSubtitle(res.data.hero.subtitle);
          if (Array.isArray(res.data.tiers)) setTiers(res.data.tiers);
          if (Array.isArray(res.data.leaders)) setLeaders(res.data.leaders);
          if (Array.isArray(res.data.rules)) setRules(res.data.rules);
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

  // Tier Modal Handlers
  const handleOpenTierModal = (tier = null) => {
    setEditingItem(tier);
    if (tier) {
      setTierForm({
        name: tier.name || '',
        icon: tier.icon || '🥇',
        badge: tier.badge || '',
        minRating: tier.minRating || '',
        poolShare: tier.poolShare || '',
        desc: tier.desc || '',
      });
    } else {
      setTierForm({ name: '', icon: '🥇', badge: 'Competitive', minRating: '', poolShare: '', desc: '' });
    }
    setModalType('tier');
  };

  const handleSaveTier = (e) => {
    e.preventDefault();
    if (!tierForm.name.trim()) return toast.error('Tier name is required');
    const newTier = {
      id: editingItem ? editingItem.id : Date.now(),
      ...tierForm,
    };
    if (editingItem) {
      setTiers((prev) => prev.map((t) => (t.id === editingItem.id ? newTier : t)));
    } else {
      setTiers((prev) => [...prev, newTier]);
    }
    setModalType(null);
    toast.success('Tier saved to draft');
  };

  const handleDeleteTier = (id) => {
    setTiers((prev) => prev.filter((t) => t.id !== id));
    toast.success('Tier removed from draft');
  };

  // Leader Modal Handlers
  const handleOpenLeaderModal = (leader = null) => {
    setEditingItem(leader);
    if (leader) {
      setLeaderForm({
        rank: leader.rank || leaders.length + 1,
        name: leader.name || '',
        contest: leader.contest || '',
        amount: leader.amount || 0,
        points: leader.points || '',
        tier: leader.tier || '',
        city: leader.city || '',
        image: leader.image || '',
      });
    } else {
      setLeaderForm({
        rank: leaders.length + 1,
        name: '',
        contest: 'Excellence League',
        amount: '',
        points: '15,000 PTS',
        tier: 'Pro Master',
        city: '',
        image: '',
      });
    }
    setModalType('leader');
  };

  const handleSaveLeader = (e) => {
    e.preventDefault();
    if (!leaderForm.name.trim()) return toast.error('Player name is required');
    const newLeader = {
      id: editingItem ? editingItem.id : Date.now(),
      ...leaderForm,
      rank: Number(leaderForm.rank) || (leaders.length + 1),
      amount: Number(leaderForm.amount) || 0,
    };
    if (editingItem) {
      setLeaders((prev) => prev.map((l) => (l.id === editingItem.id ? newLeader : l)));
    } else {
      setLeaders((prev) => [...prev, newLeader]);
    }
    setModalType(null);
    toast.success('Player saved to draft');
  };

  const handleDeleteLeader = (id) => {
    setLeaders((prev) => prev.filter((l) => l.id !== id));
    toast.success('Player removed from draft');
  };

  // Rule Modal Handlers
  const handleOpenRuleModal = (rule = null) => {
    setEditingItem(rule);
    if (rule) {
      setRuleForm({ title: rule.title || '', desc: rule.desc || '' });
    } else {
      setRuleForm({ title: '', desc: '' });
    }
    setModalType('rule');
  };

  const handleSaveRule = (e) => {
    e.preventDefault();
    if (!ruleForm.title.trim()) return toast.error('Rule title is required');
    const newRule = {
      id: editingItem ? editingItem.id : Date.now(),
      ...ruleForm,
    };
    if (editingItem) {
      setRules((prev) => prev.map((r) => (r.id === editingItem.id ? newRule : r)));
    } else {
      setRules((prev) => [...prev, newRule]);
    }
    setModalType(null);
    toast.success('Rule saved to draft');
  };

  const handleDeleteRule = (id) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    toast.success('Rule removed from draft');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f1117] p-6 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-white">Manage Excellence League Page</h1>
            <p className="text-xs text-gray-400">Edit hero banner, league tier divisions, player standings & fair play rules</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
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
              { id: 'hero', label: 'Hero Header', icon: Sparkles },
              { id: 'tiers', label: `Tier Divisions (${tiers.length})`, icon: Layers },
              { id: 'leaders', label: `League Standings (${leaders.length})`, icon: Trophy },
              { id: 'rules', label: `Rules & Fair Play (${rules.length})`, icon: ShieldCheck },
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

          {/* TAB 1: HERO HEADER */}
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

          {/* TAB 2: TIER DIVISIONS */}
          {activeTab === 'tiers' && (
            <div className="bg-[#0f1117] p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    League Tier Divisions
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Configure skill tiers, ratings & prize pool shares</p>
                </div>
                <button
                  onClick={() => handleOpenTierModal()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Tier
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="bg-[#0a0c12] p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-3 relative group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{tier.icon}</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                          {tier.badge}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white">{tier.name}</h3>
                      <p className="text-xs font-semibold text-amber-400 mt-0.5">{tier.minRating}</p>
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed">{tier.desc}</p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-gray-500">Prize Share</span>
                      <span className="font-bold text-white">{tier.poolShare}</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => handleOpenTierModal(tier)}
                        className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 cursor-pointer"
                        title="Edit Tier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTier(tier.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                        title="Delete Tier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LEAGUE STANDINGS */}
          {activeTab === 'leaders' && (
            <div className="bg-[#0f1117] p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    League Standings & Player Rankings
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Top 3 will appear on the Excellence League podium</p>
                </div>
                <button
                  onClick={() => handleOpenLeaderModal()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Player
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 uppercase font-bold tracking-wider">
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Player & Location</th>
                      <th className="py-3 px-4">Tier Division</th>
                      <th className="py-3 px-4">Points</th>
                      <th className="py-3 px-4">Winnings (₹)</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leaders.map((player, idx) => (
                      <tr key={player.id || idx} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-bold text-white">#{player.rank || idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                              {player.image ? (
                                <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-white">{player.name}</p>
                              <p className="text-[10px] text-gray-400">{player.city || 'India'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-300 font-semibold">{player.tier}</td>
                        <td className="py-3 px-4 text-amber-400 font-bold">{player.points}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          ₹{Number(player.amount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenLeaderModal(player)}
                              className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLeader(player.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: RULES & FAIR PLAY */}
          {activeTab === 'rules' && (
            <div className="bg-[#0f1117] p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    League Rules & Fair Play
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Manage key rules displayed on the Excellence League page</p>
                </div>
                <button
                  onClick={() => handleOpenRuleModal()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Rule
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="p-4 rounded-xl bg-[#0a0c12] border border-white/10 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white">{rule.title}</h3>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{rule.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenRuleModal(rule)}
                        className="p-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {/* 1. TIER MODAL */}
      {modalType === 'tier' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">{editingItem ? 'Edit Tier Division' : 'Add Tier Division'}</h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-white text-lg font-bold">✕</button>
            </div>
            <form onSubmit={handleSaveTier} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Tier Name *</label>
                <input
                  type="text"
                  required
                  value={tierForm.name}
                  onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                  placeholder="e.g. Pro Masters"
                  className="w-full px-3.5 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Icon (Emoji / Text)</label>
                  <input
                    type="text"
                    value={tierForm.icon}
                    onChange={(e) => setTierForm({ ...tierForm, icon: e.target.value })}
                    placeholder="🥇"
                    className="w-full px-3.5 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={tierForm.badge}
                    onChange={(e) => setTierForm({ ...tierForm, badge: e.target.value })}
                    placeholder="Competitive"
                    className="w-full px-3.5 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Minimum Rating / Points</label>
                <input
                  type="text"
                  value={tierForm.minRating}
                  onChange={(e) => setTierForm({ ...tierForm, minRating: e.target.value })}
                  placeholder="1,201 - 2,500 PTS"
                  className="w-full px-3.5 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Prize Pool Share</label>
                <input
                  type="text"
                  value={tierForm.poolShare}
                  onChange={(e) => setTierForm({ ...tierForm, poolShare: e.target.value })}
                  placeholder="25% Prize Pool"
                  className="w-full px-3.5 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={tierForm.desc}
                  onChange={(e) => setTierForm({ ...tierForm, desc: e.target.value })}
                  placeholder="Multi-category trivia with double coin rewards..."
                  className="w-full px-3.5 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 rounded-xl bg-white/5 text-white text-xs">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 transition-all duration-200 ease-out cursor-pointer select-none hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-red-500/35 active:translate-y-0 active:scale-[0.97] text-white text-xs font-bold">Save Tier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. LEADER MODAL */}
      {modalType === 'leader' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">{editingItem ? 'Edit Player' : 'Add Player'}</h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-white text-lg font-bold">✕</button>
            </div>
            <form onSubmit={handleSaveLeader} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Rank</label>
                  <input
                    type="number"
                    value={leaderForm.rank}
                    onChange={(e) => setLeaderForm({ ...leaderForm, rank: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">City / Location</label>
                  <input
                    type="text"
                    value={leaderForm.city}
                    onChange={(e) => setLeaderForm({ ...leaderForm, city: e.target.value })}
                    placeholder="Delhi"
                    className="w-full px-3 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Player Full Name *</label>
                <input
                  type="text"
                  required
                  value={leaderForm.name}
                  onChange={(e) => setLeaderForm({ ...leaderForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Tier Name</label>
                  <input
                    type="text"
                    value={leaderForm.tier}
                    onChange={(e) => setLeaderForm({ ...leaderForm, tier: e.target.value })}
                    placeholder="Excellence Legend"
                    className="w-full px-3 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Points Display</label>
                  <input
                    type="text"
                    value={leaderForm.points}
                    onChange={(e) => setLeaderForm({ ...leaderForm, points: e.target.value })}
                    placeholder="18,450 PTS"
                    className="w-full px-3 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Winnings Amount (₹)</label>
                <input
                  type="number"
                  value={leaderForm.amount}
                  onChange={(e) => setLeaderForm({ ...leaderForm, amount: e.target.value })}
                  placeholder="124000"
                  className="w-full px-3 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={leaderForm.image}
                  onChange={(e) => setLeaderForm({ ...leaderForm, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 rounded-xl bg-white/5 text-white text-xs">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 transition-all duration-200 ease-out cursor-pointer select-none hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-red-500/35 active:translate-y-0 active:scale-[0.97] text-white text-xs font-bold">Save Player</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. RULE MODAL */}
      {modalType === 'rule' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">{editingItem ? 'Edit Rule' : 'Add Rule'}</h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-white text-lg font-bold">✕</button>
            </div>
            <form onSubmit={handleSaveRule} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Rule Title *</label>
                <input
                  type="text"
                  required
                  value={ruleForm.title}
                  onChange={(e) => setRuleForm({ ...ruleForm, title: e.target.value })}
                  placeholder="Anti-Cheat Engine"
                  className="w-full px-3 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Rule Description</label>
                <textarea
                  rows="3"
                  value={ruleForm.desc}
                  onChange={(e) => setRuleForm({ ...ruleForm, desc: e.target.value })}
                  placeholder="Real-time response verification ensures complete fair play."
                  className="w-full px-3 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 rounded-xl bg-white/5 text-white text-xs">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 transition-all duration-200 ease-out cursor-pointer select-none hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-red-500/35 active:translate-y-0 active:scale-[0.97] text-white text-xs font-bold">Save Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageExcellenceLeague;
