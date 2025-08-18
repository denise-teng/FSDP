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


  fetchDeletedDrafts: async () => {
  const currentState = get();
  if (currentState.loading ||
      (currentState.lastFetch && Date.now() - currentState.lastFetch < 5000)) {
    return;
  }
  set({ loading: true, error: null });
  try {
    const response = await axios.get('/deleted_drafts');
    const payload = response.data;
    const list = Array.isArray(payload)
      ? payload
      : payload?.data || payload?.drafts || []; // be flexible
    set({
      deletedDrafts: list,
      loading: false,
      lastFetch: Date.now()
    });
  } catch (error) {
    set({
      error: error.response?.data?.error || 'Failed to fetch deleted drafts',
      loading: false
    });
    throw error;
  }
},


  // Add a new draft
  addDraft: async (draftData) => {
    set({ loading: true });
    try {
      const fd = new FormData();
      Object.entries(draftData).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach(item => fd.append(k, item));
        else fd.append(k, v);
      });
      const res = await axios.post('/drafts', fd);
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


  deleteDraft: async (id) => {
  set({ isDeleting: true, error: null });
  try {
    const response = await axios.delete(`/drafts/${id}`);
    const ok = response.status === 200 || response.status === 204 || response.data?.success;
    if (!ok) throw new Error(response.data?.message || 'Failed to delete draft');

    const moved = response.data?.draft || null;
    set(state => ({
      drafts: state.drafts.filter(d => d._id !== id),
      // If server returns the updated draft (with deletedAt), prepend it; otherwise refetch later
      deletedDrafts: moved ? [moved, ...state.deletedDrafts] : state.deletedDrafts,
      isDeleting: false
    }));
    toast.success("Draft moved to trash");
    return true;
  } catch (error) {
    set({ error: error.message, isDeleting: false });
    toast.error(error.message);
    return false;
  }
},


  // In useDraftsStore.js
  permanentlyDeleteDraft: async (id) => {
  set({ isDeleting: true, error: null });
  try {
    const response = await axios.delete(`/deleted_drafts/${id}`);
    const ok = response.status === 200 || response.status === 204 || response.data?.success;
    if (!ok) throw new Error(response.data?.message || 'Deletion failed');

    set(state => ({
      deletedDrafts: state.deletedDrafts.filter(d => d._id !== id),
      isDeleting: false
    }));
    return true;
  } catch (error) {
    set({ error: error.message, isDeleting: false });
    throw error;
  }
},

  restoreDraft: async (id) => {
  set({ loading: true, error: null });
  try {
    const response = await axios.put(`/deleted_drafts/${id}/restore`);
    const restored = response.data?.draft || response.data?.data || null;
    if (!restored) throw new Error(response.data?.message || 'Restoration failed');

    set(state => ({
      deletedDrafts: state.deletedDrafts.filter(d => d._id !== id),
      drafts: [restored, ...state.drafts],
      loading: false
    }));
    return true;
  } catch (error) {
    set({ error: error.message, loading: false });
    throw error;
  }
},

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
  },

  sendGeneratedNow: async (id) => {
  // adjust base path to match where you mount the router, e.g. '/publish-generate'
  // if your server mounts it as app.use('/api/publish-generate', router)
  set({ loading: true, error: null });
  try {
    const res = await axios.post(`/publish-generate/${id}/send`);
    // success => drop it from local list immediately
    set(state => ({
      drafts: state.drafts.filter(d => d._id !== id),
      loading: false
    }));
    // (optional) also refresh from server to keep everything in sync
    // await get().fetchDrafts();

    // toast if you like
    // toast.success(`Sent to ${res.data?.sent ?? 0}/${res.data?.total ?? 0} subscribers`);
    return res.data;
  } catch (error) {
    set({ loading: false, error: error.response?.data?.message || 'Failed to send draft' });
    // toast.error(error.response?.data?.message || 'Failed to send draft');
    throw error;
  }
}

}));



export const getDeletedDrafts = async (req, res) => {
  try {
    const drafts = await Draft.find({ deletedAt: { $ne: null } })
      .sort({ deletedAt: -1 });
    res.json(drafts);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch deleted drafts',
      details: error.message
    });
  }
};

export const restoreDraft = async (req, res) => {
  try {
    const draft = await Draft.findByIdAndUpdate(
      req.params.id,
      { $set: { deletedAt: null } },
      { new: true }
    );

    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    res.json({ draft });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to restore draft',
      details: error.message
    });
  }
};

export const permanentlyDeleteDraft = async (req, res) => {
  try {
    const result = await Draft.deleteOne({
      _id: req.params.id,
      deletedAt: { $ne: null }
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found or not marked as deleted'
      });
    }

    res.json({
      success: true,
      message: 'Draft permanently deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete draft',
      details: error.message
    });
  }
};
