import { createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import authService from "../../api/services/authService";
import toast from "react-hot-toast";
import { MESSAGES } from "../../constants/messages";
import { queryClient } from "../../api/queryClient";

const getErrorMessage = (error, defaultMessage = MESSAGES.NETWORK.ACTION_FAILED) => {
  if (error.response) {
    const data = error.response.data;
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0].message;
    }
    if (data?.message) {
      return data.message;
    }
    if (error.response.status === 401) return MESSAGES.NETWORK.UNAUTHORIZED;
    if (error.response.status === 403) return MESSAGES.NETWORK.ACCESS_DENIED;
    if (error.response.status === 404) return MESSAGES.NETWORK.NOT_FOUND;
    if (error.response.status >= 500) return MESSAGES.NETWORK.SERVER_ERROR;
  } else if (error.request) {
    return MESSAGES.NETWORK.NETWORK_ERROR;
  }
  return error.message || defaultMessage;
};

export const login = createAsyncThunk(
  "auth/login",
  async (arg, { rejectWithValue }) => {
    const { credentials, showToast = true } = arg?.credentials ? arg : { credentials: arg };
    try {
      const response = await authService.login(credentials);
      if (showToast) toast.success(MESSAGES.AUTH.LOGIN_SUCCESS);
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error, MESSAGES.AUTH.LOGIN_FAILED);
      toast.error(errorMessage);
      return rejectWithValue(error.response?.data || { message: errorMessage });
    }
  }
);

export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      return response;
    } catch (error) {
      if (error.response?.status === 429) {
        const storedUser = Cookies.get("user");
        if (storedUser) {
          return { user: JSON.parse(storedUser) };
        }
      }

      if (error.response?.status === 401) {
        Cookies.remove("user");
        Cookies.remove("token");
      }

      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(userData);
      toast.success(MESSAGES.AUTH.PROFILE_UPDATE_SUCCESS || "Profile updated successfully");
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error, MESSAGES.AUTH.UPDATE_FAILED);
      toast.error(errorMessage);
      return rejectWithValue(error.response?.data || { message: errorMessage });
    }
  }
);

export const deleteProfilePic = createAsyncThunk(
  "auth/deleteProfilePic",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.deleteProfilePic();
      toast.success("Profile picture removed successfully");
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to remove profile picture");
      toast.error(errorMessage);
      return rejectWithValue(error.response?.data || { message: errorMessage });
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      if (queryClient) {
        queryClient.clear();
      }
      return true;
    } catch (error) {
      if (queryClient) {
        queryClient.clear();
      }
      return rejectWithValue(error.response?.data);
    }
  }
);