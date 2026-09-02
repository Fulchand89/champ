import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  RotateCw, 
  UserPlus, 
  Trash2, 
  Loader2, 
  UserCheck, 
  UserX, 
  Eye, 
  Edit3, 
  ShieldCheck, 
  Users, 
  Trophy, 
  Coins, 
  X, 
  Save, 
  Mail, 
  Phone, 
  MapPin, 
  Lock 
} from 'lucide-react';
import Table from '../../components/common/Table';
import userService from '../../api/services/userService';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'blocked'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const initialFormData = {
    name: '',
    email: '',
    dob: '',
    panNumber: '',
    aadhaarNumber: '',
    address: '',
    mobile: '',
    password: '',
    city: '',
    role: 'user',
    isActive: true,
  };

  // Form State for Add / Edit
  const [formData, setFormData] = useState(initialFormData);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers();
      if (res?.success && Array.isArray(res.data)) {
        const mappedUsers = res.data.map(u => ({
          id: u.uuid || `USR-${u.id}`,
          rawId: u.id,
          name: u.name,
          email: u.email,
          dob: u.dob ? (u.dob.includes('T') ? u.dob.split('T')[0] : u.dob) : '-',
          rawDob: u.dob || '',
          panNumber: u.panNumber || u.pan_number || '-',
          aadhaarNumber: u.aadhaarNumber || u.adharNumber || u.aadhaar_number || u.adhar_number || '-',
          address: u.address || '-',
          role: u.role || 'user',
          joined: new Date(u.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          isActive: !!u.isActive,
          status: u.isActive ? 'Active' : 'Blocked',
          raw: u,
        }));
        setUsers(mappedUsers);
      } else {
        toast.error(res?.message || 'Failed to fetch users');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.isActive).length;
    const blocked = users.filter(u => !u.isActive).length;
    const totalQuizzes = users.reduce((acc, u) => acc + (u.quizzesPlayed || 0), 0);
    return { total, active, blocked, totalQuizzes };
  }, [users]);

  // Handle Add User Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Full Name is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email Address is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!formData.dob) {
      toast.error('Date of Birth (DOB) is required');
      return;
    }
    if (!formData.panNumber.trim()) {
      toast.error('PAN Card Number is required');
      return;
    }
    const panClean = formData.panNumber.trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panClean)) {
      toast.error('Please enter a valid 10-digit PAN number (e.g. ABCDE1234F)');
      return;
    }
    if (!formData.aadhaarNumber.trim()) {
      toast.error('Aadhaar Card Number is required');
      return;
    }
    const aadhaarClean = formData.aadhaarNumber.trim().replace(/\s+/g, '');
    if (!/^\d{12}$/.test(aadhaarClean)) {
      toast.error('Please enter a valid 12-digit Aadhaar card number');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('Full Address is required');
      return;
    }

    setIsSaving(true);
    try {
      const res = await userService.createUser({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        panNumber: panClean,
        aadhaarNumber: aadhaarClean,
        address: formData.address.trim(),
      });
      if (res?.success) {
        toast.success('User created successfully');
        setIsAddModalOpen(false);
        setFormData(initialFormData);
        fetchUsers();
      } else {
        toast.error(res?.message || 'Failed to create user');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || err.message || 'Error creating user');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Edit User Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    const isTargetAdmin = selectedUser.role === 'admin' || selectedUser.role === 'super_admin';
    if (isTargetAdmin && !formData.isActive) {
      toast.error('Admin accounts are protected and cannot be blocked!');
      return;
    }
    setIsSaving(true);
    try {
      const res = await userService.updateUser(selectedUser.rawId, {
        name: formData.name,
        dob: formData.dob,
        panNumber: formData.panNumber,
        aadhaarNumber: formData.aadhaarNumber,
        address: formData.address,
        role: formData.role,
        isActive: isTargetAdmin ? true : formData.isActive,
      });
      if (res?.success) {
        toast.success('User updated successfully');
        setIsEditModalOpen(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        toast.error(res?.message || 'Failed to update user');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating user');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Toggle Status
  const handleToggleStatus = async (user) => {
    if (user.role === 'admin' || user.role === 'super_admin') {
      toast.error('Admin accounts are protected and cannot be blocked!');
      return;
    }
    try {
      const res = await userService.toggleUserStatus(user.rawId);
      if (res?.success) {
        toast.success(`User ${res.data?.isActive ? 'activated' : 'blocked'} successfully`);
        setUsers(prev => prev.map(u => u.rawId === user.rawId ? {
          ...u,
          isActive: res.data.isActive,
          status: res.data.isActive ? 'Active' : 'Blocked'
        } : u));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  // Open Delete Confirmation
  const confirmDelete = (user) => {
    if (user.role === 'admin' || user.role === 'super_admin') {
      toast.error('Admin accounts are protected and cannot be deleted!');
      return;
    }
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    if (userToDelete.role === 'admin' || userToDelete.role === 'super_admin') {
      toast.error('Admin accounts are protected and cannot be deleted!');
      setDeleteModalOpen(false);
      return;
    }
    setIsDeleting(true);
    try {
      const res = await userService.deleteUser(userToDelete.rawId);
      if (res?.success) {
        toast.success('User deleted successfully');
        setUsers(prev => prev.filter(u => u.rawId !== userToDelete.rawId));
        setDeleteModalOpen(false);
        setUserToDelete(null);
      } else {
        toast.error(res?.message || 'Failed to delete user');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting user');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      dob: user.rawDob || (user.dob !== '-' ? user.dob : ''),
      panNumber: user.panNumber === '-' ? '' : user.panNumber,
      aadhaarNumber: user.aadhaarNumber === '-' ? '' : user.aadhaarNumber,
      address: user.address === '-' ? '' : user.address,
      role: user.role || 'user',
      isActive: user.isActive,
    });
    setIsEditModalOpen(true);
  };

  // Open View Modal
  const openViewModal = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.id && user.id.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = 
        statusFilter === 'all' ? true :
        statusFilter === 'active' ? user.isActive :
        statusFilter === 'blocked' ? !user.isActive : true;

      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  const columns = [
    { key: 'id', label: 'User ID', cellClassName: 'font-mono text-[#E94B4B] font-bold' },
    { 
      key: 'name', 
      label: 'Full Name', 
      render: (_, row) => {
        const isAdmin = row.role === 'admin' || row.role === 'super_admin';
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E94B4B]/15 border border-[#E94B4B]/30 flex items-center justify-center font-bold text-xs text-[#E94B4B] shrink-0">
              {row.name ? row.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-white text-sm leading-tight">{row.name}</p>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-white/40 text-xs mt-0.5">{row.email}</p>
            </div>
          </div>
        );
      }
    },
    { key: 'dob', label: 'DOB', cellClassName: 'text-xs text-white/80' },
    { key: 'panNumber', label: 'PAN Card Number', cellClassName: 'font-mono text-xs text-amber-300 uppercase' },
    { key: 'aadhaarNumber', label: 'Aadhaar Card Number', cellClassName: 'font-mono text-xs text-blue-300' },
    { key: 'address', label: 'Complete Address', cellClassName: 'text-xs text-white/70 max-w-[200px] truncate' },
    {
      key: 'status',
      label: 'Status',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (_, row) => {
        const isAdmin = row.role === 'admin' || row.role === 'super_admin';
        if (isAdmin) {
          return (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 cursor-not-allowed"
              title="Admin accounts are protected and cannot be blocked"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Protected</span>
            </span>
          );
        }
        return (
          <button
            onClick={() => handleToggleStatus(row)}
            title={`Click to ${row.isActive ? 'block' : 'activate'} user`}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              row.isActive 
                ? 'bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25' 
                : 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25'
            }`}
          >
            {row.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
            <span>{row.status}</span>
          </button>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (_, row) => {
        const isAdmin = row.role === 'admin' || row.role === 'super_admin';
        return (
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => openViewModal(row)}
              className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
              title="View Details"
            >
              <Eye size={15} />
            </button>
            <button
              onClick={() => openEditModal(row)}
              className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
              title="Edit User"
            >
              <Edit3 size={15} />
            </button>
            <button
              onClick={() => confirmDelete(row)}
              disabled={isAdmin}
              className={`p-1.5 rounded-lg border border-white/10 transition-all ${
                isAdmin 
                  ? 'bg-white/5 text-white/20 cursor-not-allowed opacity-50' 
                  : 'bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 cursor-pointer'
              }`}
              title={isAdmin ? "Admin accounts are protected and cannot be deleted" : "Delete User"}
            >
              <Trash2 size={15} />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="font-sans space-y-6 pb-12">
      
      {/* Top Banner & Header */}
      <div className="bg-[#0f1117] text-white p-5 sm:p-6 rounded-2xl shadow-sm border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Manage Users</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E94B4B]/15 text-[#E94B4B] border border-[#E94B4B]/30">
              {stats.total} Total Registered
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">Real-time user management, verification, role assignments and security controls.</p>
        </div>

        <button
          onClick={() => {
            setFormData(initialFormData);
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-bold transition-all cursor-pointer shadow-md hover:opacity-90 shrink-0"
          style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
        >
          <UserPlus size={16} />
          <span>Add New User</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
            style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
          >
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Total Users</p>
            <p className="text-lg font-bold text-white">{stats.total}</p>
          </div>
        </div>

        <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
            style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
          >
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Active Users</p>
            <p className="text-lg font-bold text-white">{stats.active}</p>
          </div>
        </div>

        <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
            style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
          >
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Blocked Users</p>
            <p className="text-lg font-bold text-white">{stats.blocked}</p>
          </div>
        </div>

        <div className="bg-[#0f1117] p-4 rounded-2xl border border-white/10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
            style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
          >
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Total Quizzes</p>
            <p className="text-lg font-bold text-white">{stats.totalQuizzes}</p>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#0f1117] text-white rounded-2xl shadow-sm border border-white/10 overflow-hidden flex flex-col">
        
        {/* Controls Toolbar */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between gap-4 border-b border-white/10">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-white/10 rounded-xl text-sm bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter buttons */}
            <div className="inline-flex p-1 bg-white/5 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === 'all' ? 'bg-[#E94B4B] text-white shadow-xs' : 'text-white/60 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === 'active' ? 'bg-[#E94B4B] text-white shadow-xs' : 'text-white/60 hover:text-white'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('blocked')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === 'blocked' ? 'bg-[#E94B4B] text-white shadow-xs' : 'text-white/60 hover:text-white'
                }`}
              >
                Blocked
              </button>
            </div>

            <button 
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCw size={14} className={loading ? 'animate-spin text-[#E94B4B]' : 'text-[#E94B4B]'} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Table View */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/50 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-[#E94B4B]" />
            <p className="text-sm font-semibold">Loading users data...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-3 border border-white/10">
              <Users className="w-6 h-6 text-white/30" />
            </div>
            <p className="text-sm font-bold text-white">No Users Found</p>
            <p className="text-xs text-white/40 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <Table columns={columns} data={filteredUsers} />
        )}
      </div>

      {/* ── Add User Modal ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#0f1117] rounded-2xl border border-white/15 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E94B4B]/15 flex items-center justify-center text-[#E94B4B]">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Add New User</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/40 hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* PERSONAL INFORMATION */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider">
                  PERSONAL INFORMATION
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-[#E94B4B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#E94B4B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-[#E94B4B]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#E94B4B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5">
                      Date of Birth (DOB) <span className="text-[#E94B4B]">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      placeholder="Select date of birth"
                      value={formData.dob}
                      onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#E94B4B] [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              {/* KYC INFORMATION */}
              <div className="border-t border-white/10 pt-5 space-y-4">
                <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider">
                  KYC INFORMATION
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5">
                      PAN Card Number <span className="text-[#E94B4B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      placeholder="Enter PAN card number"
                      value={formData.panNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, panNumber: e.target.value.toUpperCase() }))}
                      className="w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#E94B4B] uppercase"
                    />
                    <p className="text-[11px] text-white/40 mt-1">Enter 10 digit PAN number (e.g., ABCDE1234F)</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5">
                      Aadhaar Card Number <span className="text-[#E94B4B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      placeholder="Enter Aadhaar card number"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, aadhaarNumber: e.target.value.replace(/\D/g, '') }))}
                      className="w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#E94B4B]"
                    />
                    <p className="text-[11px] text-white/40 mt-1">Enter 12 digit Aadhaar number</p>
                  </div>
                </div>
              </div>

              {/* ADDRESS INFORMATION */}
              <div className="border-t border-white/10 pt-5 space-y-4">
                <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider">
                  ADDRESS INFORMATION
                </h4>
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5">
                    Full Address <span className="text-[#E94B4B]">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter complete address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#E94B4B] resize-none"
                  />
                  <p className="text-[11px] text-white/40 mt-1">Enter complete address including house no., street, area, city, state and pincode.</p>
                </div>
              </div>

              {/* ADDITIONAL INFORMATION (OPTIONAL) */}
              <div className="border-t border-white/10 pt-5 space-y-4">
                <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider">
                  ADDITIONAL INFORMATION (OPTIONAL)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5">
                      System Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#161922] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E94B4B]"
                    >
                      <option value="user">Standard Player (User)</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5">
                      Account Status
                    </label>
                    <select
                      value={formData.isActive ? 'active' : 'blocked'}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#161922] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E94B4B]"
                    >
                      <option value="active">Active</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md cursor-pointer hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>Create User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#0f1117] rounded-2xl border border-white/15 w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E94B4B]/15 flex items-center justify-center text-[#E94B4B]">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Edit User Profile</h3>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-white/40 hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#E94B4B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5">
                    Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full px-3.5 py-2.5 text-sm bg-white/3 border border-white/5 rounded-xl text-white/50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5">
                    Date of Birth (DOB)
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#E94B4B] [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5">
                    PAN Card Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.panNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, panNumber: e.target.value.toUpperCase() }))}
                    className="w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#E94B4B] uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5">
                    Aadhaar Card Number
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, aadhaarNumber: e.target.value.replace(/\D/g, '') }))}
                    className="w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#E94B4B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5">
                  Complete Address
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#E94B4B] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5">
                    System Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#161922] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E94B4B]"
                  >
                    <option value="user">Standard Player</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5">
                    Account Status
                  </label>
                  {(selectedUser?.role === 'admin' || selectedUser?.role === 'super_admin') ? (
                    <div>
                      <input
                        type="text"
                        disabled
                        value="Active (Protected Admin)"
                        className="w-full px-3.5 py-2.5 text-sm bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 font-bold cursor-not-allowed"
                      />
                    </div>
                  ) : (
                    <select
                      value={formData.isActive ? 'active' : 'blocked'}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#161922] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#E94B4B]"
                    >
                      <option value="active">Active</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md cursor-pointer hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View User Modal ── */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#0f1117] rounded-2xl border border-white/15 w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">User Information</h3>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="text-white/40 hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                <div className="w-14 h-14 rounded-2xl bg-[#E94B4B]/15 border border-[#E94B4B]/30 flex items-center justify-center text-xl font-bold text-[#E94B4B]">
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{selectedUser.name}</h4>
                  <p className="text-xs text-white/50 font-mono mt-0.5">{selectedUser.id}</p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedUser.isActive ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-white/50">Full Name</span>
                  <span className="font-semibold text-white">{selectedUser.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-white/50">Email Address</span>
                  <span className="font-semibold text-white">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-white/50">Date of Birth (DOB)</span>
                  <span className="font-semibold text-white">{selectedUser.dob}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-white/50">PAN Card Number</span>
                  <span className="font-mono font-semibold text-amber-300 uppercase">{selectedUser.panNumber}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-white/50">Aadhaar Card Number</span>
                  <span className="font-mono font-semibold text-blue-300">{selectedUser.aadhaarNumber}</span>
                </div>
                <div className="flex flex-col gap-1 py-1.5 border-b border-white/5">
                  <span className="text-white/50">Complete Address</span>
                  <span className="font-semibold text-white leading-relaxed">{selectedUser.address}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-white/50">System Role</span>
                  <span className="font-semibold text-white capitalize">{selectedUser.role}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-white/50">Account Status</span>
                  <span className={`font-bold ${selectedUser.isActive ? 'text-green-400' : 'text-red-400'}`}>{selectedUser.status}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-white/50">Date Joined</span>
                  <span className="font-semibold text-white">{selectedUser.joined}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-5 py-2 text-xs font-bold text-white bg-white/10 hover:bg-white/15 rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal for Delete ── */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setUserToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete User?"
        message={`Are you sure you want to delete "${userToDelete?.name}" (${userToDelete?.email})? All associated attempts and participation records will be permanently removed.`}
        confirmText="Yes, Delete User"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />

    </div>
  );
};

export default ManageUsers;
