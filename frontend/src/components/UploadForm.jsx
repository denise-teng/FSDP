import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader, PlusCircle, Save, Upload } from "lucide-react";
import { useNewsletterStore } from "../stores/useNewsletterStore";
import axios from '../lib/axios';
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import UpdateHomepageModal from './UpdateHomepageModal';
import UploadCard from "./UploadCard";
import { useDraftStore } from "../stores/useDraftsStore";

const sendToOptions = ["Email", "WhatsApp", "SMS"];
const audienceSegments = ["Young Adults", "Professionals", "Retirees", "Students"];
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB


const UploadForm = ({ editMode = false, newsletterId = null, isDraft = false }) => {
  const navigate = useNavigate();
  const { createNewsletter, updateNewsletter, loading } = useNewsletterStore();
  const [errors, setErrors] = useState({});
  const [newNewsletter, setNewNewsletter] = useState(null);
  const [previewNewsletter, setPreviewNewsletter] = useState(null);
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const { fetchDrafts } = useDraftStore();

  const [form, setForm] = useState({
    title: "",
    tags: "",
    sendTo: [],
    audience: [],
    category: "Financial Planning", // Default or empty string
    content: "",                   // Required field
    newsletterFile: null,
    thumbnail: null,
  });

  const [existingFile, setExistingFile] = useState(null);
  const [existingThumbnail, setExistingThumbnail] = useState(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

useEffect(() => {
  console.log('Edit Mode:', editMode);
  console.log('Newsletter ID:', newsletterId);

  const abortController = new AbortController();
  const { signal } = abortController;

  const fetchNewsletter = async () => {
    if (!editMode || !newsletterId) return;

    try {
      const res = await axios.get(
        isDraft ? `/drafts/${newsletterId}` : `/newsletters/${newsletterId}`,
        { signal }
      );

      if (!res?.data) throw new Error('Invalid newsletter data');
      const data = res.data;

      const getFileUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        
        const cleanedPath = path
          .replace(/^[\\/]+/, '')
          .replace(/\\/g, '/');
        
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        return `${baseUrl}/${cleanedPath}`;
      };

      const newsletterFileUrl = getFileUrl(data.newsletterFilePath);
      const thumbnailUrl = getFileUrl(data.thumbnailPath);

      setForm({
        title: data.title || "",
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : data.tags || "",
        sendTo: Array.isArray(data.sendTo) ? data.sendTo : [],
        audience: Array.isArray(data.audience) ? data.audience : [],
        category: data.category || "Financial Planning",
        content: Array.isArray(data.content) ? data.content.join('\n') : data.content || "",
        newsletterFile: null,
        thumbnail: null
      });

      setExistingFile(newsletterFileUrl);
      setExistingThumbnail(thumbnailUrl);
      setSelectedThumbnail(thumbnailUrl);

      setPreviewNewsletter({
        _id: data._id,
        title: data.title,
        tags: data.tags,
        thumbnailUrl: thumbnailUrl,
        fileUrl: newsletterFileUrl,
        thumbnailPath: data.thumbnailPath,
        newsletterFilePath: data.newsletterFilePath
      });

    } catch (err) {
      if (!axios.isCancel(err)) {
        toast.error("Failed to load newsletter for editing");
        console.error("Fetch error:", err);
      }
    }
  };

  fetchNewsletter();

  return () => {
    abortController.abort();
  };
}, [editMode, newsletterId, isDraft]); 

    const handleChange = (e) => {
      const { name, value } = e.target;
      setForm({ ...form, [name]: value });
      setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleCheckboxChange = (segment) => {
      setForm((prev) => ({
        ...prev,
        audience: prev.audience.includes(segment)
          ? prev.audience.filter((s) => s !== segment)
          : [...prev.audience, segment],
      }));
      setErrors(prev => ({ ...prev, audience: null }));
    };

    const validateFile = (file, field) => {
      if (field === 'newsletterFile' && !ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error('Invalid file type. Please upload PDF or DOCX');
        return false;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        return false;
      }

      return true;
    };

    const handleFileChange = (e, field) => {
      const file = e.target.files[0];
      if (file) {
        if (!validateFile(file, field)) {
          e.target.value = '';
          return;
        }
        setForm({ ...form, [field]: file });
        setErrors(prev => ({ ...prev, [field]: null }));
      }
    };

    const handleSendToChange = (channel) => {
      setForm((prev) => {
        const updatedSendTo = prev.sendTo.includes(channel)
          ? prev.sendTo.filter((c) => c !== channel)
          : [...prev.sendTo, channel];
        const cleanedSendTo = updatedSendTo.filter(value => value);
        return {
          ...prev,
          sendTo: cleanedSendTo,
        };
      });
      setErrors(prev => ({ ...prev, sendTo: null }));
    };

    const validateForm = () => {
      const newErrors = {};

      if (!form.title.trim()) {
        newErrors.title = "Title is required";
      } else if (form.title.length > 100) {
        newErrors.title = "Title cannot exceed 100 characters";
      }

      if (!form.tags.trim()) {
        newErrors.tags = "Tags are required";
      }

      const cleanedSendTo = form.sendTo.filter(item => item);
      if (cleanedSendTo.length === 0) {
        newErrors.sendTo = "Please select at least one channel";
      }

      if (form.audience.length === 0) {
        newErrors.audience = "Please select at least one audience segment";
      }

      if (!editMode && !form.newsletterFile) {
        newErrors.newsletterFile = "Newsletter file is required";
      }

      if (form.sendTo.includes("Homepage") && !selectedThumbnail && !form.thumbnail) {
        newErrors.thumbnail = "Thumbnail is required for homepage newsletters";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
      setForm({
        title: "",
        tags: "",
        sendTo: [],
        audience: [],
        newsletterFile: null,
        thumbnail: null,
      });
      setExistingFile(null);
      setExistingThumbnail(null);
      setSelectedThumbnail(null);
      setNewNewsletter(null);
      setPreviewNewsletter(null);
      setErrors({});

      if (fileInputRef.current) fileInputRef.current.value = "";
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    };

    const handleCloseModal = () => {
      setIsModalOpen(false);
      resetForm();
    };

    const handleCustomThumbnailChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const thumbnailUrl = URL.createObjectURL(file);
        setSelectedThumbnail(thumbnailUrl);
        setForm(prev => ({ ...prev, thumbnail: file }));
        setErrors(prev => ({ ...prev, thumbnail: null }));
      }
    };

    const handleThumbnailSelect = (thumbnail) => {
      setSelectedThumbnail(thumbnail);
      setForm(prev => ({ ...prev, thumbnail: null })); // Reset file upload if selecting a preset
      setErrors(prev => ({ ...prev, thumbnail: null }));
    };

    const handleSaveDraft = async () => {
      if (editMode && !newsletterId) {
        toast.error("Missing newsletter ID for draft update");
        return;
      }

      try {
        // 1. Set loading state
        useDraftStore.getState().loading = true;

        // 2. Construct FormData
        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("category", form.category);
        formData.append("tags", JSON.stringify(form.tags.split(',').map(tag => tag.trim())));
        formData.append("content", JSON.stringify(form.content.split('\n').filter(line => line.trim())));
        formData.append("sendTo", JSON.stringify(form.sendTo));
        formData.append("audience", JSON.stringify(form.audience));
        formData.append("status", "draft");
        formData.append("type", "newsletter");
        if (form.newsletterFile) formData.append("newsletterFile", form.newsletterFile);
        if (form.thumbnail) formData.append("thumbnail", form.thumbnail);

        // 3. Execute update
        const { data } = await axios.put(`/drafts/${newsletterId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // 4. Refresh draft list
        await useDraftStore.getState().fetchDrafts();

        // 5. Show success and redirect
        toast.success(`Draft "${data.title}" updated successfully!`);
        navigate(`/drafts/${newsletterId}`);
      } catch (err) {
        console.error("Draft save error:", err);
        toast.error(err.response?.data?.message || "Failed to save draft");
      } finally {
        useDraftStore.getState().loading = false;
      }
    };




    const handleSaveToDrafts = async () => {
      try {
        // 1. Set loading state
        useDraftStore.getState().loading = true;

        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("category", form.category);
        formData.append("tags", JSON.stringify(form.tags.split(',').map(tag => tag.trim())));
        formData.append("content", JSON.stringify(form.content.split('\n').filter(line => line.trim())));
        formData.append('sendTo', JSON.stringify(form.sendTo));
        formData.append('audience', JSON.stringify(form.audience));
        formData.append("status", "draft");
        formData.append("type", "newsletter");
        if (form.newsletterFile) formData.append('newsletterFile', form.newsletterFile);
        if (form.thumbnail) formData.append('thumbnail', form.thumbnail);

        // 2. Execute the save operation
        const { data: newDraft } = await axios.post('/drafts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // 3. Update state by fetching fresh drafts list
        await useDraftStore.getState().fetchDrafts();

        // 4. Show success and navigate
        toast.success(`Draft "${newDraft.title}" saved successfully!`);
        navigate(`/drafts/${newDraft._id}`);

      } catch (error) {
        console.error('Error saving draft:', error);
        toast.error(error.response?.data?.error || 'Failed to save draft');
      } finally {
        // 5. Reset loading state
        useDraftStore.getState().loading = false;
      }
    };


    const handlePublish = async () => {
      try {
        console.log('Submitting with:', {
          title: form.title,
          category: form.category,
          isDraft,
          editMode,
          newsletterId
        });

        if (!validateForm()) {
          toast.error("Please fix validation errors before publishing");
          return;
        }

        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("category", form.category);
        formData.append("status", "published");
        formData.append("type", "newsletter");
        formData.append("tags", JSON.stringify(form.tags.split(',').map(t => t.trim())));
        formData.append("sendTo", JSON.stringify(form.sendTo));
        formData.append("audience", JSON.stringify(form.audience));
        formData.append("content", JSON.stringify([form.content]));

        if (form.newsletterFile) formData.append("newsletterFile", form.newsletterFile);
        if (form.thumbnail) formData.append("thumbnail", form.thumbnail);

        let response;
        if (isDraft) {
          // Publish from draft
          response = await axios.post('/newsletters', formData);
          await axios.delete(`/drafts/${newsletterId}`);
          console.log("API Response (publishing draft):", response.data);
        } else if (editMode) {
          // Update existing
          response = await axios.put(`/newsletters/${newsletterId}`, formData);
          console.log("API Response (updating):", response.data);
        } else {
          // Create new
          response = await axios.post('/newsletters', formData);
          console.log("API Response (creating new):", response.data);
        }

        // Refresh data
        await Promise.all([
          useNewsletterStore.getState().fetchNewsletters(),
          isDraft ? useDraftStore.getState().fetchDrafts() : Promise.resolve()
        ]);

        // Navigate to uploads list instead of detail view
        navigate('/uploads');
        toast.success(
          isDraft ? "Published successfully!" :
            editMode ? "Updated successfully!" :
              "Created successfully!"
        );

      } catch (err) {
        console.error("Publish error details:", {
          error: err,
          response: err.response?.data,
        });

        const errorMessage = err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Failed to publish newsletter";

        toast.error(errorMessage);
      }
    };


    // Helper function to create FormData
    const createFormData = () => {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("tags", JSON.stringify(form.tags.split(',').map(x => x.trim())));
      form.sendTo.forEach(value => value && formData.append("sendTo", value));
      formData.append("audience", JSON.stringify(form.audience));
      formData.append("type", "newsletter");

      if (form.newsletterFile) formData.append("newsletterFile", form.newsletterFile);
      if (form.thumbnail) {
        formData.append("thumbnail", form.thumbnail);
      } else if (selectedThumbnail && !selectedThumbnail.startsWith('blob:')) {
        formData.append("thumbnailPreset", selectedThumbnail);
      }

      return formData;
    };
    return (
      <motion.div
        className="bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-2xl font-semibold mb-6 text-emerald-300">
          {editMode ? "Edit Newsletter" : "Upload Newsletter"}
        </h2>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {/* Title Field */}
          <div>
            <label className="text-gray-300 block mb-1">Title*</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className={`w-full bg-gray-700 border ${errors.title ? 'border-red-500' : 'border-gray-600'} text-white px-3 py-2 rounded`}
              required
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Tags Field */}
          <div>
            <label className="text-gray-300 block mb-1">Tags*</label>
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              className={`w-full bg-gray-700 border ${errors.tags ? 'border-red-500' : 'border-gray-600'} text-white px-3 py-2 rounded`}
              required
            />
            {errors.tags && <p className="text-red-400 text-sm mt-1">{errors.tags}</p>}
          </div>

          {/* Category Field */}
          <div>
            <label className="text-gray-300 block mb-1">Category*</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded"
              required
            >
              <option value="">Select a category</option>
              <option value="Financial Planning">Financial Planning</option>
              <option value="Insurance">Insurance</option>
              <option value="Estate Planning">Estate Planning</option>
              <option value="Tax Relief">Tax Relief</option>
            </select>
            {!form.category && <p className="text-red-400 text-sm mt-1">Please select a category</p>}
          </div>

          {/* Send To Channels */}
          <div>
            <label className="text-gray-300 block mb-1">Send To Channels*</label>
            <div className="flex flex-wrap gap-2">
              {sendToOptions.map((option) => (
                <label key={option} className="flex items-center text-gray-200">
                  <input
                    type="checkbox"
                    checked={form.sendTo.includes(option)}
                    onChange={() => handleSendToChange(option)}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
            {errors.sendTo && <p className="text-red-400 text-sm mt-1">{errors.sendTo}</p>}
          </div>

          {/* Audience Segments */}
          <div>
            <label className="text-gray-300 block mb-1">Audience Segments*</label>
            <div className="flex flex-wrap gap-2">
              {audienceSegments.map((segment) => (
                <label key={segment} className="flex items-center text-gray-200">
                  <input
                    type="checkbox"
                    checked={form.audience.includes(segment)}
                    onChange={() => handleCheckboxChange(segment)}
                    className="mr-2"
                  />
                  {segment}
                </label>
              ))}
            </div>
            {errors.audience && <p className="text-red-400 text-sm mt-1">{errors.audience}</p>}
          </div>

          {/* Thumbnail Selection */}
          <div>
            <label className="block text-gray-300 mb-1">
              Thumbnail {form.sendTo.includes("Homepage") && "*"}
            </label>
            <div className="flex gap-4 overflow-x-auto">
              {["/images/GenAI-Image01.webp", "/images/GenAI-Image02.jpg", "/images/GenAI-Image03.avif"].map((thumbnail, index) => (
                <div
                  key={index}
                  className={`relative w-32 h-32 rounded-lg border ${selectedThumbnail === thumbnail ? "border-emerald-500" : "border-gray-600"}`}
                  onClick={() => handleThumbnailSelect(thumbnail)}
                >
                  <img
                    src={thumbnail}
                    alt={`Generated Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2 text-white bg-black bg-opacity-50 p-1 rounded-full">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                </div>
              ))}

              <div className="relative w-32 h-32 border border-gray-600 rounded-lg">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleCustomThumbnailChange}  // This is where it's used
                  ref={thumbnailInputRef}
                />
                <div className="w-full h-full flex items-center justify-center bg-gray-700 rounded-lg">
                  <span className="text-white">+ Upload Custom</span>
                </div>
              </div>
            </div>
            {errors.thumbnail && <p className="text-red-400 text-sm mt-1">{errors.thumbnail}</p>}
          </div>

          <div>
            <label className="block text-gray-300 mb-1">
              Newsletter File* {!editMode && "(PDF or DOCX)"}
            </label>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => handleFileChange(e, 'newsletterFile')}
              className={`w-full text-gray-200 ${errors.newsletterFile ? 'border-red-500' : ''}`}
              ref={fileInputRef}
            />
            {errors.newsletterFile && <p className="text-red-400 text-sm mt-1">{errors.newsletterFile}</p>}
            {editMode && (
              <p className="text-sm text-gray-400 mt-2">
                {form.newsletterFile
                  ? "New file selected (will replace current file)"
                  : "Leave blank to keep the existing file unchanged"}
              </p>
            )}
          </div>

          {/* Content Field */}
          <div>
            <label className="text-gray-300 block mb-1">Content*</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded"
              required
            />
          </div>

        </form>

        <div className="flex gap-4 pt-4">
          {/* Save Button - behaves differently based on context */}
          <button
            type="button"
            onClick={isDraft ? handleSaveDraft : handleSaveToDrafts}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <Save className="h-5 w-5" />
            <span className="font-medium">
              {isDraft ? "Save Changes" : "Save to Drafts"}
            </span>
          </button>

          {/* Publish Button - always publishes */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-95 ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'}`}
          >
            <Upload className="h-5 w-5" />
            <span className="font-medium">Publish</span>
          </button>
        </div>

        {newNewsletter && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-white mb-2">Recently Uploaded Newsletter</h2>
            <UploadCard upload={newNewsletter} />
          </div>
        )}

        <UpdateHomepageModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          newNewsletter={newNewsletter || previewNewsletter}
          isLoading={loading}
        />
      </motion.div>
    );
  };

  export default UploadForm;