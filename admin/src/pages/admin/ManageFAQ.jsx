import React, { useState, useEffect } from 'react';
import { Search, RotateCw, Plus, Edit, Trash2, X, HelpCircle, ChevronDown, ChevronUp, ChevronsUpDown, Check } from 'lucide-react';
import { faqService } from '../../api/services/faqService';
import { contestService } from '../../api/services/contestService';
import toast from 'react-hot-toast';

const ManageFAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContestFilter, setSelectedContestFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [faqs, setFaqs] = useState([]);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  // State to track which FAQ rows are expanded to view the full answer
  const [expandedFaqIds, setExpandedFaqIds] = useState(new Set());

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [currentFAQ, setCurrentFAQ] = useState(null);

  // Form states
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [contestId, setContestId] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const [faqRes, contestRes] = await Promise.all([
        faqService.getFAQs(),
        contestService.getContests().catch(() => ({ success: false, data: [] }))
      ]);
      if (faqRes?.success && Array.isArray(faqRes.data)) {
        setFaqs(faqRes.data);
      }
      if (contestRes?.success && Array.isArray(contestRes.data)) {
        setContests(contestRes.data);
      }
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const toggleExpandFAQ = (id) => {
    setExpandedFaqIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleExpandAll = () => {
    if (expandedFaqIds.size === filteredFAQs.length && filteredFAQs.length > 0) {
      setExpandedFaqIds(new Set());
    } else {
      setExpandedFaqIds(new Set(filteredFAQs.map((f) => f.id)));
    }
  };

  const handleOpenAddModal = () => {
    setModalType('add');
    setCurrentFAQ(null);
    setQuestion('');
    setAnswer('');
    setContestId('');
    setDisplayOrder(faqs.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faq) => {
    setModalType('edit');
    setCurrentFAQ(faq);
    setQuestion(faq.question || '');
    setAnswer(faq.answer || '');
    setContestId(faq.contestId ? String(faq.contestId) : (faq.contest?.id ? String(faq.contest.id) : ''));
    setDisplayOrder(faq.displayOrder !== undefined ? faq.displayOrder : 0);
    setIsActive(Boolean(faq.isActive));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error('FAQ question is required');
      return;
    }
    if (!answer.trim()) {
      toast.error('FAQ answer is required');
      return;
    }

    const payload = {
      question: question.trim(),
      answer: answer.trim(),
      contestId: contestId ? parseInt(contestId, 10) : null,
      displayOrder: parseInt(displayOrder, 10) || 0,
      isActive
    };

    setSaving(true);
    try {
      if (modalType === 'add') {
        const res = await faqService.createFAQ(payload);
        if (res?.success) {
          toast.success('FAQ created successfully');
          fetchFAQs();
          setIsModalOpen(false);
        }
      } else {
        const res = await faqService.updateFAQ(currentFAQ.id, payload);
        if (res?.success) {
          toast.success('FAQ updated successfully');
          fetchFAQs();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error('Error saving FAQ:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Error saving FAQ';
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        const res = await faqService.deleteFAQ(id);
        if (res?.success) {
          toast.success('FAQ deleted successfully');
          fetchFAQs();
        }
      } catch (err) {
        console.error('Error deleting FAQ:', err);
        toast.error('Failed to delete FAQ');
      }
    }
  };

  const handleToggleStatus = async (faq) => {
    const payload = {
      question: faq.question,
      answer: faq.answer,
      contestId: faq.contestId || faq.contest?.id || null,
      displayOrder: faq.displayOrder,
      isActive: !faq.isActive
    };
    try {
      const res = await faqService.updateFAQ(faq.id, payload);
      if (res?.success) {
        toast.success(`FAQ ${!faq.isActive ? 'activated' : 'deactivated'}`);
        fetchFAQs();
      }
    } catch (err) {
      console.error('Error toggling FAQ status:', err);
      toast.error('Failed to toggle status');
    }
  };

  const filteredFAQs = faqs.filter((faq) => {
    const contestTitle = faq.contest?.title || '';
    const matchesSearch = (faq.question || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (faq.answer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          contestTitle.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesContest = true;
    if (selectedContestFilter === 'GENERAL') {
      matchesContest = !faq.contestId && !faq.contest;
    } else if (selectedContestFilter !== 'ALL') {
      matchesContest = String(faq.contestId) === String(selectedContestFilter) || String(faq.contest?.id) === String(selectedContestFilter);
    }

    let matchesStatus = true;
    if (statusFilter === 'ACTIVE') {
      matchesStatus = Boolean(faq.isActive);
    } else if (statusFilter === 'INACTIVE') {
      matchesStatus = !faq.isActive;
    }

    return matchesSearch && matchesContest && matchesStatus;
  });

  const totalFaqs = faqs.length;
  const activeFaqs = faqs.filter(f => f.isActive).length;
  const inactiveFaqs = totalFaqs - activeFaqs;
  const isAllExpanded = expandedFaqIds.size === filteredFAQs.length && filteredFAQs.length > 0;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="bg-[#0f1117] text-white p-5 rounded-2xl shadow-sm border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold">Manage FAQs</h1>
          <p className="text-xs text-gray-400 mt-1">
            Create, update, reorder and manage platform FAQs with contest mappings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchFAQs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-800 rounded-lg text-sm text-white transition-all disabled:opacity-50 cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#E94B4B]' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer hover:opacity-90 shadow-md"
            style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
          >
            <Plus className="w-4 h-4" />
            Add New FAQ
          </button>
        </div>
      </div>

      {/* ── Stats Overview ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0f1117] border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total FAQs</p>
            <p className="text-2xl font-bold text-white mt-1">{totalFaqs}</p>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
            style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
          >
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0f1117] border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active FAQs</p>
            <p className="text-2xl font-bold text-white mt-1">{activeFaqs}</p>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
            style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
          >
            <Check className="w-5 h-5" />
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0f1117] border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Inactive FAQs</p>
            <p className="text-2xl font-bold text-white mt-1">{inactiveFaqs}</p>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
            style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
          >
            <X className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="p-4 rounded-2xl bg-[#0f1117] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search FAQs by question or answer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0f1117] border border-gray-600 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E94B4B] transition-colors"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={toggleExpandAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0f1117] hover:bg-gray-800 border border-gray-600 rounded-xl text-xs font-semibold text-gray-300 hover:text-white transition-all cursor-pointer"
            title={isAllExpanded ? "Collapse all answers" : "Expand all answers"}
          >
            <ChevronsUpDown className="w-3.5 h-3.5 text-[#E94B4B]" />
            {isAllExpanded ? "Collapse All" : "Expand All"}
          </button>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#0f1117] border border-gray-600 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-[#E94B4B] transition-colors"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
          <select
            value={selectedContestFilter}
            onChange={(e) => setSelectedContestFilter(e.target.value)}
            className="px-3 py-2 bg-[#0f1117] border border-gray-600 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-[#E94B4B] transition-colors max-w-[200px]"
          >
            <option value="ALL">All Mappings</option>
            <option value="GENERAL">General / All Contests</option>
            {contests.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── FAQs Expandable Table / List ── */}
      <div className="bg-[#0f1117] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto w-full no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">Order</th>
                <th className="py-3.5 px-4 w-16">ID</th>
                <th className="py-3.5 px-4">Question & Answer</th>
                <th className="py-3.5 px-4 w-44">Contest Mapping</th>
                <th className="py-3.5 px-4 w-28 text-center">Status</th>
                <th className="py-3.5 px-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <RotateCw className="w-5 h-5 animate-spin text-[#E94B4B]" />
                      <span>Loading FAQs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredFAQs.length > 0 ? (
                filteredFAQs.map((faq, index) => {
                  const isExpanded = expandedFaqIds.has(faq.id);

                  return (
                    <tr
                      key={faq.id || index}
                      className={`hover:bg-white/5 transition-colors ${
                        isExpanded ? 'bg-white/[0.03]' : ''
                      }`}
                    >
                      {/* Order */}
                      <td className="py-4 px-4 font-mono text-gray-400 text-center text-xs align-top">
                        <span className="inline-block px-2 py-0.5 rounded bg-white/5 border border-white/10">
                          {faq.displayOrder !== undefined ? faq.displayOrder : index + 1}
                        </span>
                      </td>

                      {/* ID */}
                      <td className="py-4 px-4 font-mono text-[#E94B4B] text-xs font-bold align-top">
                        #{faq.id}
                      </td>

                      {/* Question & Answer (with Up/Down toggle button) */}
                      <td className="py-4 px-4 align-top max-w-xl">
                        <div className="space-y-2">
                          {/* Question Row with Up / Down Chevron Button */}
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-sm font-semibold text-white leading-snug">
                              {faq.question}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleExpandFAQ(faq.id)}
                              className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                                isExpanded
                                  ? 'bg-[#E94B4B]/15 border-[#E94B4B]/40 text-[#E94B4B] shadow-sm'
                                  : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                              }`}
                              title={isExpanded ? "Hide Answer (Up)" : "Show Answer (Down)"}
                            >
                              <span>{isExpanded ? "Hide Answer" : "View Answer"}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          {/* Answer Box: Expanded vs Collapsed */}
                          {isExpanded ? (
                            <div className="mt-2.5 p-3.5 rounded-xl bg-white/5 border border-white/10 shadow-inner">
                              <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#E94B4B]"></span>
                                Complete Answer:
                              </div>
                              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                                {faq.answer}
                              </p>
                            </div>
                          ) : (
                            <p
                              onClick={() => toggleExpandFAQ(faq.id)}
                              className="text-xs text-gray-400 line-clamp-1 cursor-pointer hover:text-gray-300 transition-colors"
                              title="Click to expand answer"
                            >
                              {faq.answer}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Contest Mapping */}
                      <td className="py-4 px-4 align-top text-xs">
                        {faq.contest?.title ? (
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-[#E94B4B]/10 text-[#E94B4B] border border-[#E94B4B]/20 font-medium">
                            {faq.contest.title}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs font-medium">General / All</span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4 text-center align-top">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(faq)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
                            faq.isActive
                              ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25 border-green-500/30'
                              : 'bg-white/10 text-white/50 hover:bg-white/15 border-white/10'
                          }`}
                          title="Click to toggle status"
                        >
                          {faq.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right align-top">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(faq)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                            title="Edit FAQ"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(faq.id)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-white/10 transition-colors cursor-pointer"
                            title="Delete FAQ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                    No FAQs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-[#0f1117] border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#E94B4B]" />
                {modalType === 'add' ? 'Add New FAQ' : 'Edit FAQ'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1">
              {/* Question */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How do I join a quiz contest?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0f1117] border border-white/15 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E94B4B] transition-colors"
                />
              </div>

              {/* Answer */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Answer *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Detailed answer explanation..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0f1117] border border-white/15 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E94B4B] transition-colors resize-none"
                />
              </div>

              {/* Contest & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Target Contest (Optional)
                  </label>
                  <select
                    value={contestId}
                    onChange={(e) => setContestId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0f1117] border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-[#E94B4B] transition-colors"
                  >
                    <option value="">General / All Contests</option>
                    {contests.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0f1117] border border-white/15 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E94B4B] transition-colors"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-white/15 bg-[#0f1117] text-[#E94B4B] focus:ring-[#E94B4B] cursor-pointer"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-300 cursor-pointer select-none">
                  Active (visible on website & app)
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
                  className="px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all shadow-md hover:opacity-90 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {saving && <RotateCw className="w-4 h-4 animate-spin" />}
                  {modalType === 'add' ? 'Create FAQ' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFAQ;
