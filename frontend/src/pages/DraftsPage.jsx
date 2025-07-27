import { useState, useEffect, useCallback } from 'react'; // Import useEffect
import DraftList from "../components/DraftList";
import DeletedList from "../components/DeletedList";
import ErrorBoundary from '../components/ErrorBoundary';
import { useDraftStore } from '../stores/useDraftsStore';

const DraftPage = () => {
  const {
    drafts,
    deletedDrafts,
    fetchDrafts,
    fetchDeletedDrafts,
    loading,
    error
  } = useDraftStore();
  const [activeTab, setActiveTab] = useState('drafts'); // 'drafts' or 'deleted'

const fetchData = useCallback(async () => {
    if (activeTab === 'drafts') {
      await fetchDrafts();
    } else {
      await fetchDeletedDrafts();
    }
  }, [activeTab, fetchDrafts, fetchDeletedDrafts]);

  // Controlled useEffect with cleanup
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await fetchData();
      }
    };

    loadData();
    return () => {
      isMounted = false; // Cleanup to prevent state updates after unmount
    };
  }, [fetchData]);

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Draft Management</h1>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-700 mt-4">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'drafts' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('drafts')}
            >
              Active Drafts ({drafts.length})
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'deleted' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('deleted')}
            >
              Recently Deleted ({deletedDrafts.length})
            </button>
          </div>
        </div>

        {/* Display either Active Drafts or Deleted Drafts */}
        {activeTab === 'drafts' ? (
          <DraftList drafts={drafts} />
        ) : (
          <DeletedList drafts={deletedDrafts} />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default DraftPage;
