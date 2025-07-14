import { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import AddEditQuickMessageModal from '../components/AddEditQuickMessageModal';
import { useQuickMessageStore } from '../stores/useQuickMessageStore';

export default function QuickMessagesPage() {
  const { messages, fetchMessages, deleteMessage } = useQuickMessageStore();
  const [showModal, setShowModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [deletingMessageId, setDeletingMessageId] = useState(null); // ✅ fixed

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleEdit = (msg) => {
    setEditingMessage(msg);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteMessage(deletingMessageId);
      setDeletingMessageId(null); // ✅ close modal after delete
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-7xl mx-auto bg-[#1e293b] shadow-lg rounded-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-emerald-400">QUICK MESSAGES</h2>
          <button
            onClick={() => {
              setEditingMessage(null);
              setShowModal(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded"
          >
            + New Message
          </button>
        </div>

        <div className="divide-y divide-gray-700">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg._id} className="flex justify-between items-center py-3">
                <p className="whitespace-pre-wrap text-left w-full">{msg.content}</p>
                <div className="flex space-x-5 ml-6">
                  <button onClick={() => handleEdit(msg)} title="Edit">
                    <Pencil className="w-6 h-6 text-blue-500 hover:text-blue-700" />
                  </button>
                  <button onClick={() => setDeletingMessageId(msg._id)} title="Delete">
                    <Trash2 className="w-6 h-6 text-red-500 hover:text-red-700" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-6">No quick messages available.</p>
          )}
        </div>
      </div>

      {showModal && (
        <AddEditQuickMessageModal
          message={editingMessage}
          onClose={() => setShowModal(false)}
          onSaved={fetchMessages}
        />
      )}

      {deletingMessageId && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold text-red-400 mb-4">Confirm Deletion</h3>
            <p className="mb-6 text-white">Are you sure you want to delete this quick message?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeletingMessageId(null)}
                className="bg-gray-600 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
