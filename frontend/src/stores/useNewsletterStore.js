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
    const res = await axios.get('/newsletters/slots');
    console.log('Raw slots data from backend:', res.data); // Add this to inspect the actual response
    
    const filteredSlots = (res.data || Array(3).fill(null)).map(slot => {
      if (!slot || slot.status !== 'published') return null;
      console.log('Original slot thumbnailPath:', slot.thumbnailPath); // Debug the original path
      const normalizedSlot = {
        ...slot,
        thumbnailUrl: normalizeImagePath(slot.thumbnailPath),
        fileUrl: normalizeImagePath(slot.filePath)
      };
      console.log('Normalized slot:', normalizedSlot); // Debug the normalized result
      return normalizedSlot;
    });
    set({ homepageSlots: filteredSlots });
  } catch (error) {
    console.error('Error loading slots:', error);
    set({ homepageSlots: Array(3).fill(null) });
  }
},


  updateHomepageSlot: async (slotIndex, newsletter) => {
    try {
      console.log('[FRONTEND] Making request to /newsletters/slots', {
        slotIndex,
        newsletterId: newsletter._id
      });


      const response = await axios.post('/newsletters/slots', {
        slotIndex,
        newsletter
      });

      // Debugging - log successful response
      console.log('[FRONTEND] Request successful:', response.data);

      set(state => {
        const updatedSlots = [...state.homepageSlots];
        updatedSlots[slotIndex] = newsletter;
        return { homepageSlots: updatedSlots };
      });

      return response.data;
    } catch (error) {
      // Enhanced error logging
      console.error('[FRONTEND] Error saving slots:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
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