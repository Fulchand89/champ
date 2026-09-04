import React, { useState, useEffect, useRef } from 'react';
import { Trophy, HelpCircle, Coins, Clock, Info, Calendar, Loader2, Upload, Users, Timer, X, ChevronDown, Check } from 'lucide-react';
import { categoryService } from '../../api/services/categoryService';
import { subjectService } from '../../api/services/subjectService';
import { topicService } from '../../api/services/topicService';
import { contestService } from '../../api/services/contestService';
import { getImageUrl } from '../../api/services/api';
import toast from 'react-hot-toast';

const CreateContest = () => {
  const [successMsg, setSuccessMsg] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);
  const topicsDropdownRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subject, setSubject] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [minParticipants, setMinParticipants] = useState('2');
  const [maxParticipants, setMaxParticipants] = useState('100');
  const [startTime, setStartTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('15');
  const [durationPerQuestion, setDurationPerQuestion] = useState('15');
  const [numQuestions, setNumQuestions] = useState('10');

  // Image upload states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res?.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Close topics dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (topicsDropdownRef.current && !topicsDropdownRef.current.contains(event.target)) {
        setIsTopicsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch subjects dynamically when category changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!categoryId) {
        setSubjects([]);
        return;
      }
      setLoadingSubjects(true);
      try {
        const res = await subjectService.getSubjects(categoryId);
        if (res?.success && res.data) {
          setSubjects(res.data);
        }
      } catch (err) {
        console.error('Error loading subjects:', err);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [categoryId]);

  // Fetch topics dynamically when subject or category changes
  useEffect(() => {
    const fetchTopics = async () => {
      if (!categoryId && !subject) {
        setTopics([]);
        return;
      }
      setLoadingTopics(true);
      try {
        const matchedSubject = subjects.find(s => String(s.id) === String(subject));
        const subId = matchedSubject ? matchedSubject.id : null;
        const res = await topicService.getTopics(subId);
        
        let fetchedTopics = [];
        if (res?.success && Array.isArray(res.data)) {
          fetchedTopics = res.data;
        } else if (Array.isArray(res)) {
          fetchedTopics = res;
        }

        // Only show topics for the selected category if no specific subject is selected
        if (!subId && categoryId) {
          fetchedTopics = fetchedTopics.filter(t => String(t.subject?.categoryId) === String(categoryId));
        }

        setTopics(fetchedTopics);
      } catch (err) {
        console.error('Error loading topics:', err);
        setTopics([]);
      } finally {
        setLoadingTopics(false);
      }
    };
    fetchTopics();
    setSelectedTopics([]);
  }, [subject, categoryId, subjects]);

  const toggleTopic = (topicObj) => {
    setSelectedTopics((prev) => {
      const exists = prev.some((t) => t.id === topicObj.id);
      if (exists) {
        return prev.filter((t) => t.id !== topicObj.id);
      } else {
        return [...prev, topicObj];
      }
    });
  };

  const removeTopic = (topicId) => {
    setSelectedTopics((prev) => prev.filter((t) => t.id !== topicId));
  };

  const handleOpenPicker = (e) => {
    const input = e.currentTarget.querySelector('input') || e.target;
    if (input && typeof input.showPicker === 'function') {
      try {
        input.showPicker();
      } catch (err) {
        // Fallback for browser restrictions
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/svg+xml'];
      const isSvg = file.name.toLowerCase().endsWith('.svg');
      if (!validTypes.includes(file.type) && !isSvg) {
        toast.error('Only JPG, JPEG, PNG, WEBP, or SVG images are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter contest title');
      return;
    }
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }
    if (!startTime) {
      toast.error('Please select start date and time');
      return;
    }

    const minPart = parseInt(minParticipants, 10);
    const maxPart = parseInt(maxParticipants, 10);
    const durMin = parseInt(durationMinutes, 10);
    const durSec = parseInt(durationPerQuestion, 10);
    const totalQues = parseInt(numQuestions, 10);

    if (isNaN(minPart) || minPart < 1) {
      toast.error('Min participants must be at least 1');
      return;
    }
    if (isNaN(maxPart) || maxPart < minPart) {
      toast.error('Max participants must be greater than or equal to Min participants');
      return;
    }
    if (isNaN(durMin) || durMin < 1) {
      toast.error('Duration must be at least 1 minute');
      return;
    }
    if (isNaN(durSec) || durSec < 5) {
      toast.error('Duration per question must be at least 5 seconds');
      return;
    }
    if (isNaN(totalQues) || totalQues < 1) {
      toast.error('Number of questions must be at least 1');
      return;
    }

    setSubmitting(true);
    setSuccessMsg(false);

    try {
      const start = new Date(startTime);
      const end = new Date(start.getTime() + durMin * 60 * 1000);

      // Find subject ID if selected from list
      const matchedSubject = subjects.find(s => String(s.id) === String(subject));
      const topicIds = selectedTopics.map(t => t.id);

      const descParts = [];
      if (matchedSubject) descParts.push(`Subject: ${matchedSubject.name}`);
      if (selectedTopics.length > 0) descParts.push(`Topics: ${selectedTopics.map(t => t.name).join(', ')}`);

      const jsonPayload = {
        title: title.trim(),
        description: descParts.join(' | '),
        categoryId: parseInt(categoryId, 10) || categoryId,
        subjectId: matchedSubject?.id || null,
        topicIds: topicIds,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        entryFee: parseFloat(entryFee) || 0,
        prizePool: Math.max(0, (parseFloat(entryFee) || 0) * maxPart * 0.9),
        minParticipants: minPart,
        maxParticipants: maxPart,
        durationMinutes: durMin,
        isActive: true,
      };

      let res;
      if (imageFile) {
        const formData = new FormData();
        Object.entries(jsonPayload).forEach(([key, val]) => {
          if (Array.isArray(val)) {
            formData.append(key, JSON.stringify(val));
          } else {
            formData.append(key, val !== null && val !== undefined ? val : '');
          }
        });
        formData.append('image', imageFile);
        res = await contestService.createContest(formData);
      } else {
        res = await contestService.createContest(jsonPayload);
      }

      if (res?.success || res?.data) {
        toast.success('Contest created and launched successfully!');
        setSuccessMsg(true);
        setTitle('');
        setCategoryId('');
        setSubject('');
        setSelectedTopics([]);
        setEntryFee('');
        setMinParticipants('2');
        setMaxParticipants('100');
        setStartTime('');
        setDurationMinutes('15');
        setDurationPerQuestion('15');
        setNumQuestions('10');
        setImageFile(null);
        setImagePreview('');
      } else {
        toast.error(res?.message || 'Failed to create contest');
      }
    } catch (err) {
      console.error('Error creating contest:', err);
      console.error('Backend full error response detail:', JSON.stringify(err.response?.data || {}, null, 2));
      const data = err.response?.data;
      let errMsg = 'Failed to create contest (Server 500 Error)';
      if (typeof data === 'string') {
        errMsg = data.includes('<!DOCTYPE') ? 'Backend server error (500) - Please check backend database logs' : data;
      } else if (data?.sqlMessage) {
        errMsg = `Database Error: ${data.sqlMessage}`;
      } else if (data?.message) {
        errMsg = data.message;
      } else if (data?.error) {
        errMsg = typeof data.error === 'string' ? data.error : (data.error.sqlMessage || data.error.message || JSON.stringify(data.error));
      } else if (Array.isArray(data?.errors) && data.errors.length > 0) {
        errMsg = data.errors.map(e => (typeof e === 'string' ? e : e.message || e.msg || JSON.stringify(e))).join(', ');
      } else if (err.message) {
        errMsg = err.message;
      }
      toast.error(errMsg, { duration: 8000 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="bg-[#0f1117] text-white p-5 rounded-2xl shadow-sm border border-white/10">
        <h1 className="text-xl font-bold">Create Contest</h1>
        <p className="text-xs text-gray-400 mt-1">Configure and launch a new live or scheduled quiz contest with custom cover image.</p>
      </div>

      <div className="bg-[#0f1117] text-white p-4 sm:p-6 rounded-2xl border border-white/10 w-full space-y-6">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Trophy className="text-[#E94B4B]" /> Contest Specifications
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Title *, Category * */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Contest Title *</label>
              <input
                required
                type="text"
                placeholder="e.g. Weekly Grand GK Challenge"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Category *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubject('');
                }}
                className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Loading categories...</option>
                )}
              </select>
            </div>
          </div>

          {/* Row 2: Subject, Topics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={loadingSubjects || !categoryId}
                className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] cursor-pointer disabled:opacity-50"
              >
                <option value="">{loadingSubjects ? 'Loading subjects...' : (subjects.length > 0 ? 'Select Subject' : 'General / All Topics')}</option>
                {subjects.length > 0 && subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Topics Multi-select */}
            <div className="relative" ref={topicsDropdownRef}>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Topics</label>
              <div
                onClick={() => !loadingTopics && setIsTopicsOpen(!isTopicsOpen)}
                className={`w-full min-h-[38px] px-3 py-1.5 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white flex items-center justify-between cursor-pointer focus:outline-none ${
                  isTopicsOpen ? 'border-[#E94B4B]' : ''
                }`}
              >
                <div className="flex flex-wrap items-center gap-1.5 flex-1 pr-2">
                  {selectedTopics.length > 0 ? (
                    selectedTopics.map((top) => (
                      <span
                        key={top.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#E94B4B]/20 text-[#E94B4B] border border-[#E94B4B]/30 text-xs font-medium"
                      >
                        {top.name}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTopic(top.id);
                          }}
                          className="hover:text-white transition-colors cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">
                      {loadingTopics
                        ? 'Loading topics...'
                        : (topics.length > 0 ? 'Select Topics' : 'General / All Topics')}
                    </span>
                  )}
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isTopicsOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Dropdown Menu */}
              {isTopicsOpen && (
                <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-[#141722] border border-gray-700 rounded-lg shadow-xl py-1">
                  {topics.length > 0 ? (
                    topics.map((top) => {
                      const isSelected = selectedTopics.some((t) => t.id === top.id);
                      return (
                        <div
                          key={top.id}
                          onClick={() => toggleTopic(top)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-200 hover:bg-[#E94B4B]/10 hover:text-white cursor-pointer transition-colors"
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-[#E94B4B] border-[#E94B4B] text-white'
                                : 'border-gray-500 bg-[#0f1117]'
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                          <span className="font-medium">{top.name}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-3 py-2 text-xs text-gray-400 text-center">
                      No topics available for selected subject
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Contest Image Upload */}
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <label className="block text-xs font-bold text-gray-300 mb-2">Contest Cover Image (Optional)</label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:flex-1 border border-dashed border-white/20 hover:border-[#E94B4B] rounded-xl p-3 text-center cursor-pointer transition-colors bg-[#0f1117] flex flex-col items-center justify-center gap-1.5"
              >
                <Upload size={18} className="text-[#E94B4B]" />
                <p className="text-xs text-gray-300 font-medium">{imageFile ? imageFile.name : 'Click to select contest image'}</p>
                <p className="text-[10px] text-gray-500">JPG, PNG, WEBP, SVG (Max 5MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp,image/svg+xml,.svg"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {imagePreview && (
                <div className="flex items-center gap-3 p-2 bg-[#0f1117] rounded-xl border border-white/15">
                  <img src={getImageUrl(imagePreview)} alt="Preview" className="w-14 h-14 object-contain rounded-lg" />
                  <div>
                    <p className="text-xs font-semibold text-white">Selected Image</p>
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                      }}
                      className="text-[10px] text-[#E94B4B] hover:underline cursor-pointer mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Entry Fee, Min Participants, Max Participants */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Entry Fee (₹)</label>
              <div className="relative">
                <Coins size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  placeholder="0 for Free or e.g. 50"
                  value={entryFee}
                  onChange={(e) => setEntryFee(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-white/15 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Min Participants *</label>
              <div className="relative">
                <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E94B4B]" />
                <input
                  required
                  type="number"
                  min="1"
                  placeholder="e.g. 2"
                  value={minParticipants}
                  onChange={(e) => setMinParticipants(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-white/15 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Max Participants *</label>
              <div className="relative">
                <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E94B4B]" />
                <input
                  required
                  type="number"
                  min="2"
                  placeholder="e.g. 100"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-white/15 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Contest Starts At, Duration (Minutes), Duration per Question (Seconds), Number of Questions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Contest Starts At *</label>
              <div 
                onClick={handleOpenPicker}
                className="relative cursor-pointer"
              >
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E94B4B] pointer-events-none" />
                <input
                  required
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-white/15 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] [color-scheme:dark] cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Duration (Minutes) *</label>
              <div className="relative">
                <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E94B4B]" />
                <input
                  required
                  type="number"
                  min="1"
                  placeholder="e.g. 15"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-white/15 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Duration per Question (Seconds) *</label>
              <div className="relative">
                <Timer size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E94B4B]" />
                <input
                  required
                  type="number"
                  min="5"
                  placeholder="e.g. 15"
                  value={durationPerQuestion}
                  onChange={(e) => setDurationPerQuestion(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-white/15 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Number of Questions *</label>
              <div className="relative">
                <HelpCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="number"
                  min="1"
                  placeholder="e.g. 10"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-white/15 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-white/10">
            <button
              disabled={submitting}
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 text-white rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer hover:opacity-90 hover:brightness-110 hover:shadow-lg hover:shadow-[#E94B4B]/30 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {submitting ? 'Launching...' : 'Launch Contest'}
            </button>
          </div>
        </form>

        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-xl flex items-start gap-3 mt-4">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Contest Created Successfully</p>
              <p className="text-xs text-gray-400 mt-1">The contest has been launched and saved in the database.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateContest;
