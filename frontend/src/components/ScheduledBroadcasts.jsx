import React, { useState, useEffect, Fragment } from 'react';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';

export default function ScheduledBroadcasts() {
  const [scheduled, setScheduled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchScheduledBroadcasts = async () => {
    try {
      const response = await axios.get('/broadcasts/scheduled');
      console.log('Scheduled broadcasts response:', response.data);
      
      const responseData = Array.isArray(response.data) ? 
        response.data : 
        response.data.data || [];
      
      setScheduled(responseData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching scheduled broadcasts:', err);
      setError(err.response?.data?.message || err.message);
      setLoading(false);
      toast.error('Failed to load scheduled broadcasts');
    }
  };

  useEffect(() => {
    fetchScheduledBroadcasts();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchScheduledBroadcasts, 30000);
    setRefreshInterval(interval);

    // Clean up interval on unmount
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);

  const getStatusBadge = (status) => {
    const statusStyles = {
      Scheduled: 'bg-yellow-900/50 text-yellow-300',
      Processing: 'bg-blue-900/50 text-blue-300',
      Sent: 'bg-green-900/50 text-green-300',
      Failed: 'bg-red-900/50 text-red-300',
      Cancelled: 'bg-gray-900/50 text-gray-300'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-700 text-gray-300'}`}>
        {status}
      </span>
    );
  };

  const handleCancelBroadcast = async (broadcastId) => {
    try {
      await axios.delete(`/broadcasts/scheduled/${broadcastId}`);
      toast.success('Broadcast cancelled successfully');
      fetchScheduledBroadcasts(); // Refresh the list
    } catch (err) {
      console.error('Error cancelling broadcast:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel broadcast');
    }
  };

  const getChannelBadge = (channel) => {
    const channelStyles = {
      Email: 'bg-blue-900/50 text-blue-300',
      SMS: 'bg-green-900/50 text-green-300',
      WhatsApp: 'bg-emerald-900/50 text-emerald-300'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${channelStyles[channel] || 'bg-gray-700 text-gray-300'}`}>
        {channel}
      </span>
    );
  };

  const filteredBroadcasts = scheduled.filter(broadcast => {
    const searchLower = searchTerm.toLowerCase();
    return (
      broadcast.title?.toLowerCase().includes(searchLower) ||
      broadcast.listName?.toLowerCase().includes(searchLower) ||
      broadcast.channel?.toLowerCase().includes(searchLower) ||
      (broadcast.tags && broadcast.tags.join(' ').toLowerCase().includes(searchLower)) ||
      broadcast.status?.toLowerCase().includes(searchLower)
    );
  });

  const handleView = (message) => {
    console.log('Opening modal for message:', message);
    setSelectedMessage(message);
    setIsModalOpen(true);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md text-white">
      <div className="text-red-400 mb-4">Error: {error}</div>
      <button 
        onClick={() => window.location.reload()}
        className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md text-white"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-emerald-300">Scheduled Broadcasts</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search broadcasts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-md pl-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={fetchScheduledBroadcasts}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md text-sm"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {filteredBroadcasts.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="w-full text-left">
            <thead className="bg-gray-700 text-emerald-300">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Scheduled Time</th>
                <th className="px-6 py-3">Channel</th>
                <th className="px-6 py-3">Recipients</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBroadcasts.map((broadcast) => (
                <tr key={broadcast._id} className="border-t border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-emerald-300">
                    {broadcast.title}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {new Date(broadcast.scheduledTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {getChannelBadge(broadcast.channel)}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {broadcast.recipients?.length || 0} recipients
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(broadcast.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(broadcast)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-150 flex items-center gap-1"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleCancelBroadcast(broadcast._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-150 flex items-center gap-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-700/50 p-8 rounded-lg border border-dashed border-gray-600 text-center">
          <p className="text-gray-400">
            {loading ? 'Loading scheduled broadcasts...' : error ? error : 'No scheduled broadcasts found'}
          </p>
        </div>
      )}

      {/* View Message Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  {selectedMessage && (
                    <>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-emerald-300"
                      >
                        {selectedMessage.listName}
                      </Dialog.Title>
                      <div className="mt-4 space-y-6">
                        {/* List Name */}
                        <div>
                          <h4 className="text-sm font-medium text-emerald-300 mb-2">List Name</h4>
                          <div className="text-sm text-gray-300 bg-gray-700/50 p-3 rounded-lg">
                            {selectedMessage.listName}
                          </div>
                        </div>

                        {/* Title */}
                        <div>
                          <h4 className="text-sm font-medium text-emerald-300 mb-2">Title</h4>
                          <div className="text-sm text-gray-300 bg-gray-700/50 p-3 rounded-lg">
                            {selectedMessage.title}
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div>
                          <h4 className="text-sm font-medium text-emerald-300 mb-2">Message Content</h4>
                          <div className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-700/50 p-4 rounded-lg max-h-48 overflow-y-auto">
                            {selectedMessage.content || 'No content available'}
                          </div>
                        </div>

                        {/* Channel and Schedule */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-emerald-300 mb-2">Channel</h4>
                            <div>
                              {getChannelBadge(selectedMessage.channel)}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-emerald-300 mb-2">Scheduled Time</h4>
                            <p className="text-sm text-gray-300">
                              {selectedMessage.scheduledTime ? 
                                new Date(selectedMessage.scheduledTime).toLocaleString() : 
                                'Not scheduled'}
                            </p>
                          </div>
                        </div>

                        {/* Recipients */}
                        <div>
                          <h4 className="text-sm font-medium text-emerald-300 mb-2">Recipients</h4>
                          <div className="text-sm text-gray-300 bg-gray-700/50 p-4 rounded-lg">
                            {selectedMessage.recipients?.length || 0} recipients scheduled
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          type="button"
                          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md text-sm transition-colors duration-150"
                          onClick={() => {
                            handleDelete(selectedMessage._id);
                            setIsModalOpen(false);
                          }}
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md text-sm transition-colors duration-150"
                          onClick={() => setIsModalOpen(false)}
                        >
                          Close
                        </button>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
