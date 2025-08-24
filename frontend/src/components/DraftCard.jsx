import { Eye, Trash2, PencilLine, Upload, Sparkles } from "lucide-react";
import { useDraftStore } from "../stores/useDraftsStore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
// import axios from 'axios';  // Add this line at the top with other imports
import axiosInstance from "../lib/axios";

const formatList = (val) => {
  if (Array.isArray(val)) return val.join(", ");
  if (typeof val === "string" && val.startsWith("[")) {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed.join(", ") : "N/A";
    } catch {
      return "N/A";
    }
  }
  return val || "N/A";
};

const getFileUrl = (path) => {
  if (!path) return null;

  const cleanPath = String(path)
    .replace(/^[\\/]+/, "")
    .replace(/\\/g, "/")
    .replace(/^uploads\//, "");

  const baseUrl = "http://localhost:5000";
  return `${baseUrl}/uploads/${cleanPath}`;
};

const DraftCard = ({ draft, onPreview, onEdit, onPublishSuccess, onDeleteSuccess }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { deleteDraft, publishDraft, sendGeneratedNow, loading } = useDraftStore();
  const navigate = useNavigate();


  const isGenerated = draft.type === 'generated';
  const thumbnailUrl = getFileUrl(draft.thumbnailPath);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      if (isGenerated) {
        const resp = await sendGeneratedNow(draft._id);

        // Enhanced success message
        toast.success(
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>
              Sent to {resp.sent} subscribers via Email
              {resp.sent < resp.total && (
                <span className="text-yellow-600"> ({resp.total - resp.sent} failed)</span>
              )}
            </span>
          </div>,
          { duration: 5000 }
        );
      } else {
        // Newsletter publishing logic
        const response = await axiosInstance.post(
          `drafts/${draft._id}/publish`,
          {},
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        let successMessage = `"${draft.title}" published successfully!`;
        if (response.data.emailError) {
          successMessage += ' (Emails partially sent)';
        } else if (draft.sendTo.includes('Email')) {
          successMessage += ' (Emails queued for delivery)';
        }

        toast.success(successMessage, {
          duration: 4000,
          icon: <Upload className="w-5 h-5 text-green-500" />
        });
      }

      setShowPublishConfirm(false);
      onPublishSuccess?.(); // Refresh draft list if needed
    } catch (error) {
      console.error("Publish failed:", error);
      const errorMsg = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to send message';

      // Enhanced error toast with retry option
      toast.error(
        (t) => (
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium">Sending failed</p>
              <p className="text-sm">{errorMsg}</p>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  handlePublish();
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
          </div>
        ),
        { duration: 8000 }
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    try {
      const success = await deleteDraft(draft._id);
      if (success) {
        toast.success(`Draft "${draft.title}" moved to trash`);
        setShowDeleteConfirm(false);
        if (onDeleteSuccess) {
          onDeleteSuccess(); // Call this to refresh the list
        }
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete draft");
    }
  };

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-md border ${isGenerated ? 'border-blue-200' : 'border-purple-200'} p-6 mb-4 hover:shadow-lg transition-shadow duration-300`}>

      {/* Header for generated messages */}
      {isGenerated && (
        <div className="flex items-center mb-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Generated
          </span>
        </div>
      )}

      <div className="flex justify-between items-start gap-6">
        {/* Left: Thumbnail + text */}
        <div className="flex gap-6 items-start">
          {/* Thumbnail - Different style for generated messages */}
          <div className={`w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden shadow-inner ${isGenerated ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : 'bg-gradient-to-br from-gray-100 to-indigo-50'}`}>
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt="Thumbnail"
                className="w-full h-full object-cover"
                onError={() => setThumbnailError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                {isGenerated ? (
                  <Sparkles className="w-8 h-8 text-blue-300" />
                ) : (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className="flex-1">
            <h3 className={`text-xl font-semibold mb-2 ${isGenerated ? 'text-blue-800' : 'text-gray-800'}`}>
              {draft.title}
            </h3>
            <div className="space-y-1">
              {!isGenerated && (
                <>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">To:</span> {formatList(draft.sendTo)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Audience:</span> {formatList(draft.audience)}
                  </p>
                </>
              )}
              {isGenerated && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {draft.content[0] || draft.content}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex gap-3">
          {/* Preview Button */}
          <div className="relative group">
            <button
              onClick={() => onPreview(draft)}
              className={`p-2 rounded-lg transition-colors duration-300 ${isGenerated ? 'bg-blue-50 hover:bg-blue-100 text-blue-600' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'}`}
            >
              <Eye className="w-5 h-5" />
            </button>
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Preview
            </span>
          </div>

          {/* Edit Button - Only for non-generated newsletters */}
          {!isGenerated && (
            <div className="relative group">
              <button
                onClick={onEdit}
                className="p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-600 transition-colors duration-300"
              >
                <PencilLine className="w-5 h-5" />
              </button>
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Edit
              </span>
            </div>
          )}


          {isGenerated && (
          <div className="relative group">
            <button
              onClick={() => setShowPublishConfirm(true)}
              disabled={isPublishing}
              className="p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors duration-300 disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
            </button>
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {isGenerated ? 'Send' : 'Publish'}
            </span>
          </div>)}


          {/* Delete Button */}
          <div className="relative group">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors duration-300 disabled:opacity-50"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Delete
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200/50 text-center max-w-sm w-full">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete {isGenerated ? 'Message' : 'Draft'}</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-medium">{draft.title}</span>?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish/Send Confirmation Modal */}
      {showPublishConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200/50 text-center max-w-sm w-full">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Upload className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {isGenerated ? 'Send Message' : 'Publish Draft'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isGenerated
                ? <>Are you sure you want to <span className="font-medium">send</span> <span className="font-medium">{draft.title}</span> to your subscribers?</>
                : <>Are you sure you want to <span className="font-medium">publish</span> <span className="font-medium">{draft.title}</span>?</>
              }
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isPublishing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isGenerated ? 'Sending...' : 'Publishing...'}
                  </span>
                ) : (isGenerated ? 'Send' : 'Publish')}
              </button>
              <button
                onClick={() => setShowPublishConfirm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftCard;