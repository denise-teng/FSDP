// components/DeletedList.jsx
import { useState } from 'react';
import { useDraftStore } from '../stores/useDraftsStore';

const DeletedList = ({ drafts }) => {
  const { restoreDraft } = useDraftStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDrafts = drafts.filter(draft => 
    draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    draft.content.some(paragraph => 
      paragraph.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="mt-6">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search deleted drafts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-gray-700 text-white px-3 py-2 rounded w-full"
        />
      </div>

      {filteredDrafts.length === 0 ? (
        <p className="text-white">No deleted drafts found</p>
      ) : (
        <div className="space-y-4">
          {filteredDrafts.map(draft => (
            <div key={draft._id} className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-white font-medium">{draft.title}</h3>
              <p className="text-gray-400 text-sm">
                Deleted: {new Date(draft.deletedAt).toLocaleString()}
              </p>
              
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => restoreDraft(draft._id)}
                  className="px-3 py-1 bg-green-600 rounded hover:bg-green-700"
                >
                  Restore
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeletedList;