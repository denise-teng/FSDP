import { Eye, Trash2 } from "lucide-react";
import { useNewsletterStore } from "../stores/useNewsletterStore";

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

const UploadCard = ({ upload, onPreview }) => {
  const { deleteNewsletter, loading } = useNewsletterStore();
  const thumbnailUrl = getFileUrl(upload.thumbnailPath);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 flex flex-col sm:flex-row sm:items-center justify-between transition-all hover:shadow-lg">
      <div className="flex items-center gap-5 w-full">
        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt="Thumbnail"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder-thumbnail.jpg";
                e.target.className = "w-full h-full object-contain p-4 bg-gray-100";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
              No Image
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {upload.title || "Untitled"}
          </h3>
          <p className="text-sm text-gray-500 truncate">To: {formatList(upload.sendTo)}</p>
          <p className="text-sm text-gray-500 truncate">Audience: {formatList(upload.audience)}</p>
        </div>
      </div>

      <div className="flex gap-3 mt-4 sm:mt-0 sm:ml-4">
        <button
          onClick={() => onPreview(upload)}
          title="Preview"
          className="text-indigo-500 hover:text-indigo-700 transition"
        >
          <Eye className="w-5 h-5" />
        </button>
        <button
          onClick={() => deleteNewsletter(upload._id)}
          title="Delete"
          disabled={loading}
          className="text-red-400 hover:text-red-600 transition"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default UploadCard;
