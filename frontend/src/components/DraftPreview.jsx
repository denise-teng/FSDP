import { X } from "lucide-react";

const DraftPreview = ({ draft, onClose }) => {
  if (!draft) return null;

  const {
    title,
    category,
    content,
    sendTo = [],
    audience = [],
    thumbnailPath,
    newsletterFilePath,
  } = draft;

  const getFileUrl = (path) => {
    if (!path) {
      console.warn("No path provided");
      return null;
    }

    // Clean the file path and prepend with the correct backend base URL
    const cleanPath = String(path)
      .replace(/^[\\/]+/, '')
      .replace(/\\/g, '/')
      .replace(/^uploads\//, '');

    // Ensure the URL points to your backend (e.g., http://localhost:5000)
    const baseUrl = 'http://localhost:5000';  // Replace with your backend URL if different

    return `${baseUrl}/uploads/${cleanPath}`;
  };

  const thumbnailUrl = getFileUrl(thumbnailPath);
  const fileUrl = getFileUrl(newsletterFilePath);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-lg w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:text-red-500 text-2xl font-bold"
        >
          <X />
        </button>

        {/* Title */}
        <h3 className="text-2xl font-semibold text-emerald-400 mb-4 text-center">{title || "Untitled"}</h3>

        {/* Information (Send To, Audience, Category) */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-300">Send To:</p>
            <p className="text-gray-200">{formatList(sendTo)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-300">Audience:</p>
            <p className="text-gray-200">{formatList(audience)}</p>
          </div>
        </div>

        {/* Category */}
        {category && <p className="text-sm text-gray-300 mb-4">Category: {category}</p>}

        {/* Thumbnail */}
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt="Thumbnail"
            className="w-full max-h-48 object-cover rounded-lg mb-4 border-4 border-gray-700"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder-thumbnail.jpg";
              e.target.className = "w-full h-48 bg-gray-700 object-contain p-4 rounded-lg mb-4";
            }}
          />
        ) : (
          <div className="w-full h-48 bg-gray-700 flex items-center justify-center mb-4 rounded-lg">
            <span className="text-gray-400">No thumbnail available</span>
          </div>
        )}

        {/* Content Section */}
        {content && (
          <div className="text-gray-200 whitespace-pre-wrap mb-4">
            {Array.isArray(content) ? content.join('\n') : content}
          </div>
        )}

        {/* File Link */}
        {fileUrl ? (
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="block w-full py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-center rounded-lg transition-all duration-200"
          >
            View Draft File
          </a>
        ) : (
          <div className="text-red-400 italic text-center py-2">
            Draft file not available.
          </div>
        )}
      </div>
    </div>
  );
};

export default DraftPreview;
