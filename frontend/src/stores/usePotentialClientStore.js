import { create } from 'zustand';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

export const usePotentialClientStore = create((set) => ({
  potentialClients: [],
  loading: false,

  fetchPotentialClients: async () => {
    set({ loading: true });
    try {
      const res = await axios.get('/potential-clients');
      // Ensure it's always an array
      set({ potentialClients: Array.isArray(res.data) ? res.data : [] });
    } catch (error) {
      toast.error('Failed to fetch potential clients');
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },

  createPotentialClient: async (formData) => {
    set({ loading: true });
    try {
      const res = await axios.post('/potential-clients', formData);
      toast.success('Added to potential clients!');
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add potential client');
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
