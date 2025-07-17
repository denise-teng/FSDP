import { Eye, Trash2 } from "lucide-react";
import { useNewsletterStore } from "../stores/useNewsletterStore";

// Helper function to handle and format lists
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

// Force URL to use port 5000
const getFileUrl = (path) => {
  if (!path) return null;

  const cleanPath = String(path)
    .replace(/^[\\/]+/, "")
    .replace(/\\/g, "/")
    .replace(/^uploads\//, "");

  const baseUrl = "http://localhost:5000"; // Hardcoded to 5000

  return `${baseUrl}/uploads/${cleanPath}`;
};

const UploadCard = ({ upload, onPreview }) => {
  const { deleteNewsletter, loading } = useNewsletterStore();

  // Get the thumbnail URL using the helper function
  const thumbnailUrl = getFileUrl(upload.thumbnailPath); // Corrected this line to use `thumbnailPath`

  return (
    <div className="bg-gray-700 p-4 rounded-md shadow-md mb-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Thumbnail image */}
        <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-600">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt="Thumbnail"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder-thumbnail.jpg"; // Fallback image
                e.target.className = "w-full h-full object-contain p-4 bg-gray-700"; // Style for fallback
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">
              No Image
            </div>
          )}
        </div>

        {/* Title, SendTo, Audience */}
        <div>
          <h3 className="text-lg text-emerald-300 font-semibold">
            {upload.title || "Untitled"}
          </h3>
          <p className="text-sm text-gray-400">To: {formatList(upload.sendTo)}</p>
          <p className="text-sm text-gray-400">Audience: {formatList(upload.audience)}</p>
        </div>
      </div>

      {/* Preview & Delete actions */}
      <div className="flex gap-3">
        <button onClick={() => onPreview(upload)} title="Preview">
          <Eye className="w-5 h-5 text-blue-400 hover:text-blue-600" />
        </button>
        <button
          onClick={() => deleteNewsletter(upload._id)}
          title="Delete"
          disabled={loading}
        >
          <Trash2 className="w-5 h-5 text-red-400 hover:text-red-600" />
        </button>
      </div>
    </div>
  );
};

export default UploadCard;
