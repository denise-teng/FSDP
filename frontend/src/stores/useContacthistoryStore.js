import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const useContactHistoryStore = create((set, get) => ({
  contactHistory: [],  // State to store fetched contact history
  loading: false,      // Loading state for API calls
  error: null,         // Error state for handling API errors

  // Fetch contact history from the server
  fetchContactHistory: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/contact-history');
      
      // Assuming the response structure has 'data' holding the contact history
      const data = Array.isArray(response.data) ? response.data : [];
      
      // Set the fetched data into the store state
      set({ 
        contactHistory: data, 
        loading: false 
      });
    } catch (err) {
      console.error('Fetch Error:', err.response?.data || err.message);
      set({ 
        contactHistory: [], // Set the state to empty on error
        error: err.response?.data?.error || 'Failed to fetch contact history',
        loading: false 
      });
    }
  },

  // Permanently delete a contact from the history
  deleteContactPermanently: async (id) => {
    try {
      // Optimistic update: Remove the contact from the state immediately
      set(state => ({
        contactHistory: state.contactHistory.filter(c => c._id !== id)
      }));

      // Call API to delete the contact permanently from the history
      await axios.delete(`/api/contact-history/${id}`);
    } catch (err) {
      console.error('Delete Error:', err.response?.data || err.message);
      
      // Rollback: Fetch the contact history again if there was an error
      await get().fetchContactHistory();
      toast.error(err.response?.data?.error || 'Failed to delete contact');
    }
  },

  // Recover a contact from history back to the main contact list
  recoverContact: async (id) => {
    try {
      // First try to recover the contact
      const response = await axios.put(`/api/contact-history/${id}/recover`);
      
      // If recovery was successful, explicitly delete the history record
      if (response.data.success) {
        // Remove from local state first
        set(state => ({
          contactHistory: state.contactHistory.filter(c => c._id !== id)
        }));

        // Then ensure it's deleted from database
        await axios.delete(`/api/contact-history/${id}`);
      } else {
        throw new Error(response.data.error || 'Failed to recover contact');
      }
    } catch (err) {
      console.error('Recover Error:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || 'Failed to recover contact');
      throw err;
    }
  },

  // Get contact by ID from the history state
  getContactById: (id) => {
    return get().contactHistory.find(c => c._id === id);
  }
}));

export default useContactHistoryStore;
