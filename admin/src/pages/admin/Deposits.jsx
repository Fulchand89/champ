import React, { useState, useEffect } from 'react';
import { Search, RotateCw, Download, Eye, X, CheckCircle2, Clock, XCircle, Calendar } from 'lucide-react';
import Table from '../../components/common/Table';
import { transactionService } from '../../api/services/transactionService';
import toast from 'react-hot-toast';

const Deposits = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Deposit Details Modal state
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const params = {
        type: 'deposit',
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      if (dateFilter !== 'all') params.dateRange = dateFilter;

      const res = await transactionService.getTransactions(params);
      if (res?.success) {
        // Filter deposit items in case API returns mixed or specific records
        const data = (res.data || []).filter(
          (t) => !t.type || t.type === 'deposit' || t.type === 'coins_pack'
        );
        setDeposits(data);
      } else {
        setDeposits(res?.data || []);
      }
    } catch (err) {
      console.error('Error fetching deposits:', err);
      toast.error('Failed to load deposit records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [statusFilter, dateFilter]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = { type: 'deposit' };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      if (dateFilter !== 'all') params.dateRange = dateFilter;

      await transactionService.exportCsv(params);
      toast.success('Deposits exported successfully');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export deposits');
    } finally {
      setExporting(false);
    }
  };

  const handleViewDetails = (deposit) => {
    setSelectedDeposit(deposit);
    setIsModalOpen(true);
  };

  // Filter client-side by date if backend doesn't filter
  const filteredDeposits = deposits.filter((dep) => {
    if (dateFilter === 'all') return true;
    if (!dep.createdAt) return true;
    const depDate = new Date(dep.createdAt);
    const now = new Date();
    if (dateFilter === 'today') {
      return depDate.toDateString() === now.toDateString();
    }
    if (dateFilter === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return depDate >= oneWeekAgo;
    }
    if (dateFilter === 'month') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return depDate >= oneMonthAgo;
    }
    return true;
  });

  const columns = [
    {
      key: 'depositId',
      label: 'Deposit ID',
      cellClassName: 'font-mono text-[#E94B4B] font-bold text-xs',
      render: (val, row) => (
        <span
          onClick={() => handleViewDetails(row)}
          className="cursor-pointer hover:underline"
          title="Click to view details"
        >
          {val || row.txnId ? `DEP${String(row.id || '').padStart(4, '0')}` : `DEP${row.id}`}
        </span>
      ),
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
            <span className="text-white text-xs">{user?.name || 'User'}</span>
            <span className="text-[10px] text-gray-400">
              {user?.email || user?.mobile || (row.userId ? `ID: ${row.userId}` : '—')}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      cellClassName: 'text-white font-black text-sm',
      render: (val) => (
        <span className="text-green-400 font-bold">
          +₹{parseFloat(val || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      cellClassName: 'text-gray-300 text-xs',
      render: (val) => (
        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[11px]">
          {val || 'UPI / Online'}
        </span>
      ),
    },
    {
      key: 'txnId',
      label: 'Transaction ID',
      cellClassName: 'font-mono text-gray-300 text-xs',
      render: (val, row) => val || row.gatewayTxnId || `TXN${row.id || '—'}`,
    },
    {
      key: 'createdAt',
      label: 'Date',
      cellClassName: 'text-gray-400 text-xs',
      render: (val) => (val ? new Date(val).toLocaleString() : '—'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const s = (val || 'pending').toLowerCase();
        const styles =
          s === 'successful' || s === 'completed' || s === 'success'
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
      label: 'Details',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (_, row) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          title="View Details"
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
          <h1 className="text-xl font-bold">Deposits</h1>
          <p className="text-xs text-gray-400 mt-1">
            Track and monitor wallet deposits and payment gateway receipts in real-time.
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
              placeholder="Search by Deposit ID, User, Txn ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchDeposits()}
              className="pl-9 pr-4 py-2 w-full border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
            </select>

            {/* Date filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>

            <button
              onClick={fetchDeposits}
              className="flex items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-800 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <RotateCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <Table columns={columns} data={filteredDeposits} loading={loading} />
      </div>

      {/* Deposit Details Modal */}
      {isModalOpen && selectedDeposit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
              <h2 className="text-base font-bold text-white">Deposit Details</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">Deposit ID</span>
                <span className="font-mono text-[#E94B4B] font-bold">
                  DEP{String(selectedDeposit.id || '').padStart(4, '0')}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">User Name</span>
                <span className="font-semibold text-white">
                  {selectedDeposit.user?.name || 'User'}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">User Email / ID</span>
                <span className="text-gray-300 font-mono">
                  {selectedDeposit.user?.email || selectedDeposit.userId || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">Deposit Amount</span>
                <span className="font-black text-base text-green-400">
                  ₹{parseFloat(selectedDeposit.amount || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">Payment Method</span>
                <span className="text-gray-200">{selectedDeposit.paymentMethod || 'UPI'}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">Transaction ID</span>
                <span className="font-mono text-gray-200">{selectedDeposit.txnId || `TXN${selectedDeposit.id}`}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">Status</span>
                <span
                  className={`font-bold capitalize ${
                    selectedDeposit.status === 'successful' || selectedDeposit.status === 'completed'
                      ? 'text-green-400'
                      : selectedDeposit.status === 'pending'
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}
                >
                  {selectedDeposit.status || 'Successful'}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">Deposit Date</span>
                <span className="text-gray-300">
                  {selectedDeposit.createdAt ? new Date(selectedDeposit.createdAt).toLocaleString() : '—'}
                </span>
              </div>

              {selectedDeposit.description && (
                <div className="pt-2">
                  <span className="text-gray-400 block mb-1">Description:</span>
                  <p className="p-2.5 bg-white/5 rounded-lg text-gray-300 border border-white/5">
                    {selectedDeposit.description}
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

export default Deposits;
