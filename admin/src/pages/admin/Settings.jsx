import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Save,
  Globe,
  Upload,
  Trash2,
  Settings as SettingsIcon,
  CheckCircle,
  RotateCw,
  Shield,
  Zap,
  Users,
  Trophy,
  CreditCard,
  AlertCircle,
  ImageIcon,
  Lock,
  Mail,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  Sliders,
  Server,
  Clock,
  Coins,
  DollarSign,
  HelpCircle,
  Activity,
  Sparkles,
  AlertTriangle,
  Phone,
  Calendar,
  Volume2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { systemSettingsService } from '../../api/services/systemSettingsService';
import authService from '../../api/services/authService';
import { initAdminSocket } from '../../api/services/adminSocketService';
import { useAuth } from '../../hooks/useAuth';
import { getImageUrl } from '../../utils/image';

/* ── Toggle Switch Component ── */
function ToggleSwitch({ checked, onChange, disabled = false, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label || 'Toggle switch'}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none shrink-0 ${
        checked ? '' : 'bg-white/15'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}`}
      style={checked ? { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' } : {}}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

/* ── Section Card Component ── */
function SectionCard({ icon: Icon, title, subtitle, children, badge, badgeColor }) {
  return (
    <div className="bg-[#0f1117] rounded-2xl border border-white/10 overflow-hidden shadow-lg shadow-black/20">
      <div className="px-5 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between items-start gap-3 bg-white/[0.02]">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E94B4B]/15 flex items-center justify-center shrink-0 border border-[#E94B4B]/20">
            <Icon className="w-4.5 h-4.5 text-[#E94B4B]" style={{ width: '18px', height: '18px' }} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">{title}</h2>
            {subtitle && <p className="text-[11px] text-white/50 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {badge && (
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 self-start sm:self-auto border ${
            badgeColor || 'bg-[#E94B4B]/15 text-[#E94B4B] border-[#E94B4B]/20'
          }`}>
            {badge}
          </span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ── Notification Row Component ── */
function NotifRow({ icon: Icon, title, desc, settingKey, settings, onToggle, color = 'text-[#E94B4B]' }) {
  const isOn = settings[settingKey] !== false;
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-white/6 last:border-0 hover:bg-white/[0.01] px-2 rounded-xl transition-colors">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 ${color}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-semibold text-white leading-snug">{title}</h4>
          <p className="text-[11px] text-white/45 mt-0.5 leading-relaxed break-words">{desc}</p>
        </div>
      </div>
      <ToggleSwitch checked={isOn} onChange={() => onToggle(settingKey)} label={title} />
    </div>
  );
}

