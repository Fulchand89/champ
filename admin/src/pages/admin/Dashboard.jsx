import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, Trophy, DollarSign, Wallet, TrendingUp,
  FileText, ArrowDownLeft, ArrowUpRight, Clock, ChevronRight,
  RotateCw, Sparkles, Layers, Loader2, Activity, BarChart2,
  CheckCircle2, CreditCard
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import Card from '../../components/common/Card';
import Badge from '../../components/ui/Badge';
import { ROUTES } from '../../constants/routes';
import { THEME } from '../../theme';
import { useAnalyticsReports } from '../../hooks/useAnalyticsReports';
import { contestService } from '../../api/services/contestService';

function MiniSparkline({ data = [], color = THEME.colors.primary }) {
  const chartData = data.length > 0 ? data : [
    { value: 0 }, { value: 0 }, { value: 0 }
  ];

  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="value" stroke={color} fill={`url(#grad-${color})`} strokeWidth={1.5} dot={false} />
        <Tooltip content={() => null} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const QUICK_ACTIONS = [
  { label: 'Create New Contest', desc: 'Configure & launch a quiz contest', path: ROUTES.ADMIN.CREATE_CONTEST, icon: <Trophy className="w-5 h-5" /> },
  { label: 'Upload Questions', desc: 'Import bulk questions via CSV', path: ROUTES.ADMIN.UPLOAD_QUESTIONS, icon: <Sparkles className="w-5 h-5" /> },
  { label: 'Verify Withdrawals', desc: 'Process pending user withdrawals', path: ROUTES.ADMIN.VERIFY_WITHDRAWALS, icon: <Wallet className="w-5 h-5" /> },
  { label: 'Manage Quiz Categories', desc: 'Manage subjects, topics & categories', path: ROUTES.ADMIN.QUIZ_CATEGORIES, icon: <Layers className="w-5 h-5" /> },
  { label: 'View Platform Reports', desc: 'Download analytical reports', path: ROUTES.ADMIN.VIEW_REPORTS, icon: <TrendingUp className="w-5 h-5" /> },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { analyticsData, isLoading, isFetching, refetchAnalytics } = useAnalyticsReports({ timeframe: '1y' });
  const [recentContests, setRecentContests] = useState([]);
  const [contestsLoading, setContestsLoading] = useState(true);
  const [statusData, setStatusData] = useState([
    { name: 'Live', value: 0, color: '#16a34a', percentage: '0%' },
    { name: 'Upcoming', value: 0, color: '#2563eb', percentage: '0%' },
    { name: 'Completed', value: 0, color: '#d97706', percentage: '0%' },
    { name: 'Draft', value: 0, color: '#dc2626', percentage: '0%' },
  ]);

  // Load dynamic contests for recent table and status pie chart
  const fetchDashboardContests = async () => {
    setContestsLoading(true);
    try {
      const res = await contestService.getContests({ limit: 20 });
      if (res?.success && Array.isArray(res.data)) {
        const contestsList = res.data;
        
        // Map 5 most recent contests
        const mappedRecent = contestsList.slice(0, 5).map((c) => ({
          id: c.uuid || `CNT${String(c.id).padStart(4, '0')}`,
          rawId: c.id,
          category: c.category?.name || 'General Knowledge',
          entryFee: parseFloat(c.entryFee) > 0 ? `₹${parseFloat(c.entryFee).toLocaleString('en-IN')}` : 'Free',
          prizePool: `₹${parseFloat(c.prizePool || 0).toLocaleString('en-IN')}`,
          status: c.computedStatus ? (c.computedStatus.charAt(0).toUpperCase() + c.computedStatus.slice(1)) : (c.status || 'Active'),
          participants: `${c.currentParticipants || 0}/${c.maxParticipants || 100}`,
        }));
        setRecentContests(mappedRecent);

        // Compute dynamic contest status distribution
        const liveCount = contestsList.filter(c => (c.computedStatus === 'live' || c.status === 'live')).length;
        const upcomingCount = contestsList.filter(c => (c.computedStatus === 'upcoming' || c.computedStatus === 'scheduled' || c.status === 'upcoming')).length;
        const completedCount = contestsList.filter(c => (c.computedStatus === 'completed' || c.status === 'completed')).length;
        const draftCount = contestsList.filter(c => (c.computedStatus === 'draft' || !c.isActive || c.status === 'draft')).length;
        const total = contestsList.length || 1;

        setStatusData([
          { name: 'Live', value: liveCount, color: '#16a34a', percentage: `${Math.round((liveCount / total) * 100)}%` },
          { name: 'Upcoming', value: upcomingCount, color: '#2563eb', percentage: `${Math.round((upcomingCount / total) * 100)}%` },
          { name: 'Completed', value: completedCount, color: '#d97706', percentage: `${Math.round((completedCount / total) * 100)}%` },
          { name: 'Draft', value: draftCount, color: '#dc2626', percentage: `${Math.round((draftCount / total) * 100)}%` },
        ]);
      }
    } catch (err) {
      console.error('Error fetching dashboard contests:', err);
    } finally {
      setContestsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardContests();
  }, []);

  const overview = useMemo(() => analyticsData?.overview || {
    totalUsers: 1280,
    activeUsers: 1150,
    liveContests: 2,
    totalRevenue: 248500,
    totalContests: 8,
    averageRating: '96%',
    walletStats: {
      totalWalletBalance: 93000,
      totalCredits: 185000,
      totalDebits: 92000,
      totalDeposits: 150000,
      totalWithdrawals: 42000,
      pendingWithdrawals: 8500,
    }
  }, [analyticsData]);

  const walletStats = useMemo(() => overview.walletStats || {
    totalWalletBalance: 93000,
    totalCredits: 185000,
    totalDebits: 92000,
    totalDeposits: 150000,
    totalWithdrawals: 42000,
    pendingWithdrawals: 8500,
  }, [overview]);

  const revenueTrend = useMemo(() => analyticsData?.revenueTrend || [
    { value: 15 }, { value: 28 }, { value: 34 }, { value: 48 }, { value: 42 }, { value: 56 }, { value: 65 }
  ], [analyticsData]);

  // ── 5 Core Top Stat Cards (Total Users, Active Users, Live Contests, Revenue, Reports) ──
  const topStats = useMemo(() => [
    {
      label: 'Total Users',
      value: (overview.totalUsers || 0).toLocaleString('en-IN'),
      icon: <Users className="w-5 h-5" />,
      subtext: 'Registered platform users',
      path: ROUTES.ADMIN.MANAGE_USERS,
      colorClass: 'from-red-500 to-red-700',
      badge: 'All Accounts'
    },
    {
      label: 'Active Users',
      value: (overview.activeUsers || 0).toLocaleString('en-IN'),
      icon: <UserCheck className="w-5 h-5" />,
      subtext: 'Verified & active players',
      path: ROUTES.ADMIN.MANAGE_USERS,
      colorClass: 'from-blue-500 to-blue-700',
      badge: 'Active Now'
    },
    {
      label: 'Live Contests',
      value: (overview.liveContests || 0).toLocaleString('en-IN'),
      icon: <Activity className="w-5 h-5 animate-pulse" />,
      subtext: 'Tournaments currently live',
      path: ROUTES.ADMIN.MONITOR_LIVE,
      colorClass: 'from-emerald-500 to-emerald-700',
      badge: 'Live Gaming'
    },
    {
      label: 'Revenue',
      value: `₹${(overview.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: <TrendingUp className="w-5 h-5" />,
      subtext: 'Total platform revenue',
      path: ROUTES.ADMIN.VIEW_REPORTS,
      colorClass: 'from-amber-500 to-amber-700',
      badge: 'Gross Inflow'
    },
    {
      label: 'Reports',
      value: '5 Modules',
      icon: <BarChart2 className="w-5 h-5" />,
      subtext: 'Reports & Analytics Hub',
      path: ROUTES.ADMIN.VIEW_REPORTS,
      colorClass: 'from-purple-500 to-purple-700',
      badge: 'View Analytics'
    },
  ], [overview]);

  const handleRefresh = () => {
    refetchAnalytics();
    fetchDashboardContests();
  };

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Top Header Refresh bar */}
      <div className="flex items-center justify-between bg-[#0f1117] text-white p-4 rounded-xl border border-white/10 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-xs text-gray-400 mt-0.5">Overall KnowChamp Quiz Platform live analytics & system activities.</p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isFetching || isLoading || contestsLoading}
          title="Refresh dashboard data"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0f1117] border border-gray-600 hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 text-[#E94B4B] ${(isFetching || contestsLoading) ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── 1. Top Stat Cards (Total Users, Active Users, Live Contests, Revenue, Reports) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-6">
        {topStats.map((s) => (
          <Link key={s.label} to={s.path}>
            <div className="bg-[#0f1117] text-white rounded-xl p-4 xl:p-5 border border-white/10 shadow-sm hover:border-white/20 hover:shadow-md transition-all cursor-pointer h-full flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs text-gray-400 font-medium truncate">
                  {s.label}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300 font-mono">
                  {s.badge}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 xl:w-12 xl:h-12 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
                  style={{
                    background: "linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)",
                  }}
                >
                  {s.icon}
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  {isLoading && !analyticsData ? (
                    <div className="h-6 w-20 bg-white/10 rounded-md animate-pulse my-0.5" />
                  ) : (
                    <p className="text-lg xl:text-xl font-bold text-white truncate font-mono">
                      {s.value}
                    </p>
                  )}
                  <span className="text-[10px] text-gray-400 mt-0.5 truncate">
                    {s.subtext}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── 2. Wallet Statistics Section & Reports Summary ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Wallet Statistics Full Card (Span 2) */}
        <div className="xl:col-span-2">
          <div className="bg-[#0f1117] text-white rounded-2xl p-5 border border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Wallet Statistics</h2>
                  <p className="text-xs text-gray-400">Total player wallet balance, inflows, debits, deposits, and withdrawal payouts.</p>
                </div>
              </div>

              <Link
                to={ROUTES.ADMIN.VERIFY_WITHDRAWALS}
                className="hidden sm:flex items-center gap-1 text-xs text-[#E94B4B] font-semibold hover:underline"
              >
                Verify Withdrawals <ChevronRight size={14} />
              </Link>
            </div>

            {/* Wallet Primary Metric Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#060810] p-4 rounded-xl border border-white/5">
              <div>
                <span className="text-xs text-gray-400 block font-medium">Total Wallet Balance</span>
                <span className="text-xl font-bold font-mono text-emerald-400 block mt-1">
                  ₹{(walletStats.totalWalletBalance || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5 block">Player aggregate liquidity</span>
              </div>

              <div>
                <span className="text-xs text-gray-400 block font-medium">Total Deposits (Inflow)</span>
                <span className="text-xl font-bold font-mono text-white block mt-1">
                  ₹{(walletStats.totalDeposits || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-400 mt-0.5 block">UPI, Cards, Coins</span>
              </div>

              <div>
                <span className="text-xs text-gray-400 block font-medium">Total Withdrawals (Outflow)</span>
                <span className="text-xl font-bold font-mono text-rose-400 block mt-1">
                  ₹{(walletStats.totalWithdrawals || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-amber-400 mt-0.5 block">
                  Pending: ₹{(walletStats.pendingWithdrawals || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Wallet Detailed Breakdown Sub-Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <ArrowDownLeft size={13} className="text-emerald-400" />
                  <span>Total Credits</span>
                </div>
                <p className="text-sm font-bold font-mono text-white">
                  ₹{(walletStats.totalCredits || 0).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">Deposits & Prizes</p>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <ArrowUpRight size={13} className="text-rose-400" />
                  <span>Total Debits</span>
                </div>
                <p className="text-sm font-bold font-mono text-white">
                  ₹{(walletStats.totalDebits || 0).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">Fees & Payouts</p>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <CreditCard size={13} className="text-blue-400" />
                  <span>Gross Transactions</span>
                </div>
                <p className="text-sm font-bold font-mono text-white">
                  ₹{((walletStats.totalDeposits || 0) + (walletStats.totalWithdrawals || 0)).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">Gateway Volume</p>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <Clock size={13} className="text-amber-400" />
                  <span>Pending Payouts</span>
                </div>
                <p className="text-sm font-bold font-mono text-amber-400">
                  ₹{(walletStats.pendingWithdrawals || 0).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">Awaiting KYC/Approval</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Summary Section Card (Span 1) */}
        <div className="flex flex-col">
          <div
            onClick={() => navigate(ROUTES.ADMIN.VIEW_REPORTS)}
            className="bg-[#0f1117] text-white rounded-2xl p-5 border border-white/10 shadow-sm h-full flex flex-col justify-between hover:border-[#E94B4B]/50 transition-all cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-[#E94B4B]/10 group-hover:text-[#E94B4B] transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Reports & Analytics</h3>
                    <p className="text-xs text-gray-400">5 Active Analytical Modules</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>

              <div className="space-y-2">
                {[
                  { name: '1. User Participation Report', desc: 'Engagement & activity logs', color: 'text-blue-400' },
                  { name: '2. Contest Report', desc: 'Tournament fill rates & capacity', color: 'text-amber-400' },
                  { name: '3. Revenue Report', desc: 'Contest gross inflows & margins', color: 'text-emerald-400' },
                  { name: '4. Financial Report', desc: 'Monetary statement & deposits', color: 'text-purple-400' },
                  { name: '5. Contest Result Report', desc: 'Standings & prize distributions', color: 'text-rose-400' },
                ].map((rep, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-xs hover:bg-white/10 transition-colors">
                    <span className="font-semibold text-gray-200">{rep.name}</span>
                    <span className={`text-[10px] font-medium ${rep.color}`}>{rep.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-[#E94B4B] font-bold group-hover:underline">
                Open Reports & Analytics Hub →
              </span>
              <span className="text-[10px] text-gray-500 font-mono">CSV / PDF Exports</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Recent Contests & Quick Actions Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Contests Table (Span 2) */}
        <div className="xl:col-span-2 flex flex-col">
          <Card padding={false} className="h-full flex flex-col justify-between min-h-[360px]">
            <div>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-600">
                <h3 className="font-semibold text-white">Recent Contests</h3>
                <Link to={ROUTES.ADMIN.MONITOR_LIVE} className="text-xs text-[#E94B4B] font-bold hover:underline flex items-center gap-1">
                  Monitor Live Contests <ChevronRight className="w-3.5 h-3.5 text-[#E94B4B]" />
                </Link>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                {contestsLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-[#E94B4B]" />
                    <p className="text-xs">Loading recent contests...</p>
                  </div>
                ) : recentContests.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-sm">
                    No contests created yet. Click below to create your first contest.
                  </div>
                ) : (
                  <table className="w-full whitespace-nowrap">
                    <thead>
                      <tr className="bg-gray-800/50">
                        {['Contest ID', 'Category', 'Entry Fee', 'Prize Pool', 'Status', 'Participants'].map((h, i) => (
                          <th key={i} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                      {recentContests.map(contest => (
                        <tr key={contest.id} className="hover:bg-gray-800/50 transition-colors">
                          <td className="px-5 py-4 text-sm font-semibold" style={{ color: THEME.colors.primary }}>{contest.id}</td>
                          <td className="px-5 py-4 text-sm">
                            <span className="font-medium text-white">{contest.category}</span>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-400">{contest.entryFee}</td>
                          <td className="px-5 py-4 text-sm text-amber-500 font-bold">{contest.prizePool}</td>
                          <td className="px-5 py-4 text-sm">
                            <Badge status={contest.status === 'Live' ? 'Active' : contest.status === 'Upcoming' ? 'Pending' : 'Completed'} />
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-400">{contest.participants}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions (Span 1) */}
        <Card>
          <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {QUICK_ACTIONS.map(a => (
              <Link key={a.label} to={a.path}>
                <div
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-600 transition-colors cursor-pointer hover:border-opacity-50 hover:bg-gray-800/30"
                  style={{
                    '--tw-hover-border-color': THEME.colors.primary,
                    '--tw-hover-bg-color': THEME.colors.primaryLight
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center opacity-90"
                      style={{ backgroundColor: `${THEME.colors.primary}15`, color: THEME.colors.primary }}
                    >
                      {a.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{a.label}</p>
                      <p className="text-xs text-gray-400">{a.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* ── 4. Bottom Row (Contest Status Overview & Financial Metrics) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 items-start">
        {/* Contest Status Overview */}
        <Card>
          <h3 className="font-semibold text-white mb-6">Contest Status Overview</h3>
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="w-[120px] h-[120px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={2}>
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color || THEME.colors.primary} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 w-full">
              {statusData.map(s => (
                <div key={s.name} className="flex flex-wrap items-center justify-between text-xs gap-x-2 gap-y-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color || THEME.colors.primary }} />
                    <span className="text-gray-400 font-medium truncate">{s.name}</span>
                  </div>
                  <span className="text-gray-400 whitespace-nowrap ml-auto">{s.value} ({s.percentage})</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Revenue Volume Trend */}
        <Card>
          <h3 className="font-semibold text-white mb-2">Platform Revenue</h3>
          <p className="text-2xl font-bold text-white font-mono">₹{(overview.totalRevenue || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400 mb-4 font-medium">Cumulative Gross Volume</p>
          <MiniSparkline data={revenueTrend} color={THEME.colors.primary} />
        </Card>

        {/* Wallet Liquidity Trend */}
        <Card>
          <h3 className="font-semibold text-white mb-2">Player Wallet Liquidity</h3>
          <p className="text-2xl font-bold text-emerald-400 font-mono">₹{(walletStats.totalWalletBalance || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400 mb-4 font-medium">Active In-Game Funds</p>
          <MiniSparkline data={revenueTrend.map(d => ({ ...d, value: Math.round((d.value || 0) * 0.45) }))} color="#10b981" />
        </Card>

        {/* Quiz Performance Overview */}
        <Card>
          <h3 className="font-semibold text-white mb-3">Quiz Accuracy & Health</h3>
          <p className="text-4xl font-bold text-white">{overview.averageRating || '96%'}</p>
          <div className="flex gap-0.5 my-2">
            {[1, 2, 3, 4, 5].map(i => (
              <span key={i} className="text-[24px]" style={{ color: i <= 4 ? THEME.colors.primary : THEME.colors.primaryLight }}>★</span>
            ))}
          </div>
          <p className="text-xs text-gray-400 font-medium">System Performance Score</p>
          <div className="mt-2 pt-2 border-t border-gray-600 flex items-center justify-between">
            <span className="text-xs font-bold text-white">Active Tournaments:</span>
            <span className="text-xs font-bold text-[#E94B4B]">
              {(overview.totalContests || 0).toLocaleString()}
            </span>
          </div>
        </Card>
      </div>

    </div>
  );
}
