import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Save,
  RotateCw,
  Coins,
  CreditCard,
  Trophy,
  Sliders,
  Globe,
  Upload,
  Trash2,
  Clock,
  Users,
  ShieldCheck,
  AlertCircle,
  ImageIcon,
  Mail,
  Phone,
  Calendar,
  Zap,
  CheckCircle2,
  DollarSign,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { systemSettingsService } from '../../api/services/systemSettingsService';
import { initAdminSocket } from '../../api/services/adminSocketService';
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
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {badge && (
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 self-start sm:self-auto border ${
              badgeColor || 'bg-[#E94B4B]/15 text-[#E94B4B] border-[#E94B4B]/20'
            }`}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState(
    tabParam && ['deposit-limits', 'withdrawal-limits', 'contest-rules', 'platform-settings'].includes(tabParam)
      ? tabParam
      : 'deposit-limits'
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  // Settings State for the 4 sections
  const [settings, setSettings] = useState({
    // ── 1. Deposit Limits ──
    minDepositAmount: 10,
    maxDepositAmount: 50000,
    dailyDepositLimit: 100000,
    monthlyDepositLimit: 1000000,
    maxDepositTxnCountPerDay: 10,
    depositBonusPercent: 0,
    maxDepositBonusAmount: 500,
    autoCreditDeposits: true,
    allowUpiDeposit: true,
    allowCardDeposit: true,
    allowNetbankingDeposit: true,
    allowWalletDeposit: true,

    // ── 2. Withdrawal Limits ──
    minWithdrawalAmount: 100,
    maxWithdrawalAmount: 25000,
    dailyWithdrawalLimit: 50000,
    monthlyWithdrawalLimit: 500000,
    maxFreeWithdrawalsPerMonth: 5,
    withdrawalProcessingFeePercent: 0,
    kycRequiredThreshold: 1000,
    autoApproveWithdrawalsUnder: 0,
    withdrawalCooldownHours: 24,

    // ── 3. Contest Rules ──
    defaultQuestionTimer: 30,
    defaultEntryFee: 10,
    maxParticipantsPerContest: 500,
    minParticipantsToStart: 2,
    autoCancelLowParticipation: true,
    tieBreakerRule: 'speed_submission',
    autoSettleContests: true,
    lateJoinWindowSeconds: 10,
    negativeMarking: false,
    negativeMarkingPoints: 0.25,
    shuffleQuestions: true,

    // ── 4. Platform Settings ──
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
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing scheduled maintenance. We will be back online shortly!',
    allowAdminDuringMaintenance: true,
    realtimeSocketSync: true,
  });

  // Sync tab param if search params change
  useEffect(() => {
    if (tabParam && ['deposit-limits', 'withdrawal-limits', 'contest-rules', 'platform-settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (id) => {
    setActiveTab(id);
    setSearchParams({ tab: id });
  };

  // Fetch backend settings
  const fetchSettings = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await systemSettingsService.getSettings();
      if (res?.data) {
        const fetched = res.data;
        const logoPath = fetched.logoUrl ? getImageUrl(fetched.logoUrl) : '/logo_knowchamp.png';
        setSettings((prev) => ({
          ...prev,
          ...fetched,
          logoPreview: logoPath,
        }));
      }
    } catch (err) {
      console.error('Fetch settings error:', err);
      if (!isSilent) toast.error('Failed to load settings');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    const socket = initAdminSocket();
    const handleSettingsUpdate = (updatedSettings) => {
      if (updatedSettings) {
        const logoPath = updatedSettings.logoUrl ? getImageUrl(updatedSettings.logoUrl) : '/logo_knowchamp.png';
        setSettings((prev) => ({ ...prev, ...updatedSettings, logoPreview: logoPath }));
      }
    };

    socket.on('system_settings_updated', handleSettingsUpdate);
    return () => {
      socket.off('system_settings_updated', handleSettingsUpdate);
    };
  }, [fetchSettings]);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const formData = new FormData();

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
        setSettings((prev) => ({ ...prev, ...updated, logoPreview: logoPath }));
      }
      toast.success('Settings saved and synced successfully!');
      setLogoFile(null);
    } catch (err) {
      console.error('Save settings error:', err);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'deposit-limits', label: 'Deposit Limits', icon: Coins },
    { id: 'withdrawal-limits', label: 'Withdrawal Limits', icon: CreditCard },
    { id: 'contest-rules', label: 'Contest Rules', icon: Trophy },
    { id: 'platform-settings', label: 'Platform Settings', icon: Sliders },
  ];

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-12">
      {/* ── Page Header ── */}
      <div className="bg-[#0f1117] text-white p-5 rounded-2xl shadow-sm border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold">Settings</h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure deposit limits, withdrawal parameters, Contest gameplay rules, and platform preferences.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => fetchSettings(false)}
            disabled={loading}
            title="Reload settings"
            className="p-2 border border-white/10 hover:bg-white/5 text-white/60 hover:text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="flex items-center gap-1.5 bg-[#0f1117] border border-white/10 rounded-2xl p-1.5 overflow-x-auto no-scrollbar shadow-md">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 shrink-0 cursor-pointer ${
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

      {/* ── Tab Content Forms ── */}
      <form onSubmit={handleSaveSettings} className="space-y-6">

        {/* ══════════════════════════════════════════════════════════════
            SECTION 1: DEPOSIT LIMITS
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'deposit-limits' && (
          <div className="space-y-6">
            <SectionCard
              icon={Coins}
              title="Deposit Amount Boundaries"
              subtitle="Set allowable deposit amount thresholds for player wallet additions."
              badge="Financial Controls"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Min Deposit Amount ({settings.currencySymbol || '₹'}) <span className="text-[#E94B4B]">*</span>
                  </label>
                  <div className="relative">
                    <Coins className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={1}
                      value={settings.minDepositAmount ?? 10}
                      onChange={(e) => handleChange('minDepositAmount', Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">Minimum single transaction deposit allowed.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Max Deposit Amount ({settings.currencySymbol || '₹'}) <span className="text-[#E94B4B]">*</span>
                  </label>
                  <div className="relative">
                    <Coins className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={100}
                      value={settings.maxDepositAmount ?? 50000}
                      onChange={(e) => handleChange('maxDepositAmount', Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">Maximum single transaction deposit cap.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Daily Deposit Limit ({settings.currencySymbol || '₹'})
                  </label>
                  <input
                    type="number"
                    min={500}
                    value={settings.dailyDepositLimit ?? 100000}
                    onChange={(e) => handleChange('dailyDepositLimit', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">Max total deposits per user per 24 hours.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Monthly Deposit Limit ({settings.currencySymbol || '₹'})
                  </label>
                  <input
                    type="number"
                    min={1000}
                    value={settings.monthlyDepositLimit ?? 1000000}
                    onChange={(e) => handleChange('monthlyDepositLimit', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">Monthly cumulative deposit ceiling per user.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6 pt-5 border-t border-white/10">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Daily Max Deposit Txn Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={settings.maxDepositTxnCountPerDay ?? 10}
                    onChange={(e) => handleChange('maxDepositTxnCountPerDay', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">Max number of deposit attempts allowed per day.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Promotional Deposit Bonus (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={settings.depositBonusPercent ?? 0}
                    onChange={(e) => handleChange('depositBonusPercent', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">Extra promotional bonus cash percentage credited on deposit.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Max Bonus Cap per Deposit ({settings.currencySymbol || '₹'})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={settings.maxDepositBonusAmount ?? 500}
                    onChange={(e) => handleChange('maxDepositBonusAmount', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">Upper cap on bonus cash credited per transaction.</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={Zap}
              title="Deposit Gateway & Verification Rules"
              subtitle="Configure payment methods and automated deposit settlement rules."
              badge="Automation"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 py-2 border-b border-white/6">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Instant Auto-Credit Wallet on Success</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Instantly credit player deposit balance upon payment gateway webhook confirmation.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.autoCreditDeposits !== false}
                    onChange={() => handleToggle('autoCreditDeposits')}
                    label="Auto Credit Deposits"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 py-2 border-b border-white/6">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Allow UPI Payments (GPay, PhonePe, Paytm)</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Enable UPI QR code and intent flow on deposit checkout.</p>
                  </div>
                  <ToggleSwitch
                    checked={settings.allowUpiDeposit !== false}
                    onChange={() => handleToggle('allowUpiDeposit')}
                    label="Allow UPI Deposit"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 py-2 border-b border-white/6">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Allow Debit & Credit Card Deposits</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Support Visa, Mastercard, and RuPay cards for wallet load.</p>
                  </div>
                  <ToggleSwitch
                    checked={settings.allowCardDeposit !== false}
                    onChange={() => handleToggle('allowCardDeposit')}
                    label="Allow Card Deposit"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 py-2">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Allow Net Banking & Wallet Gateway</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Support major Indian banks and payment wallets.</p>
                  </div>
                  <ToggleSwitch
                    checked={settings.allowNetbankingDeposit !== false}
                    onChange={() => handleToggle('allowNetbankingDeposit')}
                    label="Allow Net Banking Deposit"
                  />
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            SECTION 2: WITHDRAWAL LIMITS
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'withdrawal-limits' && (
          <div className="space-y-6">
            <SectionCard
              icon={CreditCard}
              title="Withdrawal Caps & Boundaries"
              subtitle="Configure minimum, maximum single payout, daily and monthly withdrawal limits."
              badge="Payout Rules"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Min Withdrawal ({settings.currencySymbol || '₹'}) <span className="text-[#E94B4B]">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={10}
                      value={settings.minWithdrawalAmount ?? 100}
                      onChange={(e) => handleChange('minWithdrawalAmount', Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">Minimum balance required to request a payout.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Max Single Withdrawal ({settings.currencySymbol || '₹'}) <span className="text-[#E94B4B]">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={100}
                      value={settings.maxWithdrawalAmount ?? 25000}
                      onChange={(e) => handleChange('maxWithdrawalAmount', Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">Maximum amount per single withdrawal request.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Daily Withdrawal Cap ({settings.currencySymbol || '₹'})
                  </label>
                  <input
                    type="number"
                    min={500}
                    value={settings.dailyWithdrawalLimit ?? 50000}
                    onChange={(e) => handleChange('dailyWithdrawalLimit', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">Total maximum payout allowed per player in 24 hours.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Monthly Withdrawal Cap ({settings.currencySymbol || '₹'})
                  </label>
                  <input
                    type="number"
                    min={1000}
                    value={settings.monthlyWithdrawalLimit ?? 500000}
                    onChange={(e) => handleChange('monthlyWithdrawalLimit', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">Cumulative monthly withdrawal limit per user account.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6 pt-5 border-t border-white/10">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Max Free Withdrawals / Month
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={settings.maxFreeWithdrawalsPerMonth ?? 5}
                    onChange={(e) => handleChange('maxFreeWithdrawalsPerMonth', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">Monthly free withdrawal count before processing fee applies.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Withdrawal Fee / TDS (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={settings.withdrawalProcessingFeePercent ?? 0}
                    onChange={(e) => handleChange('withdrawalProcessingFeePercent', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">Deduction rate on net prize winnings or excess requests.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Withdrawal Cooldown Period (Hours)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={72}
                    value={settings.withdrawalCooldownHours ?? 24}
                    onChange={(e) => handleChange('withdrawalCooldownHours', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">Hours to wait between consecutive withdrawal submissions.</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={ShieldCheck}
              title="Verification & Compliance Rules"
              subtitle="Enforce KYC identification thresholds and automated verification rules."
              badge="Compliance"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Mandatory KYC Threshold ({settings.currencySymbol || '₹'})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={settings.kycRequiredThreshold ?? 1000}
                    onChange={(e) => handleChange('kycRequiredThreshold', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">Withdrawals equal or above this amount strictly require verified PAN / Aadhaar.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Auto-Approve Threshold ({settings.currencySymbol || '₹'})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={settings.autoApproveWithdrawalsUnder ?? 0}
                    onChange={(e) => handleChange('autoApproveWithdrawalsUnder', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">Instant payout for verified accounts under this amount (Set 0 for manual approval).</p>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            SECTION 3: CONTEST RULES
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'contest-rules' && (
          <div className="space-y-6">
            <SectionCard
              icon={Trophy}
              title="Gameplay & Timer Settings"
              subtitle="Define default question timers, participant capacities, and late join policies."
              badge="Game Mechanics"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Default Question Timer (Seconds) <span className="text-[#E94B4B]">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={5}
                      max={300}
                      value={settings.defaultQuestionTimer ?? 30}
                      onChange={(e) => handleChange('defaultQuestionTimer', Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">Default timer per question in quiz rooms.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Default Entry Fee ({settings.currencySymbol || '₹'})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={settings.defaultEntryFee ?? 10}
                    onChange={(e) => handleChange('defaultEntryFee', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">Default entry price for new contests.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Max Participants / Room
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={2}
                      max={10000}
                      value={settings.maxParticipantsPerContest ?? 500}
                      onChange={(e) => handleChange('maxParticipantsPerContest', Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">Room player capacity ceiling.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Min Participants to Start
                  </label>
                  <input
                    type="number"
                    min={2}
                    value={settings.minParticipantsToStart ?? 2}
                    onChange={(e) => handleChange('minParticipantsToStart', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">Minimum players required before contest starts.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6 pt-5 border-t border-white/10">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Tie-Breaker Rule Policy
                  </label>
                  <select
                    value={settings.tieBreakerRule || 'speed_submission'}
                    onChange={(e) => handleChange('tieBreakerRule', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] cursor-pointer"
                  >
                    <option value="speed_submission">Fastest Answering Speed Wins (Recommended)</option>
                    <option value="equal_split">Split Prize Pool Equally Among Tied Players</option>
                    <option value="accuracy_priority">Accuracy Rate First, Then Submission Speed</option>
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1.5">Leaderboard resolution policy when participants achieve identical scores.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Late Join Window (Seconds)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={settings.lateJoinWindowSeconds ?? 10}
                    onChange={(e) => handleChange('lateJoinWindowSeconds', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">Grace period in seconds to join after countdown begins.</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={ShieldCheck}
              title="Fair-Play & Settlement Rules"
              subtitle="Configure anti-cheat protections, automatic prize settlement, and cancellation refunds."
              badge="Fair Play"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 py-2 border-b border-white/6">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Auto-Settle Finished Contests & Distribute Winnings</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Automatically calculate rankings and credit winnings directly to user wallets upon contest completion.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.autoSettleContests !== false}
                    onChange={() => handleToggle('autoSettleContests')}
                    label="Auto Settle Contests"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 py-2 border-b border-white/6">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Randomize & Shuffle Questions / Options</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Prevent screen mirroring and collusion by shuffling question and option orders per player.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.shuffleQuestions !== false}
                    onChange={() => handleToggle('shuffleQuestions')}
                    label="Shuffle Questions"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 py-2 border-b border-white/6">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Auto-Cancel & 100% Refund on Low Participation</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Automatically cancel contest and refund entry fee if minimum player threshold is not reached.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.autoCancelLowParticipation !== false}
                    onChange={() => handleToggle('autoCancelLowParticipation')}
                    label="Auto Cancel Low Participation"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 py-2">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Enable Negative Marking Penalty</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Deduct points ({settings.negativeMarkingPoints || 0.25} pts) for incorrect answer submissions.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.negativeMarking === true}
                    onChange={() => handleToggle('negativeMarking')}
                    label="Negative Marking"
                  />
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            SECTION 4: PLATFORM SETTINGS
           ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'platform-settings' && (
          <div className="space-y-6">
            <SectionCard
              icon={Globe}
              title="Brand Identity & Assets"
              subtitle="Manage official platform name, tagline, and brand logo."
              badge="Identity"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
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
                      className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white placeholder-white/25 focus:outline-none focus:border-[#E94B4B] transition-all"
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5">Shown across app title bar, browser headers, and system notifications.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-2">
                      Platform Tagline
                    </label>
                    <input
                      type="text"
                      value={settings.platformTagline || ''}
                      onChange={(e) => handleChange('platformTagline', e.target.value)}
                      placeholder="e.g. Play Quizzes, Learn & Win Real Cash Rewards"
                      className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white placeholder-white/25 focus:outline-none focus:border-[#E94B4B] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Official Platform Logo
                  </label>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
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

                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <label
                          className="inline-flex items-center gap-2 px-3.5 py-2 text-white text-xs font-bold rounded-xl transition-all cursor-pointer hover:opacity-90 shadow-sm"
                          style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
                        >
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
                                toast.success('Logo selected. Click "Save Settings" to apply.');
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
                                setSettings((prev) => ({
                                  ...prev,
                                  logoUrl: '/logo_knowchamp.png',
                                  logoPreview: '/logo_knowchamp.png',
                                }));
                                toast.success('Logo reset to default.');
                              } catch {
                                toast.error('Failed to reset logo.');
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold rounded-xl transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Reset</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400">Supported formats: PNG, SVG, WEBP, JPG (Max 2MB)</p>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={Sliders}
              title="System Operations & Maintenance"
              subtitle="Configure maintenance mode window, socket synchronization, and currency."
              badge="Operations"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                      className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white text-center focus:outline-none focus:border-[#E94B4B] transition-all"
                    />
                    <input
                      type="text"
                      value={settings.currencyCode || 'INR'}
                      onChange={(e) => handleChange('currencyCode', e.target.value)}
                      placeholder="INR"
                      className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white text-center focus:outline-none focus:border-[#E94B4B] transition-all"
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    Copyright Notice
                  </label>
                  <input
                    type="text"
                    value={settings.copyrightText || '© 2026 KnowChamp. All rights reserved.'}
                    onChange={(e) => handleChange('copyrightText', e.target.value)}
                    placeholder="© 2026 KnowChamp. All rights reserved."
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:border-[#E94B4B] transition-all"
                  />
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between gap-4 py-2 border-b border-white/6">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Maintenance Mode</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Show maintenance message on user mobile app and disable new contest entries.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.maintenanceMode === true}
                    onChange={() => handleToggle('maintenanceMode')}
                    label="Maintenance Mode"
                  />
                </div>

                {settings.maintenanceMode && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <label className="block text-xs font-semibold text-amber-400 mb-1.5">
                      Maintenance Banner Message
                    </label>
                    <textarea
                      rows={2}
                      value={settings.maintenanceMessage || ''}
                      onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                      placeholder="Enter maintenance message displayed to users..."
                      className="w-full px-3.5 py-2 rounded-lg border border-amber-500/30 bg-black/40 text-xs text-white placeholder-white/25 focus:outline-none focus:border-amber-400 transition-all resize-none"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 py-2">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Real-Time Socket Sync</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Broadcast real-time setting updates, live contestant counts, and contest leaderboards.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={settings.realtimeSocketSync !== false}
                    onChange={() => handleToggle('realtimeSocketSync')}
                    label="Realtime Socket Sync"
                  />
                </div>
              </div>
            </SectionCard>
          </div>
        )}

      </form>
    </div>
  );
};

export default Settings;
