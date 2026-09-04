import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { questionService } from '../../api/services/questionService';
import { categoryService } from '../../api/services/categoryService';
import { subjectService } from '../../api/services/subjectService';
import { topicService } from '../../api/services/topicService';
import { ROUTES } from '../../constants/routes';
import toast from 'react-hot-toast';

const UploadQuestions = () => {
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);

  const [categoryId, setCategoryId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  // Dynamic filtered lists based on parent selection
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);

  useEffect(() => {
    const fetchMetadata = async () => {
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
        console.error('Error fetching metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Update filtered subjects when Category changes
  useEffect(() => {
    if (!categoryId) {
      setFilteredSubjects([]);
      setSubjectId('');
      setFilteredTopics([]);
      setTopicId('');
      return;
    }
    const filtered = subjects.filter((s) => String(s.categoryId) === String(categoryId));
    setFilteredSubjects(filtered);
    setSubjectId('');
    setFilteredTopics([]);
    setTopicId('');
  }, [categoryId, subjects]);

  // Update filtered topics when Subject changes
  useEffect(() => {
    if (!subjectId) {
      setFilteredTopics([]);
      setTopicId('');
      return;
    }
    const filtered = topics.filter((t) => String(t.subjectId) === String(subjectId));
    setFilteredTopics(filtered);
    setTopicId('');
  }, [subjectId, topics]);

  const handleCategoryChange = (e) => {
    const newCatId = e.target.value;
    setCategoryId(newCatId);
  };

  const handleSubjectChange = (e) => {
    const newSubId = e.target.value;
    setSubjectId(newSubId);
  };

  const handleTopicChange = (e) => {
    setTopicId(e.target.value);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.txt')) {
      toast.error('Please upload a CSV file format');
      return;
    }
    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error('Please select a Category');
      return;
    }
    if (!subjectId) {
      toast.error('Please select a Subject');
      return;
    }
    if (!topicId) {
      toast.error('Please select a Topic');
      return;
    }
    if (!selectedFile) {
      toast.error('Please select a CSV file to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('categoryId', categoryId);
    formData.append('subjectId', subjectId);
    formData.append('topicId', topicId);

    try {
      const res = await questionService.uploadQuestions(formData);
      if (res?.success) {
        toast.success(res.message || 'Questions uploaded successfully');
        setUploadResult(res.data);
      }
    } catch (err) {
      console.error('Error uploading questions:', err);
      const msg = err.response?.data?.message || 'Failed to upload CSV file';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await questionService.downloadTemplate();
      toast.success('CSV Template downloaded');
    } catch (err) {
      console.error('Error downloading template:', err);
      // Fallback client-side generation
      const csv =
        'question,option_a,option_b,option_c,option_d,correct_option,difficulty,explanation\n' +
        '"What is the SI unit of power?","Joule","Watt","Newton","Pascal","B","easy","Watt is the SI unit of power."\n' +
        '"Which element has atomic number 1?","Helium","Hydrogen","Lithium","Oxygen","B","easy","Hydrogen has atomic number 1."\n';
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'question_bank_template.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0f1117] text-white p-5 rounded-2xl shadow-sm border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold">Upload Questions</h1>
          <p className="text-xs text-gray-400 mt-1">
            Bulk upload quiz questions to the question bank using CSV templates organized by Category → Subject → Topic hierarchy.
          </p>
        </div>
        <Link
          to={ROUTES.ADMIN.QUESTION_BANK}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-600 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
        >
          View Question Bank <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0f1117] text-white p-6 rounded-2xl border border-white/10 space-y-6">
          <h2 className="text-lg font-bold">Import Questions File</h2>

          <form onSubmit={handleUpload} className="space-y-5">
            {/* Category / Subject / Topic target hierarchy */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  1. Target Category <span className="text-[#E94B4B]">*</span>
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={handleCategoryChange}
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

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  2. Target Subject <span className="text-[#E94B4B]">*</span>
                </label>
                <select
                  required
                  value={subjectId}
                  onChange={handleSubjectChange}
                  disabled={!categoryId}
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!categoryId
                      ? 'Select Category first'
                      : filteredSubjects.length === 0
                      ? 'No Subjects Available'
                      : 'Select Subject'}
                  </option>
                  {filteredSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  3. Target Topic <span className="text-[#E94B4B]">*</span>
                </label>
                <select
                  required
                  value={topicId}
                  onChange={handleTopicChange}
                  disabled={!subjectId}
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-xs bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!subjectId
                      ? 'Select Subject first'
                      : filteredTopics.length === 0
                      ? 'No Topics Available'
                      : 'Select Topic'}
                  </option>
                  {filteredTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hierarchy Path Badge */}
            {categoryId && (
              <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 flex items-center gap-2">
                <span className="font-semibold text-white">Target Hierarchy:</span>
                <span className="text-[#E94B4B] font-bold">
                  {categories.find((c) => String(c.id) === String(categoryId))?.name || 'Category'}
                </span>
                <span className="text-gray-500">→</span>
                <span className={subjectId ? 'text-amber-400 font-bold' : 'text-gray-500 italic'}>
                  {subjects.find((s) => String(s.id) === String(subjectId))?.name || 'Select Subject'}
                </span>
                <span className="text-gray-500">→</span>
                <span className={topicId ? 'text-green-400 font-bold' : 'text-gray-500 italic'}>
                  {topics.find((t) => String(t.id) === String(topicId))?.name || 'Select Topic'}
                </span>
              </div>
            )}

            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-[#E94B4B] bg-[#E94B4B]/10'
                  : 'border-gray-600 hover:border-gray-500 bg-[#0f1117]'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-[#E94B4B] mb-3" />
              <p className="text-sm font-semibold text-white">
                {selectedFile ? selectedFile.name : 'Drag & drop your CSV file here'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB selected`
                  : 'or click to browse from your computer'}
              </p>
              <input
                type="file"
                accept=".csv,.txt"
                className="hidden"
                id="file-upload"
                onChange={handleFileChange}
              />
              <label
                htmlFor="file-upload"
                className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                {selectedFile ? 'Change File' : 'Select CSV File'}
              </label>
            </div>

            {/* Upload submit button */}
            <button
              type="submit"
              disabled={!selectedFile || uploading || !categoryId || !subjectId || !topicId}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-white rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer hover:opacity-90 hover:brightness-110 hover:shadow-lg hover:shadow-[#E94B4B]/30 active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Uploading & Processing...
                </>
              ) : (
                <>
                  <Upload size={16} /> Process & Import Questions
                </>
              )}
            </button>
          </form>

          {/* Results Summary */}
          {uploadResult && (
            <div className="space-y-4 pt-2 border-t border-white/10">
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">Questions Imported Successfully</p>
                  <p className="text-xs text-gray-300 mt-1">
                    {uploadResult.importedCount} of {uploadResult.totalRows} questions validated and
                    saved to the Question Bank under the selected Category, Subject, and Topic.
                  </p>
                </div>
              </div>

              {uploadResult.errors?.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-xs">
                    <AlertCircle size={15} /> Skipped Rows ({uploadResult.errors.length}):
                  </div>
                  <ul className="text-xs space-y-1 list-disc pl-5 text-gray-300 max-h-32 overflow-y-auto">
                    {uploadResult.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions Sidebar */}
        <div className="bg-[#0f1117] text-white p-6 rounded-2xl border border-white/10 space-y-4 h-fit">
          <h2 className="text-lg font-bold">CSV Template Guidelines</h2>
          <div className="space-y-3 text-xs text-gray-400">
            <p>1. Download and use the standard CSV template file below.</p>
            <p>
              2. Column headers must be exactly:
              <br />
              <code className="text-[#E94B4B] font-mono text-[11px] font-semibold">
                question, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation
              </code>
            </p>
            <p>
              3. <strong className="text-white">correct_option</strong> must be: <code>A</code>,{' '}
              <code>B</code>, <code>C</code>, or <code>D</code>.
            </p>
            <p>
              4. <strong className="text-white">difficulty</strong> must be: <code>Easy</code>,{' '}
              <code>Medium</code>, or <code>Hard</code>.
            </p>
            <p>
              5. All questions will automatically be assigned to the selected Category, Subject, and
              Topic.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-600 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileText size={14} /> Download CSV Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadQuestions;
