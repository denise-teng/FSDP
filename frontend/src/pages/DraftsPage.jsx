import { useState, useEffect, useCallback } from 'react';
import DraftList from "../components/DraftList";
import DeletedList from "../components/DeletedList";
import ErrorBoundary from '../components/ErrorBoundary';
import { useDraftStore } from '../stores/useDraftsStore';
import UploadForm from '../components/UploadForm';

const DraftsPage = () => {
  const {
    drafts,
    deletedDrafts,
    fetchDrafts,
    fetchDeletedDrafts,
    loading,
    error
  } = useDraftStore();
  const [activeTab, setActiveTab] = useState('drafts');
  const [editingDraft, setEditingDraft] = useState(null);

  const fetchData = useCallback(async () => {
    if (activeTab === 'drafts') {
      await fetchDrafts();
    } else {
      await fetchDeletedDrafts();
    }
  }, [activeTab, fetchDrafts, fetchDeletedDrafts]);

  const handleEditDraft = (draft) => {
    setEditingDraft(draft);
  };

  const handleCancelEdit = () => {
    setEditingDraft(null);
  };

  const handleSaveSuccess = () => {
    setEditingDraft(null);
    fetchData();
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) await fetchData();
    };
    loadData();
    return () => { isMounted = false };
  }, [fetchData]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-indigo-500 rounded-full mb-4"></div>
        <p className="text-indigo-600 font-medium">Loading drafts...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
        <div className="text-red-500 font-bold text-lg mb-2">Error</div>
        <p className="text-red-700">{error}</p>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section - Shows different headers based on edit mode */}
          {editingDraft ? (
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100/50 p-8 mb-10 overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>
              
              <div className="relative flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    ✏️ Edit Draft
                  </h2>
                  <p className="text-gray-600 text-lg">Modify your draft content and attachments</p>
                </div>
                
                <div className="relative">
                  <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                    <svg 
                      className="h-8 w-8 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                      />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse flex items-center justify-center">
                    <span className="text-xs font-bold text-white">Edit</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100/50 p-8 mb-10 overflow-hidden">
              {/* Decorative Circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>

              <div className="relative flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    📝 Draft Management
                  </h2>
                  <p className="text-gray-600 text-lg">View, edit, and publish your newsletter and message drafts with ease</p>
                </div>
                <div className="relative">
                  <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                    <svg 
                      className="h-8 w-8 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{drafts.length + deletedDrafts.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="bg-white/90 rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden">
            {/* Tabs - Only show when not editing */}
            {!editingDraft && (
              <div className="flex justify-center p-4 border-b border-gray-200 bg-gray-50">
                <div className="inline-flex rounded-xl p-1 bg-gray-100" role="group">
                  <button
                    onClick={() => setActiveTab('drafts')}
                    className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 shadow-sm flex items-center
                      ${activeTab === 'drafts'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-indigo-50'}
                    `}
                  >
                    <svg 
                      className={`w-4 h-4 mr-2 ${activeTab === 'drafts' ? 'text-white' : 'text-indigo-500'}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Active Drafts ({drafts.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('deleted')}
                    className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 shadow-sm flex items-center ml-2
                      ${activeTab === 'deleted'
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-red-50'}
                    `}
                  >
                    <svg 
                      className={`w-4 h-4 mr-2 ${activeTab === 'deleted' ? 'text-white' : 'text-red-500'}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Recently Deleted ({deletedDrafts.length})
                  </button>
                </div>
              </div>
            )}

            {/* Content Area */}
            <div className="p-6">
              {editingDraft ? (
                <UploadForm 
                  editMode={true} 
                  newsletterId={editingDraft._id} 
                  isDraft={true}
                  onSuccess={handleSaveSuccess}
                  onCancel={handleCancelEdit}
                />
              ) : activeTab === 'drafts' ? (
                <DraftList drafts={drafts} onEdit={handleEditDraft} />
              ) : (
                <DeletedList drafts={deletedDrafts} />
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default DraftsPage;