import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Layers, HelpCircle, CreditCard, Gift, Trophy,
  ChevronRight, Wallet, TrendingUp, RotateCw, Sparkles, Loader2
} from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { PieChart, Pie, Cell } from 'recharts'
import Card from '../../components/common/Card'
import Badge from '../../components/ui/Badge'
import { ROUTES } from '../../constants/routes'
import { THEME } from '../../theme'
import { useAnalyticsReports } from '../../hooks/useAnalyticsReports'
import { contestService } from '../../api/services/contestService'

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
  )
}

const QUICK_ACTIONS = [
  { label: 'Create New Contest', desc: 'Configure & launch a quiz contest', path: ROUTES.ADMIN.CREATE_CONTEST, icon: <Trophy className="w-5 h-5" /> },
  { label: 'Upload Questions', desc: 'Import bulk questions via CSV', path: ROUTES.ADMIN.UPLOAD_QUESTIONS, icon: <Sparkles className="w-5 h-5" /> },
  { label: 'Verify Withdrawals', desc: 'Process pending user withdrawals', path: ROUTES.ADMIN.VERIFY_WITHDRAWALS, icon: <Wallet className="w-5 h-5" /> },
  { label: 'Manage Quiz Categories', desc: 'Manage subjects, topics & categories', path: ROUTES.ADMIN.QUIZ_CATEGORIES, icon: <Layers className="w-5 h-5" /> },
  { label: 'View Platform Reports', desc: 'Download analytical reports', path: ROUTES.ADMIN.VIEW_REPORTS, icon: <TrendingUp className="w-5 h-5" /> },
]

export default function Dashboard() {
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
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    totalCustomers: 0,
    totalDrivers: 0,
    totalRewardPoints: 0,
    averageRating: '100%'
  }, [analyticsData]);

  const revenueTrend = useMemo(() => analyticsData?.revenueTrend || [
    { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }
  ], [analyticsData]);

  const topStats = useMemo(() => [
    { label: 'Total Users', value: (overview.totalCustomers || 0).toLocaleString(), icon: <Users className="w-6 h-6" />, path: ROUTES.ADMIN.MANAGE_USERS },
    { label: 'Total Categories', value: (overview.totalDrivers || 0).toLocaleString(), icon: <Layers className="w-6 h-6" />, path: ROUTES.ADMIN.QUIZ_CATEGORIES },
    { label: 'Total Questions', value: (overview.totalOrders || 0).toLocaleString(), icon: <HelpCircle className="w-6 h-6" />, path: ROUTES.ADMIN.QUESTION_BANK },
    { label: 'Total Transactions', value: `₹${(overview.totalRevenue || 0).toLocaleString('en-IN')}`, icon: <CreditCard className="w-6 h-6" />, path: ROUTES.ADMIN.MANAGE_TRANSACTIONS },
    { label: 'Total Prize Pool', value: `₹${(overview.totalRewardPoints || 0).toLocaleString('en-IN')}`, icon: <Gift className="w-6 h-6" />, path: ROUTES.ADMIN.CONFIGURE_PRIZE_POOL },
  ], [overview]);

  const handleRefresh = () => {
    refetchAnalytics();
    fetchDashboardContests();
  };

  return (
    <div className="space-y-3 sm:space-y-6">

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

      {/* Top stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-6">
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-6">
        {/* Recent Contests */}
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

        {/* Quick Actions */}
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

      {/* Bottom row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6 items-start">
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

        {/* Transaction Overview */}
        <Card>
          <h3 className="font-semibold text-white mb-2">Transaction Overview</h3>
          <p className="text-2xl font-bold text-white">₹{(overview.totalRevenue || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400 mb-4 font-medium">Total Volume</p>
          <MiniSparkline data={revenueTrend} color={THEME.colors.primary} />
        </Card>

        {/* Total Prize Pool */}
        <Card>
          <h3 className="font-semibold text-white mb-2">Total Prize Pool</h3>
          <p className="text-2xl font-bold text-white">₹{(overview.totalRewardPoints || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400 mb-4 font-medium">Prize Pool Distributed</p>
          <MiniSparkline data={revenueTrend.map(d => ({ ...d, value: Math.round((d.value || 0) * 0.04) }))} color={THEME.colors.primary} />
        </Card>

        {/* Quiz Performance Overview */}
        <Card>
          <h3 className="font-semibold text-white mb-3">Quiz Performance Overview</h3>
          <p className="text-4xl font-bold text-white">{overview.averageRating || '100%'}</p>
          <div className="flex gap-0.5 my-2">
            {[1, 2, 3, 4, 5].map(i => (
              <span key={i} className="text-[24px]" style={{ color: i <= 4 ? THEME.colors.primary : THEME.colors.primaryLight }}>★</span>
            ))}
          </div>
          <p className="text-xs text-gray-400 font-medium">Average Success Rate</p>
          <div className="mt-2 pt-2 border-t border-gray-600 flex items-center justify-between">
            <span className="text-xs font-bold text-white">Total Quiz Attempts:</span>
            <span className="text-xs font-bold text-[#E94B4B]">
              {(overview.completedOrders || 0).toLocaleString()}
            </span>
          </div>
        </Card>
      </div>
    </div>
  )
}
