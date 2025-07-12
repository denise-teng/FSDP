import React, { useState } from 'react';
import OpportunityCard from './OpportunityCard';
import { toast } from 'react-hot-toast';
import { Send } from 'lucide-react';

const mockData = [
  {
    name: 'Samantha Cheow',
    message:
      '..., this sudden increase in market shares is truly unexpected. I’m interested in knowing how to read market trends better.',
    gender: 'female',
    avatar: '/avatars/samantha.png'
  },
  {
    name: 'David Lim',
    message:
      'My first son just turned 8, I’m still unsure of what medical insurance ot get, could you tell me more about this new plan by Standard Charted?',
    gender: 'male',
    avatar: '/avatars/david.png'
  },
  {
    name: 'Michelle Hong',
    message:
      'Thanks for letting me know about this. How to save on taxes is something I’m still unsure about.',
    gender: 'female',
    avatar: '/avatars/michelle.png'
  }
];

const PotentialOpportunities = () => {
  const [sendModal, setSendModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [messageText, setMessageText] = useState('Would you like to meet up to discuss this further?'); // Default editable message

  const handleSendConfirm = () => {
    toast.success(`Message sent to ${sendModal}`);
    setSendModal(null);
    setMessageText(''); // Clear message after sending
  };

  const handleDeleteConfirm = () => {
    toast.success(`${deleteModal} deleted`);
    setDeleteModal(null);
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-xl shadow-lg mt-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">Potential Opportunities</h2>

      <div className="space-y-4">
        {mockData.map((item, i) => (
          <OpportunityCard
            key={i}
            name={item.name}
            message={item.message}
            gender={item.gender}
            avatar={item.avatar}
            onSend={() => setSendModal(item.name)}
            onDelete={() => setDeleteModal(item.name)}
          />
        ))}
      </div>

      {/* Send Modal */}
      {sendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-bold mb-3">Send Message to {sendModal}</h3>
            <textarea
              value={messageText} // Default message is present and editable
              onChange={(e) => setMessageText(e.target.value)} // Update message when edited
              rows={4}
              className="w-full bg-gray-800 border border-gray-600 text-white rounded p-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSendModal(null)}
                className="text-sm text-gray-400 hover:text-white px-3 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSendConfirm}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded flex items-center gap-1"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full max-w-sm border border-gray-700">
            <h3 className="text-lg font-bold mb-3">Delete {deleteModal}?</h3>
            <p className="mb-4 text-gray-300">
              Are you sure you want to delete this opportunity?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteModal(null)}
                className="text-sm text-gray-400 hover:text-white px-3 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PotentialOpportunities;
