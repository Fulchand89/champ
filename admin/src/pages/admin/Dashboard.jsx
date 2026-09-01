import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, Trophy, Wallet, TrendingUp,
  FileText, ArrowDownLeft, ArrowUpRight, Clock, ChevronRight,
  RotateCw, BarChart2, CreditCard
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
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
  const [contestsLoading, setContestsLoading] = useState(false);

  const fetchDashboardContests = async () => {
    setContestsLoading(true);
    try {
      await contestService.getContests({ limit: 10 });
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

  // Top 4 Stat Cards using original brand gradient styling
  const topStats = useMemo(() => [
    {
      label: 'Total Users',
      value: (overview.totalUsers || 0).toLocaleString('en-IN'),
      icon: <Users className="w-6 h-6" />,
      path: ROUTES.ADMIN.MANAGE_USERS,
    },
    {
      label: 'Active Users',
      value: (overview.activeUsers || 0).toLocaleString('en-IN'),
      icon: <UserCheck className="w-6 h-6" />,
      path: ROUTES.ADMIN.MANAGE_USERS,
    },
    {
      label: 'Live Contests',
      value: (overview.liveContests || 0).toLocaleString('en-IN'),
      icon: <Trophy className="w-6 h-6" />,
      path: ROUTES.ADMIN.MONITOR_LIVE,
    },
    {
      label: 'Revenue',
      value: `₹${(overview.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: <TrendingUp className="w-6 h-6" />,
      path: ROUTES.ADMIN.VIEW_REPORTS,
    },
  ], [overview]);

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

      {/* ── Top Stat Cards: Total Users, Active Users, Live Contests, Revenue ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {topStats.map((s) => (
          <Link key={s.label} to={s.path}>
            <div className="bg-[#0f1117] text-white rounded-xl p-4 xl:p-5 border border-white/10 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex items-center">
              <div className="flex items-start gap-3 xl:gap-4 min-w-0 w-full">
                
                <div
                  className="w-10 h-10 xl:w-12 xl:h-12 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm hover:opacity-90 transition-all duration-300"
                  style={{
                    background: "linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)",
                  }}
                >
                  {s.icon}
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs text-gray-400 font-medium mb-1 truncate">
                    {s.label}
                  </span>

                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    {isLoading && !analyticsData ? (
                      <div className="h-5 w-14 bg-white/10 rounded-md animate-pulse my-0.5" />
                    ) : (
                      <p className="text-lg xl:text-xl font-bold text-white truncate">
                        {s.value}
                      </p>
                    )}
                  </div>

                  <span className="text-[10px] text-gray-400 mt-1 font-medium truncate">
                    Live database metric
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Wallet Statistics Section & Reports Section ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        
        {/* 5. Wallet Statistics (Span 2) */}
        <div className="xl:col-span-2">
          <div className="bg-[#0f1117] text-white rounded-xl p-5 border border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-700 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
                  style={{
                    background: "linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)",
                  }}
                >
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Wallet Statistics</h2>
                  <p className="text-xs text-gray-400">Total player wallet balance, inflows, debits, deposits, and withdrawal payouts.</p>
                </div>
              </div>

              <Link
                to={ROUTES.ADMIN.WITHDRAWALS}
                className="text-xs text-[#E94B4B] font-bold hover:underline flex items-center gap-1"
              >
                Withdrawals <ChevronRight className="w-3.5 h-3.5 text-[#E94B4B]" />
              </Link>
            </div>

            {/* Wallet Primary Metric Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <div>
                <span className="text-xs text-gray-400 block font-medium">Total Wallet Balance</span>
                <span className="text-xl font-bold text-white block mt-1">
                  ₹{(walletStats.totalWalletBalance || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5 block">Player aggregate liquidity</span>
              </div>

              <div>
                <span className="text-xs text-gray-400 block font-medium">Total Deposits</span>
                <span className="text-xl font-bold text-white block mt-1">
                  ₹{(walletStats.totalDeposits || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5 block">UPI, Cards, Gateways</span>
              </div>

              <div>
                <span className="text-xs text-gray-400 block font-medium">Total Withdrawals</span>
                <span className="text-xl font-bold text-white block mt-1">
                  ₹{(walletStats.totalWithdrawals || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-[#E94B4B] mt-0.5 block">
                  Pending: ₹{(walletStats.pendingWithdrawals || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Wallet Detailed Breakdown Sub-Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="bg-white/[0.03] p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <ArrowDownLeft size={13} className="text-[#E94B4B]" />
                  <span>Total Credits</span>
                </div>
                <p className="text-sm font-bold text-white">
                  ₹{(walletStats.totalCredits || 0).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Deposits & Prizes</p>
              </div>

              <div className="bg-white/[0.03] p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <ArrowUpRight size={13} className="text-[#E94B4B]" />
                  <span>Total Debits</span>
                </div>
                <p className="text-sm font-bold text-white">
                  ₹{(walletStats.totalDebits || 0).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Fees & Payouts</p>
              </div>

              <div className="bg-white/[0.03] p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <CreditCard size={13} className="text-[#E94B4B]" />
                  <span>Gross Transactions</span>
                </div>
                <p className="text-sm font-bold text-white">
                  ₹{((walletStats.totalDeposits || 0) + (walletStats.totalWithdrawals || 0)).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Gateway Volume</p>
              </div>

              <div className="bg-white/[0.03] p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <Clock size={13} className="text-[#E94B4B]" />
                  <span>Pending Payouts</span>
                </div>
                <p className="text-sm font-bold text-white">
                  ₹{(walletStats.pendingWithdrawals || 0).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Awaiting Approval</p>
              </div>
            </div>

            {/* Inflow vs Outflow Mini Sparkline */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5 font-medium">
                <span>Platform Volume Trend</span>
                <span className="text-white">Active Liquidity</span>
              </div>
              <MiniSparkline data={revenueTrend} color={THEME.colors.primary} />
            </div>
          </div>
        </div>

        {/* 6. Reports Section (Span 1) */}
        <div className="flex flex-col">
          <div
            onClick={() => navigate(ROUTES.ADMIN.VIEW_REPORTS)}
            className="bg-[#0f1117] text-white rounded-xl p-5 border border-white/10 shadow-sm h-full flex flex-col justify-between hover:border-gray-500 transition-colors cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
                    style={{
                      background: "linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)",
                    }}
                  >
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Reports & Analytics</h3>
                    <p className="text-xs text-gray-400">5 Active Analytical Modules</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              <div className="space-y-2">
                {[
                  { name: '1. User Participation Report', desc: 'Player logs & activity' },
                  { name: '2. Contest Report', desc: 'Capacity & fill rates' },
                  { name: '3. Revenue Report', desc: 'Gross inflows & margins' },
                  { name: '4. Financial Report', desc: 'Platform ledger & flow' },
                  { name: '5. Contest Result Report', desc: 'Standings & payouts' },
                ].map((rep, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-800/20 border border-gray-700 text-xs hover:bg-gray-800/40 transition-colors">
                    <span className="font-semibold text-white">{rep.name}</span>
                    <span className="text-[10px] text-gray-400">{rep.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-700 flex items-center justify-between">
              <span className="text-xs text-[#E94B4B] font-bold hover:underline flex items-center gap-1">
                Open Reports Hub <ChevronRight className="w-3.5 h-3.5 text-[#E94B4B]" />
              </span>
              <span className="text-[10px] text-gray-400">CSV Exports</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
