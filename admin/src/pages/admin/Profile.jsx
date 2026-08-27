import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Save, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getImageUrl } from '../../utils/image';
import { toast } from 'react-hot-toast';
import authService from '../../api/services/authService';
import { useDispatch } from 'react-redux';
import { loadUser } from '../../store/auth/authThunk';

const Profile = () => {
  const { user, updateProfile, removeProfilePic } = useAuth();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
  });

  const [profilePicFile, setProfilePicFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isDeletingPic, setIsDeletingPic] = useState(false);

  // Change Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sync fresh profile data from backend on mount
  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || user.phone || '',
      });
      if (!profilePicFile) {
        setPreviewUrl(user.profilePicUrl ? getImageUrl(user.profilePicUrl) : null);
      }
    }
  }, [user, profilePicFile]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file (JPEG, PNG, WEBP)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setProfilePicFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      toast.success('Photo selected! Click "Save Profile Changes" to upload.');
    }
  };

  const handleRemovePic = async () => {
    if (profilePicFile) {
      setProfilePicFile(null);
      setPreviewUrl(user?.profilePicUrl ? getImageUrl(user.profilePicUrl) : null);
      return;
    }

    if (user?.profilePicUrl) {
      try {
        setIsDeletingPic(true);
        await removeProfilePic();
        setPreviewUrl(null);
      } catch (err) {
        console.error('Failed to delete profile picture:', err);
      } finally {
        setIsDeletingPic(false);
      }
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setIsUpdatingProfile(true);
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('email', formData.email.trim().toLowerCase());
      if (formData.mobile) data.append('mobile', formData.mobile.trim());
      if (profilePicFile) {
        data.append('profile_pic', profilePicFile);
      }

      await updateProfile(data);
      setProfilePicFile(null);
      dispatch(loadUser());
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (!passwordData.newPassword) {
      toast.error('Please enter your new password');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success(res.message || 'Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || user?.name || 'Admin')}&background=E94B4B&color=fff&font-size=0.4`;

  return (
    <div className="font-sans w-full space-y-6 pb-12">
      
      {/* ── Header Banner ── */}
      <div className="rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden" style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}>
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <ShieldCheck className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          
          {/* Avatar Upload Container */}
          <div className="relative group shrink-0">
            <img
              src={previewUrl || defaultAvatar}
              alt={formData.name || 'Admin'}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultAvatar;
              }}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white/30 shadow-2xl bg-black/40"
            />
            
            {/* Upload Camera Badge */}
            <label className="absolute bottom-0 right-0 bg-[#0f1117] text-white p-2.5 rounded-full shadow-lg border border-white/20 cursor-pointer hover:bg-white/10 hover:scale-105 transition-all" title="Upload new photo">
              <Camera className="w-4 h-4 text-[#E94B4B]" />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="hidden" 
              />
            </label>

            {/* Remove Photo Button */}
            {(previewUrl || user?.profilePicUrl || profilePicFile) && (
              <button
                type="button"
                onClick={handleRemovePic}
                disabled={isDeletingPic}
                className="absolute top-0 right-0 text-white p-1.5 rounded-full shadow-md bg-black/70 hover:bg-black border border-white/20 transition-all cursor-pointer disabled:opacity-50"
                title="Remove photo"
              >
                {isDeletingPic ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 text-red-400" />}
              </button>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white truncate">{user?.name || 'Administrator'}</h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md capitalize border border-white/30">
                {user?.role || 'Super Admin'}
              </span>
            </div>
            <p className="text-white/80 text-sm font-medium mb-3.5 break-all">{user?.email || 'admin@knowchamp.com'}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-white/90">
              <span className="flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-green-300" /> ID: <span className="font-mono font-bold">{user?.uuid || `ADM${user?.id || '01'}`}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-300" /> Status: Verified Admin
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Personal Information Form ── */}
      <div className="bg-[#0f1117] rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E94B4B]/15 flex items-center justify-center shrink-0">
              <User className="w-4.5 h-4.5 text-[#E94B4B]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Personal Information</h2>
              <p className="text-xs text-white/50">Update your account name, contact details and avatar</p>
            </div>
          </div>
          {profilePicFile && (
            <span className="text-xs font-bold text-[#E94B4B] bg-[#E94B4B]/10 px-3 py-1 rounded-full border border-[#E94B4B]/20">
              New photo selected
            </span>
          )}
        </div>

        <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                Full Name <span className="text-[#E94B4B]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 font-medium transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                Email Address <span className="text-[#E94B4B]">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 font-medium transition-all"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.mobile}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                  placeholder="e.g. 9876543210"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 font-medium transition-all"
                />
              </div>
            </div>

            {/* Role / Access Level */}
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                System Role
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={user?.role || 'Super Admin'}
                  disabled
                  readOnly
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/3 border border-white/5 rounded-xl text-white/60 font-semibold capitalize cursor-not-allowed"
                />
              </div>
            </div>

          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="flex items-center gap-2 px-6 py-2.5 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-60 hover:opacity-90"
              style={{ background: 'linear-gradient(178.27deg, #E94B4B 1.6%, #911616 126.9%)' }}
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Security & Password Card ── */}
      <div className="bg-[#0f1117] rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E94B4B]/15 flex items-center justify-center shrink-0">
            <KeyRound className="w-4.5 h-4.5 text-[#E94B4B]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Security & Password</h2>
            <p className="text-xs text-white/50">Update your account password securely</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                Current Password <span className="text-[#E94B4B]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                New Password <span className="text-[#E94B4B]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">
                Confirm New Password <span className="text-[#E94B4B]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Re-enter new password"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#E94B4B] focus:ring-1 focus:ring-[#E94B4B]/30 font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-sm border border-white/10 transition-all shadow-sm cursor-pointer disabled:opacity-60"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-[#E94B4B]" />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default Profile;
