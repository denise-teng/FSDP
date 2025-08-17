import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader, PlusCircle, Save, Upload, Sparkles, FileText, X } from "lucide-react";
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


const UploadForm = ({ editMode = false, newsletterId = null, isDraft = false, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const { createNewsletter, updateNewsletter, loading } = useNewsletterStore();
  const [errors, setErrors] = useState({});
  const [newNewsletter, setNewNewsletter] = useState(null);
  const [previewNewsletter, setPreviewNewsletter] = useState(null);
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const { fetchDrafts } = useDraftStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);


  const refreshCurrentView = (nextRoute) => {
    // clear volatile UI bits so inputs look fresh
    setUploadedFileName("");
    setThumbnailPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";

    if (nextRoute) {
      // move to the route that represents the current context, then remount
      navigate(nextRoute, { replace: true });
      // ensure remount after navigation
      setTimeout(() => setRefreshTick(t => t + 1), 0);
    } else {
      // just refetch/remount in place
      setRefreshTick(t => t + 1);
    }
  };


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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cardVariants = {
    hidden: { opacity: 0, y: 16, filter: "blur(2px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.45, ease: "easeOut" }
    },
  };

  const staggerContainer = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.06, delayChildren: 0.08 }
    }
  };

  const fieldVariant = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
  };


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

        // Accept both shapes: { success, data } or raw object
        const payload = res?.data;
        const data = payload?.data ?? payload;
        if (!data) throw new Error('Invalid response shape');

        // Helper to get absolute URL for stored files
        const getFileUrl = (p) => {
          if (!p) return null;
          if (p.startsWith('http')) return p;
          const cleaned = p.replace(/^[\\/]+/, '').replace(/\\/g, '/');
          const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
          return `${baseUrl}/${cleaned}`;
        };

        const newsletterFileUrl = getFileUrl(data.newsletterFilePath);
        const thumbnailUrl = getFileUrl(data.thumbnailPath);

        // Normalize all fields for the form
        const toCSV = (arrOrStr) => {
          if (Array.isArray(arrOrStr)) return arrOrStr.join(', ');
          if (typeof arrOrStr === 'string') return arrOrStr;
          return '';
        };
        const toArray = (v) => Array.isArray(v) ? v : (typeof v === 'string'
          ? (v.trim() ? v.split(',').map(x => x.trim()).filter(Boolean) : [])
          : (v ? [v] : []));

        setForm({
          title: data.title || "",
          tags: toCSV(data.tags || []),
          sendTo: toArray(data.sendTo || []),
          audience: toArray(data.audience || []),
          category: data.category || "Financial Planning",
          content: Array.isArray(data.content) ? data.content.join('\n') : (data.content || ""),
          newsletterFile: null,  // keep null so "Change file" works
          thumbnail: null
        });

        setExistingFile(newsletterFileUrl);
        setExistingThumbnail(thumbnailUrl);

        setPreviewNewsletter({
          _id: data._id,
          title: data.title,
          tags: data.tags,
          thumbnailUrl,
          fileUrl: newsletterFileUrl,
          thumbnailPath: data.thumbnailPath,
          newsletterFilePath: data.newsletterFilePath
        });
      } catch (err) {
        if (!axios.isCancel(err)) {
          toast.error("Failed to load item for editing");
          console.error("Fetch error:", err);
        }
      }
    };


    fetchNewsletter();

    return () => {
      abortController.abort();
    };
  }, [editMode, newsletterId, isDraft, refreshTick]);

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

      // Set the uploaded file name
      if (field === 'newsletterFile') {
        setUploadedFileName(file.name);
      }
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

    if (form.sendTo.includes("Homepage") && !form.thumbnail && !existingThumbnail) {
      newErrors.thumbnail = "Thumbnail is required for homepage newsletters";
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    // Don't reset if we're in edit mode
    if (editMode) return;

    setForm({
      title: "",
      tags: "",
      sendTo: [],
      audience: [],
      category: "Financial Planning",
      content: "",
      newsletterFile: null,
      thumbnail: null,
    });
    setExistingFile(null);
    setExistingThumbnail(null);
    setThumbnailPreview(null);
    setUploadedFileName("");
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

  // add near top: a ref to track/revoke old object urls
  const lastThumbUrlRef = useRef(null);

  const handleCustomThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      e.target.value = "";
      return;
    }

    const url = URL.createObjectURL(file);

    // revoke previous object URL to avoid leaks
    if (lastThumbUrlRef.current) URL.revokeObjectURL(lastThumbUrlRef.current);
    lastThumbUrlRef.current = url;

    setThumbnailPreview(url);
    setForm((prev) => ({ ...prev, thumbnail: file }));
    setErrors((prev) => ({ ...prev, thumbnail: null }));
  };


  const handleSaveDraft = async () => {
    if (editMode && !newsletterId) {
      toast.error("Missing newsletter ID for draft update");
      return;
    }
    try {
      useDraftStore.getState().loading = true;

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

      await axios.put(`/drafts/${newsletterId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await useDraftStore.getState().fetchDrafts();
      toast.success("Draft updated successfully!");

       // ✅ close popup & go back to Drafts page
       onSuccess?.();
    } catch (err) {
      console.error("Draft save error:", err);
      toast.error(err.response?.data?.message || "Failed to save draft");
    } finally {
      useDraftStore.getState().loading = false;
    }
  };



  const handleSaveToDrafts = async () => {
    try {
      useDraftStore.getState().loading = true;

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

      await axios.post('/drafts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await useDraftStore.getState().fetchDrafts();
      toast.success("Draft saved successfully!");

      // clear the form + refresh the upload page
      resetForm();
      refreshCurrentView();     // stay on upload; remount form
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error(error.response?.data?.error || 'Failed to save draft');
    } finally {
      useDraftStore.getState().loading = false;
    }
  };



  const handlePublish = async () => {
    setShowOverlay(true);
    if (!validateForm()) {
      toast.error("Please fix validation errors before publishing");
      setShowOverlay(false);
      return;
    }
    try {
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
      if (form.sendTo.includes("Email")) {
        setIsSending(true);
        try {
          await axios.post(`/newsletters/${response.data._id}/send`);
          toast.success("Newsletter sent to subscribers!");
        } catch (sendError) {
          console.error("Sending failed but newsletter was published", sendError);
          toast.error("Published but failed to send to subscribers");
        } finally {
          setIsSending(false);
        }
      }

      await Promise.all([
        useNewsletterStore.getState().fetchNewsletters(),
        isDraft ? useDraftStore.getState().fetchDrafts() : Promise.resolve()
      ]);

      // refresh current context
      if (isDraft) {
        // you were on /drafts/:id, now promote to newsletter and refresh on edit-newsletter page
        refreshCurrentView(`/edit-newsletter/${response.data._id}`);
      } else if (editMode) {
        // you were editing a newsletter -> stay and refresh
        refreshCurrentView(); // same route
      } else {
        // you were on upload page -> clear and refresh upload
        resetForm();
        refreshCurrentView(); // same route
      }

      toast.success(
        isDraft ? "Published successfully!" :
          editMode ? "Updated successfully!" : "Created successfully!"
      );

      onSuccess?.();

    } catch (err) {
      console.error("Publish error:", err);
      toast.error(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to publish newsletter"
      );
    } finally {
      setShowOverlay(false);
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
    if (form.thumbnail) formData.append("thumbnail", form.thumbnail);
    return formData;
  };


  // Update the generateContent function in UploadForm component
  const generateContent = async () => {
    if (!form.title.trim() && !form.newsletterFile) {
      toast.error("Please enter a title or upload a file first");
      return;
    }



    try {
      setShowOverlay(true);
      setIsGenerating(true);
      toast.loading("Analyzing content and generating newsletter...");

      let base64File = null;
      if (form.newsletterFile) {
        const fileBuffer = await form.newsletterFile.arrayBuffer();
        base64File = btoa(
          new Uint8Array(fileBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
      }


      const response = await axios.post('/content/generate-content', {
        title: form.title,
        tags: form.tags,
        category: form.category,
        audience: form.audience,
        fileName: form.newsletterFile?.name,
        fileData: base64File
      });


      if (!response.data?.content) {
        throw new Error('Invalid response format from server');
      }

      setForm(prev => ({
        ...prev,
        content: response.data.content
      }));

      toast.dismiss();
      toast.success(response.data.documentUsed
        ? "Content generated from your document!"
        : "Content generated based on your title!");
    } catch (error) {
      console.error("Content generation failed:", {
        error: error.response?.data || error.message,
        config: error.config
      });
      toast.dismiss();
      toast.error(error.response?.data?.error || "Failed to generate content");
    } finally {
      setIsGenerating(false);
      setShowOverlay(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Subtle full-screen overlay while saving/generating/sending */}
        <motion.div
          initial={false}
          animate={showOverlay ? { opacity: 1, pointerEvents: "auto" } : { opacity: 0, pointerEvents: "none" }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl px-6 py-5 flex items-center gap-3"
          >
            <Loader className="h-5 w-5 animate-spin" />
            <span className="font-medium text-gray-700">Working…</span>
          </motion.div>
        </motion.div>

        <motion.div
          key={editMode ? `${isDraft ? 'draft' : 'news'}-${newsletterId}-${refreshTick}`
            : `create-${refreshTick}`}
          className="bg-white/90 rounded-2xl shadow-xl border border-gray-100/50 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Title Field */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Title*</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className={`w-full bg-gray-50 border ${errors.title ? 'border-red-500' : 'border-gray-300'} text-gray-800 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                required
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Tags Field */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Tags*</label>
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                className={`w-full bg-gray-50 border ${errors.tags ? 'border-red-500' : 'border-gray-300'} text-gray-800 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                required
              />
              {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
            </div>

            {/* Category Field */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Category*</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-300 text-gray-800 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select a category</option>
                <option value="Financial Planning">Financial Planning</option>
                <option value="Insurance">Insurance</option>
                <option value="Estate Planning">Estate Planning</option>
                <option value="Tax Relief">Tax Relief</option>
              </select>
              {!form.category && <p className="text-red-500 text-sm mt-1">Please select a category</p>}
            </div>

            {/* Send To Channels */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Send To Channels*</label>
              <div className="flex flex-wrap gap-3">
                {sendToOptions.map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={form.sendTo.includes(option)}
                      onChange={() => handleSendToChange(option)}
                      className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              {errors.sendTo && <p className="text-red-500 text-sm mt-1">{errors.sendTo}</p>}
            </div>

            {/* Audience Segments */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Audience Segments*</label>
              <div className="flex flex-wrap gap-3">
                {audienceSegments.map((segment) => (
                  <label key={segment} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={form.audience.includes(segment)}
                      onChange={() => handleCheckboxChange(segment)}
                      className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700">{segment}</span>
                  </label>
                ))}
              </div>
              {errors.audience && <p className="text-red-500 text-sm mt-1">{errors.audience}</p>}
            </div>

            {/* Thumbnail + Newsletter in one responsive row */}
            <motion.div
              variants={fieldVariant}
              className="flex flex-col md:flex-row gap-6 items-start"
            >
              {/* Left: Thumbnail (same dashed wrapper as newsletter) */}
              <div className="w-40">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Thumbnail {form.sendTo.includes("Homepage") && "*"}
                </label>

                <label
                  className="block"
                  title={(thumbnailPreview || existingThumbnail) ? "Change thumbnail" : "Upload thumbnail"}
                >
                  {/* 👇 EXACT same shell as newsletter: dashed, rounded, padded */}
                  <div
                    className={`mt-1 flex items-center justify-center px-6
                  w-40 h-36 border-2 border-dashed rounded-xl
                  ${errors.thumbnail ? 'border-red-500' : 'border-gray-300 hover:border-indigo-400'}
                  transition-colors relative`}
                  >
                    <input
                      id="thumbnail-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCustomThumbnailChange}
                      ref={thumbnailInputRef}
                    />

                    {(thumbnailPreview || existingThumbnail) ? (
                      <>
                        {/* Inner clip so the image doesn't cover the dashed border */}
                        <div className="absolute inset-1 rounded-lg overflow-hidden">
                          <img
                            src={thumbnailPreview || existingThumbnail}
                            alt="Thumbnail"
                            className="w-full h-full object-cover pointer-events-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.preventDefault();
                            if (lastThumbUrlRef.current) URL.revokeObjectURL(lastThumbUrlRef.current);
                            lastThumbUrlRef.current = null;
                            setThumbnailPreview(null);
                            setForm(prev => ({ ...prev, thumbnail: null }));
                            if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
                          }}
                          className="absolute top-2 right-2 bg-white/85 hover:bg-white p-1 rounded-full shadow"
                          title="Remove thumbnail"
                        >
                          <X className="w-4 h-4 text-gray-700" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center text-gray-500 hover:text-indigo-600 select-none">
                        <PlusCircle className="mx-auto w-8 h-8 mb-2" />
                        <span className="text-sm">Upload Thumbnail</span>
                        <p className="text-[11px] mt-1 opacity-70">PNG/JPG</p>
                      </div>
                    )}
                  </div>
                </label>

                {errors.thumbnail && <p className="text-red-500 text-sm mt-1">{errors.thumbnail}</p>}
              </div>



              {/* Right: Newsletter File Upload (fills remaining width) */}
              <div className="flex-1 w-full">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Newsletter File* {!editMode && "(PDF or DOCX)"}
                </label>
                <label className="block">
                  <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed ${errors.newsletterFile ? 'border-red-500' : 'border-gray-300'} rounded-xl hover:border-indigo-400 transition-colors`}>
                    <div className="space-y-1 text-center">
                      {uploadedFileName || existingFile ? (
                        <div className="text-center">
                          <FileText className="mx-auto h-12 w-12 text-indigo-500" />
                          <p className="mt-2 text-sm text-gray-900">
                            {uploadedFileName || (existingFile && "Current file: " + existingFile.split('/').pop())}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedFileName("");
                              setForm(prev => ({ ...prev, newsletterFile: null }));
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                          >
                            Change file
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                            >
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                type="file"
                                accept=".pdf,.docx"
                                onChange={(e) => handleFileChange(e, 'newsletterFile')}
                                className="sr-only"
                                ref={fileInputRef}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PDF or DOCX up to 10MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </label>
                {errors.newsletterFile && <p className="text-red-500 text-sm mt-1">{errors.newsletterFile}</p>}
                {editMode && (
                  <p className="text-sm text-gray-500 mt-2">
                    {form.newsletterFile
                      ? "New file selected (will replace current file)"
                      : "Leave blank to keep the existing file unchanged"}
                  </p>
                )}
              </div>
            </motion.div>


            {/* Content Field with Auto-Generate Button */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-700 text-sm font-medium">Content*</label>
                <button
                  type="button"
                  onClick={generateContent}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 text-sm ${isGenerating
                    ? 'bg-gray-200 cursor-not-allowed'
                    : 'bg-indigo-100 hover:bg-indigo-200'
                    } text-indigo-700 px-3 py-1 rounded-lg transition-colors`}
                >
                  {isGenerating ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isGenerating ? "Generating..." : "Auto-generate"}
                </button>
              </div>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={6}
                className="w-full bg-gray-50 border border-gray-300 text-gray-800 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Write your content or click 'Auto-generate'..."
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              {/* Save Button */}
              <button
                type="button"
                onClick={isDraft ? handleSaveDraft : handleSaveToDrafts}
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-95 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'}`}
              >
                <Save className="h-5 w-5" />
                <span className="font-medium">
                  {isDraft ? "Save Changes" : "Save to Drafts"}
                </span>
              </button>

              {/* Publish Button */}
              <button
                type="button"
                onClick={handlePublish}
                disabled={loading || isSending}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-95 ${loading || isSending ? 'bg-gray-400 cursor-not-allowed' :
                  'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
                  }`}
              >
                {isSending ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Upload className="h-5 w-5" />
                )}
                <span className="font-medium">
                  {isSending ? "Sending..." : "Publish"}
                </span>
              </button>
            </div>
          </form>

          {newNewsletter && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recently Uploaded Newsletter</h2>
              <UploadCard upload={newNewsletter} />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UploadForm;