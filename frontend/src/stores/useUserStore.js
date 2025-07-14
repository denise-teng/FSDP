import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,
  users: [], // Added users state to store fetched users


  getUsers: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/users"); // Assuming this is your endpoint
      set({ users: res.data, loading: false }); // Store users in state
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Error fetching users");
    }
  },
  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });

    if (password !== confirmPassword) {
      set({ loading: false });
      return toast.error("Passwords do not match");
    }

    try {
      const res = await axios.post("/auth/signup", { name, email, password });
      set({ user: res.data, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Incorrect password or email");
    }
  },

  login: async (email, password, navigate) => {
    set({ loading: true });

    try {
    const res = await axios.post("/auth/login", { email, password });
    const user = res.data;

    set({ user, loading: false });

    // ✅ Redirect based on role
    if (navigate && user?.role === "admin") {
      navigate("/admin-home");
    } else if (navigate) {
      navigate("/user-home");
    }
  } catch (error) {
    set({ loading: false });

    // Check for specific error codes and display corresponding messages
    if (error.response?.status === 401) {
      if (error.response?.data?.message === "Wrong password") {
        toast.error("Wrong password. Please try again.");
      } else if (error.response?.data?.message === "User not found") {
        toast.error("No account found with that email address.");
      } else {
        toast.error("Invalid email or password.");
      }
    } else {
      toast.error(error.response?.data?.message || "Incorrect password or email");
    }
  }
},
  logout: async () => {
    try {
      await axios.post("/auth/logout");
      set({ user: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred during logout");
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const response = await axios.get("/auth/profile");
      set({ user: response.data, checkingAuth: false });
    } catch (error) {
      console.log(error.message);
      set({ checkingAuth: false, user: null });
    }
  },

  refreshToken: async () => {
    if (get().checkingAuth) return;

    set({ checkingAuth: true });
    try {
      const response = await axios.post("/auth/refresh-token");
      set({ checkingAuth: false });
      return response.data;
    } catch (error) {
      set({ user: null, checkingAuth: false });
      throw error;
    }
  },
}));

// ✅ Axios interceptor for token refresh
let refreshPromise = null;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (refreshPromise) {
          await refreshPromise;
          return axios(originalRequest);
        }

        refreshPromise = useUserStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;

        return axios(originalRequest);
      } catch (refreshError) {
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);