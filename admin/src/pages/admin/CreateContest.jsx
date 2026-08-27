import React, { useState, useEffect, useRef } from 'react';
import { Trophy, HelpCircle, Coins, Clock, Info, Calendar, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { categoryService } from '../../api/services/categoryService';
import { subjectService } from '../../api/services/subjectService';
import { contestService } from '../../api/services/contestService';
import { getImageUrl } from '../../api/services/api';
import toast from 'react-hot-toast';

const CreateContest = () => {
  const [successMsg, setSuccessMsg] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subject, setSubject] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [startTime, setStartTime] = useState('');
  const [numQuestions, setNumQuestions] = useState('10 Questions (Standard)');

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
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
        toast.error('Only JPG, JPEG, PNG, or WEBP images are allowed');
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
    if (!startTime) {
      toast.error('Please select start date and time');
      return;
    }

    setSubmitting(true);
    setSuccessMsg(false);

    try {
      const start = new Date(startTime);
      const questionCount = numQuestions.includes('30') ? 30 : (numQuestions.includes('20') ? 20 : 10);
      const duration = numQuestions.includes('30') ? 30 : (numQuestions.includes('20') ? 20 : 15);
      const end = new Date(start.getTime() + duration * 60 * 1000);

      // Find subject ID if selected from list
      const matchedSubject = subjects.find(s => s.name === subject || String(s.id) === String(subject));

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', subject ? `Subject: ${matchedSubject?.name || subject}` : '');
      if (categoryId) formData.append('categoryId', categoryId);
      if (matchedSubject?.id) formData.append('subjectId', matchedSubject.id);
      formData.append('startTime', start.toISOString());
      formData.append('endTime', end.toISOString());
      formData.append('entryFee', parseFloat(entryFee) || 0);
      formData.append('entryCoins', parseFloat(entryFee) ? Math.round(parseFloat(entryFee)) : 0);
      formData.append('platformCut', 10);
      formData.append('prizePool', parseFloat(prizePool) || 0);
      formData.append('maxParticipants', parseInt(maxParticipants, 10) || 100);
      formData.append('minParticipants', 2);
      formData.append('durationMinutes', duration);
      formData.append('numQuestions', questionCount);
      formData.append('status', 'scheduled');
      formData.append('isActive', true);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await contestService.createContest(formData);
      if (res?.success) {
        toast.success('Contest created and launched successfully!');
        setSuccessMsg(true);
        setTitle('');
        setCategoryId('');
        setSubject('');
        setEntryFee('');
        setPrizePool('');
        setMaxParticipants('');
        setStartTime('');
        setImageFile(null);
        setImagePreview('');
      }
    } catch (err) {
      console.error('Error creating contest:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to create contest';
      toast.error(errMsg);
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Contest Title</label>
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
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Category</label>
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
                  <option key={sub.id} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contest Image Upload */}
          <div className="bg-[#14182e]/40 p-4 rounded-xl border border-gray-800">
            <label className="block text-xs font-bold text-gray-300 mb-2">Contest Cover Image (Optional)</label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:flex-1 border border-dashed border-gray-600 hover:border-red-500 rounded-xl p-3 text-center cursor-pointer transition-colors bg-[#090b15] flex flex-col items-center justify-center gap-1.5"
              >
                <Upload size={18} className="text-red-400" />
                <p className="text-xs text-gray-300 font-medium">{imageFile ? imageFile.name : 'Click to select contest image'}</p>
                <p className="text-[10px] text-gray-500">JPG, PNG, WEBP (Max 5MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {imagePreview && (
                <div className="flex items-center gap-3 p-2 bg-[#090b15] rounded-xl border border-gray-700">
                  <img src={imagePreview} alt="Preview" className="w-14 h-14 object-contain rounded-lg" />
                  <div>
                    <p className="text-xs font-semibold text-white">Selected Image</p>
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                      }}
                      className="text-[10px] text-red-400 hover:underline cursor-pointer mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Entry Fee (₹)</label>
              <div className="relative">
                <Coins size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="number"
                  placeholder="e.g. 50"
                  value={entryFee}
                  onChange={(e) => setEntryFee(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Total Prize Pool (₹)</label>
              <div className="relative">
                <Trophy size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                <input
                  required
                  type="number"
                  placeholder="e.g. 5000"
                  value={prizePool}
                  onChange={(e) => setPrizePool(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Max Participants</label>
              <input
                required
                type="number"
                placeholder="e.g. 100"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Contest Starts At</label>
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
                  className="block w-full pl-9 pr-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] [color-scheme:dark] cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Number of Questions</label>
              <select 
                required 
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] cursor-pointer"
              >
                <option value="10 Questions (Standard)">10 Questions (Standard)</option>
                <option value="20 Questions (Grand)">20 Questions (Grand)</option>
                <option value="30 Questions (Ultra)">30 Questions (Ultra)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-white/10">
            <button
              disabled={submitting}
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
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
