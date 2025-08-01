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
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder-thumbnail.jpg";
                  e.target.className = "w-full h-full object-contain p-4 bg-gray-100";
                }}
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
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {upload.title || "Untitled"}
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-700">To:</span> {formatList(upload.sendTo)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-700">Audience:</span> {formatList(upload.audience)}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Action Buttons with Tooltips */}
        <div className="flex gap-3">
          {/* Preview Button with Tooltip */}
          <div className="relative group">
            <button
              onClick={() => onPreview(upload)}
              className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors duration-300"
            >
              <Eye className="w-5 h-5" />
            </button>
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Preview
            </span>
          </div>

          {/* Delete Button with Tooltip */}
          <div className="relative group">
            <button
              onClick={() => deleteNewsletter(upload._id)}
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
    </div>
  );
};

export default UploadCard;