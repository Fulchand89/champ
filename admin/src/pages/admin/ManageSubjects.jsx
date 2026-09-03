import React, { useState, useEffect } from 'react';
import { Search, RotateCw, Plus, Edit, Trash2, X } from 'lucide-react';
import Table from '../../components/common/Table';
import ConfirmModal from '../../components/common/ConfirmModal';
import { subjectService } from '../../api/services/subjectService';
import { categoryService } from '../../api/services/categoryService';
import toast from 'react-hot-toast';

const ManageSubjects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [currentSubject, setCurrentSubject] = useState(null);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, catRes] = await Promise.allSettled([
        subjectService.getSubjects(),
        categoryService.getCategories()
      ]);

      if (subRes.status === 'fulfilled' && subRes.value?.success) {
        setSubjects(subRes.value.data || []);
      }
      if (catRes.status === 'fulfilled' && catRes.value?.success) {
        setCategories(catRes.value.data || []);
      }
    } catch (err) {
      console.error('Error loading subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setModalType('add');
    setCurrentSubject(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sub) => {
    setModalType('edit');
    setCurrentSubject(sub);
    setName(sub.name);
    setCategoryId(sub.categoryId || sub.category?.id || '');
    setDescription(sub.description || '');
    setIsActive(sub.isActive !== false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Subject name is required');
      return;
    }
    if (!categoryId) {
      toast.error('Parent category is required');
      return;
    }

    const payload = {
      name: name.trim(),
      categoryId: parseInt(categoryId, 10),
      description: description.trim(),
      isActive
    };

    try {
      if (modalType === 'add') {
        const res = await subjectService.createSubject(payload);
        if (res?.success) {
          toast.success('Subject created successfully');
          fetchData();
          setIsModalOpen(false);
        }
      } else {
        const res = await subjectService.updateSubject(currentSubject.id, payload);
        if (res?.success) {
          toast.success('Subject updated successfully');
          fetchData();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error('Error saving subject:', err);
      toast.error(err.response?.data?.message || 'Error saving subject');
    }
  };

  const handleOpenDeleteModal = (id) => {
    setSubjectToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return;
    setDeleting(true);
    try {
      const res = await subjectService.deleteSubject(subjectToDelete);
      if (res?.success) {
        toast.success('Subject deleted successfully');
        fetchData();
        setDeleteModalOpen(false);
        setSubjectToDelete(null);
      }
    } catch (err) {
      console.error('Error deleting subject:', err);
      toast.error('Failed to delete subject');
    } finally {
      setDeleting(false);
    }
  };

  const filteredSubjects = subjects.filter((s) => {
    const catName = s.category?.name || '';
    return s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           catName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const columns = [
    { 
      key: 'id', 
      label: 'Subject ID', 
      cellClassName: 'font-mono text-[#E94B4B]',
      render: (val) => `SUB${String(val).padStart(3, '0')}`
    },
    { key: 'name', label: 'Subject Name', cellClassName: 'font-semibold' },
    { 
      key: 'category', 
      label: 'Parent Category', 
      cellClassName: 'text-gray-300',
      render: (val, row) => row.category?.name || val || 'General Knowledge'
    },
    { 
      key: 'topicsCount', 
      label: 'Topics', 
      headerClassName: 'text-center', 
      cellClassName: 'text-center',
      render: (val, row) => row.topics?.length || val || 0
    },
    { 
      key: 'questionsCount', 
      label: 'Questions', 
      headerClassName: 'text-center', 
      cellClassName: 'text-center text-white font-medium',
      render: (val) => val || 0
    },
    {
      key: 'status',
      label: 'Status',
      render: (val, row) => {
        const active = row.isActive !== false;
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            active ? 'bg-green-500/15 text-green-500' : 'bg-gray-500/15 text-gray-400'
          }`}>
            {active ? 'Active' : 'Inactive'}
          </span>
        );
      }
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
            <Edit size={14} />
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
          <h1 className="text-xl font-bold">Manage Subjects</h1>
          <p className="text-xs text-gray-400 mt-1">Configure subjects mapping to top level quiz categories.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer hover:opacity-90"
          style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
        >
          <Plus size={16} /> Add Subject
        </button>
      </div>

      <div className="bg-[#0f1117] text-white rounded-2xl shadow-sm border border-white/10 overflow-hidden flex flex-col">
        <div className="p-5 flex flex-col sm:flex-row justify-between gap-4 border-b border-white/10">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-800 rounded-lg text-sm transition-all cursor-pointer"
            >
              <RotateCw size={16} /> Refresh
            </button>
          </div>
        </div>

        <Table columns={columns} data={filteredSubjects} loading={loading} />
      </div>

      {/* Add / Edit Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-md my-8 overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">
                {modalType === 'add' ? 'Add New Subject' : 'Edit Subject'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Subject Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Physics & Astronomy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Parent Category</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Description (Optional)</label>
                <textarea
                  placeholder="Details about topics covered in this subject..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="2"
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveSubject"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#E94B4B] focus:ring-0 focus:ring-offset-0 bg-[#0f1117] border-gray-600 cursor-pointer"
                />
                <label htmlFor="isActiveSubject" className="text-xs font-semibold text-gray-300 cursor-pointer">
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
                  {modalType === 'add' ? 'Create Subject' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Subject Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
            setSubjectToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Subject?"
        message={"Are you sure you want to delete this subject?\nThis action cannot be undone."}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={deleting}
      />
    </div>
  );
};

export default ManageSubjects;
