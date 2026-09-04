import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  RotateCw, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  HelpCircle, 
  Layers, 
  BookOpen, 
  FileQuestion, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import Table from '../../components/common/Table';
import ConfirmModal from '../../components/common/ConfirmModal';
import { questionService } from '../../api/services/questionService';
import { categoryService } from '../../api/services/categoryService';
import { subjectService } from '../../api/services/subjectService';
import { topicService } from '../../api/services/topicService';
import toast from 'react-hot-toast';

const ManageQuestionBank = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter hierarchy states
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterTopic, setFilterTopic] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  // Filtered dropdown lists for Filter Toolbar
  const filterAvailableSubjects = useMemo(() => {
    if (filterCategory === 'all') return [];
    return subjects.filter((s) => String(s.categoryId) === String(filterCategory));
  }, [filterCategory, subjects]);

  const filterAvailableTopics = useMemo(() => {
    if (filterSubject === 'all') return [];
    return topics.filter((t) => String(t.subjectId) === String(filterSubject));
  }, [filterSubject, topics]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [currentQuestion, setCurrentQuestion] = useState(null);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form states for Add / Edit Screen
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formTopicId, setFormTopicId] = useState('');
  const [formQuestionText, setFormQuestionText] = useState('');
  const [formDifficulty, setFormDifficulty] = useState('easy');
  const [formQuestionType, setFormQuestionType] = useState('single_choice');
  const [formPoints, setFormPoints] = useState('1');
  const [formNegativePoints, setFormNegativePoints] = useState('0');
  const [formExplanation, setFormExplanation] = useState('');
  const [formOptionA, setFormOptionA] = useState('');
  const [formOptionB, setFormOptionB] = useState('');
  const [formOptionC, setFormOptionC] = useState('');
  const [formOptionD, setFormOptionD] = useState('');
  const [formCorrectOption, setFormCorrectOption] = useState('A');
  const [formIsActive, setFormIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal dynamic subjects & topics
  const modalAvailableSubjects = useMemo(() => {
    if (!formCategoryId) return [];
    return subjects.filter((s) => String(s.categoryId) === String(formCategoryId));
  }, [formCategoryId, subjects]);

  const modalAvailableTopics = useMemo(() => {
    if (!formSubjectId) return [];
    return topics.filter((t) => String(t.subjectId) === String(formSubjectId));
  }, [formSubjectId, topics]);

  const fetchQuestions = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (filterCategory !== 'all') params.categoryId = filterCategory;
      if (filterSubject !== 'all') params.subjectId = filterSubject;
      if (filterTopic !== 'all') params.topicId = filterTopic;
      if (filterDifficulty !== 'all') params.difficulty = filterDifficulty;

      const res = await questionService.getQuestions(params);
      if (res?.success) {
        setQuestions(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      if (err.response?.status === 401) {
        toast.error('Session expired or unauthorized. Please log in.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to load questions');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [catRes, subRes, topRes] = await Promise.allSettled([
        categoryService.getCategories(),
        subjectService.getSubjects(),
        topicService.getTopics(),
      ]);

      if (catRes.status === 'fulfilled' && catRes.value?.success) {
        setCategories(catRes.value.data || []);
      }
      if (subRes.status === 'fulfilled' && subRes.value?.success) {
        setSubjects(subRes.value.data || []);
      }
      if (topRes.status === 'fulfilled' && topRes.value?.success) {
        setTopics(topRes.value.data || []);
      }
    } catch (err) {
      console.error('Error loading classification metadata:', err);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [filterCategory, filterSubject, filterTopic, filterDifficulty]);

  // Handle Category Filter Change
  const handleFilterCategoryChange = (e) => {
    const val = e.target.value;
    setFilterCategory(val);
    setFilterSubject('all');
    setFilterTopic('all');
  };

  // Handle Subject Filter Change
  const handleFilterSubjectChange = (e) => {
    const val = e.target.value;
    setFilterSubject(val);
    setFilterTopic('all');
  };

  // Handle Modal Category Change
  const handleModalCategoryChange = (e) => {
    const val = e.target.value;
    setFormCategoryId(val);
    setFormSubjectId('');
    setFormTopicId('');
  };

  // Handle Modal Subject Change
  const handleModalSubjectChange = (e) => {
    const val = e.target.value;
    setFormSubjectId(val);
    setFormTopicId('');
  };

  const handleOpenAddModal = () => {
    setModalType('add');
    setCurrentQuestion(null);
    setFormCategoryId('');
    setFormSubjectId('');
    setFormTopicId('');
    setFormQuestionText('');
    setFormDifficulty('easy');
    setFormQuestionType('single_choice');
    setFormPoints('1');
    setFormNegativePoints('0');
    setFormExplanation('');
    setFormOptionA('');
    setFormOptionB('');
    setFormOptionC('');
    setFormOptionD('');
    setFormCorrectOption('A');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (q) => {
    setModalType('edit');
    setCurrentQuestion(q);
    setFormCategoryId(q.categoryId ? String(q.categoryId) : '');
    setFormSubjectId(q.subjectId ? String(q.subjectId) : '');
    setFormTopicId(q.topicId ? String(q.topicId) : '');
    setFormQuestionText(q.questionText || '');
    setFormDifficulty(q.difficulty || 'easy');
    setFormQuestionType(q.questionType || 'single_choice');
    setFormPoints(q.points?.toString() || '1');
    setFormNegativePoints(q.negativePoints?.toString() || '0');
    setFormExplanation(q.explanation || '');
    setFormIsActive(q.isActive !== undefined ? q.isActive : true);

    const opts = q.options || [];
    setFormOptionA(opts[0]?.optionText || '');
    setFormOptionB(opts[1]?.optionText || '');
    setFormOptionC(opts[2]?.optionText || '');
    setFormOptionD(opts[3]?.optionText || '');

    let correctKey = 'A';
    if (opts[0]?.isCorrect) correctKey = 'A';
    else if (opts[1]?.isCorrect) correctKey = 'B';
    else if (opts[2]?.isCorrect) correctKey = 'C';
    else if (opts[3]?.isCorrect) correctKey = 'D';
    setFormCorrectOption(correctKey);

    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Classification Validations
    if (!formCategoryId) {
      toast.error('Please select a Category');
      return;
    }
    if (!formSubjectId) {
      toast.error('Please select a Subject');
      return;
    }
    if (!formTopicId) {
      toast.error('Please select a Topic');
      return;
    }

    // 2. Question Details Validations
    if (!formQuestionText.trim()) {
      toast.error('Question text is required');
      return;
    }
    if (!formOptionA.trim()) {
      toast.error('Option A is required');
      return;
    }
    if (!formOptionB.trim()) {
      toast.error('Option B is required');
      return;
    }

    // 3. Correct Answer Mapping Validation
    if (formCorrectOption === 'A' && !formOptionA.trim()) {
      toast.error('Option A is set as correct answer but is empty');
      return;
    }
    if (formCorrectOption === 'B' && !formOptionB.trim()) {
      toast.error('Option B is set as correct answer but is empty');
      return;
    }
    if (formCorrectOption === 'C' && !formOptionC.trim()) {
      toast.error('Option C is set as correct answer but is empty');
      return;
    }
    if (formCorrectOption === 'D' && !formOptionD.trim()) {
      toast.error('Option D is set as correct answer but is empty');
      return;
    }

    setSubmitting(true);
    const payload = {
      categoryId: parseInt(formCategoryId, 10),
      subjectId: parseInt(formSubjectId, 10),
      topicId: parseInt(formTopicId, 10),
      questionText: formQuestionText.trim(),
      questionType: formQuestionType,
      difficulty: formDifficulty,
      points: parseInt(formPoints, 10) || 1,
      negativePoints: parseFloat(formNegativePoints) || 0,
      explanation: formExplanation.trim(),
      isActive: formIsActive,
      option_a: formOptionA.trim(),
      option_b: formOptionB.trim(),
      option_c: formOptionC.trim(),
      option_d: formOptionD.trim(),
      correctOption: formCorrectOption,
    };

    try {
      if (modalType === 'add') {
        const res = await questionService.createQuestion(payload);
        if (res?.success) {
          toast.success('Question added successfully');
          fetchQuestions(false);
          setIsModalOpen(false);
        } else {
          toast.error(res?.message || 'Failed to create question');
        }
      } else {
        const res = await questionService.updateQuestion(currentQuestion.id, payload);
        if (res?.success) {
          toast.success('Question updated successfully');
          fetchQuestions(false);
          setIsModalOpen(false);
        } else {
          toast.error(res?.message || 'Failed to update question');
        }
      }
    } catch (err) {
      console.error('Error saving question:', err);
      const msg = err.response?.data?.message || 'Error saving question';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (q) => {
    setQuestionToDelete(q);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!questionToDelete) return;
    const id = typeof questionToDelete === 'object' ? questionToDelete.id : questionToDelete;
    setDeleting(true);
    try {
      const res = await questionService.deleteQuestion(id);
      if (res?.success) {
        toast.success('Question deleted successfully');
        fetchQuestions(false);
        setDeleteModalOpen(false);
        setQuestionToDelete(null);
      } else {
        toast.error(res?.message || 'Failed to delete question');
      }
    } catch (err) {
      console.error('Error deleting question:', err);
      toast.error('Failed to delete question');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'QID',
      cellClassName: 'font-mono text-[#E94B4B] font-bold',
      render: (val) => `QST${String(val).padStart(3, '0')}`,
    },
    {
      key: 'questionText',
      label: 'Question',
      cellClassName: 'font-medium max-w-[280px]',
      render: (val) => (
        <span title={val} className="line-clamp-2 text-white text-sm">
          {val}
        </span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      cellClassName: 'text-gray-300 text-xs font-semibold',
      render: (_, row) => row.category?.name || 'General',
    },
    {
      key: 'subject',
      label: 'Subject',
      cellClassName: 'text-amber-400/90 text-xs',
      render: (_, row) => row.subject?.name || '—',
    },
    {
      key: 'topic',
      label: 'Topic',
      cellClassName: 'text-green-400/90 text-xs',
      render: (_, row) => row.topic?.name || '—',
    },
    {
      key: 'difficulty',
      label: 'Difficulty',
      render: (val) => {
        const d = (val || 'easy').toLowerCase();
        return (
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
              d === 'easy'
                ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                : d === 'medium'
                ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
                : 'bg-red-500/15 text-red-400 border border-red-500/20'
            }`}
          >
            {d}
          </span>
        );
      },
    },
    {
      key: 'options',
      label: 'Correct Answer',
      cellClassName: 'text-white font-medium text-xs max-w-[150px] truncate',
      render: (opts) => {
        const correct = opts?.find((o) => o.isCorrect);
        return correct ? (
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 size={13} className="shrink-0" />
            <span className="truncate">{correct.optionText}</span>
          </span>
        ) : (
          <span className="text-gray-500">—</span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            title="Edit Question"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => handleOpenDeleteModal(row)}
            className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-red-500/15 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
            title="Delete Question"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#0f1117] text-white p-5 rounded-2xl shadow-sm border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold">Manage Question Bank</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E94B4B]/15 text-[#E94B4B] border border-[#E94B4B]/30">
              {questions.length} Questions
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Browse, search and manage questions organized by Category → Subject → Topic hierarchy.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all duration-200 ease-out cursor-pointer select-none hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-[#E94B4B]/35 active:translate-y-0 active:scale-[0.97] shrink-0"
          style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
        >
          <Plus size={16} /> Add Question
        </button>
      </div>

      {/* Main Table Card with Hierarchy Filter Bar */}
      <div className="bg-[#0f1117] text-white rounded-2xl shadow-sm border border-white/10 overflow-hidden flex flex-col">
        {/* Filters Toolbar */}
        <div className="p-4 sm:p-5 space-y-3 border-b border-white/10">
          <div className="flex flex-col lg:flex-row justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search questions by keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchQuestions()}
                className="pl-9 pr-4 py-2 w-full border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
              />
            </div>

            {/* Hierarchical Filter Selectors */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={handleFilterCategoryChange}
                className="px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] cursor-pointer"
                title="Filter by Category"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Subject Filter (Dependent on Category) */}
              <select
                value={filterSubject}
                onChange={handleFilterSubjectChange}
                disabled={filterCategory === 'all' || filterAvailableSubjects.length === 0}
                className="px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Filter by Subject (Select Category first)"
              >
                <option value="all">
                  {filterCategory === 'all'
                    ? 'All Subjects'
                    : filterAvailableSubjects.length === 0
                    ? 'No Subjects'
                    : 'All Subjects in Category'}
                </option>
                {filterAvailableSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {/* Topic Filter (Dependent on Subject) */}
              <select
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                disabled={filterSubject === 'all' || filterAvailableTopics.length === 0}
                className="px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Filter by Topic (Select Subject first)"
              >
                <option value="all">
                  {filterSubject === 'all'
                    ? 'All Topics'
                    : filterAvailableTopics.length === 0
                    ? 'No Topics'
                    : 'All Topics in Subject'}
                </option>
                {filterAvailableTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              {/* Difficulty Filter */}
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] cursor-pointer"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              {/* Refresh */}
              <button
                onClick={fetchQuestions}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-600 hover:bg-gray-800 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                <RotateCw size={13} className={loading ? 'animate-spin text-[#E94B4B]' : 'text-[#E94B4B]'} /> Refresh
              </button>
            </div>
          </div>

          {/* Active Filter Path Breadcrumb Indicator */}
          {(filterCategory !== 'all' || filterSubject !== 'all' || filterTopic !== 'all') && (
            <div className="pt-2 flex items-center gap-2 text-xs text-gray-400">
              <span className="font-semibold text-gray-300">Active Hierarchy Filter:</span>
              <span className="text-[#E94B4B] font-bold">
                {categories.find((c) => String(c.id) === String(filterCategory))?.name || 'All Categories'}
              </span>
              {filterSubject !== 'all' && (
                <>
                  <span>→</span>
                  <span className="text-amber-400 font-bold">
                    {subjects.find((s) => String(s.id) === String(filterSubject))?.name || 'All Subjects'}
                  </span>
                </>
              )}
              {filterTopic !== 'all' && (
                <>
                  <span>→</span>
                  <span className="text-green-400 font-bold">
                    {topics.find((t) => String(t.id) === String(filterTopic))?.name || 'All Topics'}
                  </span>
                </>
              )}
              <button
                onClick={() => {
                  setFilterCategory('all');
                  setFilterSubject('all');
                  setFilterTopic('all');
                }}
                className="ml-2 text-xs text-white/50 hover:text-white underline cursor-pointer"
              >
                Clear Hierarchy
              </button>
            </div>
          )}
        </div>

        {/* Table Content */}
        <Table columns={columns} data={questions} loading={loading} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          ADD / EDIT QUESTION SCREEN (MODAL)
          ═══════════════════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1117] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E94B4B]/15 flex items-center justify-center text-[#E94B4B]">
                  {modalType === 'add' ? <Plus className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {modalType === 'add' ? 'Add New Question' : 'Edit Question Details'}
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    Specify question classification, details, and multiple choice options.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* SECTION 1: QUESTION CLASSIFICATION */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#E94B4B]" />
                    Question Classification
                  </h3>
                  <span className="text-[10px] text-gray-400 italic">Category → Subject → Topic</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Category <span className="text-[#E94B4B]">*</span>
                    </label>
                    <select
                      required
                      value={formCategoryId}
                      onChange={handleModalCategoryChange}
                      className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Subject <span className="text-[#E94B4B]">*</span>
                    </label>
                    <select
                      required
                      value={formSubjectId}
                      onChange={handleModalSubjectChange}
                      disabled={!formCategoryId}
                      className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!formCategoryId
                          ? 'Select Category first'
                          : modalAvailableSubjects.length === 0
                          ? 'No Subjects in Category'
                          : 'Select Subject'}
                      </option>
                      {modalAvailableSubjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Topic */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Topic <span className="text-[#E94B4B]">*</span>
                    </label>
                    <select
                      required
                      value={formTopicId}
                      onChange={(e) => setFormTopicId(e.target.value)}
                      disabled={!formSubjectId}
                      className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!formSubjectId
                          ? 'Select Subject first'
                          : modalAvailableTopics.length === 0
                          ? 'No Topics in Subject'
                          : 'Select Topic'}
                      </option>
                      {modalAvailableTopics.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: QUESTION DETAILS */}
              <div className="space-y-4">
                <div className="border-b border-white/10 pb-2">
                  <h3 className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                    <FileQuestion className="w-3.5 h-3.5 text-[#E94B4B]" />
                    Question Details
                  </h3>
                </div>

                {/* Question Text */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    Question Text <span className="text-[#E94B4B]">*</span>
                  </label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Enter the complete question text..."
                    value={formQuestionText}
                    onChange={(e) => setFormQuestionText(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white placeholder-gray-500 focus:outline-none focus:border-[#E94B4B]"
                  />
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-300">
                      Answer Options <span className="text-[#E94B4B]">*</span>
                    </label>
                    <span className="text-[11px] text-amber-400 font-semibold">
                      Select the radio button to mark the Correct Answer *
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {/* Option A */}
                    <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                      formCorrectOption === 'A' ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/10'
                    }`}>
                      <input
                        type="radio"
                        name="correctOption"
                        id="optA"
                        checked={formCorrectOption === 'A'}
                        onChange={() => setFormCorrectOption('A')}
                        className="accent-[#E94B4B] w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="optA" className="text-xs font-bold text-white w-6 cursor-pointer">
                        A:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Option A text (Required)..."
                        value={formOptionA}
                        onChange={(e) => setFormOptionA(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                      />
                      {formCorrectOption === 'A' && (
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20">
                          Correct
                        </span>
                      )}
                    </div>

                    {/* Option B */}
                    <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                      formCorrectOption === 'B' ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/10'
                    }`}>
                      <input
                        type="radio"
                        name="correctOption"
                        id="optB"
                        checked={formCorrectOption === 'B'}
                        onChange={() => setFormCorrectOption('B')}
                        className="accent-[#E94B4B] w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="optB" className="text-xs font-bold text-white w-6 cursor-pointer">
                        B:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Option B text (Required)..."
                        value={formOptionB}
                        onChange={(e) => setFormOptionB(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                      />
                      {formCorrectOption === 'B' && (
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20">
                          Correct
                        </span>
                      )}
                    </div>

                    {/* Option C */}
                    <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                      formCorrectOption === 'C' ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/10'
                    }`}>
                      <input
                        type="radio"
                        name="correctOption"
                        id="optC"
                        checked={formCorrectOption === 'C'}
                        onChange={() => setFormCorrectOption('C')}
                        className="accent-[#E94B4B] w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="optC" className="text-xs font-bold text-white w-6 cursor-pointer">
                        C:
                      </label>
                      <input
                        type="text"
                        placeholder="Option C text (Optional)..."
                        value={formOptionC}
                        onChange={(e) => setFormOptionC(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                      />
                      {formCorrectOption === 'C' && (
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20">
                          Correct
                        </span>
                      )}
                    </div>

                    {/* Option D */}
                    <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                      formCorrectOption === 'D' ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/10'
                    }`}>
                      <input
                        type="radio"
                        name="correctOption"
                        id="optD"
                        checked={formCorrectOption === 'D'}
                        onChange={() => setFormCorrectOption('D')}
                        className="accent-[#E94B4B] w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="optD" className="text-xs font-bold text-white w-6 cursor-pointer">
                        D:
                      </label>
                      <input
                        type="text"
                        placeholder="Option D text (Optional)..."
                        value={formOptionD}
                        onChange={(e) => setFormOptionD(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                      />
                      {formCorrectOption === 'D' && (
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20">
                          Correct
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: SETTINGS & SCORING */}
              <div className="space-y-4 border-t border-white/10 pt-4">
                <div className="border-b border-white/10 pb-2">
                  <h3 className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E94B4B]" />
                    Question Settings & Scoring
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Difficulty */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">Difficulty Level</label>
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  {/* Points */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">Marks / Points (+)</label>
                    <input
                      type="number"
                      min="1"
                      value={formPoints}
                      onChange={(e) => setFormPoints(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                    />
                  </div>

                  {/* Negative Points */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">Negative Marks (-)</label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      value={formNegativePoints}
                      onChange={(e) => setFormNegativePoints(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                    />
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    Explanation / Solution Notes (Optional)
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Provide explanatory solution shown to players upon contest completion..."
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-600 hover:bg-gray-800 text-gray-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 text-white rounded-xl text-xs font-bold transition-all duration-150 ease-out cursor-pointer select-none hover:-translate-y-0.5 hover:brightness-115 hover:shadow-lg hover:shadow-[#E94B4B]/40 active:translate-y-0.5 active:scale-95 active:brightness-90 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                  style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{modalType === 'add' ? 'Creating...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <span>{modalType === 'add' ? 'Create Question' : 'Save Changes'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Question Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
            setQuestionToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Question?"
        message={"Are you sure you want to delete this question?\nThis action cannot be undone."}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={deleting}
      />
    </div>
  );
};

export default ManageQuestionBank;
