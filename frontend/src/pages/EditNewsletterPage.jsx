import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useCallback } from "react";
import UploadForm from "../components/UploadForm";

const EditNewsletterPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isDraft = location.pathname.includes("/edit-draft/");

  // Close and return to drafts page directly
  const handleClose = useCallback(() => {
    navigate('/drafts', { replace: true });
  }, [navigate]);

  // esc closes
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose]);

  const handleSuccess = () => {
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Light blur backdrop matching draft page */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-blue-50/80 to-indigo-100/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* modal panel */}
      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-xl border border-gray-200/70 flex flex-col overflow-hidden">
        {/* Decorative elements matching draft page */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full -translate-y-1/3 translate-x-1/3 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-1/3 -translate-x-1/3 opacity-40"></div>
        
        {/* header */}
        <div className="relative flex items-center justify-between px-8 py-5 border-b border-gray-200/50 bg-white/90">
          <div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              {isDraft ? "✏️ Edit Draft" : "📝 Edit Newsletter"}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              {isDraft ? "Modify your draft content and attachments" : "Update your newsletter content and settings"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 hover:bg-gray-100 focus:outline-none transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6 text-gray-500 hover:text-indigo-600 transition-colors"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* scrollable body */}
        <div className="flex-1 overflow-y-auto p-8">
          <UploadForm
            editMode={true}
            newsletterId={id}
            isDraft={isDraft}
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
        </div>
      </div>
    </div>
  );
};

export default EditNewsletterPage;