import { Eye, Trash2, PencilLine, Upload, Sparkles } from "lucide-react";
import { useDraftStore } from "../stores/useDraftsStore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from 'axios';  // Add this line at the top with other imports

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

const DraftCard = ({ draft, onPreview, onEdit, onPublishSucces, onDeleteSuccess }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { deleteDraft, publishDraft, loading } = useDraftStore();
  const navigate = useNavigate();

  const isGenerated = draft.type === 'generated';
  const thumbnailUrl = getFileUrl(draft.thumbnailPath);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const response = await axios.post(
        `/api/drafts/${draft._id}/publish`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      let successMessage = `"${draft.title}" published successfully!`;

      if (response.data.emailError) {
        successMessage += ' (Emails partially sent)';
      } else if (draft.sendTo.includes('Email')) {
        successMessage += ' Emails are being sent to subscribers!';
      }

      toast.success(successMessage);
      setShowPublishConfirm(false);

      if (onPublishSuccess) {
        onPublishSuccess(response.data);
      }
    } catch (error) {
      console.error("Publish failed:", error);
      const errorMsg = error.response?.data?.error ||
        error.message ||
        "Failed to publish draft";
      toast.error(errorMsg);
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

          {/* Edit Button */}
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

          {/* Publish Button - Hidden for generated messages */}
          {!isGenerated && (
            <div className="relative group">
              <button
                onClick={() => setShowPublishConfirm(true)}
                disabled={loading}
                className="p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors duration-300 disabled:opacity-50"
              >
                <Upload className="w-5 h-5" />
              </button>
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Publish
              </span>
            </div>
          )}

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

      {/* Publish Confirmation Modal */}
      {showPublishConfirm && !isGenerated && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200/50 text-center max-w-sm w-full">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Upload className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Publish Draft</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to publish <span className="font-medium">{draft.title}</span>?
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
                    Publishing...
                  </span>
                ) : "Publish"}
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