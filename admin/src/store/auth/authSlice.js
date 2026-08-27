import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { login, loadUser, updateProfile, deleteProfilePic, logout } from "../auth/authThunk";
import toast from "react-hot-toast";
import { MESSAGES } from "../../constants/messages";

const getInitialToken = () => {
  return Cookies.get("token") || localStorage.getItem("token") || Cookies.get("adminToken") || localStorage.getItem("adminToken") || null;
};

const getInitialUser = () => {
  try {
    const token = getInitialToken();
    if (!token) return null;
    const storedUser = Cookies.get("user") || localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const initialToken = getInitialToken();
const initialUser = getInitialUser();

const initialState = {
  user: initialUser,
  isAuthenticated: !!(initialToken && initialUser),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        const user = action.payload.data?.user || (action.payload.data?.id ? action.payload.data : action.payload.user);
        const token = action.payload.data?.token || action.payload.token;
        state.user = user;

        if (user) {
          Cookies.set("user", JSON.stringify(user), { expires: 7 });
          localStorage.setItem("user", JSON.stringify(user));
        }
        if (token) {
          Cookies.set("token", token, { expires: 7 });
          localStorage.setItem("token", token);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || MESSAGES.AUTH.LOGIN_FAILED;
      })

      // LOAD USER
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        const user = action.payload?.data?.user || (action.payload?.data?.id ? action.payload.data : action.payload?.user);
        const token = action.payload?.data?.token || action.payload?.token;
        if (user) {
          state.user = user;
          state.isAuthenticated = true;
          Cookies.set("user", JSON.stringify(user), { expires: 7 });
          localStorage.setItem("user", JSON.stringify(user));
        }
        if (token) {
          Cookies.set("token", token, { expires: 7 });
          localStorage.setItem("token", token);
        }
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        Cookies.remove("user");
        Cookies.remove("token");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      })

      // UPDATE PROFILE
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload?.data?.user || (action.payload?.data?.id ? action.payload.data : action.payload?.user);
        if (updatedUser) {
          state.user = updatedUser;
          Cookies.set("user", JSON.stringify(updatedUser), { expires: 7 });
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || MESSAGES.AUTH.UPDATE_FAILED;
      })

      // DELETE PROFILE PIC
      .addCase(deleteProfilePic.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProfilePic.fulfilled, (state) => {
        state.loading = false;
        if (state.user) {
          state.user = { ...state.user, profilePicUrl: null };
          Cookies.set("user", JSON.stringify(state.user), { expires: 7 });
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      })
      .addCase(deleteProfilePic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to remove profile picture";
      })

      // LOGOUT
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        Cookies.remove("user");
        Cookies.remove("token");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        toast.success(MESSAGES.AUTH.LOGOUT_SUCCESS);
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        Cookies.remove("user");
        Cookies.remove("token");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        toast.success(MESSAGES.AUTH.LOGOUT_SUCCESS);
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;