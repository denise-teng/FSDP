import { create } from 'zustand';
import axios from '../lib/axios';
import toast from 'react-hot-toast';


const getBaseUrl = () => {
  return 'http://localhost:5000';  // Change to your actual backend URL
};

const normalizeImagePath = (path) => {
  if (!path) return '/placeholder-image.jpg';
  if (path.startsWith('http') || path.startsWith('/')) return path;
 
  // Handle uploaded files
  const cleanPath = String(path)
    .replace(/^[\\/]+/, '')
    .replace(/\\/g, '/')
    .replace(/^uploads\//, '');
   
  return `${getBaseUrl()}/uploads/${cleanPath}`;
};

// Helper function to construct file URLs
const getFileUrl = (path) => {
  if (!path) return null;
  const cleanPath = String(path)
    .replace(/^[\\/]+/, '')
    .replace(/\\/g, '/')
    .replace(/^uploads\//, '');
  return `${getBaseUrl()}/uploads/${cleanPath}`;
};

export const useNewsletterStore = create((set) => ({
  newsletters: [],
  drafts: [],
  homepageSlots: Array(3).fill(null), // This will store 3 slots
  loading: false,

  initializeHomepageSlots: (slots) => set({ homepageSlots: slots }),

  setFeaturedNewsletters: (newsletters) => set({ featuredNewsletters: newsletters }),

  setNewsletters: (newsletters) => set({ newsletters }),

initializeSlots: async () => {
  try {
    const res = await axios.get('/newsletters/slots'); // should return an array of length 3
    const slots = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.slots) ? res.data.slots : [null, null, null]);
    const normalized = slots.map(s => s ? ({
      ...s,
      thumbnailUrl: normalizeImagePath(s.thumbnailPath),
      fileUrl: normalizeImagePath(s.newsletterFilePath),
    }) : null);
    set({ homepageSlots: normalized });
  } catch (err) {
    console.error('Error loading slots:', err);
    set({ homepageSlots: [null, null, null] });
  }
},



  // stores/useNewsletterStore.js
updateHomepageSlot: async (slotIndex, newsletter) => {
  try {
    if (!newsletter?._id) throw new Error('Missing newsletter._id');

    console.log('[FRONTEND] PUT /newsletters/slots', { slotIndex, newsletterId: newsletter._id });

    const res = await axios.put('/newsletters/slots', {
      slotIndex,
      newsletterId: newsletter._id,
    });

    const serverSlots = Array.isArray(res.data?.slots) ? res.data.slots : [null, null, null];

    const normalized = serverSlots.map(s => s ? ({
      ...s,
      thumbnailUrl: normalizeImagePath(s.thumbnailPath),
      fileUrl: normalizeImagePath(s.newsletterFilePath),
    }) : null);

    set({ homepageSlots: normalized });
    return { ok: true };
  } catch (error) {
    console.error('[FRONTEND] Error saving slots:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
},


  // In useNewsletterStore.js
  createNewsletter: async (formData) => {
    set({ loading: true });
    try {
      const res = await axios.post('/newsletters', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newNewsletter = res.data.newsletter;
      const status = formData.get('status') || 'published'; // Default to published if not specified

      set((prev) => ({
        newsletters: status === 'published'
          ? [newNewsletter, ...prev.newsletters]
          : prev.newsletters,
        drafts: status === 'draft'
          ? [newNewsletter, ...prev.drafts || []]
          : prev.drafts || [],
        loading: false,
      }));

      toast.success(
        status === 'draft'
          ? 'Draft saved successfully!'
          : 'Newsletter published successfully!',
        { id: 'create-success' }
      );

      return newNewsletter;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save newsletter');
      set({ loading: false });
      throw error;
    }
  },

  fetchNewsletters: async () => {
    set({ loading: true });
    try {
      const res = await axios.get('/newsletters');  // Make sure the URL is correct
      set({ newsletters: res.data, loading: false });  // Update state with fetched newsletters
    } catch (error) {
      toast.error('Failed to fetch newsletters');
      set({ loading: false });
    }
  },

  deleteNewsletter: async (id) => {
    set({ loading: true });
    try {
      await axios.delete(`/newsletters/${id}`);
      set((prev) => ({
        newsletters: prev.newsletters.filter((n) => n._id !== id),
        loading: false,
      }));
      toast.success('Newsletter deleted!');
    } catch (error) {
      toast.error('Failed to delete newsletter');
      set({ loading: false });
    }
  },

  updateNewsletter: async (id, formData) => {
    set({ loading: true });
    try {
      const res = await axios.put(`/newsletters/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set((prev) => ({
        newsletters: prev.newsletters.map((n) =>
          n._id === id ? res.data.newsletter : n
        ),
        loading: false,
      }));
      toast.success('Newsletter updated!');
    } catch (error) {
      toast.error(
        error.response?.data?.error || 'Failed to update newsletter'
      );
      set({ loading: false });
    }
  }
}));