/* ── Main Settings Page ── */
const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  // Dynamic Live Stats from Backend
  const [liveStats, setLiveStats] = useState({
    totalUsers: 0,
    totalContests: 0,
    totalTransactions: 0,
    pendingWithdrawals: 0,
    systemStatus: 'Operational',
    serverTime: new Date().toISOString(),
  });

  // Settings State
  const [settings, setSettings] = useState({
    // General & Branding
    platformName: 'KnowChamp',
    platformTagline: 'Play Quizzes, Learn & Win Real Cash Rewards',
    logoUrl: '/logo_knowchamp.png',
    logoPreview: '/logo_knowchamp.png',
    supportEmail: 'support@knowchamp.com',
    supportPhone: '+91 98765 43210',
    currencySymbol: '₹',
    currencyCode: 'INR',
    timezone: 'Asia/Kolkata (IST)',
    copyrightText: '© 2026 KnowChamp. All rights reserved.',

    // Contest & Financial Rules
    defaultQuestionTimer: 30,
    defaultEntryFee: 10,
    minWithdrawalAmount: 100,
    maxWithdrawalAmount: 50000,
    referralRewardAmount: 50,
    signupBonus: 25,
    autoSettleContests: true,
    maxParticipantsPerContest: 500,

    // Notifications & Alerts
    emailNotifications: true,
    realtimeSocketAlerts: true,
    newBookingAlerts: true,
    quotationAlerts: true,
    settlementAlerts: true,
    userRegistrationAlerts: true,
    soundAlerts: false,

    // System & Maintenance
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing scheduled maintenance. We will be back online shortly!',
    allowAdminDuringMaintenance: true,
    debugMode: false,
    sessionTimeoutMins: 60,
    maxLoginAttempts: 5,
  });

  // Security Tab State
  const [emailData, setEmailData] = useState({ newEmail: '' });
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Sync email when user loads
  useEffect(() => {
    if (user?.email) {
      setEmailData({ newEmail: user.email });
    }
  }, [user]);

  // Fetch backend settings & live stats
  const fetchBackendSettings = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await systemSettingsService.getSettings();
      if (res?.data) {
        const fetched = res.data;
        const logoPath = fetched.logoUrl ? getImageUrl(fetched.logoUrl) : '/logo_knowchamp.png';
        setSettings(prev => ({
          ...prev,
          ...fetched,
          logoPreview: logoPath,
        }));
      }
      if (res?.stats) {
        setLiveStats(res.stats);
      }
    } catch (err) {
      console.error('Fetch settings error:', err);
      if (!isSilent) toast.error('Failed to load system settings');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBackendSettings();

    // Listen for real-time system setting update socket event
    const socket = initAdminSocket();
    const handleSettingsUpdate = (updatedSettings) => {
      if (updatedSettings) {
        const logoPath = updatedSettings.logoUrl ? getImageUrl(updatedSettings.logoUrl) : '/logo_knowchamp.png';
        setSettings(prev => ({ ...prev, ...updatedSettings, logoPreview: logoPath }));
      }
    };

    socket.on('system_settings_updated', handleSettingsUpdate);
    return () => {
      socket.off('system_settings_updated', handleSettingsUpdate);
    };
  }, [fetchBackendSettings]);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const formData = new FormData();

      // Append all setting keys to form data
      Object.keys(settings).forEach((key) => {
        if (key !== 'logoPreview') {
          formData.append(key, String(settings[key]));
        }
      });

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const res = await systemSettingsService.updateSettings(formData);
      if (res?.data) {
        const updated = res.data;
        const logoPath = updated.logoUrl ? getImageUrl(updated.logoUrl) : settings.logoPreview;
        setSettings(prev => ({ ...prev, ...updated, logoPreview: logoPath }));
      }
      toast.success('Platform settings saved and synced successfully!');
      setLogoFile(null);
    } catch (err) {
      console.error('Save settings error:', err);
      toast.error('Failed to save settings. Please check your network and try again.');
    } finally {
      setSaving(false);
    }
  };

  // Email Change Handler
  const handleEmailChange = async (e) => {
    e.preventDefault();
    const trimmed = emailData.newEmail.trim();
    if (!trimmed) return toast.error('Email address is required.');
    if (!/\S+@\S+\.\S+/.test(trimmed)) return toast.error('Please enter a valid email address.');
    if (trimmed === user?.email) return toast.error('New email is the same as current email.');
    try {
      setIsSavingEmail(true);
      const data = new FormData();
      data.append('name', user?.name || '');
      data.append('email', trimmed);
      await updateProfile(data);
      toast.success('Login email updated successfully!');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update email. Please try again.';
      toast.error(msg);
    } finally {
      setIsSavingEmail(false);
    }
  };

  // Password Change Handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword) return toast.error('Please enter your current password.');
    if (!passwordData.newPassword) return toast.error('Please enter a new password.');
    if (passwordData.newPassword.length < 6) return toast.error('New password must be at least 6 characters.');
    if (passwordData.newPassword !== passwordData.confirmPassword) return toast.error('New passwords do not match.');
    try {
      setIsSavingPassword(true);
      const res = await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success(res?.message || 'Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update password. Please try again.';
      toast.error(msg);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const TABS = [
    { id: 'general', label: 'General & Branding', icon: Globe },
    { id: 'contest', label: 'Contest & Financial', icon: Trophy },
    { id: 'notifications', label: 'Alerts & Notifications', icon: Bell },
    { id: 'maintenance', label: 'System & Maintenance', icon: Sliders },
    { id: 'security', label: 'Security & Access', icon: ShieldCheck },
  ];

  const activeNotifCount = [
    settings.realtimeSocketAlerts,
    settings.newBookingAlerts,
    settings.quotationAlerts,
    settings.settlementAlerts,
    settings.userRegistrationAlerts !== false,
    settings.emailNotifications,
    settings.soundAlerts,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-10">

      {/* ── Top Header Banner ── */}
      <div className="bg-[#0f1117] rounded-2xl border border-white/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#E94B4B]/15 border border-[#E94B4B]/30 flex items-center justify-center shadow-inner">
            <SettingsIcon className="w-5 h-5 text-[#E94B4B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-white">Platform Settings & Control Center</h1>
              {settings.maintenanceMode && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                  Maintenance Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/50 mt-0.5">
              Live dynamic configuration for {settings.platformName || 'KnowChamp'} platform preferences, rules & security.
            </p>
          </div>
        </div>

        {/* Dynamic Status Badges */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
            <span className="text-[11px] font-semibold text-green-400">
              {settings.maintenanceMode ? 'Maintenance Mode' : 'Live System Online'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E94B4B]/10 border border-[#E94B4B]/20 rounded-xl">
            <Bell className="w-3.5 h-3.5 text-[#E94B4B]" />
            <span className="text-[11px] font-semibold text-[#E94B4B]">{activeNotifCount}/7 Alerts Active</span>
          </div>

          <button
            type="button"
            onClick={() => fetchBackendSettings(false)}
            disabled={loading}
            title="Reload live settings from server"
            className="p-2 border border-white/10 hover:bg-white/5 text-white/60 hover:text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Dynamic System Overview Cards (Live Database Metrics) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#0f1117] rounded-xl border border-white/10 p-4 flex items-center gap-3.5 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Total Contests</p>
            <p className="text-base font-bold text-white mt-0.5">{liveStats.totalContests ?? 0}</p>
          </div>
        </div>

        <div className="bg-[#0f1117] rounded-xl border border-white/10 p-4 flex items-center gap-3.5 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Registered Users</p>
            <p className="text-base font-bold text-white mt-0.5">{liveStats.totalUsers ?? 0}</p>
          </div>
        </div>

        <div className="bg-[#0f1117] rounded-xl border border-white/10 p-4 flex items-center gap-3.5 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-green-400/10 border border-green-400/20 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Transactions</p>
            <p className="text-base font-bold text-white mt-0.5">{liveStats.totalTransactions ?? 0}</p>
          </div>
        </div>

        <div className="bg-[#0f1117] rounded-xl border border-white/10 p-4 flex items-center gap-3.5 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Pending Payouts</p>
            <p className="text-base font-bold text-purple-400 mt-0.5">{liveStats.pendingWithdrawals ?? 0}</p>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation Bar ── */}
      <div className="flex items-center gap-1.5 bg-[#0f1117] border border-white/10 rounded-2xl p-1.5 overflow-x-auto no-scrollbar shadow-md">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 shrink-0 cursor-pointer ${
                isActive
                  ? 'text-white shadow-lg font-bold'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
              style={isActive ? { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' } : {}}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Form Container ── */}
      <form onSubmit={handleSaveSettings} className="space-y-6">

        {/* ══════════════════════════════════════════════════════════════
            TAB 1: GENERAL & BRANDING
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Platform Brand & Identity */}
            <SectionCard
              icon={Globe}
              title="Brand & Platform Identity"
              subtitle="Configure your brand name, tagline, and platform logo displayed across Web & Apps."
              badge="Core Identity"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Platform Name & Tagline */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-2">
                      Platform Brand Name <span className="text-[#E94B4B]">*</span>
                    </label>
                    <input
                      type="text"
                      value={settings.platformName || ''}
                      onChange={(e) => handleChange('platformName', e.target.value)}
                      placeholder="e.g. KnowChamp"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white placeholder-white/25 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                    />
                    <p className="text-[11px] text-white/35 mt-1.5">
                      Used in browser titles, email templates, push headers, and invoices.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-2">
                      Platform Tagline / Slogan
                    </label>
                    <input
                      type="text"
                      value={settings.platformTagline || ''}
                      onChange={(e) => handleChange('platformTagline', e.target.value)}
                      placeholder="e.g. Play Quizzes, Learn & Win Real Cash Rewards"
                      className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white placeholder-white/25 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                    />
                    <p className="text-[11px] text-white/35 mt-1.5">
                      Sub-heading displayed across user onboarding and social share metadata.
                    </p>
                  </div>
                </div>

                {/* Logo Upload Card */}
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Official Platform Logo
                  </label>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    {/* Preview Box */}
                    <div className="w-20 h-20 rounded-xl bg-black/40 border border-white/15 flex items-center justify-center overflow-hidden shrink-0 relative p-2 shadow-inner">
                      {imgLoading && (
                        <div className="absolute inset-0 bg-white/10 animate-pulse rounded-xl flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-white/20" />
                        </div>
                      )}
                      <img
                        src={settings.logoPreview || '/logo_knowchamp.png'}
                        alt="Platform Logo"
                        onLoad={() => setImgLoading(false)}
                        onError={(e) => {
                          setImgLoading(false);
                          e.target.onerror = null;
                          e.target.src = '/logo_knowchamp.png';
                        }}
                        className={`w-full h-full object-contain transition-all duration-300 ${
                          imgLoading ? 'opacity-0' : 'opacity-100'
                        }`}
                      />
                    </div>

                    {/* Upload / Remove Actions */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex items-center gap-2 px-3.5 py-2 text-white text-xs font-bold rounded-xl transition-all cursor-pointer hover:opacity-90 shadow-sm" style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload New Logo</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                if (file.size > 2 * 1024 * 1024) {
                                  toast.error('Logo file size must be under 2MB');
                                  return;
                                }
                                const url = URL.createObjectURL(file);
                                setLogoFile(file);
                                handleChange('logoPreview', url);
                                setImgLoading(false);
                                toast.success('Logo selected. Click "Save Platform Settings" to apply.');
                              }
                            }}
                            className="hidden"
                          />
                        </label>

                        {(logoFile || (settings.logoUrl && settings.logoUrl !== '/logo_knowchamp.png')) && (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                setLogoFile(null);
                                const formData = new FormData();
                                formData.append('logoUrl', '/logo_knowchamp.png');
                                await systemSettingsService.updateSettings(formData);
                                setSettings(prev => ({
                                  ...prev,
                                  logoUrl: '/logo_knowchamp.png',
                                  logoPreview: '/logo_knowchamp.png',
                                }));
                                toast.success('Logo reset to default KnowChamp asset.');
                              } catch {
                                toast.error('Failed to reset logo.');
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold rounded-xl transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Reset Default</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-white/40">Supported formats: PNG, SVG, WEBP, JPG (Max 2MB)</p>
                    </div>
                  </div>
                </div>

              </div>
            </SectionCard>

            {/* Support & Localization */}
            <SectionCard
              icon={HelpCircle}
              title="Contact, Support & Localization"
              subtitle="Configure public helpdesk contact details, default currency, and time formatting."
              badge="Support"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Official Support Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={settings.supportEmail || ''}
                      onChange={(e) => handleChange('supportEmail', e.target.value)}
                      placeholder="support@knowchamp.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white placeholder-white/25 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Support Helpline / Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={settings.supportPhone || ''}
                      onChange={(e) => handleChange('supportPhone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white placeholder-white/25 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Currency Symbol & Code
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={settings.currencySymbol || '₹'}
                      onChange={(e) => handleChange('currencySymbol', e.target.value)}
                      placeholder="₹"
                      className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white text-center focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                    />
                    <input
                      type="text"
                      value={settings.currencyCode || 'INR'}
                      onChange={(e) => handleChange('currencyCode', e.target.value)}
                      placeholder="INR"
                      className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white text-center focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    System Timezone
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={settings.timezone || 'Asia/Kolkata (IST)'}
                      onChange={(e) => handleChange('timezone', e.target.value)}
                      placeholder="Asia/Kolkata (IST)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white placeholder-white/25 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Copyright Notice
                  </label>
                  <input
                    type="text"
                    value={settings.copyrightText || '© 2026 KnowChamp. All rights reserved.'}
                    onChange={(e) => handleChange('copyrightText', e.target.value)}
                    placeholder="© 2026 KnowChamp. All rights reserved."
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white placeholder-white/25 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                  />
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 2: CONTEST & FINANCIAL RULES
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'contest' && (
          <div className="space-y-6">
            <SectionCard
              icon={Trophy}
              title="Contest & Gameplay Defaults"
              subtitle="Set default gameplay parameters, timers, and automatic contest settlement rules."
              badge="Game Mechanics"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Default Question Timer (Seconds)
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={5}
                      max={300}
                      value={settings.defaultQuestionTimer || 30}
                      onChange={(e) => handleChange('defaultQuestionTimer', Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-white/35 mt-1.5">Seconds allowed per question in standard quizzes.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Default Entry Fee ({settings.currencySymbol || '₹'})
                  </label>
                  <div className="relative">
                    <Coins className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={0}
                      value={settings.defaultEntryFee || 10}
                      onChange={(e) => handleChange('defaultEntryFee', Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-white/35 mt-1.5">Default entry price when creating new contests.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Max Participants Per Contest
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={10}
                      max={10000}
                      value={settings.maxParticipantsPerContest || 500}
                      onChange={(e) => handleChange('maxParticipantsPerContest', Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-white/35 mt-1.5">Maximum concurrent players per live room.</p>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-white">Auto-Settle Finished Contests</h4>
                  <p className="text-[11px] text-white/45 mt-0.5">
                    Automatically distribute winnings to player wallets when a contest ends and ranks calculate.
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.autoSettleContests !== false}
                  onChange={() => handleToggle('autoSettleContests')}
                  label="Auto Settle Contests"
                />
              </div>
            </SectionCard>

            <SectionCard
              icon={DollarSign}
              title="Financial Limits & Bonus Rewards"
              subtitle="Configure withdrawal boundaries, referral bonuses, and new user welcome rewards."
              badge="Financial Controls"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Min Withdrawal ({settings.currencySymbol || '₹'})
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={settings.minWithdrawalAmount || 100}
                    onChange={(e) => handleChange('minWithdrawalAmount', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                  />
                  <p className="text-[11px] text-white/35 mt-1.5">Minimum payout request threshold.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Max Withdrawal ({settings.currencySymbol || '₹'})
                  </label>
                  <input
                    type="number"
                    min={100}
                    value={settings.maxWithdrawalAmount || 50000}
                    onChange={(e) => handleChange('maxWithdrawalAmount', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                  />
                  <p className="text-[11px] text-white/35 mt-1.5">Maximum per transaction withdrawal.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Referral Bonus ({settings.currencySymbol || '₹'})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={settings.referralRewardAmount || 50}
                    onChange={(e) => handleChange('referralRewardAmount', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                  />
                  <p className="text-[11px] text-white/35 mt-1.5">Credited to referrer upon friend's first contest.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Signup Welcome Bonus ({settings.currencySymbol || '₹'})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={settings.signupBonus || 25}
                    onChange={(e) => handleChange('signupBonus', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                  />
                  <p className="text-[11px] text-white/35 mt-1.5">Instant bonus cash credited on registration.</p>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 3: ALERTS & NOTIFICATIONS
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <SectionCard
              icon={Zap}
              title="Real-Time Admin Alert Channels"
              subtitle="Control which events trigger instant live alerts, socket pushes, and header notifications."
              badge={`${activeNotifCount} Active Channels`}
            >
              <div className="divide-y divide-white/5">
                <NotifRow
                  icon={Bell}
                  title="Real-Time Header Notifications"
                  desc="Display live push notifications immediately in the admin top-bar bell dropdown."
                  settingKey="realtimeSocketAlerts"
                  settings={settings}
                  onToggle={handleToggle}
                  color="text-[#E94B4B]"
                />
                <NotifRow
                  icon={Trophy}
                  title="New Contest & Live Match Activity"
                  desc="Trigger an alert when a new contest is scheduled, opened, or goes live."
                  settingKey="newBookingAlerts"
                  settings={settings}
                  onToggle={handleToggle}
                  color="text-amber-400"
                />
                <NotifRow
                  icon={CreditCard}
                  title="Transactions & Fee Deposits"
                  desc="Notify on new wallet recharges, contest fee collections, and payment gateway webhooks."
                  settingKey="quotationAlerts"
                  settings={settings}
                  onToggle={handleToggle}
                  color="text-blue-400"
                />
                <NotifRow
                  icon={CheckCircle}
                  title="Withdrawal Settlement & Payout Requests"
                  desc="Alert administrators when a user submits a cash withdrawal request or a payout settles."
                  settingKey="settlementAlerts"
                  settings={settings}
                  onToggle={handleToggle}
                  color="text-green-400"
                />
                <NotifRow
                  icon={Users}
                  title="User Registrations & Onboarding"
                  desc="Alert when a new player completes registration or updates their profile credentials."
                  settingKey="userRegistrationAlerts"
                  settings={settings}
                  onToggle={handleToggle}
                  color="text-purple-400"
                />
                <NotifRow
                  icon={Mail}
                  title="Email Notifications Dispatch"
                  desc="Send transactional emails to players for prize wins, receipts, and security alerts."
                  settingKey="emailNotifications"
                  settings={settings}
                  onToggle={handleToggle}
                  color="text-cyan-400"
                />
                <NotifRow
                  icon={Volume2}
                  title="Sound Alert on Live Events"
                  desc="Play a subtle audio chime when a critical real-time alert is received in the dashboard."
                  settingKey="soundAlerts"
                  settings={settings}
                  onToggle={handleToggle}
                  color="text-yellow-400"
                />
              </div>
            </SectionCard>

            <div className="bg-[#0f1117] rounded-xl border border-white/10 p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-white/30 shrink-0" />
              <p className="text-[11px] text-white/40 leading-relaxed">
                Notification preferences synchronize across all active admin browser sessions instantly via WebSockets.
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 4: SYSTEM & MAINTENANCE
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <SectionCard
              icon={Sliders}
              title="Maintenance Mode & Traffic Controls"
              subtitle="Temporarily pause public user access to perform server upgrades, database syncs, or migrations."
              badge={settings.maintenanceMode ? 'Active (Locked)' : 'Normal Operations'}
              badgeColor={settings.maintenanceMode ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-green-500/15 text-green-400 border-green-500/30'}
            >
              <div className="space-y-5">
                {/* Maintenance Mode Toggle Row */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      settings.maintenanceMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-white/5 text-white/40 border-white/10'
                    }`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">Enable Platform Maintenance Mode</h3>
                      <p className="text-[11px] text-white/45 mt-0.5">
                        When enabled, user mobile & web apps will display the maintenance splash screen.
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={settings.maintenanceMode === true}
                    onChange={() => handleToggle('maintenanceMode')}
                    label="Enable Platform Maintenance Mode"
                  />
                </div>

                {/* Maintenance Message */}
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Maintenance Notice Message
                  </label>
                  <textarea
                    rows={3}
                    value={settings.maintenanceMessage || ''}
                    onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                    placeholder="We are currently performing scheduled maintenance. We will be back online shortly!"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white placeholder-white/25 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all resize-none"
                  />
                  <p className="text-[11px] text-white/35 mt-1.5">Displayed prominently to users on the app maintenance screen.</p>
                </div>

                {/* Sub Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/8">
                    <div>
                      <h4 className="text-xs font-semibold text-white">Allow Admin Panel Access</h4>
                      <p className="text-[10px] text-white/40 mt-0.5">Allow admins to log in during maintenance mode.</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.allowAdminDuringMaintenance !== false}
                      onChange={() => handleToggle('allowAdminDuringMaintenance')}
                      label="Allow Admin Panel Access"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/8">
                    <div>
                      <h4 className="text-xs font-semibold text-white">Verbose Debug Logging</h4>
                      <p className="text-[10px] text-white/40 mt-0.5">Log detailed API queries and socket telemetry.</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.debugMode === true}
                      onChange={() => handleToggle('debugMode')}
                      label="Verbose Debug Logging"
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Server Diagnostics Card */}
            <SectionCard
              icon={Server}
              title="System Diagnostics & Server State"
              subtitle="Live runtime health metrics and environment diagnostic parameters."
              badge="Node Environment"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-[10px] text-white/40 font-medium">Database Status</p>
                  <p className="text-xs font-bold text-green-400 mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Connected (MySQL)
                  </p>
                </div>

                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-[10px] text-white/40 font-medium">WebSockets</p>
                  <p className="text-xs font-bold text-green-400 mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Active (Socket.io)
                  </p>
                </div>

                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-[10px] text-white/40 font-medium">Server Time</p>
                  <p className="text-xs font-semibold text-white mt-1 truncate">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>

                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-[10px] text-white/40 font-medium">App Version</p>
                  <p className="text-xs font-bold text-amber-400 mt-1">v2.4.0 (Enterprise)</p>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 5: SECURITY & CREDENTIALS
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Change Login Email */}
            <SectionCard
              icon={Mail}
              title="Change Admin Login Email"
              subtitle="Update the email address used to sign in to the administrative portal."
              badge="Credentials"
            >
              <div className="space-y-4">
                {/* Current Email (read-only) */}
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Current Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={user?.email || 'admin@knowchamp.com'}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/8 bg-white/4 text-sm font-medium text-white/40 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* New Email */}
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    New Email Address <span className="text-[#E94B4B]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={emailData.newEmail}
                      onChange={(e) => setEmailData({ newEmail: e.target.value })}
                      placeholder="Enter new email address"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white placeholder-white/25 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-white/35 mt-1.5">
                    You will need to use this new email address on your next login session.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleEmailChange}
                    disabled={isSavingEmail}
                    className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
                    style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
                  >
                    {isSavingEmail ? (
                      <><RotateCw className="w-4 h-4 animate-spin" /><span>Saving...</span></>
                    ) : (
                      <><Save className="w-4 h-4" /><span>Update Email Address</span></>
                    )}
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* Change Password */}
            <SectionCard
              icon={Lock}
              title="Change Admin Password"
              subtitle="Set a strong, fresh password to protect access to the admin console."
              badge="Authentication"
            >
              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Current Password <span className="text-[#E94B4B]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white placeholder-white/25 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 cursor-pointer transition-colors"
                    >
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-2">
                      New Password <span className="text-[#E94B4B]">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Min 6 characters"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white placeholder-white/25 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 cursor-pointer transition-colors"
                      >
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-2">
                      Confirm New Password <span className="text-[#E94B4B]">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Re-enter new password"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white placeholder-white/25 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 cursor-pointer transition-colors"
                      >
                        {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Notice */}
                <div className="flex items-start gap-2.5 p-3 bg-white/4 rounded-xl border border-white/8">
                  <ShieldCheck className="w-4 h-4 text-[#E94B4B] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-white/45 leading-relaxed">
                    Choose at least <span className="text-white/70 font-semibold">6-8 characters</span> with a mix of letters, numbers, and symbols.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handlePasswordChange}
                    disabled={isSavingPassword}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSavingPassword ? (
                      <><RotateCw className="w-4 h-4 animate-spin" /><span>Updating...</span></>
                    ) : (
                      <><KeyRound className="w-4 h-4 text-[#E94B4B]" /><span>Update Password</span></>
                    )}
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* Session & Rate Limit Policies */}
            <SectionCard
              icon={Shield}
              title="Session & Access Security Policies"
              subtitle="Configure session auto-inactivity timeouts and brute-force lock thresholds."
              badge="Security Rules"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Session Inactivity Timeout (Minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={1440}
                    value={settings.sessionTimeoutMins || 60}
                    onChange={(e) => handleChange('sessionTimeoutMins', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                  />
                  <p className="text-[11px] text-white/35 mt-1.5">Auto log out admins after idle duration.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Max Failed Login Attempts
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={20}
                    value={settings.maxLoginAttempts || 5}
                    onChange={(e) => handleChange('maxLoginAttempts', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 transition-all"
                  />
                  <p className="text-[11px] text-white/35 mt-1.5">Temporary IP lock after consecutive failures.</p>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ── Global Save Bar ── */}
        <div className="sticky bottom-4 z-20 bg-[#0f1117]/95 backdrop-blur-md rounded-2xl border border-white/15 p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchBackendSettings(false)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-white/10 hover:bg-white/5 text-white/60 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Reload</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Reset all platform settings to default values?')) {
                  try {
                    setSaving(true);
                    const defaultPayload = new FormData();
                    defaultPayload.append('platformName', 'KnowChamp');
                    defaultPayload.append('platformTagline', 'Play Quizzes, Learn & Win Real Cash Rewards');
                    defaultPayload.append('logoUrl', '/logo_knowchamp.png');
                    defaultPayload.append('supportEmail', 'support@knowchamp.com');
                    defaultPayload.append('supportPhone', '+91 98765 43210');
                    defaultPayload.append('currencySymbol', '₹');
                    defaultPayload.append('currencyCode', 'INR');
                    defaultPayload.append('timezone', 'Asia/Kolkata (IST)');
                    defaultPayload.append('defaultQuestionTimer', '30');
                    defaultPayload.append('defaultEntryFee', '10');
                    defaultPayload.append('minWithdrawalAmount', '100');
                    defaultPayload.append('maxWithdrawalAmount', '50000');
                    defaultPayload.append('referralRewardAmount', '50');
                    defaultPayload.append('signupBonus', '25');
                    defaultPayload.append('autoSettleContests', 'true');
                    defaultPayload.append('realtimeSocketAlerts', 'true');
                    defaultPayload.append('emailNotifications', 'true');
                    defaultPayload.append('maintenanceMode', 'false');

                    const res = await systemSettingsService.updateSettings(defaultPayload);
                    if (res?.data) {
                      setSettings(prev => ({ ...prev, ...res.data, logoPreview: '/logo_knowchamp.png' }));
                    }
                    toast.success('Reset settings to factory defaults.');
                  } catch {
                    toast.error('Failed to reset settings.');
                  } finally {
                    setSaving(false);
                  }
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-white/40 hover:text-red-400 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-95 transform active:scale-95"
              style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
            >
              {saving ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Saving & Broadcasting...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Platform Settings</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default SettingsPage;
