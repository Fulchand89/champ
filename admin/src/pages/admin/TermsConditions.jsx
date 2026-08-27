import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  UserCheck,
  Trophy,
  Save,
  CheckCircle2,
  History,
  Clock,
  Plus,
  X,
  Eye,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  BookOpen,
  Smartphone,
  Edit3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useTermsConditions } from '../../hooks/useLegalPolicies';
import TableSkeleton from '../../components/common/TableSkeleton';
import Pagination from '../../components/common/Pagination';

const DEFAULT_CUSTOMER_TERMS = `<h2>1. Acceptance of Terms</h2>
<p>By downloading, registering, or participating in quiz contests on <strong>KnowChamp</strong>, you agree to be legally bound by these Terms and Conditions and our Platform Rules.</p>

<h2>2. Eligibility &amp; Account Registration</h2>
<ul>
  <li>Users must be at least 18 years of age (or have verified parental/guardian consent) to participate in cash prize tournaments.</li>
  <li>Each player is entitled to maintain only one active KnowChamp account. Multi-accounting, emulator usage, or profile sharing is strictly prohibited.</li>
  <li>Players from restricted jurisdictions where skill-based gaming is legally prohibited are not eligible to enter paid contests.</li>
</ul>

<h2>3. Contests, Entry Fees &amp; Prize Pools</h2>
<ul>
  <li>Contests require the payment of a specified entry fee or ticket prior to joining.</li>
  <li>Entry fees are non-refundable once a contest countdown begins or questions are revealed.</li>
  <li>Prize pools are distributed strictly according to official leaderboard rankings computed based on accuracy, score, and answering speed.</li>
  <li>In case of a tie, the prize allocation follows the transparent tie-breaker protocol specified for that contest.</li>
</ul>

<h2>4. Wallet, Winnings &amp; Withdrawals</h2>
<ul>
  <li>Wallet balances consist of Deposit Balance, Bonus Cash, and Withdrawable Winnings.</li>
  <li>Winnings can be withdrawn to verified UPI IDs or bank accounts subject to mandatory KYC verification.</li>
  <li>KnowChamp complies with applicable tax regulations, including Tax Deducted at Source (TDS) on net winnings where mandated by law.</li>
</ul>

<h2>5. Fair Play &amp; Anti-Cheating Policy</h2>
<p>KnowChamp operates a zero-tolerance policy against cheating, automated scripts, screen mirroring tools, or collusion. Violations will result in immediate disqualification, permanent account banning, and forfeiture of all balances.</p>

<h2>6. Limitation of Liability</h2>
<p>KnowChamp is a game of knowledge, skill, and cognitive speed. We are not liable for gameplay disruptions arising from user connectivity issues, device failures, or third-party telecommunication interruptions.</p>`;

const DEFAULT_DRIVER_TERMS = `<h2>1. Quiz Host &amp; Partner Agreement</h2>
<p>This Agreement governs your onboarding and engagement as an approved Quiz Creator, Tournament Host, or Subject Expert on the <strong>KnowChamp</strong> platform.</p>

<h2>2. Question Quality &amp; Confidentiality</h2>
<ul>
  <li>Hosts must ensure all submitted questions are factually accurate, unambiguous, and free from intellectual property infringement.</li>
  <li>Leaking question sets or answer keys prior to contest conclusion is a severe breach resulting in immediate legal action and compensation claims.</li>
  <li>KnowChamp reserves editorial rights to review, approve, modify, or reject any submitted content.</li>
</ul>

<h2>3. Host Revenue Share &amp; Settlements</h2>
<ul>
  <li>Host commission payouts are calculated based on contest participation volume minus platform hosting fees.</li>
  <li>Settlements are processed weekly to verified bank accounts following anti-fraud review.</li>
</ul>

<h2>4. Account Termination</h2>
<p>KnowChamp reserves the right to suspend or terminate host privileges for non-compliance with quality standards or community guidelines.</p>`;

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ['link', 'clean'],
  ],
};

