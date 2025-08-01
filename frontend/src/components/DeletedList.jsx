import { useState } from 'react';
import { useDraftStore } from '../stores/useDraftsStore';
import { RotateCcw } from 'lucide-react';

const DeletedList = ({ drafts }) => {
  const { restoreDraft } = useDraftStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [restoringId, setRestoringId] = useState(null);

  const filteredDrafts = drafts.filter(draft =>
    draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (draft.content && draft.content.some(paragraph =>
      paragraph.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const handleRestore = async (id) => {
    setRestoringId(id);
    try {
      await restoreDraft(id);
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Deleted Drafts</h1>
        <div className="relative">
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
              {searchTerm ? "No deleted drafts match your search" : "No deleted drafts found"}
            </h3>
          </div>
        ) : (
          filteredDrafts.map(draft => (
            <div key={draft._id} className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{draft.title}</h3>
                  <p className="text-sm text-gray-500">
                    Deleted: {new Date(draft.deletedAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleRestore(draft._id)}
                  disabled={restoringId === draft._id}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  {restoringId === draft._id ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                  Restore
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DeletedList;
