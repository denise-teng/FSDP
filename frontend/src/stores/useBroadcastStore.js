import { create } from 'zustand';
import axios from '../lib/axios';

export const useBroadcastStore = create((set) => ({
  broadcasts: [],
  fetchBroadcasts: async () => {
    const res = await axios.get('/broadcasts');
    set({ broadcasts: res.data });
  }
}));