const TermsConditions = () => {
  const [activeType, setActiveType] = useState('customer'); // 'customer' | 'driver'
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editorViewTab, setEditorViewTab] = useState('write'); // 'write' | 'preview'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // TanStack Query & Redux Thunk custom hook
  const {
    activeTerms,
    history = [],
    loading,
    publishing,
    publishTerms,
    toggleStatus,
    restoreVersion,
  } = useTermsConditions(activeType);

  const [editorContent, setEditorContent] = useState('');

  // Sync editor content when activeTerms updates
  useEffect(() => {
    if (activeTerms && activeTerms.content) {
      setEditorContent(activeTerms.content);
    } else {
      setEditorContent(activeType === 'customer' ? DEFAULT_CUSTOMER_TERMS : DEFAULT_DRIVER_TERMS);
    }
  }, [activeTerms, activeType]);

  // Reset pagination when active tab changes
  useEffect(() => {
    setCurrentPage(1);
    setShowEditor(false);
  }, [activeType]);

  const currentVersionTag = history && history.length > 0 ? history[0].version : (activeTerms?.version || 'v1.0');
  const isActive = activeTerms ? activeTerms.isActive : true;

  // Calculate approximate read time and word count
  const activeContentText = activeTerms?.content || (activeType === 'customer' ? DEFAULT_CUSTOMER_TERMS : DEFAULT_DRIVER_TERMS);
  const wordCount = useMemo(() => {
    const text = activeContentText.replace(/<[^>]+>/g, ' ');
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, [activeContentText]);
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  // Pagination calculation
  const totalItems = history.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedHistory = history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddNew = () => {
    setEditorContent(activeContentText);
    setEditorViewTab('write');
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!editorContent.trim()) {
      toast.error('Terms content cannot be empty');
      return;
    }
    try {
      await publishTerms(editorContent);
      setShowEditor(false);
      toast.success(`${activeType === 'customer' ? 'Player App' : 'Contest Host'} Terms & Conditions published successfully!`);
    } catch (error) {
      toast.error(error.message || 'Failed to publish terms');
    }
  };

  const handleToggleStatus = async (itemToToggle) => {
    try {
      await toggleStatus(itemToToggle.id);
      toast.success('Terms status updated');
    } catch (error) {
      toast.error(error.message || 'Failed to toggle status');
    }
  };

  const handleRestore = async (item) => {
    try {
      if (restoreVersion) {
        await restoreVersion(item.id);
        toast.success(`Restored terms to ${item.version}`);
      } else {
        await publishTerms(item.content);
        toast.success(`Restored & published terms from ${item.version}`);
      }
      setSelectedHistoryItem(null);
    } catch (error) {
      toast.error(error.message || 'Failed to restore terms version');
    }
  };

  const handleCopyContent = () => {
    const plainText = activeContentText.replace(/<[^>]+>/g, '\n').replace(/\n+/g, '\n').trim();
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    toast.success('Terms text copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="font-sans max-w-5xl pb-16 space-y-6">
      {/* ── Main Header Card ── */}
      <div className="bg-[#0f1117] rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#E94B4B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E94B4B]/15 border border-[#E94B4B]/20 flex items-center justify-center shrink-0 shadow-inner">
              <FileText className="w-6 h-6 text-[#E94B4B]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Terms &amp; Conditions Management</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E94B4B]/15 text-[#E94B4B] border border-[#E94B4B]/25">
                  KnowChamp Legal
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/50 mt-1">
                Configure, revise, and publish gameplay rules, fair play agreements, and payout terms for KnowChamp platform.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            {!showEditor ? (
              <button
                onClick={handleAddNew}
                className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 active:scale-95 text-white rounded-xl text-sm font-bold transition-all shadow-lg cursor-pointer hover:opacity-90"
                style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
              >
                <Plus className="w-4 h-4" />
                <span>Create New Version</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <button
                  onClick={() => setShowEditor(false)}
                  className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 border border-white/10 text-white/70 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={publishing}
                  className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-lg disabled:opacity-60 cursor-pointer hover:opacity-90"
                  style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
                >
                  <Save className="w-4 h-4" />
                  {publishing ? 'Publishing...' : 'Save & Publish'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Audience Segment Tabs ── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="bg-[#0f1117] border border-white/10 p-1.5 rounded-2xl flex items-center gap-1.5 shadow-md w-full sm:w-fit overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => { setActiveType('customer'); setSelectedHistoryItem(null); }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer outline-none select-none whitespace-nowrap flex-1 sm:flex-initial justify-center sm:justify-start ${
                activeType === 'customer'
                  ? 'text-white shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              style={activeType === 'customer' ? { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' } : {}}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>Player / User App Terms</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveType('driver'); setSelectedHistoryItem(null); }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer outline-none select-none whitespace-nowrap flex-1 sm:flex-initial justify-center sm:justify-start ${
                activeType === 'driver'
                  ? 'text-white shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              style={activeType === 'driver' ? { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' } : {}}
            >
              <Trophy className="w-4 h-4 shrink-0" />
              <span>Contest Host &amp; Partner Agreement</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-[#E94B4B]" />
              ~{wordCount} words
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              ~{estimatedReadTime} min read
            </span>
          </div>
        </div>
      </div>

      {/* ── Metadata / Overview Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f1117] border border-white/10 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#E94B4B]/15 border border-[#E94B4B]/20 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-[#E94B4B]" />
          </div>
          <div>
            <span className="text-[11px] text-white/40 font-medium block">Agreement Scope</span>
            <span className="text-sm font-bold text-white capitalize">
              {activeType === 'customer' ? 'Player App Terms' : 'Quiz Host Agreement'}
            </span>
          </div>
        </div>

        <div className="bg-[#0f1117] border border-white/10 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
            <History className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <span className="text-[11px] text-white/40 font-medium block">Active Version</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20">
                {currentVersionTag}
              </span>
              <span className="text-[10px] text-white/30">Live on Apps</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0f1117] border border-white/10 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] text-white/40 font-medium block">Status</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                isActive ? 'text-green-400' : 'text-white/40'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-white/30'}`} />
                {isActive ? 'Live & Enforced' : 'Draft / Inactive'}
              </span>
              <button
                onClick={() => activeTerms && handleToggleStatus(activeTerms)}
                className="text-[10px] text-white/50 hover:text-white underline cursor-pointer"
              >
                {isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Rich Editor Card (when showEditor is TRUE) ── */}
      {showEditor && (
        <div className="bg-[#0f1117] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in duration-200">
          <div className="px-5 py-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/2">
            <div className="flex items-center gap-2.5">
              <Edit3 className="w-4 h-4 text-[#E94B4B]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Editing {activeType === 'customer' ? 'Player' : 'Contest Host'} Terms &amp; Conditions
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-white/5 p-1 rounded-xl flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEditorViewTab('write')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    editorViewTab === 'write' ? 'text-white' : 'text-white/60 hover:text-white'
                  }`}
                  style={editorViewTab === 'write' ? { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' } : {}}
                >
                  Write / Edit
                </button>
                <button
                  type="button"
                  onClick={() => setEditorViewTab('preview')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    editorViewTab === 'preview' ? 'text-white' : 'text-white/60 hover:text-white'
                  }`}
                  style={editorViewTab === 'preview' ? { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' } : {}}
                >
                  App Live Preview
                </button>
              </div>

              <button
                onClick={() => setShowEditor(false)}
                className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {editorViewTab === 'write' ? (
            <div className="quill-editor-wrapper bg-white min-h-[480px]">
              <ReactQuill
                theme="snow"
                value={editorContent}
                onChange={setEditorContent}
                modules={QUILL_MODULES}
                placeholder="Write KnowChamp terms & conditions using headings, bullet points, and rules..."
                className="font-sans min-h-[450px]"
              />
            </div>
          ) : (
            <div className="p-6 bg-[#0a0c12] min-h-[480px] max-h-[600px] overflow-y-auto no-scrollbar">
              <div className="max-w-2xl mx-auto bg-[#0f1117] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-inner">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-[#E94B4B]" />
                    <span className="text-xs font-bold text-white/70">Mobile App Preview</span>
                  </div>
                  <span className="text-[10px] text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded-full border border-green-500/20">
                    Live Rendering
                  </span>
                </div>
                <div
                  className="ql-editor-content text-white/90 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: editorContent }}
                />
              </div>
            </div>
          )}

          <div className="px-5 py-3.5 border-t border-white/10 bg-white/2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2 text-xs text-white/40">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 sm:mt-0 shrink-0" />
              <span>Publishing creates a new revision version and immediately updates the live mobile app.</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowEditor(false)}
                className="flex-1 sm:flex-initial px-4 py-2 border border-white/10 text-white/70 hover:bg-white/5 rounded-xl text-xs font-semibold cursor-pointer transition-colors text-center"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={publishing}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all disabled:opacity-60 hover:opacity-90"
                style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
              >
                <Save className="w-3.5 h-3.5" />
                {publishing ? 'Publishing...' : 'Save & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Active Document Live View Card (When not in editor mode) ── */}
      {!showEditor && (
        <div className="bg-[#0f1117] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/15 border border-green-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Live Published Terms — {activeType === 'customer' ? 'Player App' : 'Host Agreement'}
                </h3>
                <p className="text-[11px] text-white/40">
                  Version {currentVersionTag} • Active &amp; legally enforced on KnowChamp apps
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyContent}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
                title="Copy terms content"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Text'}
              </button>
              <button
                onClick={handleAddNew}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer hover:opacity-90"
                style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Terms
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 max-h-[500px] overflow-y-auto no-scrollbar bg-[#0b0d13]/50">
            <div
              className="ql-editor-content text-white/90 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: activeContentText }}
            />
          </div>
        </div>
      )}

      {/* ── Revision History Section ── */}
      <div className="bg-[#0f1117] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
              <History className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Terms Revision History</h3>
              <p className="text-[11px] text-white/45">
                Audit trail and previous publications of {activeType === 'customer' ? 'Player App' : 'Host Agreement'} terms
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-[#E94B4B]/15 text-[#E94B4B] border border-[#E94B4B]/20 rounded-full text-xs font-semibold">
            {history.length} Revisions
          </span>
        </div>

        {loading ? (
          <div className="p-5">
            <TableSkeleton columnsCount={5} rowCount={4} />
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/3 border-b border-white/10">
                  <tr>
                    {['Version', 'Publication Date', 'Published By', 'Status', 'Actions'].map((h, i) => (
                      <th
                        key={i}
                        className={`py-3 px-4 text-[11px] font-semibold text-white/40 uppercase tracking-wider ${
                          i === 4 ? 'text-right' : ''
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-xs text-white/30 font-medium">
                        No previous revision history found for this terms document.
                      </td>
                    </tr>
                  ) : (
                    paginatedHistory.map((item) => (
                      <tr key={item.id || item.version} className="hover:bg-white/3 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">
                          <span className="inline-flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#E94B4B]" />
                            {item.version}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-white/60">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-white/30" />
                            {item.date || 'Recently'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-white/70">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-[#E94B4B]/20 text-[#E94B4B] text-[10px] font-bold flex items-center justify-center">
                              {(item.author || 'Admin')[0]?.toUpperCase()}
                            </span>
                            {item.author || 'System Admin'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              item.status === 'Active' || item.isActive
                                ? 'bg-green-500/15 text-green-400 border-green-500/20'
                                : 'bg-white/8 text-white/40 border-white/10'
                            }`}
                          >
                            {(item.status || (item.isActive ? 'Active' : 'Archived')).toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedHistoryItem(item)}
                              className="flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                            {(!item.isActive && item.status !== 'Active') && (
                              <button
                                onClick={() => handleRestore(item)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-[#E94B4B]/10 border border-[#E94B4B]/20 text-[#E94B4B] hover:bg-[#E94B4B]/20 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                title="Rollback to this version"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Rollback
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card Layout */}
            <div className="block md:hidden divide-y divide-white/5">
              {paginatedHistory.length === 0 ? (
                <div className="py-12 text-center text-xs text-white/30 font-medium">
                  No previous revision history found for this terms document.
                </div>
              ) : (
                paginatedHistory.map((item) => (
                  <div key={item.id || item.version} className="p-4 space-y-4 hover:bg-white/2 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#E94B4B]" />
                        {item.version}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.status === 'Active' || item.isActive
                            ? 'bg-green-500/15 text-green-400 border-green-500/20'
                            : 'bg-white/8 text-white/40 border-white/10'
                        }`}
                      >
                        {(item.status || (item.isActive ? 'Active' : 'Archived')).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 text-white/60">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-[11px]">Published: {item.date || 'Recently'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white/70">
                        <span className="w-5 h-5 rounded-full bg-[#E94B4B]/20 text-[#E94B4B] text-[10px] font-bold flex items-center justify-center">
                          {(item.author || 'Admin')[0]?.toUpperCase()}
                        </span>
                        <span className="text-[11px]">{item.author || 'System Admin'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setSelectedHistoryItem(item)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                      {(!item.isActive && item.status !== 'Active') && (
                        <button
                          onClick={() => handleRestore(item)}
                          className="flex-1 flex items-center justify-center gap-1 px-2.5 py-2 bg-[#E94B4B]/10 border border-[#E94B4B]/20 text-[#E94B4B] hover:bg-[#E94B4B]/20 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          title="Rollback to this version"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Rollback
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalItems > itemsPerPage && (
              <div className="px-5 py-3 border-t border-white/10">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={(page) => setCurrentPage(page)}
                  itemName="revisions"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* ── History Preview / Rollback Modal ── */}
      {selectedHistoryItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E94B4B]/15 border border-[#E94B4B]/20 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-[#E94B4B]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">
                      Terms &amp; Conditions — {selectedHistoryItem.version}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/60">
                      {activeType === 'customer' ? 'Player App' : 'Host Agreement'}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/40 mt-0.5">
                    Published on {selectedHistoryItem.date || 'N/A'} by {selectedHistoryItem.author || 'Admin'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="text-white/40 hover:text-white p-1.5 hover:bg-white/8 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto no-scrollbar text-sm leading-relaxed text-white/90 bg-[#0a0c12] max-h-[500px]">
              <div
                className="ql-editor-content"
                dangerouslySetInnerHTML={{ __html: selectedHistoryItem.content }}
              />
            </div>

            <div className="px-6 py-3.5 border-t border-white/10 bg-white/2 flex items-center justify-between">
              <button
                onClick={() => handleRestore(selectedHistoryItem)}
                className="flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer hover:opacity-90"
                style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restore &amp; Make Live
              </button>

              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="px-4 py-2 border border-white/10 text-white/70 hover:bg-white/8 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
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

export default TermsConditions;
