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
    if (!path) return null;

    const cleanPath = String(path)
      .replace(/^[\\/]+/, '')
      .replace(/\\/g, '/')
      .replace(/^uploads\//, '');

    const baseUrl = 'http://localhost:5000';
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full relative border border-gray-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
        >
          <X />
        </button>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          {title || "Untitled"}
        </h3>

        {/* Info */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 font-medium">Send To:</p>
            <p className="text-gray-700">{formatList(sendTo)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Audience:</p>
            <p className="text-gray-700">{formatList(audience)}</p>
          </div>
          {category && (
            <div>
              <p className="text-sm text-gray-500 font-medium">Category:</p>
              <p className="text-gray-700">{category}</p>
            </div>
          )}
        </div>

        {/* Thumbnail */}
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt="Thumbnail"
            className="w-full max-h-48 object-cover rounded-xl mb-4 border border-gray-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder-thumbnail.jpg";
              e.target.className =
                "w-full h-48 bg-gray-100 object-contain p-4 rounded-xl mb-4";
            }}
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center mb-4 rounded-xl">
            <span className="text-gray-400">No thumbnail available</span>
          </div>
        )}

        {/* Content */}
        {content && (
          <div className="text-gray-700 whitespace-pre-wrap mb-4 text-sm border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-60 overflow-y-auto">
            {Array.isArray(content) ? content.join('\n') : content}
          </div>
        )}

        {/* File Link */}
        {fileUrl ? (
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="block w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-600 text-white text-center rounded-xl transition-all duration-200"
          >
            Download Draft File
          </a>
        ) : (
          <div className="text-red-500 italic text-center py-2">
            Draft file not available.
          </div>
        )}
      </div>
    </div>
  );
};

export default DraftPreview;

