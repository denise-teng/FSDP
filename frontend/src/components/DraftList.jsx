import { useDraftStore } from '../stores/useDraftsStore';
import { useState, useEffect, useMemo } from 'react';
import DraftCard from './DraftCard';
import { useNavigate } from 'react-router-dom';
import DraftPreview from './DraftPreview';

const DraftList = () => {
  const { drafts, fetchDrafts } = useDraftStore();
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [previewDraft, setPreviewDraft] = useState(null);


  useEffect(() => {
    const loadDrafts = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchDrafts();
      } catch (err) {
        console.error("Failed to fetch drafts:", err);
        setError(err.message || 'Failed to load drafts');
      } finally {
        setLoading(false);
      }
    };
    loadDrafts();
  }, [fetchDrafts]);

  const filteredDrafts = useMemo(() => {
    return drafts
      .filter(draft => draft.status === "draft")
      .filter(draft => !draft.deletedAt)
      .filter(draft => filterType === "all" || draft.type === filterType)
      .filter(draft =>
        draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (draft.content && draft.content.some(paragraph =>
          paragraph.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
  }, [drafts, filterType, searchTerm]);

  const handlePublishSuccess = async () => {
    await fetchDrafts(); // Refresh the list after publishing
  };

  const handleEditDraft = (draft) => {
    navigate(`/edit-draft/${draft._id}`); // Navigate to edit page
  };

  if (error) {
    return (
      <div className="text-red-600 p-6 bg-red-50 rounded-xl text-center max-w-2xl mx-auto my-8">
        <div className="font-medium mb-3">Error loading drafts</div>
        <p className="mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Drafts</h1>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search drafts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            <option value="all">All Drafts</option>
            <option value="newsletter">Newsletters</option>
            <option value="generated">Generated Messages</option>
          </select>
        </div>
      </div>

      {/* Drafts List */}
      <div className="space-y-6">
        {filteredDrafts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700">
              {searchTerm ? "No drafts match your search" : "You don't have any drafts yet"}
            </h3>
            <p className="text-gray-500 mt-1">
              {!searchTerm && "Create your first draft to get started"}
            </p>
          </div>
        ) : (
          filteredDrafts.map((draft) => (
            <DraftCard
              key={draft._id}
              draft={draft}
              onEdit={() => handleEditDraft(draft)}
              onPreview={() => setPreviewDraft(draft)}
              onPublishSuccess={handlePublishSuccess}
              // Add this if you need to refresh the list after delete
              onDeleteSuccess={() => fetchDrafts()}
            />
          ))
        )}
      </div>

      {previewDraft && (
        <DraftPreview
          draft={previewDraft}
          onClose={() => setPreviewDraft(null)}
        />
      )}
    </div>
  );
};

export default DraftList;
