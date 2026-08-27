import { useSelector, useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { updateProfile as updateProfileThunk, deleteProfilePic as deleteProfilePicThunk, login as loginThunk, logout as logoutThunk } from '../store/auth/authThunk';

export const useAuth = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  const hasRole = (role) => {
    return user?.role === role;
  };

  const isAdmin = hasRole('admin');
  const isOwner = (userId) => user?.id === userId;

  const updateProfile = (userData) => {
    return dispatch(updateProfileThunk(userData));
  };

  const removeProfilePic = () => {
    return dispatch(deleteProfilePicThunk());
  };

  const login = (credentials) => {
    return dispatch(loginThunk(credentials));
  };

  const logout = async (options) => {
    const result = await dispatch(logoutThunk(options));
    // Clear all TanStack Query caches on logout so no stale user data persists
    queryClient.clear();
    return result;
  };

  return {
    user,
    isAuthenticated,
    loading,
    isAdmin,
    isOwner,
    hasRole,
    updateProfile,
    removeProfilePic,
    login,
    logout,
  };
};

export default useAuth;