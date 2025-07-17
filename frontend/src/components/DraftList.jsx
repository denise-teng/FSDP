import { useDraftStore } from '../stores/useDraftsStore';
import { useState, useEffect, useMemo } from 'react';
import DraftCard from './DraftCard';
import DraftPreview from './DraftPreview';
import { useNavigate } from 'react-router-dom';

const DraftList = () => {
  const { drafts, fetchDrafts } = useDraftStore();
  const [previewDraft, setPreviewDraft] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDrafts = async () => {
      setLoading(true);
      try {
        await fetchDrafts();
      } catch (error) {
        console.error("Failed to fetch drafts:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDrafts();
  }, []); 

  const filteredDrafts = useMemo(() => {
    return drafts.filter(draft => draft.status === "draft").filter(draft => filterType === "all" || draft.type === filterType);
  }, [drafts, filterType]);

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
            onPreview={() => {
              console.log('Previewing draft:', draft);
              setPreviewDraft(draft);
            }}
            onEdit={() => navigate(`/edit-draft/${draft._id}`)}
          />
        ))
      )}

      {previewDraft && (
        <DraftPreview draft={previewDraft} onClose={() => setPreviewDraft(null)} />
      )}
    </div>
  );
};

export default DraftList;