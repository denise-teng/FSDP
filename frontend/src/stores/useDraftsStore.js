import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-toastify";

export const useDraftStore = create((set, get) => ({
  drafts: [],
  deletedDrafts: [], // Separate state for deleted drafts
  loading: false,
  error: null,
  isDeleting: false, // Separate loading state for delete operations
  lastFetchTime: null,

 fetchDrafts: async () => {
    // Prevent rapid consecutive fetches
    const { lastFetchTime } = get();
    if (lastFetchTime && Date.now() - lastFetchTime < 5000) {
      return;
    }

    set({ loading: true, error: null });
    try {
      const response = await axios.get("/drafts");
      set({ 
        drafts: response.data,
        loading: false,
        lastFetchTime: Date.now() 
      });
    } catch (error) {
      set({ 
        error: error.message || "Failed to fetch drafts",
        loading: false 
      });
    }
  },



  // Similar for fetchDeletedDrafts
  fetchDeletedDrafts: async () => {
    const { lastFetchTime } = get();
    if (lastFetchTime && Date.now() - lastFetchTime < 5000) {
      return;
    }

    set({ loading: true, error: null });
    try {
      const response = await axios.get("/deleted-drafts");
      set({ 
        deletedDrafts: response.data,
        loading: false,
        lastFetchTime: Date.now()
      });
    } catch (error) {
      set({ 
        error: error.message || "Failed to fetch deleted drafts",
        loading: false 
      });
    }
  },

  // Add a new draft
  addDraft: async (draftData) => {
    set({ loading: true });
    try {
      const res = await axios.post('/drafts', draftData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set((state) => ({ 
        drafts: [res.data, ...state.drafts], 
        loading: false 
      }));
      toast.success("Draft created successfully");
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to create draft";
      set({ loading: false, error: errorMsg });
      toast.error(errorMsg);
      throw error;
    }
  },

  // Update a draft
  updateDraft: async (id, updates) => {
    set({ loading: true });
    try {
      const res = await axios.put(`/drafts/${id}`, updates);
      set((state) => ({
        drafts: state.drafts.map(draft =>
          draft._id === id ? { ...draft, ...res.data } : draft
        ),
        loading: false
      }));
      toast.success("Draft updated successfully");
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to update draft";
      set({ loading: false, error: errorMsg });
      toast.error(errorMsg);
      throw error;
    }
  },

  // Delete a draft (soft delete)
  deleteDraft: async (id) => {
    set({ isDeleting: true, error: null });
    try {
      const response = await axios.delete(`/drafts/${id}`);
      
      if (response.data.success) {
        // Remove from active drafts and add to deleted drafts
        set((state) => ({
          drafts: state.drafts.filter(draft => draft._id !== id),
          deletedDrafts: [response.data.draft, ...state.deletedDrafts],
          isDeleting: false
        }));
        toast.success("Draft moved to trash");
        return true;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to delete draft";
      set({ error: errorMsg, isDeleting: false });
      toast.error(errorMsg);
      return false;
    }
  },

  // Restore a deleted draft
  restoreDraft: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/deleted_drafts/${id}/restore`);
      
      if (response.data) {
        // Remove from deleted drafts and add back to active drafts
        set((state) => ({
          deletedDrafts: state.deletedDrafts.filter(draft => draft._id !== id),
          drafts: [response.data.draft, ...state.drafts],
          loading: false
        }));
        toast.success("Draft restored successfully");
        return true;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to restore draft";
      set({ error: errorMsg, loading: false });
      toast.error(errorMsg);
      return false;
    }
  },

  // Permanently delete a draft
  permanentlyDeleteDraft: async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this draft?")) {
      return false;
    }

    set({ isDeleting: true, error: null });
    try {
      const response = await axios.delete(`/deleted_drafts/${id}`);
      
      if (response.data.success) {
        set((state) => ({
          deletedDrafts: state.deletedDrafts.filter(draft => draft._id !== id),
          isDeleting: false
        }));
        toast.success("Draft permanently deleted");
        return true;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to delete draft permanently";
      set({ error: errorMsg, isDeleting: false });
      toast.error(errorMsg);
      return false;
    }
  },

  // Publish a draft
  publishDraft: async (id) => {
    set({ loading: true });
    try {
      const res = await axios.post(`/drafts/${id}/publish`);
      set((state) => ({
        drafts: state.drafts.filter(draft => draft._id !== id),
        loading: false
      }));
      toast.success("Draft published successfully");
      return res.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to publish draft";
      set({ loading: false, error: errorMsg });
      toast.error(errorMsg);
      throw error;
    }
  },

  // Helper function to get draft by ID
  getDraftById: (id) => {
    return get().drafts.find(draft => draft._id === id) || 
           get().deletedDrafts.find(draft => draft._id === id);
  }
}));