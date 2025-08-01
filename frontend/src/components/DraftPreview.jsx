import { X, Sparkles } from "lucide-react";

const DraftPreview = ({ draft, onClose }) => {
  if (!draft) return null;

  const isGenerated = draft.type === 'generated';
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
      <div className={`bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full relative border ${isGenerated ? 'border-blue-200' : 'border-gray-200'}`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
        >
          <X />
        </button>

        {/* Header for generated messages */}
        {isGenerated && (
          <div className="flex items-center justify-center mb-3">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Generated Message
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className={`text-2xl font-bold mb-4 text-center ${isGenerated ? 'text-blue-700' : 'text-gray-800'}`}>
          {title || "Untitled"}
        </h3>

        {/* Info - Hidden for generated messages */}
        {!isGenerated && (
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
        )}

        {/* Thumbnail - Different style for generated messages */}
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt="Thumbnail"
            className={`w-full max-h-48 object-cover rounded-xl mb-4 ${isGenerated ? 'border-2 border-blue-200' : 'border border-gray-300'}`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder-thumbnail.jpg";
              e.target.className = `w-full h-48 ${isGenerated ? 'bg-blue-50' : 'bg-gray-100'} object-contain p-4 rounded-xl mb-4`;
            }}
          />
        ) : (
          <div className={`w-full h-48 ${isGenerated ? 'bg-blue-50' : 'bg-gray-100'} flex items-center justify-center mb-4 rounded-xl`}>
            {isGenerated ? (
              <Sparkles className="text-blue-300 w-8 h-8" />
            ) : (
              <span className="text-gray-400">No thumbnail available</span>
            )}
          </div>
        )}

        {/* Content - Different style for generated messages */}
        {content && (
          <div className={`whitespace-pre-wrap mb-4 text-sm rounded-lg p-3 max-h-60 overflow-y-auto ${isGenerated ? 'bg-blue-50 border border-blue-200 text-blue-800' : 'bg-gray-50 border border-gray-200 text-gray-700'}`}>
            {Array.isArray(content) ? content.join('\n') : content}
          </div>
        )}

        {/* File Link - Different style for generated messages */}
        {fileUrl ? (
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className={`block w-full py-2 px-4 text-center rounded-xl transition-all duration-200 ${isGenerated ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'}`}
          >
            {isGenerated ? 'Download Message' : 'Download Draft File'}
          </a>
        ) : (
          <div className={`text-center py-2 ${isGenerated ? 'text-blue-500' : 'text-red-500'} italic`}>
            {isGenerated ? 'No file attached' : 'Draft file not available.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default DraftPreview;