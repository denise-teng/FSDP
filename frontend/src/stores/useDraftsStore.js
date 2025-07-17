import { create } from "zustand";
import axios from "../lib/axios";

export const useDraftStore = create((set) => ({
  drafts: [],
  loading: false,
  error: null,

fetchDrafts: async () => {
  set({ loading: true, error: null });
  try {
    const response = await axios.get("/drafts");
    set({ drafts: response.data, loading: false }); // ✅ actually save the fetched drafts
  } catch (error) {
    set({ error: "Failed to fetch drafts", loading: false });
    toast.error(error.response?.data?.error || "Failed to fetch drafts");
  }
},


  // Add a new draft to the store
  addDraft: async (draftData) => {
    console.log("Sending draft data:", draftData);  // Log to inspect the data before sending
    set({ loading: true });
    try {
      const res = await axios.post('/drafts', draftData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Draft saved:", res.data);
      set((state) => ({ drafts: [res.data, ...state.drafts], loading: false }));
      return res.data;
    } catch (error) {
      console.error("Error saving draft:", error.response?.data || error.message);
      set({ loading: false });
      throw error;
    }
  },

  // Update an existing draft
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
      return res.data;
    } catch (error) {
      set({ loading: false });
      console.error("Failed to update draft:", error);
      throw error;
    }
  },

  // Delete a draft
  deleteDraft: async (id) => {
    set({ loading: true });
    try {
      await axios.delete(`/drafts/${id}`);
      set((state) => ({
        drafts: state.drafts.filter(draft => draft._id !== id),
        loading: false
      }));
    } catch (error) {
      set({ loading: false });
      console.error("Failed to delete draft:", error);
      throw error;
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
      return res.data;
    } catch (error) {
      set({ loading: false });
      console.error("Failed to publish draft:", error);
      throw error;
    }
  },

  // Optional helper function to fetch draft by ID from state
  getDraftById: (id) => {
    return useDraftStore.getState().drafts.find(draft => draft._id === id);
  }
}));

// Export helper function (optional)
export const getDraftById = (id) => {
  return useDraftStore.getState().drafts.find(draft => draft._id === id);
};
