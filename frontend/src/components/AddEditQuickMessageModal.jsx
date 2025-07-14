import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AddEditQuickMessageModal({ message, onClose, onSaved }) {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (message) {
      setContent(message.content);
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    try {
      if (message) {
        await axios.put(`/api/quick-messages/${message._id}`, { content });
        toast.success('Message updated');
      } else {
        await axios.post('/api/quick-messages', { content });
        toast.success('Message added');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error('Failed to save message');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1e293b] w-full max-w-xl p-8 rounded-lg shadow-md space-y-6 mx-4 text-white"
      >
        <h2 className="text-2xl font-bold text-center text-emerald-400">
          {message ? 'Edit Quick Message' : 'New Quick Message'}
        </h2>

        <div>
          <label className="block text-sm font-medium mb-2">
            Message
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="5"
            placeholder="Type your quick message here..."
            className="w-full p-3 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded"
          >
            {message ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
}
