import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

export const useQuickMessageStore = create((set) => ({
  messages: [],
  loading: false,

  fetchMessages: async () => {
    set({ loading: true });
    try {
      const res = await axios.get('/api/quick-messages');
      set({ messages: res.data });
    } catch (err) {
      console.error('Failed to fetch quick messages:', err);
      toast.error('Failed to load quick messages');
    } finally {
      set({ loading: false });
    }
  },

  addMessage: async (content) => {
    try {
      const res = await axios.post('/api/quick-messages', { content });
      set((state) => ({ messages: [res.data, ...state.messages] }));
      toast.success('Message added');
    } catch (err) {
      console.error('Add message failed:', err);
      toast.error('Failed to add message');
    }
  },

  updateMessage: async (id, content) => {
    try {
      const res = await axios.put(`/api/quick-messages/${id}`, { content });
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === id ? res.data : msg
        ),
      }));
      toast.success('Message updated');
    } catch (err) {
      console.error('Update failed:', err);
      toast.error('Failed to update message');
    }
  },

  deleteMessage: async (id) => {
    try {
      await axios.delete(`/api/quick-messages/${id}`);
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== id),
      }));
      toast.success('Message deleted');
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete message');
    }
  },
}));
