import Cookies from "js-cookie";
import api from "./api";

class AuthService {
  async login(credentials) {
    const response = await api.post("auth/login/admin", credentials);
    if (response.data?.success) {
      const { user, token } = response.data.data;
      Cookies.set("adminToken", token, { expires: 7 });
      Cookies.set("token", token, { expires: 7 });
      localStorage.setItem("adminToken", token);
      localStorage.setItem("token", token);
      Cookies.set("user", JSON.stringify(user), { expires: 7 });
      localStorage.setItem("user", JSON.stringify(user));
    }
    return response.data;
  }

  async getProfile() {
    const response = await api.get("auth/me");
    return response.data;
  }

  async updateProfile(formData) {
    const response = await api.put("auth/me", formData, {
      headers: {
        'Content-Type': formData instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    });
    if (response.data?.success) {
      const user = response.data.data;
      Cookies.set("user", JSON.stringify(user), { expires: 7 });
      localStorage.setItem("user", JSON.stringify(user));
    }
    return response.data;
  }

  async deleteProfilePic() {
    const response = await api.delete("auth/me/profile-pic");
    return response.data;
  }

  async register(userData) {
    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    formData.append('mobile', userData.mobile);
    formData.append('password', userData.password);
    formData.append('city', 'Delhi');
    formData.append('adharNumber', '123456789012');
    formData.append('isTermAccpeted', 'true');

    const dummyBlob = new Blob([new Uint8Array([71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 0, 0, 0, 255, 255, 255, 33, 249, 4, 1, 0, 0, 0, 0, 44, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 68, 1, 0, 59])], { type: 'image/gif' });
    formData.append('adharImages', dummyBlob, 'adhar_front.gif');
    formData.append('adharImages', dummyBlob, 'adhar_back.gif');

    const response = await api.post('auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async changePassword(passwords) {
    const response = await api.put("auth/me/change-password", passwords);
    return response.data;
  }

  async logout() {
    try {
      await api.post("auth/logout");
    } catch (error) {
      console.error("API logout failed:", error);
    }
    Cookies.remove("token");
    Cookies.remove("adminToken");
    Cookies.remove("user");
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");

    return {
      success: true,
      message: "Logout successful"
    };
  }
}

export default new AuthService();