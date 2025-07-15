import { create } from 'zustand';
import axios from '../lib/axios'; 

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  loading: false,
  error: null,

  fetchNotifications: async (userId) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(`/api/notifications/${userId}`);
      set({ notifications: res.data, loading: false });
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
      set({ error: err.message, loading: false });
    }
  },

  addNotification: (notif) =>
    set((state) => ({
      notifications: [notif, ...state.notifications],
    })),

  deleteNotification: async (id) => {
  try {
    await axios.delete(`/notifications/${id}`); // ✅ no double /api/api
    set((state) => ({
      notifications: state.notifications.filter((n) => n._id !== id),
    }));
  } catch (err) {
    console.error('❌ Error deleting notification:', err);
    throw err;
  }
},

  clearNotifications: () => set({ notifications: [] }),
}));
