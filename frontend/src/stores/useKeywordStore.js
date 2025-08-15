import { create } from 'zustand';

const useKeywordStore = create((set, get) => ({
  keywords: [
    // Some default keywords to start with
    { keywordId: 1, keyword: 'urgent', isActive: true, createdAt: new Date() },
    { keywordId: 2, keyword: 'meeting', isActive: true, createdAt: new Date() },
    { keywordId: 3, keyword: 'appointment', isActive: true, createdAt: new Date() },
    { keywordId: 4, keyword: 'consultation', isActive: true, createdAt: new Date() },
    { keywordId: 5, keyword: 'investment', isActive: true, createdAt: new Date() },
  ],
  loading: false,

  // Get all keywords
  getKeywords: () => {
    return get().keywords;
  },

  // Get active keywords only
  getActiveKeywords: () => {
    return get().keywords.filter(keyword => keyword.isActive);
  },

  // Add a new keyword
  addKeyword: (keywordText) => {
    const { keywords } = get();
    
    // Check if keyword already exists
    const exists = keywords.find(k => k.keyword.toLowerCase() === keywordText.toLowerCase());
    if (exists) {
      throw new Error('Keyword already exists');
    }

    // Get next ID
    const nextId = keywords.length > 0 ? Math.max(...keywords.map(k => k.keywordId)) + 1 : 1;
    
    const newKeyword = {
      keywordId: nextId,
      keyword: keywordText.toLowerCase().trim(),
      isActive: true,
      createdAt: new Date()
    };

    set(state => ({
      keywords: [newKeyword, ...state.keywords]
    }));

    return newKeyword;
  },

  // Delete a keyword
  deleteKeyword: (keywordId) => {
    set(state => ({
      keywords: state.keywords.filter(k => k.keywordId !== keywordId)
    }));
  },

  // Toggle keyword active status
  toggleKeywordStatus: (keywordId) => {
    set(state => ({
      keywords: state.keywords.map(k => 
        k.keywordId === keywordId 
          ? { ...k, isActive: !k.isActive }
          : k
      )
    }));
    
    return get().keywords.find(k => k.keywordId === keywordId);
  },

  // Update a keyword
  updateKeyword: (keywordId, updates) => {
    set(state => ({
      keywords: state.keywords.map(k => 
        k.keywordId === keywordId 
          ? { ...k, ...updates }
          : k
      )
    }));
    
    return get().keywords.find(k => k.keywordId === keywordId);
  },

  // Set loading state
  setLoading: (loading) => {
    set({ loading });
  },

  // Clear all keywords
  clearKeywords: () => {
    set({ keywords: [] });
  }
}));

export default useKeywordStore;
