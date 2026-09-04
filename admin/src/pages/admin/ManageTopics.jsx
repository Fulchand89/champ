import React, { useState, useEffect } from 'react';
import { Search, RotateCw, Plus, Edit, Trash2, X } from 'lucide-react';
import Table from '../../components/common/Table';
import ConfirmModal from '../../components/common/ConfirmModal';
import { topicService } from '../../api/services/topicService';
import { subjectService } from '../../api/services/subjectService';
import toast from 'react-hot-toast';

const ManageTopics = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [currentTopic, setCurrentTopic] = useState(null);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [topRes, subRes] = await Promise.allSettled([
        topicService.getTopics(),
        subjectService.getSubjects()
      ]);

      if (topRes.status === 'fulfilled' && topRes.value?.success) {
        setTopics(topRes.value.data || []);
      }
      if (subRes.status === 'fulfilled' && subRes.value?.success) {
        setSubjects(subRes.value.data || []);
      }
    } catch (err) {
      console.error('Error loading topics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setModalType('add');
    setCurrentTopic(null);
    setName('');
    setSubjectId(subjects[0]?.id || '');
    setDescription('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (top) => {
    setModalType('edit');
    setCurrentTopic(top);
    setName(top.name);
    setSubjectId(top.subjectId || top.subject?.id || '');
    setDescription(top.description || '');
    setIsActive(top.isActive !== false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Topic name is required');
      return;
    }
    if (!subjectId) {
      toast.error('Parent subject is required');
      return;
    }

    const payload = {
      name: name.trim(),
      subjectId: parseInt(subjectId, 10),
      description: description.trim(),
      isActive
    };

    try {
      if (modalType === 'add') {
        const res = await topicService.createTopic(payload);
        if (res?.success) {
          toast.success('Topic created successfully');
          fetchData();
          setIsModalOpen(false);
        }
      } else {
        const res = await topicService.updateTopic(currentTopic.id, payload);
        if (res?.success) {
          toast.success('Topic updated successfully');
          fetchData();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error('Error saving topic:', err);
      toast.error(err.response?.data?.message || 'Error saving topic');
    }
  };

  const handleOpenDeleteModal = (id) => {
    setTopicToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!topicToDelete) return;
    setDeleting(true);
    try {
      const res = await topicService.deleteTopic(topicToDelete);
      if (res?.success) {
        toast.success('Topic deleted successfully');
        fetchData();
        setDeleteModalOpen(false);
        setTopicToDelete(null);
      }
    } catch (err) {
      console.error('Error deleting topic:', err);
      toast.error('Failed to delete topic');
    } finally {
      setDeleting(false);
    }
  };

  const filteredTopics = topics.filter((t) => {
    const subName = t.subject?.name || '';
    const catName = t.subject?.category?.name || '';
    return t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           subName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           catName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const columns = [
    { 
      key: 'id', 
      label: 'Topic ID', 
      cellClassName: 'font-mono text-[#E94B4B]',
      render: (val) => `TOP${String(val).padStart(3, '0')}`
    },
    { key: 'name', label: 'Topic Name', cellClassName: 'font-semibold' },
    { 
      key: 'subject', 
      label: 'Subject', 
      cellClassName: 'text-gray-300',
      render: (val, row) => row.subject?.name || val || 'General Science'
    },
    { 
      key: 'category', 
      label: 'Category', 
      cellClassName: 'text-gray-400 text-sm',
      render: (val, row) => row.subject?.category?.name || val || 'Science & Technology'
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
          <h1 className="text-xl font-bold">Manage Topics</h1>
          <p className="text-xs text-gray-400 mt-1">Configure individual quiz topics mapping to subjects.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[linear-gradient(178.27deg,#E94B4B_1.6%,#911616_126.9%)] text-white rounded-lg text-sm font-semibold transition-all duration-200 ease-out cursor-pointer select-none hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-[#E94B4B]/35 active:translate-y-0 active:scale-[0.97]"
        >
          <Plus size={16} /> Add Topic
        </button>
      </div>

      <div className="bg-[#0f1117] text-white rounded-2xl shadow-sm border border-white/10 overflow-hidden flex flex-col">
        <div className="p-5 flex flex-col sm:flex-row justify-between gap-4 border-b border-white/10">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topics..."
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

        <Table columns={columns} data={filteredTopics} loading={loading} />
      </div>

      {/* Add / Edit Topic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-md my-8 overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">
                {modalType === 'add' ? 'Add New Topic' : 'Edit Topic'}
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
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Topic Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Thermodynamics"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Parent Subject</label>
                <select
                  required
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category?.name || 'Category'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Description (Optional)</label>
                <textarea
                  placeholder="Details about this quiz topic..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="2"
                  className="block w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-[#0f1117] text-white focus:outline-none focus:border-[#E94B4B]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveTopic"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#E94B4B] focus:ring-0 focus:ring-offset-0 bg-[#0f1117] border-gray-600 cursor-pointer"
                />
                <label htmlFor="isActiveTopic" className="text-xs font-semibold text-gray-300 cursor-pointer">
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
                  className="px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all duration-200 ease-out cursor-pointer select-none hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-[#E94B4B]/35 active:translate-y-0 active:scale-[0.97]"
                  style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
                >
                  {modalType === 'add' ? 'Create Topic' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Topic Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
            setTopicToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Topic?"
        message={"Are you sure you want to delete this topic?\nThis action cannot be undone."}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={deleting}
      />
    </div>
  );
};

export default ManageTopics;
