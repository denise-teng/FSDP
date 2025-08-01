import { useState } from 'react';
import { useDraftStore } from '../stores/useDraftsStore';
import { RotateCcw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const DeletedList = ({ drafts: initialDrafts }) => {
  const { restoreDraft, permanentlyDeleteDraft } = useDraftStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState("all");
  const [restoringId, setRestoringId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [localDrafts, setLocalDrafts] = useState(initialDrafts);

  const filteredDrafts = localDrafts
    .filter(draft => filterType === "all" || draft.type === filterType)
    .filter(draft =>
      draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (draft.content && draft.content.some(paragraph =>
        paragraph.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );

  const handleRestore = async (id) => {
    setRestoringId(id);
    try {
      await restoreDraft(id);
      setLocalDrafts(localDrafts.filter(draft => draft._id !== id));
      toast.success('Draft restored successfully!');
    } catch (error) {
      toast.error('Failed to restore draft');
    } finally {
      setRestoringId(null);
    }
  };

const handlePermanentDelete = async (id) => {
    setDeletingId(id);
    try {
      await permanentlyDeleteDraft(id);
      // Use functional update to ensure we're working with latest state
      setLocalDrafts(prevDrafts => prevDrafts.filter(draft => draft._id !== id));
      toast.success('Draft permanently deleted');
      setShowDeleteConfirm(null);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (error.response?.status === 404) {
        // If draft not found, remove it from local state anyway
        setLocalDrafts(prevDrafts => prevDrafts.filter(draft => draft._id !== id));
        toast.error('Draft was already deleted');
      } else {
        toast.error('Failed to delete draft');
      }
    } finally {
      setDeletingId(null);
    }
  };


  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Deleted Drafts</h1>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search deleted drafts..."
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

      {/* Deleted Drafts List */}
      <div className="space-y-4">
        {filteredDrafts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700">
              {searchTerm || filterType !== "all" 
                ? "No deleted drafts match your criteria" 
                : "No deleted drafts found"}
            </h3>
          </div>
        ) : (
          filteredDrafts.map(draft => (
            <div key={draft._id} className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{draft.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Deleted: {new Date(draft.deletedAt).toLocaleString()}</span>
                    {draft.type && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-600">
                        {draft.type}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* Restore Button with Tooltip */}
                  <div className="relative group">
                    <button
                      onClick={() => handleRestore(draft._id)}
                      disabled={restoringId === draft._id || deletingId === draft._id}
                      className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors disabled:opacity-50"
                    >
                      {restoringId === draft._id ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <RotateCcw className="w-5 h-5" />
                      )}
                    </button>
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Restore
                    </span>
                  </div>

                  {/* Permanent Delete Button with Tooltip */}
                  <div className="relative group">
                    <button
                      onClick={() => setShowDeleteConfirm(draft._id)}
                      disabled={restoringId === draft._id || deletingId === draft._id}
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Delete Permanently
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200/50 text-center max-w-sm w-full">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Permanently Delete Draft</h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. Are you sure you want to permanently delete this draft?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => handlePermanentDelete(showDeleteConfirm)}
                disabled={deletingId === showDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {deletingId === showDeleteConfirm ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </span>
                ) : "Delete Permanently"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeletedList;