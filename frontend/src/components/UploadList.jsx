import { useState, useEffect } from "react";
import { useNewsletterStore } from "../stores/useNewsletterStore";
import UploadCard from "./UploadCard";
import UploadPreview from "./UploadPreview";

const UploadList = () => {
  const { newsletters, fetchNewsletters } = useNewsletterStore();
  const [previewUpload, setPreviewUpload] = useState(null);

  useEffect(() => {
    fetchNewsletters();
  }, [fetchNewsletters]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Enhanced Header Section */}
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100/50 p-8 mb-8 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>

          <div className="relative">
            <h2 className="text-4xl font-bold mb-3">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                📰 Published Newsletters
              </span>
            </h2>
            <p className="text-gray-600 text-lg">Browse and preview your published newsletters</p>
          </div>
        </div>

        {/* Content Section - Single Column Layout */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-6">
          {newsletters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                <svg className="h-12 w-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No newsletters published yet</h3>
              <p className="text-gray-500 max-w-md">Once you publish newsletters, they will appear here for preview and management.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {(newsletters ?? [])
                .filter(n => n && (n._id || n.id))
                .sort((a, b) => new Date(b?.createdAt ?? 0) - new Date(a?.createdAt ?? 0))
                .map((upload) => (
                  <UploadCard
                    key={upload._id ?? upload.id}
                    upload={upload}
                    onPreview={(item) => setPreviewUpload(item)}
                  />
                ))}

            </div>
          )}
        </div>
      </div>

      {previewUpload && (
        <UploadPreview
          upload={previewUpload}
          onClose={() => setPreviewUpload(null)}
        />
      )}
    </div>
  );
};

export default UploadList;
