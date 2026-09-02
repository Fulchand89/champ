import React, { useState, useEffect, useRef } from 'react';
import { Search, RotateCw, Plus, Edit, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';
import Table from '../../components/common/Table';
import { contestService } from '../../api/services/contestService';
import { categoryService } from '../../api/services/categoryService';
import { getImageUrl } from '../../api/services/api';
import toast from 'react-hot-toast';

const ScheduleContest = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contests, setContests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [currentContest, setCurrentContest] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [minParticipants, setMinParticipants] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Image Upload states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const fetchContestsAndCategories = async () => {
    setLoading(true);
    try {
      const [contestRes, categoryRes] = await Promise.allSettled([
        contestService.getContests(),
        categoryService.getCategories()
      ]);

      if (contestRes.status === 'fulfilled' && contestRes.value?.success) {
        setContests(contestRes.value.data || []);
      }

      if (categoryRes.status === 'fulfilled' && categoryRes.value?.success) {
        setCategories(categoryRes.value.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContestsAndCategories();
  }, []);

  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const tzoffset = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date.getTime() - tzoffset).toISOString().slice(0, -1);
      return localISOTime.substring(0, 16);
    } catch {
      return '';
    }
  };

  const handleOpenAddModal = () => {
    setModalType('add');
    setCurrentContest(null);
    setTitle('');
    setDescription('');
    setCategoryId(categories[0]?.id || '');
    setStartTime('');
    setEndTime('');
    setEntryFee('0');
    setPrizePool('0');
    setMaxParticipants('100');
    setMinParticipants('2');
    setDurationMinutes('15');
    setIsActive(true);
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cnt) => {
    if (!cnt) return;
    setModalType('edit');
    setCurrentContest(cnt);
    setTitle(cnt.title || '');
    setDescription(cnt.description || '');
    setCategoryId(cnt.categoryId || '');
    setStartTime(formatDateTimeForInput(cnt.startTime));
    setEndTime(formatDateTimeForInput(cnt.endTime));
    setEntryFee(cnt.entryFee !== undefined ? parseFloat(cnt.entryFee).toString() : '0');
    setPrizePool(cnt.prizePool !== undefined ? parseFloat(cnt.prizePool).toString() : '0');
    setMaxParticipants(cnt.maxParticipants?.toString() || '100');
    setMinParticipants(cnt.minParticipants?.toString() || '2');
    setDurationMinutes(cnt.durationMinutes?.toString() || '15');
    setIsActive(cnt.isActive !== undefined ? cnt.isActive : true);
    setImageFile(null);
    setImagePreview(cnt.image || '');
    setIsModalOpen(true);
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
      toast.error('Contest title is required');
      return;
    }
    if (!startTime || !endTime) {
      toast.error('Start time and End time are required');
      return;
    }

    const jsonPayload = {
      title: title.trim(),
      description: description || '',
      categoryId: parseInt(categoryId, 10) || categoryId,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      entryFee: parseFloat(entryFee) || 0,
      prizePool: parseFloat(prizePool) || 0,
      maxParticipants: parseInt(maxParticipants, 10) || 100,
      minParticipants: parseInt(minParticipants, 10) || 2,
      durationMinutes: parseInt(durationMinutes, 10) || 15,
      isActive: true,
    };

    try {
      let res;
      if (imageFile) {
        const formData = new FormData();
        Object.entries(jsonPayload).forEach(([key, val]) => {
          formData.append(key, val);
        });
        formData.append('image', imageFile);
        if (!imagePreview && currentContest?.image) {
          formData.append('removeImage', 'true');
        }
        try {
          if (modalType === 'add') {
            res = await contestService.createContest(formData);
          } else {
            res = await contestService.updateContest(currentContest.id, formData);
          }
        } catch (formErr) {
          console.warn('FormData submission failed, retrying with JSON payload:', formErr);
          if (modalType === 'add') {
            res = await contestService.createContest(jsonPayload);
          } else {
            res = await contestService.updateContest(currentContest.id, jsonPayload);
          }
        }
      } else {
        if (modalType === 'add') {
          res = await contestService.createContest(jsonPayload);
        } else {
          res = await contestService.updateContest(currentContest.id, jsonPayload);
        }
      }

      if (res?.success || res?.data) {
        toast.success(`Contest ${modalType === 'add' ? 'scheduled' : 'updated'} successfully`);
        fetchContestsAndCategories();
        setIsModalOpen(false);
      } else {
        toast.error(res?.message || `Failed to ${modalType === 'add' ? 'schedule' : 'update'} contest`);
      }
    } catch (err) {
      console.error('Error saving contest:', err);
      console.error('Backend full error response detail:', JSON.stringify(err.response?.data || {}, null, 2));
      const data = err.response?.data;
      let errMsg = 'Failed to save contest (Server 500 Error)';
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
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contest?')) {
      try {
        const res = await contestService.deleteContest(id);
        if (res?.success) {
          toast.success('Contest deleted successfully');
          fetchContestsAndCategories();
        }
      } catch (err) {
        console.error('Error deleting contest:', err);
        toast.error('Failed to delete contest');
      }
    }
  };

  const handleToggleStatus = async (cnt) => {
    const formData = new FormData();
    formData.append('title', cnt.title);
    formData.append('isActive', !cnt.isActive);
    try {
      const res = await contestService.updateContest(cnt.id, formData);
      if (res?.success) {
        toast.success(`Contest ${!cnt.isActive ? 'activated' : 'deactivated'}`);
        fetchContestsAndCategories();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      toast.error('Failed to toggle status');
    }
  };

  const filteredContests = contests.filter((cnt) => {
    const catName = cnt.category?.name || '';
    return cnt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           catName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const columns = [
    { key: 'id', label: 'Contest ID', cellClassName: 'font-mono text-[#E94B4B]' },
    {
      key: 'title',
      label: 'Contest Title',
      cellClassName: 'font-semibold',
      render: (val, row) => {
        const catName = (row.category?.name || val || '').toLowerCase();
        let fallbackImg = '/cat-general.png';
        if (catName.includes('sport') || catName.includes('cricket') || catName.includes('football')) fallbackImg = '/cat-sports.png';
        else if (catName.includes('science')) fallbackImg = '/cat-science.png';
        else if (catName.includes('tech') || catName.includes('robot') || catName.includes('code')) fallbackImg = '/cat-technology.png';
        else if (catName.includes('current') || catName.includes('news') || catName.includes('affair')) fallbackImg = '/cat-current.png';
        else if (catName.includes('entertain') || catName.includes('movie') || catName.includes('music')) fallbackImg = '/cat-entertainment.png';
        else if (catName.includes('history')) fallbackImg = '/cat-history.png';
        else if (catName.includes('math') || catName.includes('logic')) fallbackImg = '/Knowledge.png';
        else if (catName.includes('general') || catName.includes('gk') || catName.includes('knowledge')) fallbackImg = '/cat-general.png';

        const isUrlPath = (pathStr) => pathStr && typeof pathStr === 'string' && (
          pathStr.startsWith('/') || pathStr.startsWith('http') || pathStr.startsWith('uploads/') || pathStr.startsWith('data:')
        );

        const imgPath = isUrlPath(row.image) ? row.image : (isUrlPath(row.category?.image) ? row.category.image : (isUrlPath(row.category?.icon) ? row.category.icon : fallbackImg));
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={getImageUrl(imgPath)}
                alt={val}
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackImg;
                }}
              />
            </div>
            <span>{val}</span>
          </div>
        );
      }
    },
    {
      key: 'categoryId',
      label: 'Category',
      cellClassName: 'text-gray-300',
      render: (_, row) => row.category?.name || 'Unassigned'
    },
    {
      key: 'entryFee',
      label: 'Entry Fee',
      cellClassName: 'text-gray-400 font-medium',
      render: (val) => `₹${parseFloat(val)}`
    },
    {
      key: 'prizePool',
      label: 'Prize Pool',
      cellClassName: 'text-amber-500 font-bold',
      render: (val) => `₹${parseFloat(val).toLocaleString()}`
    },
    {
      key: 'startTime',
      label: 'Starts At',
      cellClassName: 'text-white',
      render: (val) => new Date(val).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (val, row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
            val ? 'bg-green-500/15 text-green-500 hover:bg-green-500/25' : 'bg-gray-500/15 text-gray-400 hover:bg-gray-500/25'
          }`}
        >
          {val ? 'Active' : 'Inactive'}
        </button>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1 text-gray-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1 text-red-500/70 hover:text-red-500 rounded transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#0f1117] text-white p-5 rounded-2xl shadow-sm border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold">Schedule Contests</h1>
          <p className="text-xs text-gray-400 mt-1">Manage and edit scheduled quizzes with dynamic image support.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer hover:opacity-90"
          style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
        >
          <Plus size={16} /> Schedule Contest
        </button>
      </div>

      <div className="bg-[#0f1117] text-white rounded-2xl shadow-sm border border-white/10 overflow-hidden flex flex-col">
        <div className="p-5 flex flex-col sm:flex-row justify-between gap-4 border-b border-white/10">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search scheduled contests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchContestsAndCategories}
              className="flex items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-800 rounded-lg text-sm transition-all cursor-pointer"
            >
              <RotateCw size={16} /> Refresh
            </button>
          </div>
        </div>

        <Table columns={columns} data={filteredContests} loading={loading} />
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-lg my-8 overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">
                {modalType === 'add' ? 'Schedule New Contest' : 'Edit Contest Details'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Contest Title</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Weekly Grand Science Trivia"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Description (Optional)</label>
                  <textarea
                    placeholder="Enter details about this contest..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="2"
                    className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                  />
                </div>

                {/* Contest Cover Image */}
                <div className="col-span-1 sm:col-span-2 bg-white/5 p-3 rounded-xl border border-white/10">
                  <label className="block text-xs font-bold text-gray-300 mb-2">Contest Cover Image (Optional)</label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:flex-1 border border-dashed border-white/20 hover:border-[#E94B4B] rounded-xl p-2.5 text-center cursor-pointer transition-colors bg-[#0f1117] flex flex-col items-center justify-center gap-1"
                    >
                      <Upload size={16} className="text-[#E94B4B]" />
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
                      <div className="flex items-center gap-2.5 p-2 bg-[#0f1117] rounded-xl border border-white/15">
                        <img src={getImageUrl(imagePreview)} alt="Preview" className="w-12 h-12 object-contain rounded-lg" />
                        <div>
                          <p className="text-xs font-semibold text-white">Preview</p>
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview('');
                            }}
                            className="text-[10px] text-[#E94B4B] hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Category</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Duration (Minutes)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="e.g. 15"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Starts At</label>
                  <input
                    required
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Ends At</label>
                  <input
                    required
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Entry Fee (₹)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="e.g. 20"
                    value={entryFee}
                    onChange={(e) => setEntryFee(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Prize Pool (₹)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="e.g. 5000"
                    value={prizePool}
                    onChange={(e) => setPrizePool(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Max Participants</label>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="e.g. 100"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Min Participants</label>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="e.g. 2"
                    value={minParticipants}
                    onChange={(e) => setMinParticipants(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveContest"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#E94B4B] focus:ring-0 focus:ring-offset-0 bg-[#0f1117] border-gray-600 cursor-pointer"
                />
                <label htmlFor="isActiveContest" className="text-xs font-semibold text-gray-300 cursor-pointer">
                  Mark as Active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-600 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer hover:opacity-90"
                  style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
                >
                  {modalType === 'add' ? 'Schedule' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleContest;
