import React, { useState, useEffect } from 'react';
import { Search, RotateCw, Plus, Edit, Trash2, X } from 'lucide-react';
import Table from '../../components/common/Table';
import ConfirmModal from '../../components/common/ConfirmModal';
import { contestService } from '../../api/services/contestService';
import toast from 'react-hot-toast';

const ConfigureEntryFee = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [currentTier, setCurrentTier] = useState(null);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tierToDelete, setTierToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form states
  const [tierName, setTierName] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [entryCoins, setEntryCoins] = useState('');
  const [platformCut, setPlatformCut] = useState('10%');
  const [status, setStatus] = useState('Active');

  const fetchTiers = async () => {
    setLoading(true);
    try {
      const res = await contestService.getEntryFeeTiers();
      if (res?.success && res.data) {
        setTiers(res.data);
      }
    } catch (err) {
      console.error('Error loading fee tiers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const handleOpenAddModal = () => {
    setModalType('add');
    setCurrentTier(null);
    setTierName('');
    setEntryFee('0');
    setEntryCoins('0');
    setPlatformCut('10%');
    setStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tier) => {
    setModalType('edit');
    setCurrentTier(tier);
    setTierName(tier.tierName);
    setEntryFee(parseFloat(tier.entryFee).toString());
    setEntryCoins((tier.entryCoins || 0).toString());
    setPlatformCut(tier.platformCut || '10%');
    setStatus(tier.status || 'Active');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tierName.trim()) {
      toast.error('Tier name is required');
      return;
    }

    const payload = {
      tierName: tierName.trim(),
      entryFee: parseFloat(entryFee) || 0,
      entryCoins: parseInt(entryCoins, 10) || (parseFloat(entryFee) ? Math.round(parseFloat(entryFee)) : 0),
      platformCut: platformCut || '10%',
      status
    };

    try {
      if (modalType === 'add') {
        const res = await contestService.createEntryFeeTier(payload);
        if (res?.success) {
          toast.success('Fee tier created successfully');
          fetchTiers();
          setIsModalOpen(false);
        }
      } else {
        const res = await contestService.updateEntryFeeTier(currentTier.id, payload);
        if (res?.success) {
          toast.success('Fee tier updated successfully');
          fetchTiers();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error('Error saving fee tier:', err);
      toast.error(err.response?.data?.message || 'Error saving fee tier');
    }
  };

  const handleOpenDeleteModal = (id) => {
    setTierToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!tierToDelete) return;
    setDeleting(true);
    try {
      const res = await contestService.deleteEntryFeeTier(tierToDelete);
      if (res?.success) {
        toast.success('Fee tier deleted successfully');
        fetchTiers();
        setDeleteModalOpen(false);
        setTierToDelete(null);
      }
    } catch (err) {
      console.error('Error deleting fee tier:', err);
      toast.error('Failed to delete fee tier');
    } finally {
      setDeleting(false);
    }
  };

  const filteredTiers = tiers.filter((t) => {
    return t.tierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (t.tierCode || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const columns = [
    { 
      key: 'id', 
      label: 'Tier ID', 
      cellClassName: 'font-mono text-[#E94B4B]',
      render: (val, row) => row.tierCode || `FEE${String(val).padStart(3, '0')}`
    },
    { key: 'tierName', label: 'Tier Name', cellClassName: 'font-semibold' },
    { 
      key: 'entryFee', 
      label: 'Entry Fee Amount', 
      cellClassName: 'text-white font-medium',
      render: (val) => `₹${parseFloat(val || 0)}`
    },
    { 
      key: 'entryCoins', 
      label: 'Coin Conversion Equivalent', 
      cellClassName: 'text-amber-500 font-medium',
      render: (val, row) => `${val || row.entryFee || 0} Coins`
    },
    { 
      key: 'platformCut', 
      label: 'Platform Commission Cut', 
      cellClassName: 'text-gray-300',
      render: (val) => val || '10%'
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          val === 'Active' ? 'bg-green-500/15 text-green-500' : 'bg-gray-500/15 text-gray-400'
        }`}>
          {val || 'Active'}
        </span>
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
            <Edit size={14} />
          </button>
          <button
            onClick={() => handleOpenDeleteModal(row.id)}
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
          <h1 className="text-xl font-bold">Configure Entry Fee</h1>
          <p className="text-xs text-gray-400 mt-1">Configure entry fee tiers, coin equivalents, and platform commission cuts.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all duration-200 ease-out cursor-pointer select-none hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-[#E94B4B]/35 active:translate-y-0 active:scale-[0.97]"
          style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
        >
          <Plus size={16} /> Create Fee Tier
        </button>
      </div>

      <div className="bg-[#0f1117] text-white rounded-2xl shadow-sm border border-white/10 overflow-hidden flex flex-col">
        <div className="p-5 flex flex-col sm:flex-row justify-between gap-4 border-b border-white/10">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tiers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchTiers}
              className="flex items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-800 rounded-lg text-sm transition-all cursor-pointer"
            >
              <RotateCw size={16} /> Refresh
            </button>
          </div>
        </div>

        <Table columns={columns} data={filteredTiers} loading={loading} />
      </div>

      {/* Add / Edit Fee Tier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-md my-8 overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">
                {modalType === 'add' ? 'Create New Fee Tier' : 'Edit Fee Tier'}
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
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Tier Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Platinum Tier"
                  value={tierName}
                  onChange={(e) => setTierName(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Entry Fee (₹)</label>
                <input
                  required
                  type="number"
                  min="0"
                  placeholder="e.g. 50"
                  value={entryFee}
                  onChange={(e) => {
                    setEntryFee(e.target.value);
                    setEntryCoins(e.target.value);
                  }}
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Entry Coins</label>
                <input
                  required
                  type="number"
                  min="0"
                  placeholder="e.g. 50"
                  value={entryCoins}
                  onChange={(e) => setEntryCoins(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Platform Commission Cut</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 10%"
                  value={platformCut}
                  onChange={(e) => setPlatformCut(e.target.value)}
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
                  className="px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all duration-200 ease-out cursor-pointer select-none hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-[#E94B4B]/35 active:translate-y-0 active:scale-[0.97]"
                  style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
                >
                  {modalType === 'add' ? 'Create Tier' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Fee Tier Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
            setTierToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Fee Tier?"
        message={"Are you sure you want to delete this fee tier?\nThis action cannot be undone."}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={deleting}
      />
    </div>
  );
};

export default ConfigureEntryFee;
