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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <form
        onSubmit={handleSubmit}
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>
        
        <div className="relative p-8 space-y-6">
          {/* Enhanced title */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                {message ? 'Edit Quick Message' : 'New Quick Message'}
              </span>
            </h2>
            <p className="text-gray-600">
              {message ? 'Update your message template' : 'Create a new quick message template'}
            </p>
          </div>

          {/* Enhanced form field */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Message Content
            </label>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="6"
                placeholder="Type your quick message here..."
                className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 resize-none text-gray-800 placeholder-gray-400 shadow-sm"
              />
              {/* Character count indicator */}
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {content.length} characters
              </div>
            </div>
          </div>

          {/* Enhanced buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="group relative px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <span className="relative z-10">
                {message ? 'Update Message' : 'Create Message'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
