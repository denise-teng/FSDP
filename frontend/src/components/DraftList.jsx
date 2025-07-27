// components/DraftList.jsx
import { useDraftStore } from '../stores/useDraftsStore';
import { useState, useEffect, useMemo } from 'react';
import DraftCard from './DraftCard';
import { useNavigate } from 'react-router-dom';

const DraftList = () => {
  const { drafts, fetchDrafts } = useDraftStore();
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    return drafts.filter(draft => draft.status === "draft")
                .filter(draft => filterType === "all" || draft.type === filterType);
  }, [drafts, filterType]);

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-gray-800 rounded-lg">
        Error: {error}
        <button 
          onClick={() => window.location.reload()}
          className="ml-4 px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="text-white">Loading drafts...</div>;
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Your Drafts</h2>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-gray-700 text-white px-3 py-1 rounded"
        >
          <option value="all">All</option>
          <option value="newsletter">Newsletters</option>
          <option value="generated">Generated Messages</option>
        </select>
      </div>

      {filteredDrafts.length === 0 ? (
        <p className="text-white">No drafts found.</p>
      ) : (
        filteredDrafts.map((draft) => (
          <DraftCard
            key={draft._id}
            draft={draft}
            onEdit={() => navigate(`/edit-draft/${draft._id}`)}
          />
        ))
      )}
    </div>
  );
};

export default DraftList;