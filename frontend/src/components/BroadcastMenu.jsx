import { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

export default function BroadcastMenu({ isOpen, onClose, contactId }) {
  const [broadcasts, setBroadcasts] = useState([]);
  const [selectedBroadcast, setSelectedBroadcast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBroadcasts();
    } else {
      setSelectedBroadcast(null);
    }
  }, [isOpen]);

  const fetchBroadcasts = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/broadcasts');
      console.log('Fetched broadcasts:', res.data); // Debug log
      setBroadcasts(res.data);
    } catch (err) {
      console.error('Error fetching broadcasts:', err);
      toast.error('Failed to load broadcast lists');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToList = async (broadcastId) => {
    try {
      console.log('Debug: handleAddToList called with:', {
        broadcastId,
        contactId,
        broadcastIdType: typeof broadcastId,
        contactIdType: typeof contactId
      });
      
      const response = await axios.post('/broadcasts/add-contact', {
        broadcastId,
        contactId
      });
      
      console.log('Success response:', response.data);
      toast.success('Contact added to broadcast list');
      onClose();
    } catch (err) {
      console.error('Error adding contact to broadcast:', err);
      console.error('Error response:', err.response?.data);
      toast.error('Failed to add contact to broadcast list');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200/50 relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -translate-y-10 translate-x-10 opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full translate-y-8 -translate-x-8 opacity-30"></div>
        
        <div className="relative">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-3 shadow-lg transform rotate-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Broadcast Lists
              </span>
            </h3>
            <p className="text-gray-600">Select a broadcast list to add this contact</p>
          </div>

          {/* Broadcast Dropdown and Details */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <select
                onChange={(e) => setSelectedBroadcast(broadcasts.find(b => b._id === e.target.value))}
                value={selectedBroadcast?._id || ''}
                className="w-full p-3 rounded-xl border border-gray-200 bg-white text-gray-900 appearance-none pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              >
                <option value="">Select a broadcast list</option>
                {broadcasts.map((broadcast) => (
                  <option key={broadcast._id} value={broadcast._id}>
                    {broadcast.title}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-3 shadow-lg animate-pulse">
                  <svg className="h-6 w-6 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="text-gray-600">Loading broadcast lists...</p>
              </div>
            ) : broadcasts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No broadcast lists available</p>
              </div>
            ) : selectedBroadcast && (
              <div className="p-4 bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-xl border border-gray-200/50 transition-all duration-300">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {selectedBroadcast.title}
                    </h4>
                    <div className="text-sm text-gray-500 space-y-1 mt-2">
                      <p>List: {selectedBroadcast.listName}</p>
                      <p>Channel: {selectedBroadcast.channel}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedBroadcast.tags?.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddToList(selectedBroadcast._id)}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg mt-4"
                  >
                    Add to Broadcast List
                  </button>
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
