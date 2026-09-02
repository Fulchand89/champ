import React, { useState, useEffect, useMemo } from 'react';
import {
  RotateCcw,
  UserCheck,
  Trophy,
  Save,
  CheckCircle2,
  History,
  Clock,
  FileText,
  Plus,
  X,
  Eye,
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
import { useRefundPolicies } from '../../hooks/useLegalPolicies';
import TableSkeleton from '../../components/common/TableSkeleton';
import Pagination from '../../components/common/Pagination';

const DEFAULT_CUSTOMER_POLICY = `<h2>1. Refund &amp; Cancellation Overview</h2>
<p>At <strong>KnowChamp</strong>, we strive to ensure a fair, transparent, and seamless skill-based gaming environment. This Refund Policy sets out the terms under which refunds may be issued for contest entries, wallet deposits, and transactions on our platform.</p>

<h2>2. Contest Entry Fee Refunds</h2>
<ul>
  <li><strong>Contest Cancellation by Platform:</strong> If a scheduled quiz contest is cancelled by KnowChamp due to technical issues, insufficient participation, or server maintenance, 100% of the entry fee paid will be automatically refunded to the user's wallet balance within 24 hours.</li>
  <li><strong>Disconnections &amp; Server Disruptions:</strong> In the event of a verified server-side failure that disrupts live contest gameplay for all participants, entry fees will be refunded to affected users.</li>
  <li><strong>User-Side Connectivity Issues:</strong> KnowChamp is not liable for device crashes, network loss, or disconnections arising from user ISP problems once questions have been revealed. In such cases, entry fees are non-refundable.</li>
</ul>

<h2>3. Wallet Deposits &amp; Payment Failures</h2>
<ul>
  <li>If an amount is debited from your bank account/UPI but does not reflect in your KnowChamp wallet within 15 minutes, our automated reconciliation system will either credit the wallet or process a refund to the original payment method within 3–5 business days.</li>
  <li>Accidental deposit refund requests can be submitted via the Support Center within 2 hours of transaction, provided the funds have not been utilized in any contest.</li>
</ul>

<h2>4. Processing Timelines &amp; Modes</h2>
<p>Approved refunds are routed back to the original payment source (UPI, Bank Account, Card) or credited directly to the KnowChamp Wallet Deposit balance within <strong>3 to 7 business days</strong> depending on banking partner timelines.</p>

<h2>5. Contact for Refund Queries</h2>
<p>For refund disputes or transaction escalations, contact our finance team at <strong>refunds@knowchamp.com</strong> with your Transaction ID and registered User ID.</p>`;

const DEFAULT_DRIVER_POLICY = `<h2>1. Contest Host Settlement &amp; Cancellation Terms</h2>
<p>This policy details the refund, cancellation, and fee adjustment guidelines applicable to verified Quiz Creators, Contest Organizers, and Subject Experts hosting contests on <strong>KnowChamp</strong>.</p>

<h2>2. Host Contest Cancellation &amp; Penalties</h2>
<ul>
  <li>If a host voluntarily cancels a scheduled contest after player registrations have opened, all collected player entry fees are 100% refunded to participants, and the host's platform reliability score may be adjusted.</li>
  <li>Repeated unannounced cancellations may result in temporary suspension of contest hosting privileges.</li>
</ul>

<h2>3. Platform Fee Reversals</h2>
<ul>
  <li>Platform commission fees charged to hosts for aborted or server-cancelled Contests are fully waived and credited back to host accounts.</li>
</ul>

<h2>4. Dispute Resolution &amp; Host Support</h2>
<p>For questions regarding hosting payouts or fee reconciliations, reach out to <strong>partners@knowchamp.com</strong>.</p>`;

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

const RefundPolicy = () => {
  const [activeType, setActiveType] = useState('customer'); // 'customer' | 'driver'
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editorViewTab, setEditorViewTab] = useState('write'); // 'write' | 'preview'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // TanStack Query & Redux Thunk custom hook
  const {
    activePolicy,
    history = [],
    loading,
    publishing,
    publishPolicy,
    toggleStatus,
    restoreVersion,
  } = useRefundPolicies(activeType);

  const [editorContent, setEditorContent] = useState('');

  // Sync editor content when activePolicy updates
  useEffect(() => {
    if (activePolicy && activePolicy.content) {
      setEditorContent(activePolicy.content);
    } else {
      setEditorContent(activeType === 'customer' ? DEFAULT_CUSTOMER_POLICY : DEFAULT_DRIVER_POLICY);
    }
  }, [activePolicy, activeType]);

  // Reset pagination when active tab changes
  useEffect(() => {
    setCurrentPage(1);
    setShowEditor(false);
  }, [activeType]);

  const currentVersionTag = history && history.length > 0 ? history[0].version : (activePolicy?.version || 'v1.0');
  const isActive = activePolicy ? activePolicy.isActive : true;

  // Calculate approximate read time and word count
  const activeContentText = activePolicy?.content || (activeType === 'customer' ? DEFAULT_CUSTOMER_POLICY : DEFAULT_DRIVER_POLICY);
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
      toast.error('Policy content cannot be empty');
      return;
    }
    try {
      await publishPolicy(editorContent);
      setShowEditor(false);
      toast.success(`${activeType === 'customer' ? 'Player App' : 'Contest Host'} Refund Policy published successfully!`);
    } catch (error) {
      toast.error(error.message || 'Failed to publish refund policy');
    }
  };

  const handleToggleStatus = async (itemToToggle) => {
    try {
      await toggleStatus(itemToToggle.id);
      toast.success('Refund policy status updated');
    } catch (error) {
      toast.error(error.message || 'Failed to toggle status');
    }
  };

  const handleRestore = async (item) => {
    try {
      if (restoreVersion) {
        await restoreVersion(item.id);
        toast.success(`Restored refund policy to ${item.version}`);
      } else {
        await publishPolicy(item.content);
        toast.success(`Restored & published refund policy from ${item.version}`);
      }
      setSelectedHistoryItem(null);
    } catch (error) {
      toast.error(error.message || 'Failed to restore policy version');
    }
  };

  const handleCopyContent = () => {
    const plainText = activeContentText.replace(/<[^>]+>/g, '\n').replace(/\n+/g, '\n').trim();
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    toast.success('Refund policy text copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ── Main Header Card ── */}
      <div className="bg-[#0f1117] text-white p-5 rounded-2xl shadow-sm border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold">Refund Policy</h1>
          <p className="text-xs text-gray-400 mt-1">
            Configure and maintain cancellation rules, wallet deposit refund conditions, and contest fee reversal policies.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleAddNew}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all shadow-md cursor-pointer hover:opacity-90"
            style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
          >
            <Plus className="w-4 h-4" />
            <span>Update Policy</span>
          </button>
        </div>
      </div>

      {/* ── Type Selector Tabs ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="bg-[#0f1117] border border-white/10 p-1.5 rounded-xl flex items-center gap-1.5 shadow-md w-full sm:w-fit overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveType('customer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer outline-none select-none whitespace-nowrap flex-1 sm:flex-initial text-center ${
              activeType === 'customer'
                ? 'text-white shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            style={activeType === 'customer' ? { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' } : {}}
          >
            Player App (Customer)
          </button>
          <button
            onClick={() => setActiveType('driver')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer outline-none select-none whitespace-nowrap flex-1 sm:flex-initial text-center ${
              activeType === 'driver'
                ? 'text-white shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            style={activeType === 'driver' ? { background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' } : {}}
          >
            Contest Hosts &amp; Creators
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>~{wordCount} words</span>
          <span>•</span>
          <span>~{estimatedReadTime} min read</span>
        </div>
      </div>

      {/* ── Active Policy Preview Card ── */}
      <div className="bg-[#0f1117] rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Published {activeType === 'customer' ? 'Player' : 'Host'} Refund Policy
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {isActive ? 'Active on App' : 'Disabled'}
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Last modified: {activePolicy?.publishedAt ? new Date(activePolicy.publishedAt).toLocaleString() : 'System Default'}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyContent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 transition-colors"
              title="Copy plain text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#E94B4B]" />
              Edit
            </button>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <TableSkeleton rows={4} cols={3} />
        ) : (
          <div className="prose prose-invert max-w-none prose-sm prose-headings:text-white prose-p:text-white/80 prose-li:text-white/80 prose-strong:text-white prose-a:text-[#E94B4B] bg-[#090b15] p-5 sm:p-6 rounded-xl border border-white/5 leading-relaxed overflow-x-auto">
            <div dangerouslySetInnerHTML={{ __html: activeContentText }} />
          </div>
        )}
      </div>

      {/* ── Version History & Audit Log ── */}
      <div className="bg-[#0f1117] rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white">Version History &amp; Revisions</h3>
          </div>
          <span className="text-xs text-white/40">{history.length} Revisions Recorded</span>
        </div>

        {loading ? (
          <TableSkeleton rows={3} cols={5} />
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-white/40 text-sm">No revisions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/40 font-medium">
                  <th className="py-3 px-3">Version</th>
                  <th className="py-3 px-3">Published Date</th>
                  <th className="py-3 px-3">Published By</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-white">{item.version}</td>
                    <td className="py-3 px-3 text-white/70">
                      {new Date(item.publishedAt).toLocaleDateString()}{' '}
                      <span className="text-white/40">{new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="py-3 px-3 text-white/70">{item.publishedBy || 'Admin'}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          item.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-white/5 text-white/50 border-white/10'
                        }`}
                      >
                        {item.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedHistoryItem(item)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
                          title="View Version Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {!item.isActive && (
                          <button
                            onClick={() => handleRestore(item)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E94B4B]/10 hover:bg-[#E94B4B]/20 text-[#E94B4B] border border-[#E94B4B]/30 font-medium transition-colors"
                            title="Rollback to this version"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pt-3 border-t border-white/10">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </div>

      {/* ── Fullscreen / Modal Policy Editor ── */}
      {showEditor && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#0f1117] w-full max-w-4xl max-h-[90vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#E94B4B]" />
                  Update {activeType === 'customer' ? 'Player App' : 'Contest Host'} Refund Policy
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Write formatting policy clauses in HTML. Changes will generate a new archived revision tag upon publishing.
                </p>
              </div>
              <button
                onClick={() => setShowEditor(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Editor vs Live Preview Switcher */}
            <div className="px-5 pt-3 pb-2 border-b border-white/10 bg-[#090b15] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditorViewTab('write')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    editorViewTab === 'write'
                      ? 'bg-[#E94B4B] text-white shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Rich Editor
                </button>
                <button
                  onClick={() => setEditorViewTab('preview')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    editorViewTab === 'preview'
                      ? 'bg-[#E94B4B] text-white shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Live Preview
                </button>
              </div>

              <div className="text-[11px] text-white/40">
                Word Count: <strong className="text-white">{editorContent.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length}</strong>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 bg-[#090b15]">
              {editorViewTab === 'write' ? (
                <div className="quill-custom-wrapper">
                  <ReactQuill
                    theme="snow"
                    value={editorContent}
                    onChange={setEditorContent}
                    modules={QUILL_MODULES}
                    className="text-white bg-[#0f1117] rounded-xl overflow-hidden border border-white/10"
                  />
                </div>
              ) : (
                <div className="prose prose-invert max-w-none prose-sm bg-[#0f1117] p-5 rounded-xl border border-white/10">
                  <div dangerouslySetInnerHTML={{ __html: editorContent }} />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                Publishing immediately updates active in-app refund documentation.
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={publishing}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#E94B4B] to-[#911616] hover:brightness-110 text-white font-semibold text-xs shadow-lg shadow-[#E94B4B]/20 active:scale-95 disabled:opacity-50 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  {publishing ? 'Publishing...' : 'Save & Publish Version'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Version Detail Modal ── */}
      {selectedHistoryItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#0f1117] w-full max-w-3xl max-h-[85vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#E94B4B]" />
                  Archived Revision: <span className="font-mono text-emerald-400">{selectedHistoryItem.version}</span>
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Published on {new Date(selectedHistoryItem.publishedAt).toLocaleString()} by {selectedHistoryItem.publishedBy || 'Admin'}
                </p>
              </div>
              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 bg-[#090b15]">
              <div className="prose prose-invert max-w-none prose-sm bg-[#0f1117] p-5 rounded-xl border border-white/10">
                <div dangerouslySetInnerHTML={{ __html: selectedHistoryItem.content }} />
              </div>
            </div>

            <div className="p-4 border-t border-white/10 flex justify-between items-center bg-white/[0.02]">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                  selectedHistoryItem.isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-white/5 text-white/50 border-white/10'
                }`}
              >
                {selectedHistoryItem.isActive ? 'Currently Active' : 'Archived Revision'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedHistoryItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Close
                </button>
                {!selectedHistoryItem.isActive && (
                  <button
                    onClick={() => handleRestore(selectedHistoryItem)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E94B4B] to-[#911616] text-white font-semibold text-xs shadow-md shadow-[#E94B4B]/20 transition-all active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore This Revision
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundPolicy;
