import { create } from 'zustand';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

export const useWhatsappContactStore = create((set) => ({
  loading: false,

  createWhatsappContact: async (formData) => {
    set({ loading: true });

    const requiredFields = ['firstName', 'lastName', 'phone', 'company', 'eventName', 'eventDate'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`${field} is required`);
        set({ loading: false });
        return;
      }
    }

    try {
      const res = await axios.post('/whatsapp-contacts', formData);
      toast.success('WhatsApp contact added successfully!');
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add contact');
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));
