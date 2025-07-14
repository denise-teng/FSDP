// src/stores/useContactStore.js
import { create } from 'zustand';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

export const useContactStore = create((set) => ({
  loading: false,

  createContact: async (formData) => {
    set({ loading: true });

    // Optional basic client-side validation
    const requiredFields = ['firstName', 'lastName', 'phone', 'email', 'subject', 'message'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`${field} is required`);
        set({ loading: false });
        return;
      }
    }

    try {
      const res = await axios.post('/contacts', formData);
      toast.success('Contact submitted successfully!');
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit contact');
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));
