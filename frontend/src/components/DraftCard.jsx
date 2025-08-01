import { Eye, Trash2, PencilLine, Upload } from "lucide-react";
import { useDraftStore } from "../stores/useDraftsStore";
import { useState } from "react";

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

const DraftCard = ({ draft, onPreview, onEdit }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const { deleteDraft, publishDraft, loading } = useDraftStore();

  const thumbnailUrl = getFileUrl(draft.thumbnailPath);

  const handlePublish = async () => {
    try {
      await publishDraft(draft._id);
    } catch (error) {
      console.error("Publish failed:", error);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/50 p-6 mb-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-start gap-6">
        {/* Left: Thumbnail + text */}
        <div className="flex gap-6 items-start">
          {/* Thumbnail */}
          <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-gradient-to-br from-gray-100 to-indigo-50 overflow-hidden shadow-inner">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt="Thumbnail"
                className="w-full h-full object-cover"
                onError={() => setThumbnailError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{draft.title}</h3>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-700">To:</span> {formatList(draft.sendTo)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-700">Audience:</span> {formatList(draft.audience)}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onPreview(draft)}
            className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors duration-300"
            title="Preview"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-600 transition-colors duration-300"
            title="Edit"
          >
            <PencilLine className="w-5 h-5" />
          </button>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors duration-300 disabled:opacity-50"
            title="Publish"
          >
            <Upload className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={loading}
            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors duration-300 disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200/50 text-center max-w-sm w-full">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Draft</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-medium">{draft.title}</span>?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={async () => {
                  await deleteDraft(draft._id);
                  setShowConfirm(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowConfirm(false)}
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
