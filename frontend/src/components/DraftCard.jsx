import { Eye, Trash2, PencilLine, Upload } from "lucide-react";
import { useDraftStore } from "../stores/useDraftsStore";
import { useState } from "react"; // Make sure this import is at the top

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

  // Force the URL to use port 5000
  const baseUrl = "http://localhost:5000"; // Hardcoded to 5000

  return `${baseUrl}/uploads/${cleanPath}`;
};

const DraftCard = ({ draft, onPreview, onEdit }) => {
  console.log(draft); 
  const [showConfirm, setShowConfirm] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const { deleteDraft, publishDraft, loading } = useDraftStore();

  const thumbnailUrl = getFileUrl(draft.thumbnailPath); // Get the file URL for the thumbnail

  return (
    <div className="bg-gray-700 p-4 rounded-lg shadow-md mb-4 flex justify-between items-start">
      {/* Left: Thumbnail + text */}
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="w-20 h-20 flex-shrink-0 rounded bg-gray-600 overflow-hidden">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt="Thumbnail"
              className="w-full h-full object-cover"
              onError={() => setThumbnailError(true)} // Handle image error
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">
              No Image
            </div>
          )}
        </div>

        {/* Text Content */}
        <div>
          <h3 className="text-lg font-semibold text-emerald-300">{draft.title}</h3>
          <p className="text-sm text-gray-400">To: {formatList(draft.sendTo)}</p>
          <p className="text-sm text-gray-400">Audience: {formatList(draft.audience)}</p>
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex gap-2">
        <button onClick={() => onPreview(draft)} title="Preview">
          <Eye className="w-5 h-5 text-blue-400 hover:text-blue-600" />
        </button>
        <button onClick={onEdit} title="Edit">
          <PencilLine className="w-5 h-5 text-yellow-400 hover:text-yellow-600" />
        </button>
        <button
          onClick={() => publishDraft(draft._id)}
          disabled={loading}
          title="Publish"
          className="disabled:opacity-50"
        >
          <Upload className="w-5 h-5 text-green-400 hover:text-green-600" />
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          title="Delete"
          className="disabled:opacity-50"
        >
          <Trash2 className="w-5 h-5 text-red-400 hover:text-red-600" />
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
            <p className="mb-4">
              Are you sure you want to delete <strong>{draft.title}</strong>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={async () => {
                  await deleteDraft(draft._id);
                  setShowConfirm(false);
                }}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
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
