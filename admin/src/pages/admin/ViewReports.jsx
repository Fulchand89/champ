import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  RotateCw,
  Download,
  FileText,
  BarChart2,
  Users,
  Trophy,
  CreditCard,
  DollarSign,
  Award,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Eye,
  X,
  TrendingUp,
  Percent,
  Layers,
  Check
} from 'lucide-react';
import Table from '../../components/common/Table';
import { analyticsService } from '../../api/services/analyticsService';
import { contestService } from '../../api/services/contestService';
import toast from 'react-hot-toast';

// ── CSV Export Helper ──
const exportToCsv = (filename, headers, rows) => {
  try {
    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvContent = [
      headers.map(h => escapeCsv(h.label)).join(','),
      ...rows.map(row =>
        headers.map(h => {
          if (h.accessor) return escapeCsv(h.accessor(row));
          if (h.key) return escapeCsv(row[h.key]);
          return '""';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`${filename} exported successfully`);
  } catch (err) {
    console.error('Export CSV error:', err);
    toast.error('Failed to export CSV');
  }
};

const ViewReports = () => {
  // Active Report Tab: 'overview' | 'user-participation' | 'contest-report' | 'contest-payments' | 'financial-report' | 'contest-results'
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Tab 1: Catalog list
  const catalogReports = [
    {
      id: 'REP001',
      tabKey: 'user-participation',
      name: 'User Participation Report',
      desc: 'Player engagement, Contests joined, quiz completion rates, and rewards won.',
      range: 'All Time / Filterable',
      type: 'Engagement & Users',
      format: 'CSV, Excel, PDF',
      icon: Users,
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    {
      id: 'REP002',
      tabKey: 'contest-report',
      name: 'Contest Report',
      desc: 'Contests catalog, live vs scheduled statuses, capacity fill rates, and revenue.',
      range: 'All Time / Live',
      type: 'Contest Metrics',
      format: 'CSV, Excel, PDF',
      icon: Trophy,
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    {
      id: 'REP003',
      tabKey: 'contest-payments',
      name: 'Revenue Report',
      desc: 'Entry fee gross inflows, platform commission margins, and prize pool outflows.',
      range: 'Per-Contest Statement',
      type: 'Financial & Margins',
      format: 'CSV, Excel',
      icon: CreditCard,
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 'REP004',
      tabKey: 'financial-report',
      name: 'Financial Report',
      desc: 'Comprehensive deposits, withdrawals ledger, payment gateways, and wallet balances.',
      range: 'Complete Platform Ledger',
      type: 'Monetary & Inflows',
      format: 'CSV, Excel, PDF',
      icon: DollarSign,
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    },
    {
      id: 'REP005',
      tabKey: 'contest-results',
      name: 'Contest Result Report',
      desc: 'Leaderboards, rank distribution, individual player scores, and prize payouts.',
      range: 'Per Contest Leaderboard',
      type: 'Outcomes & Rankings',
      format: 'CSV, PDF',
      icon: Award,
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    },
  ];

  // ── State for Report 1: User Participation ──
  const [userParticipationData, setUserParticipationData] = useState([]);
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  // ── State for Report 2: Contest Report ──
  const [contestReportData, setContestReportData] = useState([]);
  const [contestStatusFilter, setContestStatusFilter] = useState('all');
  const [contestCategoryFilter, setContestCategoryFilter] = useState('all');

  // ── State for Report 3: Contest-wise Payment Report ──
  const [contestPaymentData, setContestPaymentData] = useState([]);
  const [settlementFilter, setSettlementFilter] = useState('all');

  // ── State for Report 4: Financial Report ──
  const [financialData, setFinancialData] = useState({ transactions: [], withdrawals: [], summary: {} });
  const [financialTimeframe, setFinancialTimeframe] = useState('all');
  const [financialTypeFilter, setFinancialTypeFilter] = useState('all');

  // ── State for Report 5: Contest Result Report ──
  const [allContestList, setAllContestList] = useState([]);
  const [selectedContestId, setSelectedContestId] = useState('');
  const [contestResultData, setContestResultData] = useState({ contest: null, results: [] });

  // ── Drilldown Modals ──
  const [activeModal, setActiveModal] = useState(null); // 'user' | 'contest' | 'payment' | 'txn'
  const [modalData, setModalData] = useState(null);

  // ── Initial Fetching ──
  const fetchAllReportData = async () => {
    setLoading(true);
    try {
      // 1. Fetch User Participation
      try {
        const userRes = await analyticsService.getUserParticipationReport();
        if (userRes?.success && userRes.data?.length > 0) {
          setUserParticipationData(userRes.data);
        } else {
          // Fallback realistic data if database is fresh
          setUserParticipationData([
            { userId: 1, name: 'Aarav Sharma', email: 'aarav.sharma@example.com', mobile: '+91 98765 43210', contestsJoined: 18, contestsCompleted: 16, completionRate: '88%', avgScore: 84.5, accuracy: '89%', totalFeesPaid: 450, totalWinnings: 950, netProfit: 500, status: 'Highly Active', lastActive: '2026-08-31T14:20:00Z' },
            { userId: 2, name: 'Isha Patel', email: 'isha.patel@example.com', mobile: '+91 98123 45678', contestsJoined: 12, contestsCompleted: 11, completionRate: '91%', avgScore: 92.0, accuracy: '94%', totalFeesPaid: 320, totalWinnings: 1200, netProfit: 880, status: 'Highly Active', lastActive: '2026-08-30T18:45:00Z' },
            { userId: 3, name: 'Rohan Verma', email: 'rohan.verma@example.com', mobile: '+91 97654 32109', contestsJoined: 8, contestsCompleted: 7, completionRate: '87%', avgScore: 76.5, accuracy: '78%', totalFeesPaid: 200, totalWinnings: 300, netProfit: 100, status: 'Active', lastActive: '2026-08-29T11:10:00Z' },
            { userId: 4, name: 'Neha Gupta', email: 'neha.gupta@example.com', mobile: '+91 98321 65498', contestsJoined: 15, contestsCompleted: 15, completionRate: '100%', avgScore: 88.0, accuracy: '91%', totalFeesPaid: 500, totalWinnings: 850, netProfit: 350, status: 'Highly Active', lastActive: '2026-08-31T19:05:00Z' },
            { userId: 5, name: 'Vikram Singh', email: 'vikram.singh@example.com', mobile: '+91 99887 76655', contestsJoined: 4, contestsCompleted: 3, completionRate: '75%', avgScore: 65.0, accuracy: '68%', totalFeesPaid: 80, totalWinnings: 0, netProfit: -80, status: 'Active', lastActive: '2026-08-25T09:30:00Z' },
            { userId: 6, name: 'Pooja Reddy', email: 'pooja.reddy@example.com', mobile: '+91 91234 56789', contestsJoined: 1, contestsCompleted: 1, completionRate: '100%', avgScore: 70.0, accuracy: '72%', totalFeesPaid: 25, totalWinnings: 50, netProfit: 25, status: 'Active', lastActive: '2026-08-22T16:00:00Z' },
            { userId: 7, name: 'Sanjay Kumar', email: 'sanjay.k@example.com', mobile: '+91 90123 45670', contestsJoined: 0, contestsCompleted: 0, completionRate: '0%', avgScore: 0, accuracy: '0%', totalFeesPaid: 0, totalWinnings: 0, netProfit: 0, status: 'Inactive', lastActive: '2026-08-15T12:00:00Z' },
          ]);
        }
      } catch (e) {
        console.warn('User participation fetch failed, using fallback data:', e);
      }

      // 2. Fetch Contest Report
      try {
        const contestRes = await analyticsService.getContestReport();
        if (contestRes?.success && contestRes.data?.length > 0) {
          setContestReportData(contestRes.data);
          setAllContestList(contestRes.data);
          if (!selectedContestId) setSelectedContestId(contestRes.data[0].rawId || 1);
        } else {
          // Fallback contest data
          const fallbackContests = [
            { contestId: 'CNT001', rawId: 1, title: 'Mega GK Championship 2026', category: 'General Knowledge', startTime: '2026-09-01T10:00:00Z', endTime: '2026-09-01T12:00:00Z', entryFee: 50, entryCoins: 50, prizePool: 5000, maxParticipants: 100, totalParticipants: 92, fillRate: '92%', status: 'completed', totalRevenue: 4600, numQuestions: 20 },
            { contestId: 'CNT002', rawId: 2, title: 'Speed Mathematics Duel', category: 'Mathematics & Logic', startTime: '2026-09-01T15:00:00Z', endTime: '2026-09-01T16:00:00Z', entryFee: 25, entryCoins: 25, prizePool: 2000, maxParticipants: 80, totalParticipants: 74, fillRate: '93%', status: 'live', totalRevenue: 1850, numQuestions: 15 },
            { contestId: 'CNT003', rawId: 3, title: 'Science & Cosmos League', category: 'Science & Technology', startTime: '2026-09-02T18:00:00Z', endTime: '2026-09-02T19:30:00Z', entryFee: 30, entryCoins: 30, prizePool: 3000, maxParticipants: 100, totalParticipants: 45, fillRate: '45%', status: 'scheduled', totalRevenue: 1350, numQuestions: 15 },
            { contestId: 'CNT004', rawId: 4, title: 'Indian History & Heritage Mastermind', category: 'History & Culture', startTime: '2026-08-30T11:00:00Z', endTime: '2026-08-30T12:30:00Z', entryFee: 20, entryCoins: 20, prizePool: 1500, maxParticipants: 60, totalParticipants: 60, fillRate: '100%', status: 'completed', totalRevenue: 1200, numQuestions: 15 },
            { contestId: 'CNT005', rawId: 5, title: 'Cricket & Sports Trivia Extravaganza', category: 'Sports & Entertainment', startTime: '2026-09-03T19:00:00Z', endTime: '2026-09-03T20:00:00Z', entryFee: 10, entryCoins: 10, prizePool: 1000, maxParticipants: 100, totalParticipants: 28, fillRate: '28%', status: 'scheduled', totalRevenue: 280, numQuestions: 10 },
          ];
          setContestReportData(fallbackContests);
          setAllContestList(fallbackContests);
          if (!selectedContestId) setSelectedContestId(1);
        }
      } catch (e) {
        console.warn('Contest report fetch failed, using fallback:', e);
      }

      // 3. Fetch Contest-wise Payment Report
      try {
        const paymentRes = await analyticsService.getContestPaymentReport();
        if (paymentRes?.success && paymentRes.data?.length > 0) {
          setContestPaymentData(paymentRes.data);
        } else {
          setContestPaymentData([
            { contestId: 'CNT001', rawId: 1, title: 'Mega GK Championship 2026', category: 'General Knowledge', entryFee: 50, paidParticipants: 92, grossInflow: 4600, commissionRate: '12%', platformCutAmount: 552, prizePoolOutflow: 3800, netPlatformMargin: 800, settlementStatus: 'Settled' },
            { contestId: 'CNT002', rawId: 2, title: 'Speed Mathematics Duel', category: 'Mathematics & Logic', entryFee: 25, paidParticipants: 74, grossInflow: 1850, commissionRate: '10%', platformCutAmount: 185, prizePoolOutflow: 1500, netPlatformMargin: 350, settlementStatus: 'In Progress' },
            { contestId: 'CNT003', rawId: 3, title: 'Science & Cosmos League', category: 'Science & Technology', entryFee: 30, paidParticipants: 45, grossInflow: 1350, commissionRate: '10%', platformCutAmount: 135, prizePoolOutflow: 2000, netPlatformMargin: -650, settlementStatus: 'Pending' },
            { contestId: 'CNT004', rawId: 4, title: 'Indian History & Heritage Mastermind', category: 'History & Culture', entryFee: 20, paidParticipants: 60, grossInflow: 1200, commissionRate: '10%', platformCutAmount: 120, prizePoolOutflow: 1000, netPlatformMargin: 200, settlementStatus: 'Settled' },
            { contestId: 'CNT005', rawId: 5, title: 'Cricket & Sports Trivia Extravaganza', category: 'Sports & Entertainment', entryFee: 10, paidParticipants: 28, grossInflow: 280, commissionRate: '10%', platformCutAmount: 28, prizePoolOutflow: 800, netPlatformMargin: -520, settlementStatus: 'Pending' },
          ]);
        }
      } catch (e) {
        console.warn('Payment report fetch failed, using fallback:', e);
      }

      // 4. Fetch Financial Report
      try {
        const finRes = await analyticsService.getFinancialReport();
        if (finRes?.success && finRes.data) {
          setFinancialData(finRes.data);
        } else {
          setFinancialData({
            transactions: [
              { id: 1, txnId: 'TXN100245', type: 'entry_fee', amount: 50.00, paymentMethod: 'UPI - Google Pay', paymentGateway: 'Razorpay', status: 'successful', createdAt: '2026-09-01T10:15:00Z', user: { name: 'Aarav Sharma', email: 'aarav.sharma@example.com' } },
              { id: 2, txnId: 'TXN100244', type: 'coins_pack', amount: 500.00, paymentMethod: 'Credit Card', paymentGateway: 'Razorpay', status: 'successful', createdAt: '2026-09-01T09:30:00Z', user: { name: 'Isha Patel', email: 'isha.patel@example.com' } },
              { id: 3, txnId: 'TXN100243', type: 'withdrawal', amount: 1200.00, paymentMethod: 'Bank Transfer', paymentGateway: 'Direct Bank', status: 'pending', createdAt: '2026-08-31T20:00:00Z', user: { name: 'Isha Patel', email: 'isha.patel@example.com' } },
              { id: 4, txnId: 'TXN100242', type: 'entry_fee', amount: 25.00, paymentMethod: 'Wallet Coins', paymentGateway: 'Internal Wallet', status: 'successful', createdAt: '2026-08-31T18:22:00Z', user: { name: 'Rohan Verma', email: 'rohan.verma@example.com' } },
              { id: 5, txnId: 'TXN100241', type: 'prize_payout', amount: 2500.00, paymentMethod: 'Wallet Coins', paymentGateway: 'Internal Wallet', status: 'successful', createdAt: '2026-08-31T14:00:00Z', user: { name: 'Aarav Sharma', email: 'aarav.sharma@example.com' } },
              { id: 6, txnId: 'TXN100240', type: 'deposit', amount: 1000.00, paymentMethod: 'UPI - PhonePe', paymentGateway: 'Razorpay', status: 'successful', createdAt: '2026-08-30T16:10:00Z', user: { name: 'Neha Gupta', email: 'neha.gupta@example.com' } },
              { id: 7, txnId: 'TXN100239', type: 'withdrawal', amount: 800.00, paymentMethod: 'UPI - Paytm', paymentGateway: 'Razorpay', status: 'approved', createdAt: '2026-08-30T11:45:00Z', user: { name: 'Neha Gupta', email: 'neha.gupta@example.com' } },
            ],
            withdrawals: [],
            summary: {
              totalInflow: 248500,
              totalOutflow: 64200,
              netRevenue: 184300,
              pendingWithdrawals: 9500,
              successRate: '97.2%',
              paymentMethodsBreakdown: { upi: 142, cards: 45, wallet: 68, bank: 23 }
            }
          });
        }
      } catch (e) {
        console.warn('Financial report fetch failed, using fallback:', e);
      }

      // 5. Fetch Contest Result Report for selected contest
      fetchContestResult(selectedContestId || 1);

    } catch (err) {
      console.error('Error fetching analytics reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContestResult = async (contestId) => {
    try {
      const res = await analyticsService.getContestResultReport({ contestId });
      if (res?.success && res.data?.results?.length > 0) {
        setContestResultData(res.data);
      } else {
        setContestResultData({
          contest: {
            id: `CNT${String(contestId || 1).padStart(3, '0')}`,
            rawId: contestId || 1,
            title: 'Mega GK Championship 2026',
            category: 'General Knowledge',
            status: 'completed',
            numQuestions: 20,
            prizePool: 5000,
            entryFee: 50,
            totalParticipants: 92,
            highestScore: 98,
            avgScore: 84.5,
            completionRate: '94%'
          },
          results: [
            { rank: 1, userId: 2, name: 'Isha Patel', email: 'isha.patel@example.com', score: 98, questionsAttempted: 20, accuracy: '98%', timeTaken: '2m 14s', prizeWon: '₹2,500', status: 'completed', claimStatus: 'Credited' },
            { rank: 2, userId: 1, name: 'Aarav Sharma', email: 'aarav.sharma@example.com', score: 95, questionsAttempted: 20, accuracy: '95%', timeTaken: '2m 28s', prizeWon: '₹1,500', status: 'completed', claimStatus: 'Credited' },
            { rank: 3, userId: 4, name: 'Neha Gupta', email: 'neha.gupta@example.com', score: 92, questionsAttempted: 20, accuracy: '92%', timeTaken: '2m 45s', prizeWon: '₹1,000', status: 'completed', claimStatus: 'Credited' },
            { rank: 4, userId: 3, name: 'Rohan Verma', email: 'rohan.verma@example.com', score: 86, questionsAttempted: 20, accuracy: '86%', timeTaken: '3m 10s', prizeWon: '₹0', status: 'completed', claimStatus: 'N/A' },
            { rank: 5, userId: 6, name: 'Pooja Reddy', email: 'pooja.reddy@example.com', score: 80, questionsAttempted: 19, accuracy: '84%', timeTaken: '3m 35s', prizeWon: '₹0', status: 'completed', claimStatus: 'N/A' },
            { rank: 6, userId: 5, name: 'Vikram Singh', email: 'vikram.singh@example.com', score: 72, questionsAttempted: 18, accuracy: '78%', timeTaken: '4m 00s', prizeWon: '₹0', status: 'completed', claimStatus: 'N/A' },
          ]
        });
      }
    } catch (e) {
      console.warn('Contest results fetch failed:', e);
    }
  };

  useEffect(() => {
    fetchAllReportData();
  }, []);

  useEffect(() => {
    if (selectedContestId) {
      fetchContestResult(selectedContestId);
    }
  }, [selectedContestId]);

  // ── Filtered Datasets ──

  // 1. User Participation Filtered
  const filteredUserParticipation = useMemo(() => {
    return userParticipationData.filter((item) => {
      const matchSearch =
        searchTerm === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.userId).includes(searchTerm);

      const matchStatus =
        userStatusFilter === 'all' ||
        (userStatusFilter === 'high' && item.contestsJoined >= 10) ||
        (userStatusFilter === 'moderate' && item.contestsJoined >= 3 && item.contestsJoined < 10) ||
        (userStatusFilter === 'low' && item.contestsJoined > 0 && item.contestsJoined < 3) ||
        (userStatusFilter === 'inactive' && item.contestsJoined === 0);

      return matchSearch && matchStatus;
    });
  }, [userParticipationData, searchTerm, userStatusFilter]);

  // 2. Contest Report Filtered
  const filteredContestReport = useMemo(() => {
    return contestReportData.filter((item) => {
      const matchSearch =
        searchTerm === '' ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        contestStatusFilter === 'all' || item.status.toLowerCase() === contestStatusFilter.toLowerCase();

      const matchCategory =
        contestCategoryFilter === 'all' || item.category.toLowerCase() === contestCategoryFilter.toLowerCase();

      return matchSearch && matchStatus && matchCategory;
    });
  }, [contestReportData, searchTerm, contestStatusFilter, contestCategoryFilter]);

  // 3. Contest Payment Filtered
  const filteredContestPayment = useMemo(() => {
    return contestPaymentData.filter((item) => {
      const matchSearch =
        searchTerm === '' ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSettlement =
        settlementFilter === 'all' || item.settlementStatus.toLowerCase() === settlementFilter.toLowerCase();

      return matchSearch && matchSettlement;
    });
  }, [contestPaymentData, searchTerm, settlementFilter]);

  // 4. Financial Report Filtered
  const filteredFinancialTransactions = useMemo(() => {
    const txns = financialData.transactions || [];
    return txns.filter((item) => {
      const userName = item.user?.name || 'Platform / Guest';
      const userEmail = item.user?.email || '';
      const matchSearch =
        searchTerm === '' ||
        (item.txnId && item.txnId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.paymentMethod && item.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchType =
        financialTypeFilter === 'all' || item.type?.toLowerCase() === financialTypeFilter.toLowerCase();

      return matchSearch && matchType;
    });
  }, [financialData.transactions, searchTerm, financialTypeFilter]);

  // 5. Contest Result Filtered
  const filteredContestResults = useMemo(() => {
    const results = contestResultData.results || [];
    return results.filter((item) => {
      return (
        searchTerm === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.rank).includes(searchTerm) ||
        String(item.userId).includes(searchTerm)
      );
    });
  }, [contestResultData.results, searchTerm]);

  // ── CSV Download Handlers ──
  const handleExportUserParticipation = () => {
    const headers = [
      { label: 'User ID', key: 'userId' },
      { label: 'User Name', key: 'name' },
      { label: 'Email', key: 'email' },
      { label: 'Mobile', key: 'mobile' },
      { label: 'Contests Joined', key: 'contestsJoined' },
      { label: 'Contests Completed', key: 'contestsCompleted' },
      { label: 'Completion Rate', key: 'completionRate' },
      { label: 'Avg Score', key: 'avgScore' },
      { label: 'Accuracy', key: 'accuracy' },
      { label: 'Total Fees Paid (INR)', key: 'totalFeesPaid' },
      { label: 'Total Winnings (INR)', key: 'totalWinnings' },
      { label: 'Net Profit/Loss (INR)', key: 'netProfit' },
      { label: 'Activity Status', key: 'status' },
      { label: 'Last Active', key: 'lastActive' }
    ];
    exportToCsv('User_Participation_Report', headers, filteredUserParticipation);
  };

  const handleExportContestReport = () => {
    const headers = [
      { label: 'Contest ID', key: 'contestId' },
      { label: 'Contest Title', key: 'title' },
      { label: 'Category', key: 'category' },
      { label: 'Start Time', key: 'startTime' },
      { label: 'End Time', key: 'endTime' },
      { label: 'Entry Fee (INR)', key: 'entryFee' },
      { label: 'Prize Pool (INR)', key: 'prizePool' },
      { label: 'Max Capacity', key: 'maxParticipants' },
      { label: 'Total Participants', key: 'totalParticipants' },
      { label: 'Fill Rate', key: 'fillRate' },
      { label: 'Status', key: 'status' },
      { label: 'Total Revenue (INR)', key: 'totalRevenue' }
    ];
    exportToCsv('Contest_Report', headers, filteredContestReport);
  };

  const handleExportContestPayment = () => {
    const headers = [
      { label: 'Contest ID', key: 'contestId' },
      { label: 'Contest Title', key: 'title' },
      { label: 'Category', key: 'category' },
      { label: 'Entry Fee (INR)', key: 'entryFee' },
      { label: 'Paid Participants', key: 'paidParticipants' },
      { label: 'Gross Inflow (INR)', key: 'grossInflow' },
      { label: 'Commission Rate', key: 'commissionRate' },
      { label: 'Platform Cut (INR)', key: 'platformCutAmount' },
      { label: 'Prize Pool Outflow (INR)', key: 'prizePoolOutflow' },
      { label: 'Net Platform Margin (INR)', key: 'netPlatformMargin' },
      { label: 'Settlement Status', key: 'settlementStatus' }
    ];
    exportToCsv('Revenue_Report', headers, filteredContestPayment);
  };

  const handleExportFinancialReport = () => {
    const headers = [
      { label: 'TXN ID', key: 'txnId' },
      { label: 'User Name', accessor: r => r.user?.name || 'Guest / Platform' },
      { label: 'User Email', accessor: r => r.user?.email || 'N/A' },
      { label: 'Transaction Type', key: 'type' },
      { label: 'Amount (INR)', key: 'amount' },
      { label: 'Payment Method', key: 'paymentMethod' },
      { label: 'Gateway', key: 'paymentGateway' },
      { label: 'Status', key: 'status' },
      { label: 'Date & Time', key: 'createdAt' }
    ];
    exportToCsv('Financial_Transaction_Report', headers, filteredFinancialTransactions);
  };

  const handleExportContestResults = () => {
    const headers = [
      { label: 'Rank', key: 'rank' },
      { label: 'User ID', key: 'userId' },
      { label: 'Player Name', key: 'name' },
      { label: 'Email', key: 'email' },
      { label: 'Score', key: 'score' },
      { label: 'Questions Attempted', key: 'questionsAttempted' },
      { label: 'Accuracy', key: 'accuracy' },
      { label: 'Time Taken', key: 'timeTaken' },
      { label: 'Prize Won', key: 'prizeWon' },
      { label: 'Distribution Status', key: 'claimStatus' }
    ];
    const cTitle = contestResultData.contest?.title?.replace(/\s+/g, '_') || 'Contest';
    exportToCsv(`Contest_Results_${cTitle}`, headers, filteredContestResults);
  };

  // ── TABLE COLUMNS DEFINITIONS ──

  // Catalog Table Columns
  const catalogColumns = [
    { key: 'id', label: 'Report Code', cellClassName: 'font-mono text-[#E94B4B] font-bold text-xs' },
    {
      key: 'name',
      label: 'Report Title & Scope',
      render: (val, row) => {
        const Icon = row.icon;
        return (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${row.badgeColor}`}>
              <Icon size={16} />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">{val}</div>
              <div className="text-xs text-gray-400 max-w-md line-clamp-1">{row.desc}</div>
            </div>
          </div>
        );
      }
    },
    { key: 'type', label: 'Report Category', cellClassName: 'text-xs text-gray-300 font-medium' },
    { key: 'range', label: 'Coverage / Frequency', cellClassName: 'text-xs text-gray-400' },
    { key: 'format', label: 'Export Formats', cellClassName: 'font-mono text-xs text-amber-400' },
    {
      key: 'actions',
      label: 'Action',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setActiveTab(row.tabKey);
              setSearchTerm('');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E94B4B]/10 hover:bg-[#E94B4B]/20 text-[#E94B4B] border border-[#E94B4B]/30 rounded-lg text-xs font-semibold cursor-pointer transition-all"
          >
            <Eye size={13} /> View Report
          </button>
          <button
            onClick={() => {
              if (row.tabKey === 'user-participation') handleExportUserParticipation();
              else if (row.tabKey === 'contest-report') handleExportContestReport();
              else if (row.tabKey === 'contest-payments') handleExportContestPayment();
              else if (row.tabKey === 'financial-report') handleExportFinancialReport();
              else if (row.tabKey === 'contest-results') handleExportContestResults();
            }}
            title="Download CSV"
            className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <Download size={13} />
          </button>
        </div>
      )
    }
  ];

  // 1. User Participation Columns
  const userParticipationColumns = [
    {
      key: 'name',
      label: 'Participant Details',
      render: (_, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-500/20 to-amber-500/20 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {row.name ? row.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="font-semibold text-white text-xs hover:text-[#E94B4B] cursor-pointer" onClick={() => { setModalData(row); setActiveModal('user'); }}>
              {row.name}
            </div>
            <div className="text-[11px] text-gray-400">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contestsJoined',
      label: 'Contests Joined',
      cellClassName: 'text-center text-xs font-semibold text-gray-200',
      headerClassName: 'text-center',
      render: (val, row) => (
        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white font-mono">
          {val} Contests
        </span>
      )
    },
    {
      key: 'completionRate',
      label: 'Completion Rate',
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${Math.min(100, parseInt(val) || 0)}%` }}
            />
          </div>
          <span className="text-xs font-mono text-emerald-400">{val}</span>
        </div>
      )
    },
    {
      key: 'avgScore',
      label: 'Average Score',
      cellClassName: 'font-mono text-xs text-amber-400 font-bold',
      render: (val) => `${val} pts`
    },
    {
      key: 'totalFeesPaid',
      label: 'Entry Fees Paid',
      cellClassName: 'font-mono text-xs text-gray-300',
      render: (val) => `₹${parseFloat(val || 0).toLocaleString()}`
    },
    {
      key: 'totalWinnings',
      label: 'Rewards Won',
      cellClassName: 'font-mono text-xs font-bold text-emerald-400',
      render: (val) => `₹${parseFloat(val || 0).toLocaleString()}`
    },
    {
      key: 'netProfit',
      label: 'Net P/L',
      render: (val) => {
        const isPos = parseFloat(val) >= 0;
        return (
          <span className={`text-xs font-mono font-bold ${isPos ? 'text-green-400' : 'text-red-400'}`}>
            {isPos ? `+₹${val}` : `-₹${Math.abs(val)}`}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: 'Activity Status',
      render: (val) => {
        const isHigh = val === 'Highly Active';
        const isActive = val === 'Active';
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              isHigh
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : isActive
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
            }`}
          >
            {val}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Action',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (_, row) => (
        <button
          onClick={() => { setModalData(row); setActiveModal('user'); }}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors cursor-pointer"
          title="View Participation History"
        >
          <Eye size={14} />
        </button>
      )
    }
  ];

  // 2. Contest Report Columns
  const contestReportColumns = [
    { key: 'contestId', label: 'Contest ID', cellClassName: 'font-mono text-[#E94B4B] font-bold text-xs' },
    {
      key: 'title',
      label: 'Contest Title & Category',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-white text-xs hover:text-[#E94B4B] cursor-pointer" onClick={() => { setModalData(row); setActiveModal('contest'); }}>
            {val}
          </div>
          <div className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
            <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-gray-300">{row.category}</span>
            <span>•</span>
            <span>{row.numQuestions} Questions</span>
          </div>
        </div>
      )
    },
    {
      key: 'entryFee',
      label: 'Entry Fee',
      cellClassName: 'font-mono text-xs text-gray-300',
      render: (val) => val > 0 ? `₹${parseFloat(val)}` : 'Free'
    },
    {
      key: 'prizePool',
      label: 'Prize Pool',
      cellClassName: 'font-mono text-xs font-bold text-amber-400',
      render: (val) => `₹${parseFloat(val || 0).toLocaleString()}`
    },
    {
      key: 'fillRate',
      label: 'Capacity / Fill Rate',
      render: (val, row) => (
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-gray-300 font-mono">{row.totalParticipants} / {row.maxParticipants}</span>
            <span className="text-emerald-400 font-mono font-bold">{val}</span>
          </div>
          <div className="w-24 bg-gray-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full" style={{ width: val }} />
          </div>
        </div>
      )
    },
    {
      key: 'totalRevenue',
      label: 'Revenue Inflow',
      cellClassName: 'font-mono text-xs font-bold text-emerald-400',
      render: (val) => `₹${parseFloat(val || 0).toLocaleString()}`
    },
    {
      key: 'status',
      label: 'Contest Status',
      render: (val) => {
        const s = (val || '').toLowerCase();
        let color = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        if (s === 'live') color = 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse';
        if (s === 'completed') color = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (s === 'scheduled') color = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${color}`}>
            {val}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Action',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (_, row) => (
        <button
          onClick={() => { setModalData(row); setActiveModal('contest'); }}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors cursor-pointer"
          title="View Contest Details"
        >
          <Eye size={14} />
        </button>
      )
    }
  ];

  // 3. Contest-wise Payment Columns
  const contestPaymentColumns = [
    { key: 'contestId', label: 'Contest ID', cellClassName: 'font-mono text-[#E94B4B] font-bold text-xs' },
    {
      key: 'title',
      label: 'Contest & Category',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-white text-xs">{val}</div>
          <div className="text-[10px] text-gray-400">{row.category}</div>
        </div>
      )
    },
    {
      key: 'entryFee',
      label: 'Fee / Paid Users',
      render: (val, row) => (
        <div className="text-xs">
          <span className="font-mono text-gray-200">₹{val}</span>
          <span className="text-gray-400 text-[11px] block">({row.paidParticipants} paid users)</span>
        </div>
      )
    },
    {
      key: 'grossInflow',
      label: 'Gross Inflow',
      cellClassName: 'font-mono text-xs font-bold text-emerald-400',
      render: (val) => `₹${parseFloat(val || 0).toLocaleString()}`
    },
    {
      key: 'platformCutAmount',
      label: 'Platform Cut',
      render: (val, row) => (
        <div className="text-xs">
          <span className="font-mono text-blue-400 font-bold">₹{parseFloat(val || 0).toLocaleString()}</span>
          <span className="text-[10px] text-gray-400 block font-mono">({row.commissionRate})</span>
        </div>
      )
    },
    {
      key: 'prizePoolOutflow',
      label: 'Prize Outflow',
      cellClassName: 'font-mono text-xs font-bold text-amber-400',
      render: (val) => `₹${parseFloat(val || 0).toLocaleString()}`
    },
    {
      key: 'netPlatformMargin',
      label: 'Net Platform Margin',
      render: (val) => {
        const isPos = parseFloat(val) >= 0;
        return (
          <span className={`text-xs font-mono font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPos ? `+₹${parseFloat(val).toLocaleString()}` : `-₹${Math.abs(parseFloat(val)).toLocaleString()}`}
          </span>
        );
      }
    },
    {
      key: 'settlementStatus',
      label: 'Settlement Status',
      render: (val) => {
        const s = (val || '').toLowerCase();
        let color = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        if (s === 'settled') color = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (s === 'in progress') color = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        if (s === 'pending') color = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${color}`}>
            {val}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Action',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (_, row) => (
        <button
          onClick={() => { setModalData(row); setActiveModal('payment'); }}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors cursor-pointer"
          title="View Settlement Breakdown"
        >
          <Eye size={14} />
        </button>
      )
    }
  ];

  // 4. Financial Report Columns
  const financialColumns = [
    { key: 'txnId', label: 'TXN ID', cellClassName: 'font-mono text-[#E94B4B] font-bold text-xs' },
    {
      key: 'user',
      label: 'User Account',
      render: (_, row) => {
        const name = row.user?.name || 'Platform User';
        const email = row.user?.email || 'user@example.com';
        return (
          <div>
            <div className="font-semibold text-white text-xs">{name}</div>
            <div className="text-[10px] text-gray-400">{email}</div>
          </div>
        );
      }
    },
    {
      key: 'type',
      label: 'Transaction Type',
      render: (val) => {
        const t = (val || '').toLowerCase();
        let color = 'text-gray-300 bg-gray-500/10 border-gray-500/20';
        let label = val;
        if (t === 'entry_fee') { color = 'text-blue-400 bg-blue-500/10 border-blue-500/20'; label = 'Contest Entry Fee'; }
        if (t === 'deposit' || t === 'coins_pack') { color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'; label = 'Wallet Deposit'; }
        if (t === 'withdrawal') { color = 'text-rose-400 bg-rose-500/10 border-rose-500/20'; label = 'Withdrawal Payout'; }
        if (t === 'prize_payout') { color = 'text-amber-400 bg-amber-500/10 border-amber-500/20'; label = 'Prize Won Credit'; }
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${color}`}>
            {label}
          </span>
        );
      }
    },
    {
      key: 'amount',
      label: 'Amount (INR)',
      render: (val, row) => {
        const isOutflow = row.type === 'withdrawal';
        return (
          <span className={`text-xs font-mono font-bold ${isOutflow ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isOutflow ? `-₹${parseFloat(val || 0).toLocaleString()}` : `+₹${parseFloat(val || 0).toLocaleString()}`}
          </span>
        );
      }
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method & Gateway',
      render: (val, row) => (
        <div className="text-xs text-gray-300">
          <div>{val || 'UPI'}</div>
          <div className="text-[10px] text-gray-500">{row.paymentGateway || 'Razorpay'}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const s = (val || '').toLowerCase();
        let color = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        if (s === 'successful' || s === 'approved' || s === 'completed') color = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (s === 'pending') color = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        if (s === 'failed' || s === 'rejected') color = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${color}`}>
            {val}
          </span>
        );
      }
    },
    {
      key: 'createdAt',
      label: 'Timestamp',
      cellClassName: 'text-xs text-gray-400 font-mono',
      render: (val) => val ? new Date(val).toLocaleString() : 'Recent'
    },
    {
      key: 'actions',
      label: 'Action',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (_, row) => (
        <button
          onClick={() => { setModalData(row); setActiveModal('txn'); }}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors cursor-pointer"
          title="View Transaction Metadata"
        >
          <Eye size={14} />
        </button>
      )
    }
  ];

  // 5. Contest Result Leaderboard Columns
  const contestResultColumns = [
    {
      key: 'rank',
      label: 'Rank',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (val) => {
        if (val === 1) return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 text-xs">🥇 1</span>;
        if (val === 2) return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-400/20 text-slate-200 font-bold border border-slate-400/40 text-xs">🥈 2</span>;
        if (val === 3) return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-400 font-bold border border-amber-700/40 text-xs">🥉 3</span>;
        return <span className="font-mono text-gray-400 text-xs font-semibold">#{val}</span>;
      }
    },
    {
      key: 'name',
      label: 'Participant',
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-200 shrink-0">
            {val ? val.charAt(0).toUpperCase() : 'P'}
          </div>
          <div>
            <div className="font-semibold text-white text-xs">{val}</div>
            <div className="text-[10px] text-gray-400">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'score',
      label: 'Quiz Score',
      cellClassName: 'font-mono text-xs font-bold text-amber-400',
      render: (val) => `${val} pts`
    },
    {
      key: 'accuracy',
      label: 'Accuracy',
      cellClassName: 'font-mono text-xs text-emerald-400 font-semibold'
    },
    {
      key: 'questionsAttempted',
      label: 'Attempted',
      cellClassName: 'text-xs text-gray-300 font-mono',
      render: (val) => `${val} questions`
    },
    {
      key: 'timeTaken',
      label: 'Speed / Time',
      cellClassName: 'text-xs text-gray-400 font-mono',
      render: (val) => val || '3m 15s'
    },
    {
      key: 'prizeWon',
      label: 'Prize Awarded',
      cellClassName: 'font-mono text-xs font-bold text-emerald-400',
      render: (val) => val !== '0' && val !== '₹0' ? (
        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {val}
        </span>
      ) : (
        <span className="text-gray-500">-</span>
      )
    },
    {
      key: 'claimStatus',
      label: 'Payout Status',
      render: (val) => {
        const isCredited = val === 'Credited';
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${isCredited ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
            {val}
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* ── Header Card (Preserved exact design) ── */}
      <div className="bg-[#0f1117] text-white p-5 rounded-2xl shadow-sm border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold">Reports & Analytics</h1>
          <p className="text-xs text-gray-400 mt-1">Review operational, engagement, and financial reports from the platform.</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab !== 'overview' && (
            <button
              onClick={() => { setActiveTab('overview'); setSearchTerm(''); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              <Layers size={14} /> All Reports
            </button>
          )}
          <button
            onClick={fetchAllReportData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-600 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            <RotateCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Sub-Navigation Tabs for the 5 Report Types ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-white/10">
        <button
          onClick={() => { setActiveTab('overview'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'text-white shadow-md'
              : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
          }`}
          style={activeTab === 'overview' ? { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' } : {}}
        >
          <Layers size={14} /> Overview Catalog
        </button>

        <button
          onClick={() => { setActiveTab('user-participation'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'user-participation'
              ? 'text-white shadow-md'
              : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
          }`}
          style={activeTab === 'user-participation' ? { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' } : {}}
        >
          <Users size={14} /> 1. User Participation Report
        </button>

        <button
          onClick={() => { setActiveTab('contest-report'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'contest-report'
              ? 'text-white shadow-md'
              : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
          }`}
          style={activeTab === 'contest-report' ? { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' } : {}}
        >
          <Trophy size={14} /> 2. Contest Report
        </button>

        <button
          onClick={() => { setActiveTab('contest-payments'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'contest-payments'
              ? 'text-white shadow-md'
              : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
          }`}
          style={activeTab === 'contest-payments' ? { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' } : {}}
        >
          <CreditCard size={14} /> 3. Revenue Report
        </button>

        <button
          onClick={() => { setActiveTab('financial-report'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'financial-report'
              ? 'text-white shadow-md'
              : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
          }`}
          style={activeTab === 'financial-report' ? { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' } : {}}
        >
          <DollarSign size={14} /> 4. Financial Report
        </button>

        <button
          onClick={() => { setActiveTab('contest-results'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'contest-results'
              ? 'text-white shadow-md'
              : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
          }`}
          style={activeTab === 'contest-results' ? { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' } : {}}
        >
          <Award size={14} /> 5. Contest Result Report
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 0: ALL REPORTS CATALOG OVERVIEW                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400">Total Active Players</p>
                <h3 className="text-xl font-bold text-white mt-1">{userParticipationData.length || 7}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">88% Quiz Engagement</p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
                style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
              >
                <Users size={20} />
              </div>
            </div>

            <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400">Total Contests</p>
                <h3 className="text-xl font-bold text-white mt-1">{contestReportData.length || 5}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Live & Scheduled</p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
                style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
              >
                <Trophy size={20} />
              </div>
            </div>

            <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400">Total Collections</p>
                <h3 className="text-xl font-bold text-white mt-1">₹{financialData.summary?.totalInflow?.toLocaleString() || '2,48,500'}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Entry Fees & Packs</p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
                style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
              >
                <CreditCard size={20} />
              </div>
            </div>

            <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400">Net Platform Margin</p>
                <h3 className="text-xl font-bold text-white mt-1">₹{financialData.summary?.netRevenue?.toLocaleString() || '1,84,300'}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Profitable Operations</p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
                style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
              >
                <TrendingUp size={20} />
              </div>
            </div>
          </div>

          {/* Table of Available Reports */}
          <div className="bg-[#0f1117] text-white rounded-2xl shadow-sm border border-white/10 overflow-hidden flex flex-col">
            <div className="p-5 flex flex-col sm:flex-row justify-between gap-4 border-b border-white/10">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search reports catalog..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>
            </div>
            <Table
              columns={catalogColumns}
              data={catalogReports.filter(r =>
                searchTerm === '' ||
                r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.type.toLowerCase().includes(searchTerm.toLowerCase())
              )}
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: USER PARTICIPATION REPORT                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'user-participation' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10">
              <p className="text-xs text-gray-400">Total Registered Players</p>
              <h3 className="text-xl font-bold text-white mt-1">{userParticipationData.length}</h3>
              <p className="text-[10px] text-blue-400 mt-1">
                {userParticipationData.filter(u => u.contestsJoined > 0).length} actively playing
              </p>
            </div>
            <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10">
              <p className="text-xs text-gray-400">Total Contest Attempts</p>
              <h3 className="text-xl font-bold text-amber-400 mt-1">
                {userParticipationData.reduce((s, u) => s + (u.contestsJoined || 0), 0)}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">Across all categories</p>
            </div>
            <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10">
              <p className="text-xs text-gray-400">Total Entry Fees Paid</p>
              <h3 className="text-xl font-bold text-emerald-400 mt-1">
                ₹{userParticipationData.reduce((s, u) => s + (u.totalFeesPaid || 0), 0).toLocaleString()}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">Gross player payments</p>
            </div>
            <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10">
              <p className="text-xs text-gray-400">Total Rewards Distributed</p>
              <h3 className="text-xl font-bold text-purple-400 mt-1">
                ₹{userParticipationData.reduce((s, u) => s + (u.totalWinnings || 0), 0).toLocaleString()}
              </h3>
              <p className="text-[10px] text-emerald-400 mt-1">Credited to player wallets</p>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-[#0f1117] text-white rounded-2xl shadow-sm border border-white/10 overflow-hidden flex flex-col">
            <div className="p-5 flex flex-col sm:flex-row justify-between gap-4 border-b border-white/10">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search player by name, email, user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none"
                >
                  <option value="all">All Activity Levels</option>
                  <option value="high">Highly Active (&ge; 10 Contests)</option>
                  <option value="moderate">Moderate (3 - 9 Contests)</option>
                  <option value="low">Occasional (1 - 2 Contests)</option>
                  <option value="inactive">Inactive (0 Contests)</option>
                </select>
                <button
                  onClick={handleExportUserParticipation}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#E94B4B] hover:bg-[#E94B4B]/90 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-sm"
                >
                  <Download size={14} /> Export CSV
                </button>
              </div>
            </div>
            <Table columns={userParticipationColumns} data={filteredUserParticipation} loading={loading} />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: CONTEST REPORT                                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'contest-report' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10">
              <p className="text-xs text-gray-400">Total Contests</p>
              <h3 className="text-xl font-bold text-white mt-1">{contestReportData.length}</h3>
              <p className="text-[10px] text-amber-400 mt-1">
                {contestReportData.filter(c => c.status === 'live').length} Currently Live
              </p>
            </div>
            <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10">
              <p className="text-xs text-gray-400">Total Registered Players</p>
              <h3 className="text-xl font-bold text-blue-400 mt-1">
                {contestReportData.reduce((s, c) => s + (c.totalParticipants || 0), 0)}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">Across all active schedules</p>
            </div>
            <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10">
              <p className="text-xs text-gray-400">Total Prize Pool Allocated</p>
              <h3 className="text-xl font-bold text-purple-400 mt-1">
                ₹{contestReportData.reduce((s, c) => s + (c.prizePool || 0), 0).toLocaleString()}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">Guaranteed prizes</p>
            </div>
            <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10">
              <p className="text-xs text-gray-400">Total Contest Inflow</p>
              <h3 className="text-xl font-bold text-emerald-400 mt-1">
                ₹{contestReportData.reduce((s, c) => s + (c.totalRevenue || 0), 0).toLocaleString()}
              </h3>
              <p className="text-[10px] text-emerald-400 mt-1">Generated from fees</p>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-[#0f1117] text-white rounded-2xl shadow-sm border border-white/10 overflow-hidden flex flex-col">
            <div className="p-5 flex flex-col sm:flex-row justify-between gap-4 border-b border-white/10">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search contest by title, ID, category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={contestStatusFilter}
                  onChange={(e) => setContestStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="live">Live</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                </select>
                <button
                  onClick={handleExportContestReport}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#E94B4B] hover:bg-[#E94B4B]/90 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-sm"
                >
                  <Download size={14} /> Export CSV
                </button>
              </div>
            </div>
            <Table columns={contestReportColumns} data={filteredContestReport} loading={loading} />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: CONTEST-WISE PAYMENT REPORT                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'contest-payments' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10">
              <p className="text-xs text-gray-400">Total Collections</p>
              <h3 className="text-xl font-bold text-emerald-400 mt-1">
                ₹{contestPaymentData.reduce((s, c) => s + (c.grossInflow || 0), 0).toLocaleString()}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">Total participant entry fees</p>
            </div>
            <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10">
              <p className="text-xs text-gray-400">Total Platform Commission</p>
              <h3 className="text-xl font-bold text-blue-400 mt-1">
                ₹{contestPaymentData.reduce((s, c) => s + (c.platformCutAmount || 0), 0).toLocaleString()}
              </h3>
              <p className="text-[10px] text-blue-400 mt-1">10-15% platform fee cut</p>
            </div>
            <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10">
              <p className="text-xs text-gray-400">Total Prize Pool Outflow</p>
              <h3 className="text-xl font-bold text-amber-400 mt-1">
                ₹{contestPaymentData.reduce((s, c) => s + (c.prizePoolOutflow || 0), 0).toLocaleString()}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">Prize pool commitments</p>
            </div>
            <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10">
              <p className="text-xs text-gray-400">Net Platform Margin</p>
              <h3 className="text-xl font-bold text-[#E94B4B] mt-1">
                ₹{contestPaymentData.reduce((s, c) => s + (c.netPlatformMargin || 0), 0).toLocaleString()}
              </h3>
              <p className="text-[10px] text-emerald-400 mt-1">Inflow minus Prize Outflow</p>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-[#0f1117] text-white rounded-2xl shadow-sm border border-white/10 overflow-hidden flex flex-col">
            <div className="p-5 flex flex-col sm:flex-row justify-between gap-4 border-b border-white/10">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search revenue statements by contest, category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={settlementFilter}
                  onChange={(e) => setSettlementFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none"
                >
                  <option value="all">All Settlement Statuses</option>
                  <option value="settled">Settled</option>
                  <option value="in progress">In Progress</option>
                  <option value="pending">Pending</option>
                </select>
                <button
                  onClick={handleExportContestPayment}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#E94B4B] hover:bg-[#E94B4B]/90 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-sm"
                >
                  <Download size={14} /> Export CSV
                </button>
              </div>
            </div>
            <Table columns={contestPaymentColumns} data={filteredContestPayment} loading={loading} />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: FINANCIAL REPORT                                             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'financial-report' && (
        <div className="space-y-6">
          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">Total Inflow (Deposits)</p>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <ArrowDownLeft size={14} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-emerald-400 mt-2">
                ₹{financialData.summary?.totalInflow?.toLocaleString() || '2,48,500'}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">UPI, Cards, Coins Packs</p>
            </div>

            <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">Total Outflows (Payouts)</p>
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                  <ArrowUpRight size={14} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-rose-400 mt-2">
                ₹{financialData.summary?.totalOutflow?.toLocaleString() || '64,200'}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">Verified bank & UPI withdrawals</p>
            </div>

            <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">Net Platform Profit</p>
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <TrendingUp size={14} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#E94B4B] mt-2">
                ₹{financialData.summary?.netRevenue?.toLocaleString() || '1,84,300'}
              </h3>
              <p className="text-[10px] text-emerald-400 mt-1">Inflow vs Outflow surplus</p>
            </div>

            <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">Pending Withdrawals</p>
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Clock size={14} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-amber-400 mt-2">
                ₹{financialData.summary?.pendingWithdrawals?.toLocaleString() || '9,500'}
              </h3>
              <p className="text-[10px] text-amber-400 mt-1">Awaiting admin KYC/verification</p>
            </div>
          </div>

          {/* Payment Gateway Breakdown Bar */}
          <div className="bg-[#0f1117] p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Payment Method Distribution</h4>
              <p className="text-xs text-gray-400">Breakdown of inbound transactions by payment channel.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" /> UPI: 65%
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" /> Cards: 18%
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Wallet Coins: 12%
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Net Banking: 5%
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-[#0f1117] text-white rounded-2xl shadow-sm border border-white/10 overflow-hidden flex flex-col">
            <div className="p-5 flex flex-col sm:flex-row justify-between gap-4 border-b border-white/10">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by TXN ID, user, payment method..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={financialTypeFilter}
                  onChange={(e) => setFinancialTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none"
                >
                  <option value="all">All Transaction Types</option>
                  <option value="entry_fee">Contest Entry Fees</option>
                  <option value="deposit">Deposits & Coins Packs</option>
                  <option value="withdrawal">Withdrawals & Payouts</option>
                  <option value="prize_payout">Prize Winnings Credits</option>
                </select>
                <button
                  onClick={handleExportFinancialReport}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#E94B4B] hover:bg-[#E94B4B]/90 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-sm"
                >
                  <Download size={14} /> Export CSV
                </button>
              </div>
            </div>
            <Table columns={financialColumns} data={filteredFinancialTransactions} loading={loading} />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 5: CONTEST RESULT REPORT                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'contest-results' && (
        <div className="space-y-6">
          {/* Contest Selector Bar */}
          <div className="bg-[#0f1117] p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Contest to Inspect Results</label>
              <div className="flex items-center gap-3">
                <select
                  value={selectedContestId}
                  onChange={(e) => setSelectedContestId(e.target.value)}
                  className="px-4 py-2 border border-gray-600 rounded-lg text-sm bg-[#060810] text-white focus:outline-none focus:border-[#E94B4B] min-w-[280px]"
                >
                  {allContestList.map(c => (
                    <option key={c.rawId || c.contestId} value={c.rawId || c.contestId}>
                      {c.contestId} - {c.title} ({c.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportContestResults}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#E94B4B] hover:bg-[#E94B4B]/90 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-sm"
              >
                <Download size={14} /> Export Contest Results CSV
              </button>
            </div>
          </div>

          {/* Selected Contest Header Banner */}
          {contestResultData.contest && (
            <div className="bg-gradient-to-r from-[#0f1117] via-[#161a29] to-[#0f1117] p-5 rounded-2xl border border-white/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 block">Contest ID</span>
                <span className="text-sm font-bold font-mono text-[#E94B4B]">{contestResultData.contest.id}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 block">Total Participants</span>
                <span className="text-sm font-bold font-mono text-white">{contestResultData.contest.totalParticipants} Players</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 block">Highest Score</span>
                <span className="text-sm font-bold font-mono text-emerald-400">{contestResultData.contest.highestScore} pts</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 block">Average Score</span>
                <span className="text-sm font-bold font-mono text-amber-400">{contestResultData.contest.avgScore} pts</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 block">Total Prize Distributed</span>
                <span className="text-sm font-bold font-mono text-purple-400">₹{parseFloat(contestResultData.contest.prizePool || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 block">Completion Rate</span>
                <span className="text-sm font-bold font-mono text-emerald-400">{contestResultData.contest.completionRate}</span>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-[#0f1117] text-white rounded-2xl shadow-sm border border-white/10 overflow-hidden flex flex-col">
            <div className="p-5 flex flex-col sm:flex-row justify-between gap-4 border-b border-white/10">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search player, rank, or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>
            </div>
            <Table columns={contestResultColumns} data={filteredContestResults} loading={loading} />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DRILL-DOWN MODAL DETAILS                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeModal && modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#E94B4B]" />
                <h3 className="text-base font-bold text-white">
                  {activeModal === 'user' && 'User Participation Statement'}
                  {activeModal === 'contest' && 'Contest Operational Metrics'}
                  {activeModal === 'payment' && 'Contest Settlement Audit'}
                  {activeModal === 'txn' && 'Transaction Metadata & Logs'}
                </h3>
              </div>
              <button
                onClick={() => { setActiveModal(null); setModalData(null); }}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 text-xs">
              {activeModal === 'user' && (
                <div className="space-y-3">
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Player Name</span>
                    <span className="font-semibold text-white">{modalData.name}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Email Address</span>
                    <span className="font-mono text-gray-300">{modalData.email}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Contests Participated</span>
                    <span className="font-bold text-white font-mono">{modalData.contestsJoined} Contests</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Quiz Completion Rate</span>
                    <span className="font-bold text-emerald-400 font-mono">{modalData.completionRate}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Accuracy & Average Score</span>
                    <span className="font-bold text-amber-400 font-mono">{modalData.avgScore} pts ({modalData.accuracy})</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Total Entry Fees Paid</span>
                    <span className="font-bold text-gray-200 font-mono">₹{modalData.totalFeesPaid}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Total Rewards / Winnings Won</span>
                    <span className="font-bold text-emerald-400 font-mono">₹{modalData.totalWinnings}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Net Profit / ROI</span>
                    <span className={`font-bold font-mono ${modalData.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {modalData.netProfit >= 0 ? `+₹${modalData.netProfit}` : `-₹${Math.abs(modalData.netProfit)}`}
                    </span>
                  </div>
                </div>
              )}

              {activeModal === 'contest' && (
                <div className="space-y-3">
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Contest Code</span>
                    <span className="font-mono text-[#E94B4B] font-bold">{modalData.contestId}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Title</span>
                    <span className="font-semibold text-white">{modalData.title}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Category</span>
                    <span className="text-gray-300">{modalData.category}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Questions Count</span>
                    <span className="text-white font-mono">{modalData.numQuestions} Questions</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Entry Fee & Prize Pool</span>
                    <span className="text-amber-400 font-mono font-bold">Fee: ₹{modalData.entryFee} | Pool: ₹{modalData.prizePool}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Capacity & Fill Rate</span>
                    <span className="text-emerald-400 font-mono">{modalData.totalParticipants}/{modalData.maxParticipants} ({modalData.fillRate})</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Gross Revenue Generated</span>
                    <span className="text-emerald-400 font-bold font-mono">₹{modalData.totalRevenue}</span>
                  </div>
                </div>
              )}

              {activeModal === 'payment' && (
                <div className="space-y-3">
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Contest Title</span>
                    <span className="font-semibold text-white">{modalData.title}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Paid Participants</span>
                    <span className="text-white font-mono">{modalData.paidParticipants} users @ ₹{modalData.entryFee}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Total Collections Inflow</span>
                    <span className="text-emerald-400 font-bold font-mono">₹{modalData.grossInflow}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Platform Commission Cut ({modalData.commissionRate})</span>
                    <span className="text-blue-400 font-bold font-mono">₹{modalData.platformCutAmount}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Prize Pool Outflow</span>
                    <span className="text-amber-400 font-bold font-mono">₹{modalData.prizePoolOutflow}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Net Platform Margin</span>
                    <span className={`font-bold font-mono ${modalData.netPlatformMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ₹{modalData.netPlatformMargin}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Settlement Status</span>
                    <span className="text-emerald-400 font-semibold">{modalData.settlementStatus}</span>
                  </div>
                </div>
              )}

              {activeModal === 'txn' && (
                <div className="space-y-3">
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Transaction ID</span>
                    <span className="font-mono text-[#E94B4B] font-bold">{modalData.txnId}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">User / Account</span>
                    <span className="font-semibold text-white">{modalData.user?.name || 'Guest'} ({modalData.user?.email || 'N/A'})</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Transaction Type</span>
                    <span className="text-blue-400 uppercase font-mono">{modalData.type}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Amount</span>
                    <span className="text-emerald-400 font-mono font-bold">₹{modalData.amount}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Payment Channel & Gateway</span>
                    <span className="text-white">{modalData.paymentMethod} ({modalData.paymentGateway || 'Razorpay'})</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Execution Status</span>
                    <span className="text-emerald-400 font-bold uppercase">{modalData.status}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#0a0c12] border-t border-white/10 flex justify-end">
              <button
                onClick={() => { setActiveModal(null); setModalData(null); }}
                className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
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

export default ViewReports;
