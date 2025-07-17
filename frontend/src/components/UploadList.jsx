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
    <div className="mt-6">
      <h2 className="text-xl font-bold text-white mb-4">Published Newsletters</h2>

      {newsletters.length === 0 ? (
        <p className="text-gray-400">No published newsletters yet.</p>
      ) : (
        newsletters
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((upload) => (
            <UploadCard
              key={upload._id}
              upload={upload}
              onPreview={(item) => setPreviewUpload(item)}
            />
          ))
      )}

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
