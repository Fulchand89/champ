import React, { useState, useEffect, useRef } from 'react';
import { Search, RotateCw, Plus, Edit, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';
import Table from '../../components/common/Table';
import ConfirmModal from '../../components/common/ConfirmModal';
import { categoryService } from '../../api/services/categoryService';
import { getImageUrl } from '../../api/services/api';
import toast from 'react-hot-toast';

const ManageQuizCategories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [currentCategory, setCurrentCategory] = useState(null);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [colorClass, setColorClass] = useState('hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]');
  const [isActive, setIsActive] = useState(true);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Mandatory Image Upload States
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const STANDARD_CATEGORIES = [
    'Sports',
    'Science',
    'Technology',
    'Current Affairs',
    'Entertainment',
    'History',
    'General Knowledge',
    'Mathematics',
    'Geography',
    'Art & Culture',
    'Business & Finance',
    'Health & Medical',
    'Environment & Nature',
    'Computer Science & Coding',
    'Literature & Books',
    'Music & Movies',
    'Politics & Civics',
    'World Trivia',
    'Logic & Reasoning',
  ];

  const COLOR_OPTIONS = [
    { value: 'hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]', label: 'Red' },
    { value: 'hover:border-teal-400/50 hover:shadow-[0_0_20px_rgba(45,212,191,0.25)]', label: 'Teal' },
    { value: 'hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(192,132,252,0.25)]', label: 'Purple' },
    { value: 'hover:border-orange-400/50 hover:shadow-[0_0_20px_rgba(251,146,60,0.25)]', label: 'Orange' },
    { value: 'hover:border-pink-400/50 hover:shadow-[0_0_20px_rgba(244,114,182,0.25)]', label: 'Pink' },
    { value: 'hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(96,165,250,0.25)]', label: 'Blue' },
    { value: 'hover:border-amber-600/50 hover:shadow-[0_0_20px_rgba(217,119,6,0.25)]', label: 'Amber' },
    { value: 'hover:border-green-400/50 hover:shadow-[0_0_20px_rgba(74,222,128,0.25)]', label: 'Green' },
    { value: 'hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.25)]', label: 'Cyan' },
    { value: 'hover:border-yellow-400/50 hover:shadow-[0_0_20px_rgba(250,204,21,0.25)]', label: 'Yellow' },
  ];

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories();
      if (res?.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setModalType('add');
    setCurrentCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setColorClass('hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]');
    setIsActive(true);
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setModalType('edit');
    setCurrentCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setColorClass(cat.colorClass || 'hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]');
    setIsActive(cat.isActive);
    setImageFile(null);
    const existingImg = cat.image || '';
    setImagePreview(existingImg);
    setIsModalOpen(true);
  };

  const handleNameChange = (val) => {
    setName(val);
    if (modalType === 'add') {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
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
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    const generatedSlug = (slug || name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (modalType === 'add') {
      const exists = (categories || []).some(
        c => c.name?.toLowerCase().trim() === name.trim().toLowerCase() || c.slug?.toLowerCase().trim() === generatedSlug
      );
      if (exists) {
        toast.error(`Category "${name.trim()}" already exists! Please use a unique category name.`);
        return;
      }
    }

    const jsonPayload = {
      name: name.trim(),
      slug: generatedSlug,
      description: description ? description.trim() : '',
      colorClass: colorClass || 'hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]',
      icon: '📚',
      isActive: Boolean(isActive),
    };

    setSubmitting(true);
    try {
      let res;
      if (imageFile) {
        const formData = new FormData();
        formData.append('name', jsonPayload.name);
        formData.append('slug', jsonPayload.slug);
        formData.append('description', jsonPayload.description);
        formData.append('colorClass', jsonPayload.colorClass);
        formData.append('isActive', String(jsonPayload.isActive));
        formData.append('image', imageFile);
        if (modalType === 'add') {
          res = await categoryService.createCategory(formData);
        } else {
          res = await categoryService.updateCategory(currentCategory.id, formData);
        }
      } else {
        if (modalType === 'add') {
          res = await categoryService.createCategory(jsonPayload);
        } else {
          res = await categoryService.updateCategory(currentCategory.id, jsonPayload);
        }
      }

      if (res?.success || res?.data) {
        toast.success(`Category ${modalType === 'add' ? 'created' : 'updated'} successfully`);
        fetchCategories();
        setIsModalOpen(false);
      } else {
        toast.error(res?.message || `Failed to ${modalType === 'add' ? 'create' : 'update'} category`);
      }
    } catch (err) {
      console.error('Error saving category:', err);
      console.error('Backend full error response:', err.response?.data);
      const data = err.response?.data;
      let errMsg = 'Failed to save category';
      if (typeof data === 'string') {
        errMsg = data;
      } else if (data?.message) {
        errMsg = data.message;
      } else if (data?.error) {
        errMsg = typeof data.error === 'string' ? data.error : (data.error.message || JSON.stringify(data.error));
      } else if (Array.isArray(data?.errors) && data.errors.length > 0) {
        errMsg = data.errors.map(e => (typeof e === 'string' ? e : e.message || e.msg || JSON.stringify(e))).join(', ');
      } else if (err.message) {
        errMsg = err.message;
      }
      toast.error(errMsg, { duration: 5000 });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (catId) => {
    setCategoryToDelete(catId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      const res = await categoryService.deleteCategory(categoryToDelete);
      if (res?.success) {
        toast.success('Category deleted successfully');
        fetchCategories();
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error('Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    const formData = new FormData();
    formData.append('name', cat.name);
    formData.append('slug', cat.slug);
    formData.append('isActive', !cat.isActive);
    try {
      const res = await categoryService.updateCategory(cat.id, formData);
      if (res?.success) {
        toast.success(`Category ${!cat.isActive ? 'activated' : 'deactivated'}`);
        fetchCategories();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      toast.error('Failed to toggle status');
    }
  };

  const filteredCategories = categories.filter((cat) => {
    return cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const columns = [
    { key: 'id', label: 'Category ID', cellClassName: 'font-mono text-[#E94B4B]' },
    {
      key: 'name',
      label: 'Category Name & Image',
      cellClassName: 'font-semibold',
      render: (val, row) => {
        const catName = (val || row.slug || '').toLowerCase();
        let fallbackImg = '/cat-general.png';
        if (catName.includes('sport') || catName.includes('cricket') || catName.includes('football')) fallbackImg = '/cat-sports.png';
        else if (catName.includes('science')) fallbackImg = '/cat-science.png';
        else if (catName.includes('tech') || catName.includes('robot') || catName.includes('code')) fallbackImg = '/cat-technology.png';
        else if (catName.includes('current') || catName.includes('news') || catName.includes('affair')) fallbackImg = '/cat-current.png';
        else if (catName.includes('entertain') || catName.includes('movie') || catName.includes('music')) fallbackImg = '/cat-entertainment.png';
        else if (catName.includes('history')) fallbackImg = '/cat-history.png';
        else if (catName.includes('math') || catName.includes('logic')) fallbackImg = '/Knowledge.png';
        else if (catName.includes('general') || catName.includes('gk') || catName.includes('knowledge')) fallbackImg = '/cat-general.png';

        const imgPath = (row.image && typeof row.image === 'string' && row.image.trim()) ? row.image : ((row.icon && typeof row.icon === 'string' && row.icon.trim() && (row.icon.startsWith('/') || row.icon.startsWith('http') || row.icon.startsWith('data:'))) ? row.icon : fallbackImg);
        const resolvedImgPath = getImageUrl(imgPath) || fallbackImg;
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              <img
                src={resolvedImgPath}
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
    { key: 'slug', label: 'Slug', cellClassName: 'font-mono text-sm' },
    {
      key: 'isActive',
      label: 'Status',
      render: (val, row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${val ? 'bg-green-500/15 text-green-500 hover:bg-green-500/25' : 'bg-gray-500/15 text-gray-400 hover:bg-gray-500/25'
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
            onClick={() => handleOpenDeleteModal(row.id)}
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
          <h1 className="text-xl font-bold">Manage Quiz Categories</h1>
          <p className="text-xs text-gray-400 mt-1">Configure, add and edit dynamic quiz categories with mandatory image uploads.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all duration-200 ease-out cursor-pointer select-none hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-[#E94B4B]/35 active:translate-y-0 active:scale-[0.97]"
          style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      <div className="bg-[#0f1117] text-white rounded-2xl shadow-sm border border-white/10 overflow-hidden flex flex-col">
        <div className="p-5 flex flex-col sm:flex-row justify-between gap-4 border-b border-white/10">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search categories by name or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchCategories}
              className="flex items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-800 rounded-lg text-sm transition-all cursor-pointer"
            >
              <RotateCw size={16} /> Refresh
            </button>
          </div>
        </div>

        <Table columns={columns} data={filteredCategories} loading={loading} />
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">
                {modalType === 'add' ? 'Add Category' : 'Edit Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Category Name Searchable Input */}
              <div className="relative">
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  Category Name <span className="text-red-500">*</span>
                </label>
                
                <div className="relative">
                  <input
                    required
                    type="text"
                    placeholder="e.g. Sports or custom name..."
                    value={name}
                    onChange={(e) => {
                      handleNameChange(e.target.value);
                      setShowCategoryDropdown(true);
                    }}
                    onFocus={() => setShowCategoryDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                    className="block w-full px-3 py-2 border border-white/15 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                  />
                  
                  {showCategoryDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-[#1a1d27] border border-white/10 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      {STANDARD_CATEGORIES.filter(c => c.toLowerCase().includes(name.toLowerCase())).map((catName) => (
                        <div
                          key={catName}
                          onClick={() => {
                            handleNameChange(catName);
                            setShowCategoryDropdown(false);
                          }}
                          className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                        >
                          {catName}
                        </div>
                      ))}
                      {name && STANDARD_CATEGORIES.filter(c => c.toLowerCase().includes(name.toLowerCase())).length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500 italic">
                          No matches found. Using custom category "{name}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Slug (Auto-generated)</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. sports"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="block w-full px-3 py-2 border border-white/15 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Description (Optional)</label>
                <textarea
                  placeholder="Enter details about this category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="2"
                  className="block w-full px-3 py-2 border border-white/15 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>

              {/* Mandatory Category Image Upload Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-300">
                    Category Image <span className="text-[#E94B4B]">* (Required)</span>
                  </label>
                  <span className="text-[10px] text-gray-400">Max 5MB (Auto-optimized)</span>
                </div>
                
                {/* Upload box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors bg-white/5 flex flex-col items-center justify-center gap-2 ${
                    imageFile ? 'border-green-500/80 bg-green-500/5' : 'border-white/20 hover:border-[#E94B4B]'
                  }`}
                >
                  <Upload size={24} className={imageFile ? 'text-green-400' : 'text-[#E94B4B]'} />
                  <div>
                    <p className="text-xs text-gray-200 font-semibold">
                      {imageFile ? `Selected: ${imageFile.name}` : 'Click or drop image here to upload'}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Supports JPG, PNG, WEBP, SVG</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp,image/svg+xml,.svg"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>



              {/* Category Live Card Preview */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Category Card Preview</label>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-[#090b15] border border-gray-800">
                  <div
                    className={`w-20 h-20 rounded-xl bg-[#0e1121] border border-gray-700 flex flex-col items-center justify-between p-2 shrink-0 transition-all ${colorClass}`}
                  >
                    <div className="flex-1 flex items-center justify-center">
                      {imagePreview ? (
                        <img
                          src={getImageUrl(imagePreview)}
                          alt="Category Preview"
                          className="w-9 h-9 object-contain select-none"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/cat-general.png';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-800/60 flex items-center justify-center text-gray-500">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-white text-center leading-tight truncate w-full">
                      {name || 'Category Name'}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-white">{name || 'Category Name'}</p>
                    <p className="text-gray-400 text-[11px]">Slug: <span className="text-gray-300 font-mono">{slug || 'slug'}</span></p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCat"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#E94B4B] focus:ring-0 focus:ring-offset-0 bg-[#0f1117] border-gray-600 cursor-pointer"
                />
                <label htmlFor="isActiveCat" className="text-xs font-semibold text-gray-300 cursor-pointer">
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
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-bold transition-all duration-150 ease-out cursor-pointer select-none hover:-translate-y-0.5 hover:brightness-115 hover:shadow-lg hover:shadow-[#E94B4B]/40 active:translate-y-0.5 active:scale-95 active:brightness-90 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                  style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{modalType === 'add' ? 'Creating...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <span>{modalType === 'add' ? 'Create' : 'Save Changes'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
            setCategoryToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Category?"
        message={"Are you sure you want to delete this category?\nThis action cannot be undone."}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={deleting}
      />
    </div>
  );
};

export default ManageQuizCategories;
