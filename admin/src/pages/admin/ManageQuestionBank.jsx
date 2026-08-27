import React, { useState, useEffect } from 'react';
import { Search, Filter, RotateCw, Plus, Edit, Trash2, X, CheckCircle, HelpCircle } from 'lucide-react';
import Table from '../../components/common/Table';
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

  // Filters
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [currentQuestion, setCurrentQuestion] = useState(null);

  // Form states
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formTopicId, setFormTopicId] = useState('');
  const [formQuestionText, setFormQuestionText] = useState('');
  const [formDifficulty, setFormDifficulty] = useState('easy');
  const [formPoints, setFormPoints] = useState('1');
  const [formNegativePoints, setFormNegativePoints] = useState('0');
  const [formExplanation, setFormExplanation] = useState('');
  const [formOptionA, setFormOptionA] = useState('');
  const [formOptionB, setFormOptionB] = useState('');
  const [formOptionC, setFormOptionC] = useState('');
  const [formOptionD, setFormOptionD] = useState('');
  const [formCorrectOption, setFormCorrectOption] = useState('A');
  const [submitting, setSubmitting] = useState(false);

  // Subjects & topics for modal
  const [modalSubjects, setModalSubjects] = useState([]);
  const [modalTopics, setModalTopics] = useState([]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (filterCategory !== 'all') params.categoryId = filterCategory;
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
      setLoading(false);
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
      console.error('Error loading filters:', err);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [filterCategory, filterDifficulty]);

  // Modal dynamic subjects
  useEffect(() => {
    if (!formCategoryId) {
      setModalSubjects([]);
      setFormSubjectId('');
      return;
    }
    const filteredSubs = subjects.filter(
      (s) => String(s.categoryId) === String(formCategoryId)
    );
    setModalSubjects(filteredSubs);
  }, [formCategoryId, subjects]);

  // Modal dynamic topics
  useEffect(() => {
    if (!formSubjectId) {
      setModalTopics([]);
      setFormTopicId('');
      return;
    }
    const filteredTops = topics.filter(
      (t) => String(t.subjectId) === String(formSubjectId)
    );
    setModalTopics(filteredTops);
  }, [formSubjectId, topics]);

  const handleOpenAddModal = () => {
    setModalType('add');
    setCurrentQuestion(null);
    setFormCategoryId(categories[0]?.id || '');
    setFormSubjectId('');
    setFormTopicId('');
    setFormQuestionText('');
    setFormDifficulty('easy');
    setFormPoints('1');
    setFormNegativePoints('0');
    setFormExplanation('');
    setFormOptionA('');
    setFormOptionB('');
    setFormOptionC('');
    setFormOptionD('');
    setFormCorrectOption('A');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (q) => {
    setModalType('edit');
    setCurrentQuestion(q);
    setFormCategoryId(q.categoryId || '');
    setFormSubjectId(q.subjectId || '');
    setFormTopicId(q.topicId || '');
    setFormQuestionText(q.questionText || '');
    setFormDifficulty(q.difficulty || 'easy');
    setFormPoints(q.points?.toString() || '1');
    setFormNegativePoints(q.negativePoints?.toString() || '0');
    setFormExplanation(q.explanation || '');

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
    if (!formQuestionText.trim()) {
      toast.error('Question text is required');
      return;
    }
    if (!formOptionA.trim() || !formOptionB.trim()) {
      toast.error('At least Option A and Option B are required');
      return;
    }

    setSubmitting(true);
    const payload = {
      categoryId: formCategoryId ? parseInt(formCategoryId, 10) : null,
      subjectId: formSubjectId ? parseInt(formSubjectId, 10) : null,
      topicId: formTopicId ? parseInt(formTopicId, 10) : null,
      questionText: formQuestionText.trim(),
      difficulty: formDifficulty,
      points: parseInt(formPoints, 10) || 1,
      negativePoints: parseFloat(formNegativePoints) || 0,
      explanation: formExplanation.trim(),
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
          fetchQuestions();
          setIsModalOpen(false);
        }
      } else {
        const res = await questionService.updateQuestion(currentQuestion.id, payload);
        if (res?.success) {
          toast.success('Question updated successfully');
          fetchQuestions();
          setIsModalOpen(false);
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const res = await questionService.deleteQuestion(id);
        if (res?.success) {
          toast.success('Question deleted');
          fetchQuestions();
        }
      } catch (err) {
        console.error('Error deleting question:', err);
        toast.error('Failed to delete question');
      }
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'QID',
      cellClassName: 'font-mono text-[#E94B4B]',
      render: (val) => `QST${String(val).padStart(3, '0')}`,
    },
    {
      key: 'questionText',
      label: 'Question text',
      cellClassName: 'font-medium max-w-[280px] truncate',
      render: (val) => (
        <span title={val} className="line-clamp-2 text-white">
          {val}
        </span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      cellClassName: 'text-gray-300 text-xs',
      render: (_, row) => row.category?.name || 'General',
    },
    {
      key: 'subject',
      label: 'Subject',
      cellClassName: 'text-gray-300 text-xs',
      render: (_, row) => row.subject?.name || '—',
    },
    {
      key: 'topic',
      label: 'Topic',
      cellClassName: 'text-gray-400 text-xs',
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
                ? 'bg-green-500/15 text-green-400'
                : d === 'medium'
                ? 'bg-yellow-500/15 text-yellow-400'
                : 'bg-red-500/15 text-red-400'
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
      cellClassName: 'text-amber-400 font-medium text-xs max-w-[150px] truncate',
      render: (opts) => {
        const correct = opts?.find((o) => o.isCorrect);
        return correct ? correct.optionText : '—';
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
            className="p-1 text-gray-400 hover:text-white rounded transition-colors cursor-pointer"
            title="Edit Question"
          >
            <Edit size={15} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1 text-red-500/70 hover:text-red-500 rounded transition-colors cursor-pointer"
            title="Delete Question"
          >
            <Trash2 size={15} />
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
          <h1 className="text-xl font-bold">Question Bank</h1>
          <p className="text-xs text-gray-400 mt-1">
            Review, filter, edit or add individual quiz questions to your platform.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer hover:opacity-90"
          style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
        >
          <Plus size={16} /> Add Question
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#0f1117] text-white rounded-2xl shadow-sm border border-white/10 overflow-hidden flex flex-col">
        {/* Filters Bar */}
        <div className="p-5 flex flex-col lg:flex-row justify-between gap-4 border-b border-white/10">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions by text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchQuestions()}
              className="pl-9 pr-4 py-2 w-full border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Difficulty filter */}
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

            <button
              onClick={fetchQuestions}
              className="flex items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-800 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              <RotateCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Table Content */}
        <Table columns={columns} data={questions} loading={loading} />
      </div>

      {/* Add / Edit Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">
                {modalType === 'add' ? 'Add New Question' : 'Edit Question'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Category, Subject, Topic Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Category *</label>
                  <select
                    required
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Subject</label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    disabled={!formCategoryId}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] disabled:opacity-50"
                  >
                    <option value="">{modalSubjects.length > 0 ? 'Select Subject' : 'General / None'}</option>
                    {modalSubjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Topic</label>
                  <select
                    value={formTopicId}
                    onChange={(e) => setFormTopicId(e.target.value)}
                    disabled={!formSubjectId}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] disabled:opacity-50"
                  >
                    <option value="">{modalTopics.length > 0 ? 'Select Topic' : 'All Topics / None'}</option>
                    {modalTopics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Question Text *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Enter the complete question text..."
                  value={formQuestionText}
                  onChange={(e) => setFormQuestionText(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>

              {/* Difficulty & Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Difficulty</label>
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

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Points</label>
                  <input
                    type="number"
                    min="1"
                    value={formPoints}
                    onChange={(e) => setFormPoints(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Negative Points</label>
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

              {/* Options */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-gray-300">
                  Multiple Choice Options (Select radio for correct answer)
                </label>

                <div className="grid grid-cols-1 gap-2.5">
                  {/* Option A */}
                  <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <input
                      type="radio"
                      name="correctOption"
                      id="optA"
                      checked={formCorrectOption === 'A'}
                      onChange={() => setFormCorrectOption('A')}
                      className="accent-[#E94B4B] w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="optA" className="text-xs font-bold text-gray-300 w-8">
                      A:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Option A text..."
                      value={formOptionA}
                      onChange={(e) => setFormOptionA(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                    />
                  </div>

                  {/* Option B */}
                  <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <input
                      type="radio"
                      name="correctOption"
                      id="optB"
                      checked={formCorrectOption === 'B'}
                      onChange={() => setFormCorrectOption('B')}
                      className="accent-[#E94B4B] w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="optB" className="text-xs font-bold text-gray-300 w-8">
                      B:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Option B text..."
                      value={formOptionB}
                      onChange={(e) => setFormOptionB(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                    />
                  </div>

                  {/* Option C */}
                  <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <input
                      type="radio"
                      name="correctOption"
                      id="optC"
                      checked={formCorrectOption === 'C'}
                      onChange={() => setFormCorrectOption('C')}
                      className="accent-[#E94B4B] w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="optC" className="text-xs font-bold text-gray-300 w-8">
                      C:
                    </label>
                    <input
                      type="text"
                      placeholder="Option C text (Optional)..."
                      value={formOptionC}
                      onChange={(e) => setFormOptionC(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                    />
                  </div>

                  {/* Option D */}
                  <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <input
                      type="radio"
                      name="correctOption"
                      id="optD"
                      checked={formCorrectOption === 'D'}
                      onChange={() => setFormCorrectOption('D')}
                      className="accent-[#E94B4B] w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="optD" className="text-xs font-bold text-gray-300 w-8">
                      D:
                    </label>
                    <input
                      type="text"
                      placeholder="Option D text (Optional)..."
                      value={formOptionD}
                      onChange={(e) => setFormOptionD(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                    />
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  Explanation / Solution (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Explain why the answer is correct..."
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
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
                  className="px-5 py-2 text-white rounded-lg text-xs font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
                >
                  {submitting ? 'Saving...' : modalType === 'add' ? 'Create Question' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageQuestionBank;
