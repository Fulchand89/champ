import React, { useState, useEffect } from 'react';
import { Search, RotateCw, Plus, Edit, Trash2, X, Sparkles } from 'lucide-react';
import Table from '../../components/common/Table';
import { featureService } from '../../api/services/featureService';
import { contestService } from '../../api/services/contestService';
import toast from 'react-hot-toast';

const ManageFeatures = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContestFilter, setSelectedContestFilter] = useState('ALL');
  const [features, setFeatures] = useState([]);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [currentFeature, setCurrentFeature] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('ShieldCheck');
  const [contestId, setContestId] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [badgeText, setBadgeText] = useState('');
  const [colorClass, setColorClass] = useState('text-[#E94B4B]');
  const [isActive, setIsActive] = useState(true);

  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const [featRes, contestRes] = await Promise.all([
        featureService.getFeatures(),
        contestService.getContests().catch(() => ({ success: false, data: [] }))
      ]);
      if (featRes?.success) {
        setFeatures(featRes.data);
      }
      if (contestRes?.success && contestRes.data) {
        setContests(contestRes.data);
      }
    } catch (err) {
      console.error('Error fetching features:', err);
      toast.error('Failed to load features');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleOpenAddModal = () => {
    setModalType('add');
    setCurrentFeature(null);
    setTitle('');
    setDescription('');
    setIconName('ShieldCheck');
    setContestId(contests.length > 0 ? String(contests[0].id) : '');
    setDisplayOrder(features.length + 1);
    setBadgeText('');
    setColorClass('text-[#E94B4B]');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (feat) => {
    setModalType('edit');
    setCurrentFeature(feat);
    setTitle(feat.title);
    setDescription(feat.description);
    setIconName(feat.iconName || 'ShieldCheck');
    setContestId(feat.contestId ? String(feat.contestId) : (feat.contest?.id ? String(feat.contest.id) : ''));
    setDisplayOrder(feat.displayOrder !== undefined ? feat.displayOrder : 0);
    setBadgeText(feat.badgeText || '');
    setColorClass(feat.colorClass || 'text-[#E94B4B]');
    setIsActive(feat.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Feature title is required');
      return;
    }
    const payload = {
      title: title.trim(),
      description: description ? description.trim() : '',
      iconName: iconName || 'ShieldCheck',
      contestId: contestId ? parseInt(contestId, 10) : null,
      displayOrder: parseInt(displayOrder, 10) || 0,
      badgeText: badgeText ? badgeText.trim() : null,
      colorClass: colorClass || 'text-[#E94B4B]',
      isActive
    };
    try {
      if (modalType === 'add') {
        const res = await featureService.createFeature(payload);
        if (res?.success) {
          toast.success('Feature created successfully');
          fetchFeatures();
          setIsModalOpen(false);
        }
      } else {
        const res = await featureService.updateFeature(currentFeature.id, payload);
        if (res?.success) {
          toast.success('Feature updated successfully');
          fetchFeatures();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error('Error saving feature:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Error saving feature';
      toast.error(errMsg);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this feature?')) {
      try {
        const res = await featureService.deleteFeature(id);
        if (res?.success) {
          toast.success('Feature deleted successfully');
          fetchFeatures();
        }
      } catch (err) {
        console.error('Error deleting feature:', err);
        toast.error('Failed to delete feature');
      }
    }
  };

  const handleToggleStatus = async (feat) => {
    const payload = {
      title: feat.title,
      description: feat.description,
      iconName: feat.iconName,
      contestId: feat.contestId || feat.contest?.id || null,
      displayOrder: feat.displayOrder,
      badgeText: feat.badgeText,
      colorClass: feat.colorClass,
      isActive: !feat.isActive
    };
    try {
      const res = await featureService.updateFeature(feat.id, payload);
      if (res?.success) {
        toast.success(`Feature ${!feat.isActive ? 'activated' : 'deactivated'}`);
        fetchFeatures();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      toast.error('Failed to toggle status');
    }
  };

  const filteredFeatures = features.filter((feat) => {
    const contestTitle = feat.contest?.title || '';
    const matchesSearch = feat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          feat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          contestTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesContest = true;
    if (selectedContestFilter === 'GENERAL') {
      matchesContest = !feat.contestId && !feat.contest;
    } else if (selectedContestFilter !== 'ALL') {
      matchesContest = String(feat.contestId) === String(selectedContestFilter) || String(feat.contest?.id) === String(selectedContestFilter);
    }
    return matchesSearch && matchesContest;
  });

  const columns = [
    { key: 'displayOrder', label: 'Order', cellClassName: 'font-mono text-gray-400 w-16 text-center' },
    { key: 'id', label: 'ID', cellClassName: 'font-mono text-[#E94B4B]' },
    {
      key: 'iconName',
      label: 'Icon',
      cellClassName: 'text-gray-300 font-semibold font-mono text-sm',
      render: (val) => val
    },
    { key: 'title', label: 'Feature Title', cellClassName: 'font-semibold' },
    {
      key: 'contest',
      label: 'Mapped Contest',
      cellClassName: 'text-xs text-blue-400 font-medium',
      render: (val, row) => row.contest?.title || 'General / All Contests'
    },
    {
      key: 'badgeText',
      label: 'Badge',
      cellClassName: 'text-xs',
      render: (val) => val ? (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
          {val}
        </span>
      ) : <span className="text-gray-600">—</span>
    },
    {
      key: 'description',
      label: 'Description',
      cellClassName: 'text-gray-400 text-xs max-w-xs truncate whitespace-nowrap',
      render: (val) => val
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (val, row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
            val ? 'bg-green-500/15 text-green-500 hover:bg-green-500/25' : 'bg-gray-500/15 text-gray-400 hover:bg-gray-500/25'
          }`}
        >
          {val ? 'Active' : 'Inactive'}
        </button>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1 text-gray-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1 text-red-500/70 hover:text-red-500 rounded transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#0f1117] text-white p-5 rounded-2xl shadow-sm border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="text-[#E94B4B]" /> Manage Features
          </h1>
          <p className="text-xs text-gray-400 mt-1">Configure and manage home page Choose Us section features and contest mappings.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer hover:opacity-90"
          style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
        >
          <Plus size={16} /> Add Feature
        </button>
      </div>

      <div className="bg-[#0f1117] text-white rounded-2xl shadow-sm border border-white/10 overflow-hidden flex flex-col">
        <div className="p-5 flex flex-col md:flex-row justify-between gap-4 border-b border-white/10">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search features by title, contest or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
              />
            </div>
            <select
              value={selectedContestFilter}
              onChange={(e) => setSelectedContestFilter(e.target.value)}
              className="px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] cursor-pointer shrink-0"
            >
              <option value="ALL">All Contests (Any)</option>
              <option value="GENERAL">General / Unmapped</option>
              {contests.map((c) => (
                <option key={c.id} value={c.id}>
                  Contest: {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchFeatures}
              className="flex items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-800 rounded-lg text-sm transition-all cursor-pointer"
            >
              <RotateCw size={16} /> Refresh
            </button>
          </div>
        </div>

        <Table columns={columns} data={filteredFeatures} loading={loading} />
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 shrink-0">
              <h2 className="text-lg font-bold text-white">
                {modalType === 'add' ? 'Add Feature' : 'Edit Feature'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Feature Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Fair & Transparent"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Mapped Contest</label>
                <select
                  value={contestId}
                  onChange={(e) => setContestId(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                >
                  <option value="">General / All Contests</option>
                  {contests.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} (ID: {c.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Badge Tag (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. POPULAR"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Icon Name</label>
                  <select
                    required
                    value={iconName}
                    onChange={(e) => setIconName(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                  >
                    <option value="ShieldCheck">ShieldCheck — Fairness / Trust</option>
                    <option value="Gift">Gift — Rewards / Prizes</option>
                    <option value="BookOpen">BookOpen — Learning / Knowledge</option>
                    <option value="Lock">Lock — Security / Privacy</option>
                    <option value="Trophy">Trophy — Achievement / Winner</option>
                    <option value="Zap">Zap — Speed / Performance</option>
                    <option value="Star">Star — Excellence / Rating</option>
                    <option value="Users">Users — Community / Players</option>
                    <option value="Wallet">Wallet — Payments / Money</option>
                    <option value="BarChart2">BarChart2 — Analytics / Stats</option>
                    <option value="Headphones">Headphones — Support / Help</option>
                    <option value="Smartphone">Smartphone — Mobile / App</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Icon Color</label>
                  <select
                    value={colorClass}
                    onChange={(e) => setColorClass(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                  >
                    <option value="text-[#E94B4B]">Red (Default)</option>
                    <option value="text-teal-400">Teal</option>
                    <option value="text-purple-400">Purple</option>
                    <option value="text-amber-400">Gold / Amber</option>
                    <option value="text-green-400">Green</option>
                    <option value="text-blue-400">Blue</option>
                    <option value="text-pink-400">Pink</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Description</label>
                <textarea
                  required
                  placeholder="Enter feature details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActiveFeat"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#E94B4B] focus:ring-0 focus:ring-offset-0 bg-[#0f1117] border-gray-600 cursor-pointer"
                />
                <label htmlFor="isActiveFeat" className="text-xs font-semibold text-gray-300 cursor-pointer">
                  Mark as Active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-600 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer hover:opacity-90"
                  style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
                >
                  {modalType === 'add' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFeatures;
