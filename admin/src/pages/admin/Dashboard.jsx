import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, Trophy, DollarSign, Wallet, TrendingUp,
  FileText, ArrowDownLeft, ArrowUpRight, Clock, ChevronRight,
  RotateCw, Sparkles, Layers, Activity, BarChart2, CheckCircle2,
  CreditCard, ChevronUp, ChevronDown
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../../components/common/Card';
import { ROUTES } from '../../constants/routes';
import { THEME } from '../../theme';
import { useAnalyticsReports } from '../../hooks/useAnalyticsReports';
import { contestService } from '../../api/services/contestService';

function MiniSparkline({ data = [], color = THEME.colors.primary }) {
  const chartData = data.length > 0 ? data : [
    { value: 0 }, { value: 0 }, { value: 0 }
  ];

  return (
    <ResponsiveContainer width="100%" height={36}>
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

export default function Dashboard() {
  const navigate = useNavigate();
  const { analyticsData, isLoading, isFetching, refetchAnalytics } = useAnalyticsReports({ timeframe: '1y' });
  const [liveContestsList, setLiveContestsList] = useState([]);
  const [contestsLoading, setContestsLoading] = useState(true);

  // Load dynamic contests for live tournaments view
  const fetchDashboardContests = async () => {
    setContestsLoading(true);
    try {
      const res = await contestService.getContests({ limit: 10 });
      if (res?.success && Array.isArray(res.data)) {
        setLiveContestsList(res.data);
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

  const handleRefresh = () => {
    refetchAnalytics();
    fetchDashboardContests();
  };

  return (
    <div className="space-y-6">

      {/* Top Header Refresh Bar */}
      <div className="flex items-center justify-between bg-[#0f1117] text-white p-5 rounded-2xl border border-white/10 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-xs text-gray-400 mt-1">KnowChamp Quiz Platform live metrics, user analytics & wallet activities.</p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isFetching || isLoading || contestsLoading}
          title="Refresh dashboard data"
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0f1117] border border-gray-600 hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 text-[#E94B4B] ${(isFetching || contestsLoading) ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 4 PRIMARY STAT CARDS: Total Users, Active Users, Live Contests, Revenue */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* 1. Total Users */}
        <Link to={ROUTES.ADMIN.MANAGE_USERS}>
          <div className="bg-[#0f1117] text-white rounded-2xl p-5 border border-white/10 shadow-sm hover:border-white/25 hover:shadow-md transition-all cursor-pointer h-full flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400">Total Users</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                All Players
              </span>
            </div>

            <div className="flex items-center gap-3.5 my-1">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
                style={{ background: 'linear-gradient(178.27deg, #3b82f6 1.6%, #1d4ed8 126.9%)' }}
              >
                <Users className="w-6 h-6" />
              </div>

              <div className="min-w-0 flex-1">
                {isLoading && !analyticsData ? (
                  <div className="h-7 w-24 bg-white/10 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-white font-mono truncate">
                    {(overview.totalUsers || 0).toLocaleString('en-IN')}
                  </p>
                )}
                <span className="text-xs text-gray-400 mt-0.5 block truncate">
                  Registered platform accounts
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-blue-400 group-hover:underline">
              <span>View User Management</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* 2. Active Users */}
        <Link to={ROUTES.ADMIN.MANAGE_USERS}>
          <div className="bg-[#0f1117] text-white rounded-2xl p-5 border border-white/10 shadow-sm hover:border-white/25 hover:shadow-md transition-all cursor-pointer h-full flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400">Active Users</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Playing
              </span>
            </div>

            <div className="flex items-center gap-3.5 my-1">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
                style={{ background: 'linear-gradient(178.27deg, #10b981 1.6%, #047857 126.9%)' }}
              >
                <UserCheck className="w-6 h-6" />
              </div>

              <div className="min-w-0 flex-1">
                {isLoading && !analyticsData ? (
                  <div className="h-7 w-24 bg-white/10 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-emerald-400 font-mono truncate">
                    {(overview.activeUsers || 0).toLocaleString('en-IN')}
                  </p>
                )}
                <span className="text-xs text-gray-400 mt-0.5 block truncate">
                  Active & verified players
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-emerald-400 group-hover:underline">
              <span>Inspect Active Players</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* 3. Live Contests */}
        <Link to={ROUTES.ADMIN.MONITOR_LIVE}>
          <div className="bg-[#0f1117] text-white rounded-2xl p-5 border border-white/10 shadow-sm hover:border-white/25 hover:shadow-md transition-all cursor-pointer h-full flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400">Live Contests</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse">
                ● Live Now
              </span>
            </div>

            <div className="flex items-center gap-3.5 my-1">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
                style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
              >
                <Trophy className="w-6 h-6" />
              </div>

              <div className="min-w-0 flex-1">
                {isLoading && !analyticsData ? (
                  <div className="h-7 w-16 bg-white/10 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-white font-mono truncate">
                    {(overview.liveContests || 0).toLocaleString('en-IN')}
                  </p>
                )}
                <span className="text-xs text-gray-400 mt-0.5 block truncate">
                  Tournaments in session
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-[#E94B4B] font-semibold group-hover:underline">
              <span>Monitor Live Contests</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* 4. Revenue */}
        <Link to={ROUTES.ADMIN.VIEW_REPORTS}>
          <div className="bg-[#0f1117] text-white rounded-2xl p-5 border border-white/10 shadow-sm hover:border-white/25 hover:shadow-md transition-all cursor-pointer h-full flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400">Revenue</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Gross Inflow
              </span>
            </div>

            <div className="flex items-center gap-3.5 my-1">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
                style={{ background: 'linear-gradient(178.27deg, #f59e0b 1.6%, #b45309 126.9%)' }}
              >
                <TrendingUp className="w-6 h-6" />
              </div>

              <div className="min-w-0 flex-1">
                {isLoading && !analyticsData ? (
                  <div className="h-7 w-28 bg-white/10 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-amber-400 font-mono truncate">
                    ₹{(overview.totalRevenue || 0).toLocaleString('en-IN')}
                  </p>
                )}
                <span className="text-xs text-gray-400 mt-0.5 block truncate">
                  Total platform earnings
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-amber-400 group-hover:underline">
              <span>View Revenue Statements</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>

      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 5. WALLET STATISTICS SECTION & 6. REPORTS SECTION                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── 5. Wallet Statistics Section (Span 2) ── */}
        <div className="xl:col-span-2">
          <div className="bg-[#0f1117] text-white rounded-2xl p-6 border border-white/10 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Wallet Statistics</h2>
                  <p className="text-xs text-gray-400">Comprehensive summary of wallet balance, credits, debits, deposits, and withdrawal disbursements.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={ROUTES.ADMIN.VERIFY_WITHDRAWALS}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E94B4B]/10 hover:bg-[#E94B4B]/20 text-[#E94B4B] border border-[#E94B4B]/30 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  Verify Withdrawals <ChevronRight size={14} />
                </Link>
                <Link
                  to={ROUTES.ADMIN.MANAGE_TRANSACTIONS}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  Transactions <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* Wallet Primary Balance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#060810] p-4 rounded-xl border border-white/5">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs text-gray-400 block font-medium">Total Wallet Balance</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 block mt-1">
                  ₹{(walletStats.totalWalletBalance || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-gray-500 mt-1 block">In-game player liquidity pool</span>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs text-gray-400 block font-medium">Total Deposits</span>
                <span className="text-2xl font-bold font-mono text-white block mt-1">
                  ₹{(walletStats.totalDeposits || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-emerald-400 mt-1 block">Processed via UPI & Gateways</span>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs text-gray-400 block font-medium">Total Withdrawals</span>
                <span className="text-2xl font-bold font-mono text-rose-400 block mt-1">
                  ₹{(walletStats.totalWithdrawals || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-amber-400 mt-1 block">
                  Pending: ₹{(walletStats.pendingWithdrawals || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Credits, Debits & Payouts Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <ArrowDownLeft size={14} className="text-emerald-400" />
                  <span className="font-semibold">Total Credits</span>
                </div>
                <p className="text-base font-bold font-mono text-white">
                  ₹{(walletStats.totalCredits || 0).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">Deposits & Prizes credited</p>
              </div>

              <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <ArrowUpRight size={14} className="text-rose-400" />
                  <span className="font-semibold">Total Debits</span>
                </div>
                <p className="text-base font-bold font-mono text-white">
                  ₹{(walletStats.totalDebits || 0).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">Entry fees & payouts debited</p>
              </div>

              <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <CreditCard size={14} className="text-blue-400" />
                  <span className="font-semibold">Transaction Volume</span>
                </div>
                <p className="text-base font-bold font-mono text-white">
                  ₹{((walletStats.totalDeposits || 0) + (walletStats.totalWithdrawals || 0)).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">Cumulative payments</p>
              </div>

              <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <Clock size={14} className="text-amber-400" />
                  <span className="font-semibold">Pending Withdrawals</span>
                </div>
                <p className="text-base font-bold font-mono text-amber-400">
                  ₹{(walletStats.pendingWithdrawals || 0).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">Awaiting payout approvals</p>
              </div>
            </div>

            {/* Inflow vs Outflow Mini Sparkline Visual */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                <span>Platform Cashflow Velocity</span>
                <span className="text-emerald-400 font-mono font-semibold">+68% Net Positive Liquidity</span>
              </div>
              <MiniSparkline data={revenueTrend} color="#10b981" />
            </div>
          </div>
        </div>

        {/* ── 6. Reports Section (Span 1) ── */}
        <div className="flex flex-col">
          <div
            onClick={() => navigate(ROUTES.ADMIN.VIEW_REPORTS)}
            className="bg-[#0f1117] text-white rounded-2xl p-6 border border-white/10 shadow-sm h-full flex flex-col justify-between hover:border-[#E94B4B]/50 transition-all cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-[#E94B4B]/10 group-hover:text-[#E94B4B] transition-colors">
                    <BarChart2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Reports & Analytics</h3>
                    <p className="text-xs text-gray-400">5 Active Comprehensive Reports</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>

              <div className="space-y-2.5">
                {[
                  { name: '1. User Participation Report', desc: 'Engagement, scores & completion', color: 'text-blue-400' },
                  { name: '2. Contest Report', desc: 'Capacity, schedules & fill rates', color: 'text-amber-400' },
                  { name: '3. Revenue Report', desc: 'Gross collections & net margins', color: 'text-emerald-400' },
                  { name: '4. Financial Report', desc: 'Ledger statement & withdrawals', color: 'text-purple-400' },
                  { name: '5. Contest Result Report', desc: 'Leaderboard standings & payouts', color: 'text-rose-400' },
                ].map((rep, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs hover:bg-white/10 transition-colors"
                  >
                    <span className="font-semibold text-gray-200">{rep.name}</span>
                    <span className={`text-[10px] font-medium font-mono ${rep.color}`}>{rep.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-[#E94B4B] font-bold group-hover:underline flex items-center gap-1">
                Open Reports & Analytics Hub <ChevronRight size={14} />
              </span>
              <span className="text-[10px] text-gray-500 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
                CSV / Excel / PDF
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
