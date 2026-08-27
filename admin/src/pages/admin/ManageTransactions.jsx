import React, { useState, useEffect } from 'react';
import { Search, Filter, RotateCw, Download, Eye, X, CheckCircle2, Clock, XCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import Table from '../../components/common/Table';
import { transactionService } from '../../api/services/transactionService';
import toast from 'react-hot-toast';

const ManageTransactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Details Modal
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await transactionService.getTransactions(params);
      if (res?.success) {
        setTransactions(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, statusFilter]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      await transactionService.exportCsv(params);
      toast.success('Transactions exported successfully');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export transactions');
    } finally {
      setExporting(false);
    }
  };

  const handleViewDetails = (txn) => {
    setSelectedTxn(txn);
    setIsModalOpen(true);
  };

  const columns = [
    {
      key: 'txnId',
      label: 'TXN ID',
      cellClassName: 'font-mono text-[#E94B4B] font-bold text-xs',
      render: (val, row) => (
        <span
          onClick={() => handleViewDetails(row)}
          className="cursor-pointer hover:underline"
          title="Click to view details"
        >
          {val || `TXN${row.id}`}
        </span>
      ),
    },
    {
      key: 'user',
      label: 'User',
      cellClassName: 'font-semibold text-xs text-white',
      render: (user, row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-gray-300">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex flex-col">
            <span className="text-white text-xs">{user?.name || 'Platform / Guest'}</span>
            <span className="text-[10px] text-gray-400">{user?.email || row.userId ? `User #${row.userId}` : 'System'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (val) => {
        const t = (val || 'deposit').toLowerCase();
        const config = {
          entry_fee: { label: 'Entry Fee', class: 'bg-blue-500/15 text-blue-400' },
          coins_pack: { label: 'Coins Pack', class: 'bg-amber-500/15 text-amber-400' },
          deposit: { label: 'Deposit', class: 'bg-green-500/15 text-green-400' },
          withdrawal: { label: 'Withdrawal', class: 'bg-purple-500/15 text-purple-400' },
          prize_payout: { label: 'Prize Payout', class: 'bg-red-500/15 text-red-400' },
          refund: { label: 'Refund', class: 'bg-gray-500/15 text-gray-400' },
        };
        const c = config[t] || { label: val, class: 'bg-gray-500/15 text-gray-300' };
        return (
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${c.class}`}>
            {c.label}
          </span>
        );
      },
    },
    {
      key: 'amount',
      label: 'Amount',
      cellClassName: 'text-white font-black text-sm',
      render: (val, row) => (
        <span className={row.type === 'withdrawal' || row.type === 'refund' ? 'text-red-400' : 'text-green-400'}>
          {row.type === 'withdrawal' || row.type === 'refund' ? '-' : '+'}₹{parseFloat(val || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      cellClassName: 'text-gray-300 text-xs',
      render: (val) => val || 'UPI',
    },
    {
      key: 'createdAt',
      label: 'Date & Time',
      cellClassName: 'text-gray-400 text-xs',
      render: (val) => (val ? new Date(val).toLocaleString() : '—'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const s = (val || 'pending').toLowerCase();
        const styles =
          s === 'successful'
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
      label: 'View',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (_, row) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          title="View Transaction Details"
        >
          <Eye size={15} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0f1117] text-white p-5 rounded-2xl shadow-sm border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold">Manage Transactions</h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time ledger of deposit transactions, entry fee receipts, and platform prize payouts.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
        >
          <Download size={15} /> {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#0f1117] text-white rounded-2xl shadow-sm border border-white/10 overflow-hidden flex flex-col">
        {/* Filters Bar */}
        <div className="p-5 flex flex-col lg:flex-row justify-between gap-4 border-b border-white/10">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Txn ID, User, Description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTransactions()}
              className="pl-9 pr-4 py-2 w-full border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="entry_fee">Entry Fee</option>
              <option value="coins_pack">Coins Pack</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="prize_payout">Prize Payout</option>
              <option value="refund">Refund</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="successful">Successful</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <button
              onClick={fetchTransactions}
              className="flex items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-800 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <RotateCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <Table columns={columns} data={transactions} loading={loading} />
      </div>

      {/* Transaction Details Modal */}
      {isModalOpen && selectedTxn && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
              <h2 className="text-base font-bold text-white">Transaction Details</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">Transaction ID</span>
                <span className="font-mono text-[#E94B4B] font-bold">{selectedTxn.txnId}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">User</span>
                <span className="font-semibold text-white">
                  {selectedTxn.user?.name || 'Guest / Platform User'}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">Transaction Type</span>
                <span className="font-semibold uppercase tracking-wider text-amber-400">
                  {selectedTxn.type}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">Amount</span>
                <span className="font-black text-base text-white">
                  ₹{parseFloat(selectedTxn.amount || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">Payment Method</span>
                <span className="text-gray-200">{selectedTxn.paymentMethod}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">Gateway</span>
                <span className="text-gray-200">{selectedTxn.paymentGateway || 'Razorpay'}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">Status</span>
                <span
                  className={`font-bold capitalize ${
                    selectedTxn.status === 'successful'
                      ? 'text-green-400'
                      : selectedTxn.status === 'pending'
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}
                >
                  {selectedTxn.status}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">Timestamp</span>
                <span className="text-gray-300">
                  {selectedTxn.createdAt ? new Date(selectedTxn.createdAt).toLocaleString() : '—'}
                </span>
              </div>

              {selectedTxn.description && (
                <div className="pt-2">
                  <span className="text-gray-400 block mb-1">Description / Notes:</span>
                  <p className="p-2.5 bg-white/5 rounded-lg text-gray-300 border border-white/5">
                    {selectedTxn.description}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTransactions;
