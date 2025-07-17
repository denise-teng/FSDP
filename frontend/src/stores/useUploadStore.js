import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";

export const useUploadStore = create((set) => ({
    uploads: [],
    loading: false,

    setUploads: (uploads) => set({ uploads }),

    createUpload: async (formData) => {
        set({ loading: true });
        try {
            const res = await axios.post("/newsletters", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            set((prev) => ({
                uploads: [...prev.uploads, res.data.newsletter], // use `newsletter` from response
                loading: false
            }));
            toast.success("Newsletter uploaded!");
        } catch (error) {
            set({ loading: false });
            console.error("UPLOAD ERROR:", error);
            toast.error(
                error.response?.data?.error || "Failed to upload newsletter"
            );
        }
    },

    fetchUploads: async () => {
        set({ loading: true });
        try {
            const res = await axios.get("/newsletters");
            set({ uploads: res.data, loading: false });
        } catch (error) {
            set({ loading: false });
            toast.error("Failed to fetch uploaded newsletters");
        }
    },

    deleteUpload: async (id) => {
        set({ loading: true });
        try {
            await axios.delete(`/newsletters/${id}`);
            set((prev) => ({
                uploads: prev.uploads.filter((upload) => upload._id !== id),
                loading: false
            }));
            toast.success("Newsletter deleted!");
        } catch (error) {
            set({ loading: false });
            toast.error("Failed to delete newsletter");
        }
    }
}));
