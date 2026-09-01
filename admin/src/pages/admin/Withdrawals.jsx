import React, { useState, useEffect } from 'react';
import { Search, RotateCw, Check, X, Eye, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import Table from '../../components/common/Table';
import { withdrawalService } from '../../api/services/withdrawalService';
import toast from 'react-hot-toast';

const Withdrawals = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verification Action Modal state
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: 'approve', // 'approve' | 'reject' | 'view'
    withdrawal: null,
    remarks: '',
    submitting: false,
  });

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await withdrawalService.getWithdrawals(params);
      if (res?.success) {
        setWithdrawals(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching withdrawals:', err);
      toast.error('Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [statusFilter]);

  const handleOpenAction = (withdrawal, type) => {
    setActionModal({
      isOpen: true,
      type,
      withdrawal,
      remarks:
        type === 'approve'
          ? 'Approved and processed via payout gateway'
          : type === 'reject'
          ? 'Invalid account details / KYC verification pending'
          : '',
      submitting: false,
    });
  };

  const handleConfirmVerification = async () => {
    const { withdrawal, type, remarks } = actionModal;
    if (!withdrawal) return;

    setActionModal((prev) => ({ ...prev, submitting: true }));
    try {
      const status = type === 'approve' ? 'approved' : 'rejected';
      const res = await withdrawalService.verifyWithdrawal(withdrawal.id, {
        status,
        adminRemarks: remarks.trim(),
      });

      if (res?.success) {
        toast.success(
          type === 'approve'
            ? `Withdrawal #${withdrawal.withdrawalId || withdrawal.id} Approved!`
            : `Withdrawal #${withdrawal.withdrawalId || withdrawal.id} Rejected.`
        );
        fetchWithdrawals();
        setActionModal({ isOpen: false, type: 'approve', withdrawal: null, remarks: '', submitting: false });
      }
    } catch (err) {
      console.error('Verification error:', err);
      const msg = err.response?.data?.message || 'Failed to update withdrawal status';
      toast.error(msg);
      setActionModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const columns = [
    {
      key: 'withdrawalId',
      label: 'Withdrawal ID',
      cellClassName: 'font-mono text-[#E94B4B] font-bold text-xs',
      render: (val, row) => val || `WTH${String(row.id).padStart(4, '0')}`,
    },
    {
      key: 'user',
      label: 'User Name',
      cellClassName: 'font-semibold text-xs text-white',
      render: (user, row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-gray-300">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex flex-col">
            <span className="text-white text-xs">{user?.name || 'Unknown User'}</span>
            <span className="text-[10px] text-gray-400">{user?.email || user?.mobile || `ID: ${row.userId}`}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Requested Amount',
      cellClassName: 'text-white font-black text-sm',
      render: (val) => `₹${parseFloat(val || 0).toLocaleString()}`,
    },
    {
      key: 'payoutDetails',
      label: 'Destination Account / UPI',
      cellClassName: 'text-gray-300 font-mono text-xs max-w-[220px] truncate',
      render: (val, row) => (
        <span title={val} className="text-amber-400 font-medium">
          {val || (row.payoutMethod === 'upi' ? 'UPI Payout' : 'Bank Transfer')}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Request Date',
      cellClassName: 'text-gray-400 text-xs',
      render: (val) => (val ? new Date(val).toLocaleString() : '—'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const s = (val || 'pending').toLowerCase();
        const styles =
          s === 'approved' || s === 'completed'
            ? 'bg-green-500/15 text-green-400 border-green-500/20'
            : s === 'pending'
            ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
            : 'bg-red-500/15 text-red-400 border-red-500/20';

        return (
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${styles} capitalize`}>
            {s}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (_, row) => {
        const isPending = (row.status || '').toLowerCase() === 'pending';
        return isPending ? (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleOpenAction(row, 'approve')}
              className="flex items-center gap-1 px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow"
              title="Approve & Payout"
            >
              <Check size={13} /> Approve
            </button>
            <button
              onClick={() => handleOpenAction(row, 'reject')}
              className="flex items-center gap-1 px-2.5 py-1 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow hover:opacity-90"
              style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
              title="Decline / Reject"
            >
              <X size={13} /> Reject
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleOpenAction(row, 'view')}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-gray-300 rounded-lg text-xs font-medium cursor-pointer transition"
          >
            Details
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0f1117] text-white p-5 rounded-2xl shadow-sm border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold">Withdrawals</h1>
          <p className="text-xs text-gray-400 mt-1">
            Review, verify, approve, or decline user prize withdrawal and payout requests.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#0f1117] text-white rounded-2xl shadow-sm border border-white/10 overflow-hidden flex flex-col">
        {/* Filters Bar */}
        <div className="p-5 flex flex-col sm:flex-row justify-between gap-4 border-b border-white/10">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Withdrawal ID, User, or Account/UPI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchWithdrawals()}
              className="pl-9 pr-4 py-2 w-full border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] cursor-pointer"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <button
              onClick={fetchWithdrawals}
              className="flex items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-800 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <RotateCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <Table columns={columns} data={withdrawals} loading={loading} />
      </div>

      {/* Approve / Reject / View Modal */}
      {actionModal.isOpen && actionModal.withdrawal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
              <h2 className="text-base font-bold text-white">
                {actionModal.type === 'approve'
                  ? 'Approve Withdrawal Payout'
                  : actionModal.type === 'reject'
                  ? 'Reject Withdrawal Request'
                  : 'Withdrawal Audit Record'}
              </h2>
              <button
                onClick={() => setActionModal({ ...actionModal, isOpen: false })}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Withdrawal ID:</span>
                  <span className="font-mono text-[#E94B4B] font-bold">
                    {actionModal.withdrawal.withdrawalId || `WTH${actionModal.withdrawal.id}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">User:</span>
                  <span className="text-white font-semibold">
                    {actionModal.withdrawal.user?.name || 'User'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-green-400 font-bold text-sm">
                    ₹{parseFloat(actionModal.withdrawal.amount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Destination:</span>
                  <span className="text-amber-400 font-medium truncate max-w-[200px]">
                    {actionModal.withdrawal.payoutDetails || 'Bank / UPI Transfer'}
                  </span>
                </div>
              </div>

              {actionModal.type !== 'view' ? (
                <div>
                  <label className="block text-gray-300 font-bold mb-1.5">
                    {actionModal.type === 'approve'
                      ? 'Admin Approval Remarks (Optional)'
                      : 'Rejection Reason *'}
                  </label>
                  <textarea
                    rows="3"
                    value={actionModal.remarks}
                    onChange={(e) =>
                      setActionModal({ ...actionModal, remarks: e.target.value })
                    }
                    placeholder={
                      actionModal.type === 'approve'
                        ? 'e.g. Transaction processed via payout gateway'
                        : 'e.g. Invalid account details / KYC failed'
                    }
                    className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">Status:</span>
                    <span className="font-bold capitalize text-white">
                      {actionModal.withdrawal.status}
                    </span>
                  </div>
                  {actionModal.withdrawal.adminRemarks && (
                    <div className="py-1">
                      <span className="text-gray-400 block mb-1">Remarks:</span>
                      <p className="p-2.5 bg-white/5 rounded-lg text-gray-300">
                        {actionModal.withdrawal.adminRemarks}
                      </p>
                    </div>
                  )}
                  {actionModal.withdrawal.verifiedAt && (
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">Verified At:</span>
                      <span className="text-gray-300">
                        {new Date(actionModal.withdrawal.verifiedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActionModal({ ...actionModal, isOpen: false })}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {actionModal.type === 'view' ? 'Close' : 'Cancel'}
              </button>

              {actionModal.type === 'approve' && (
                <button
                  type="button"
                  disabled={actionModal.submitting}
                  onClick={handleConfirmVerification}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {actionModal.submitting ? 'Processing...' : 'Confirm Approval'}
                </button>
              )}

              {actionModal.type === 'reject' && (
                <button
                  type="button"
                  disabled={actionModal.submitting}
                  onClick={handleConfirmVerification}
                  className="px-5 py-2 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                  style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
                >
                  {actionModal.submitting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Withdrawals;
