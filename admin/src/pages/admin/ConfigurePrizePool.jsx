import React, { useState, useEffect } from 'react';
import { Search, RotateCw, Plus, Edit, Trash2, Award, X } from 'lucide-react';
import Table from '../../components/common/Table';
import { contestService } from '../../api/services/contestService';
import toast from 'react-hot-toast';

const ConfigurePrizePool = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [currentPool, setCurrentPool] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [distribution, setDistribution] = useState('');
  const [minParticipants, setMinParticipants] = useState('2');
  const [platformFee, setPlatformFee] = useState('10%');
  const [status, setStatus] = useState('Active');

  const fetchPools = async () => {
    setLoading(true);
    try {
      const res = await contestService.getPrizeTemplates();
      if (res?.success && res.data) {
        setPools(res.data);
      }
    } catch (err) {
      console.error('Error loading prize pools:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
  }, []);

  const handleOpenAddModal = () => {
    setModalType('add');
    setCurrentPool(null);
    setName('');
    setDistribution('Rank 1: 50%, Rank 2: 30%, Rank 3: 20%');
    setMinParticipants('2');
    setPlatformFee('10%');
    setStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pool) => {
    setModalType('edit');
    setCurrentPool(pool);
    setName(pool.name);
    setDistribution(pool.distribution);
    setMinParticipants(pool.minParticipants?.toString() || '2');
    setPlatformFee(pool.platformFee || '10%');
    setStatus(pool.status || 'Active');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (!distribution.trim()) {
      toast.error('Distribution description is required');
      return;
    }

    const payload = {
      name: name.trim(),
      distribution: distribution.trim(),
      minParticipants: parseInt(minParticipants, 10) || 2,
      platformFee: platformFee || '10%',
      status
    };

    try {
      if (modalType === 'add') {
        const res = await contestService.createPrizeTemplate(payload);
        if (res?.success) {
          toast.success('Prize template created successfully');
          fetchPools();
          setIsModalOpen(false);
        }
      } else {
        const res = await contestService.updatePrizeTemplate(currentPool.id, payload);
        if (res?.success) {
          toast.success('Prize template updated successfully');
          fetchPools();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error('Error saving prize template:', err);
      toast.error(err.response?.data?.message || 'Error saving prize template');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this prize template?')) {
      try {
        const res = await contestService.deletePrizeTemplate(id);
        if (res?.success) {
          toast.success('Prize template deleted successfully');
          fetchPools();
        }
      } catch (err) {
        console.error('Error deleting prize template:', err);
        toast.error('Failed to delete prize template');
      }
    }
  };

  const filteredPools = pools.filter((p) => {
    return p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.distribution?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (p.poolCode || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const columns = [
    { 
      key: 'id', 
      label: 'Pool ID', 
      cellClassName: 'font-mono text-[#E94B4B]',
      render: (val, row) => row.poolCode || `POOL${String(val).padStart(3, '0')}`
    },
    { key: 'name', label: 'Template Name', cellClassName: 'font-semibold' },
    { key: 'distribution', label: 'Prize Share Distribution Description', cellClassName: 'text-gray-300 max-w-xs truncate' },
    { key: 'minParticipants', label: 'Min Users Required', headerClassName: 'text-center', cellClassName: 'text-center' },
    { 
      key: 'platformFee', 
      label: 'Admin Service Fee Deducted', 
      cellClassName: 'text-amber-500 font-bold',
      render: (val) => val || '10%'
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
            <Edit size={14} />
          </button>
          <button 
            onClick={() => handleDelete(row.id)}
            className="p-1 text-red-500/70 hover:text-red-500 rounded transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#0f1117] text-white p-5 rounded-2xl shadow-sm border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold">Configure Prize Pools</h1>
          <p className="text-xs text-gray-400 mt-1">Manage winner distribution templates and platforms payout splits.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer hover:opacity-90"
          style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
        >
          <Plus size={16} /> Create Prize Template
        </button>
      </div>

      <div className="bg-[#0f1117] text-white rounded-2xl shadow-sm border border-white/10 overflow-hidden flex flex-col">
        <div className="p-5 flex flex-col sm:flex-row justify-between gap-4 border-b border-white/10">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchPools}
              className="flex items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-800 rounded-lg text-sm transition-all cursor-pointer"
            >
              <RotateCw size={16} /> Refresh
            </button>
          </div>
        </div>

        <Table columns={columns} data={filteredPools} loading={loading} />
      </div>

      {/* Add / Edit Prize Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-md my-8 overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">
                {modalType === 'add' ? 'Create Prize Template' : 'Edit Prize Template'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Template Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Top 3 Split (50-30-20)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Distribution Breakdown Description</label>
                <textarea
                  required
                  placeholder="e.g. 1st: 50%, 2nd: 30%, 3rd: 20%"
                  value={distribution}
                  onChange={(e) => setDistribution(e.target.value)}
                  rows="2"
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Min Participants Required</label>
                <input
                  required
                  type="number"
                  min="2"
                  placeholder="e.g. 5"
                  value={minParticipants}
                  onChange={(e) => setMinParticipants(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Admin Platform Fee Cut</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 10%"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
                  {modalType === 'add' ? 'Create Template' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurePrizePool;
