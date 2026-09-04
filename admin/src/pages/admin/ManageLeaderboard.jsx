import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Trophy,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Search,
  CheckCircle2,
  Sparkles,
  User,
} from 'lucide-react';
import cmsService from '../../api/services/cmsService';

const ManageLeaderboard = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [heroTitle, setHeroTitle] = useState('Leaderboard');
  const [heroSubtitle, setHeroSubtitle] = useState('Track top earners and compare your scores with other global players.');
  const [leaders, setLeaders] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    rank: 1,
    name: '',
    contest: '',
    amount: '',
    image: '',
  });

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await cmsService.getAdminLeaderboard();
      if (res?.success && res.data) {
        setHeroTitle(res.data.hero?.title || 'Leaderboard');
        setHeroSubtitle(res.data.hero?.subtitle || '');
        setLeaders(res.data.leaders || []);
      }
    } catch (err) {
      console.error('Error fetching leaderboard CMS:', err);
      toast.error('Failed to load Leaderboard CMS content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save all changes to backend
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload = {
        hero: {
          title: heroTitle,
          subtitle: heroSubtitle,
        },
        leaders: leaders.map((item, idx) => ({
          ...item,
          rank: Number(item.rank) || idx + 1,
          amount: Number(item.amount) || 0,
        })),
      };

      const res = await cmsService.updateAdminLeaderboard(payload);
      if (res?.success) {
        toast.success('Leaderboard CMS content saved successfully!');
        if (res.data) {
          setLeaders(res.data.leaders || []);
        }
      } else {
        toast.error(res?.message || 'Failed to save changes');
      }
    } catch (err) {
      console.error('Error saving leaderboard CMS:', err);
      toast.error('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  // Open modal for add/edit
  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        rank: item.rank || leaders.length + 1,
        name: item.name || '',
        contest: item.contest || '',
        amount: item.amount || 0,
        image: item.image || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        rank: leaders.length + 1,
        name: '',
        contest: '',
        amount: '',
        image: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveModalItem = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Player name is required');
      return;
    }

    const newItem = {
      id: editingItem ? editingItem.id : Date.now(),
      rank: Number(formData.rank) || (leaders.length + 1),
      name: formData.name.trim(),
      contest: formData.contest.trim() || 'General Contest',
      amount: Number(formData.amount) || 0,
      image: formData.image.trim(),
    };

    if (editingItem) {
      setLeaders((prev) => prev.map((l) => (l.id === editingItem.id ? newItem : l)));
      toast.success('Player updated in draft');
    } else {
      setLeaders((prev) => [...prev, newItem]);
      toast.success('Player added to draft');
    }

    setIsModalOpen(false);
  };

  const handleDeleteItem = (id) => {
    setLeaders((prev) => prev.filter((item) => item.id !== id));
    toast.success('Player removed from draft');
  };

  const handleMoveRank = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === leaders.length - 1) return;

    const updated = [...leaders];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Recalculate rank numbers
    const reRanked = updated.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

    setLeaders(reRanked);
  };

  const filteredLeaders = leaders.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.contest.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f1117] p-6 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white shadow-md">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Manage Leaderboard Page</h1>
            <p className="text-xs text-gray-400">Edit hero content, rankings, top player payouts & standings displayed on the website</p>
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
          <p className="text-xs text-gray-400">Loading Leaderboard Content...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 1: Hero Settings */}
          <div className="bg-[#0f1117] p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-500" />
                Hero Banner Content
              </h2>
              <span className="text-xs text-gray-400">Header title & description on website</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Page Title</label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Leaderboard"
                  className="w-full px-4 py-2.5 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Subtitle / Description</label>
                <input
                  type="text"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Track top earners and compare your scores..."
                  className="w-full px-4 py-2.5 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Player Leaderboard Rankings */}
          <div className="bg-[#0f1117] p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Player Rankings & Payouts ({leaders.length})
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Top 3 will appear on the interactive Podium</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search player or contest..."
                    className="pl-9 pr-4 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 w-48 sm:w-64"
                  />
                </div>
                <button
                  onClick={() => handleOpenModal()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add Player
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Player</th>
                    <th className="py-3 px-4">Contest</th>
                    <th className="py-3 px-4">Winnings (₹)</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLeaders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-500">
                        No player entries found. Click "Add Player" to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredLeaders.map((player, idx) => (
                      <tr key={player.id || idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-bold text-white">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
                              idx === 0
                                ? 'bg-amber-400 text-gray-950'
                                : idx === 1
                                ? 'bg-slate-400 text-gray-950'
                                : idx === 2
                                ? 'bg-amber-600 text-white'
                                : 'bg-white/10 text-gray-300'
                            }`}
                          >
                            #{player.rank || idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                              {player.image ? (
                                <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <span className="font-bold text-white">{player.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{player.contest}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          ₹{Number(player.amount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleMoveRank(idx, 'up')}
                              disabled={idx === 0}
                              title="Move Up"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveRank(idx, 'down')}
                              disabled={idx === leaders.length - 1}
                              title="Move Down"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenModal(player)}
                              title="Edit"
                              className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 cursor-pointer ml-1"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(player.id)}
                              title="Delete"
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Add / Edit Player */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {editingItem ? 'Edit Leaderboard Player' : 'Add New Leaderboard Player'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModalItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Rank Position</label>
                <input
                  type="number"
                  min="1"
                  value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Player Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3.5 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Latest Contest Name</label>
                <input
                  type="text"
                  value={formData.contest}
                  onChange={(e) => setFormData({ ...formData, contest: e.target.value })}
                  placeholder="e.g. Grand Champions League"
                  className="w-full px-3.5 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Total Winnings Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="124000"
                  className="w-full px-3.5 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Avatar Image URL (Optional)</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 bg-[#0a0c12] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 transition-all duration-200 ease-out cursor-pointer select-none hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-red-500/35 active:translate-y-0 active:scale-[0.97] text-white text-xs font-bold"
                >
                  {editingItem ? 'Update Player' : 'Add Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLeaderboard;
