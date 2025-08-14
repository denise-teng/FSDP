import { X } from "lucide-react";

const UploadPreview = ({ upload, onClose }) => {
  if (!upload) return null;

  const {
    title,
    sendTo = [],
    audience = [],
    thumbnailPath,
    newsletterFilePath,
  } = upload;

  const getFileUrl = (path) => {
  if (!path) {
    console.warn("No path provided");
    return null;
  }

  // Convert to string and normalize path
  const cleanPath = String(path)
    .replace(/^[\\/]+/, '') // Remove leading slashes/backslashes
    .replace(/\\/g, '/')    // Convert backslashes to forward slashes
    .trim();                // Remove any whitespace

  const baseUrl = 'http://localhost:5000';
  return `${baseUrl}/${cleanPath}`;
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

        {/* Information (Send To, Audience) */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 font-medium">Send To:</p>
            <p className="text-gray-700">{formatList(sendTo)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Audience:</p>
            <p className="text-gray-700">{formatList(audience)}</p>
          </div>
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
              e.target.className = "w-full h-48 bg-gray-100 object-contain p-4 rounded-xl mb-4";
            }}
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center mb-4 rounded-xl">
            <span className="text-gray-400">No thumbnail available</span>
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
            Download Newsletter
          </a>
        ) : (
          <div className="text-red-500 italic text-center py-2">
            Newsletter file not available.
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPreview;

