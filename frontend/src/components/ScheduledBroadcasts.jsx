import React, { useState, useEffect, Fragment } from 'react';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';

export default function ScheduledBroadcasts() {
  const [scheduled, setScheduled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const fetchScheduledBroadcasts = async () => {
    try {
      const response = await axios.get('/broadcasts/scheduled');
      console.log('Scheduled broadcasts response:', response.data);
      
      const responseData = Array.isArray(response.data) ? 
        response.data : 
        response.data.data || [];
      const processedData = responseData.map(msg => ({
        _id: msg._id,
        title: msg.title || 'Untitled Message',
        content: msg.content || msg.message || '',
        channel: msg.channel || 'Unknown',
        scheduledTime: msg.scheduledTime || null,
        recipientCount: msg.recipientCount || msg.recipients?.length || 0,
        recipients: msg.recipients || [],
        status: msg.status || 'Scheduled'
      }));
      
      setScheduled(processedData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching scheduled broadcasts:', err);
      setError(err.response?.data?.message || err.message);
      setLoading(false);
      toast.error('Failed to load scheduled broadcasts');
    }
  };

  const handleDelete = async (messageId) => {
    if (!messageId) {
      toast.error('Invalid message ID');
      return;
    }
    if (window.confirm('Are you sure you want to delete this scheduled broadcast?')) {
      try {
        await axios.delete(`broadcasts/scheduled/${messageId}`);
        toast.success('Scheduled broadcast deleted successfully');
        fetchScheduledBroadcasts(); // Refresh the list
      } catch (err) {
        console.error('Error deleting scheduled broadcast:', err);
        toast.error(err.response?.data?.message || 'Failed to delete scheduled broadcast');
      }
    }
  };

  const handleView = (message) => {
    console.log('Opening modal for message:', message);
    setSelectedMessage(message);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchScheduledBroadcasts();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchScheduledBroadcasts, 30000);
    return () => clearInterval(interval);
  }, []);

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
      broadcast.channel?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-emerald-300">Scheduled Broadcasts</h2>
          <p className="text-sm text-gray-400 mt-1">
            Total: {scheduled.length} scheduled {scheduled.length === 1 ? 'message' : 'messages'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search scheduled broadcasts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-md pl-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <button
            onClick={fetchScheduledBroadcasts}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md text-sm"
          >
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
              {filteredBroadcasts.map((message) => (
                <tr key={message._id} className="border-t border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-emerald-300">
                    {message.title}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {message.scheduledTime ? 
                      new Date(message.scheduledTime).toLocaleString() : 
                      'Not scheduled'}
                  </td>
                  <td className="px-6 py-4">
                    {getChannelBadge(message.channel)}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {message.recipientCount || message.recipients?.length || 0} recipients
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(message.status || 'Scheduled')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(message)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-150 flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(message._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-150 flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete
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
                <tr 
                  key={broadcast._id} 
                  className="border-t border-gray-700 hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-emerald-300">
                    {broadcast.title}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {new Date(broadcast.scheduledTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      broadcast.channel === 'Email' ? 'bg-blue-900/50 text-blue-300' :
                      broadcast.channel === 'SMS' ? 'bg-green-900/50 text-green-300' :
                      broadcast.channel === 'WhatsApp' ? 'bg-emerald-900/50 text-emerald-300' :
                      'bg-purple-900/50 text-purple-300'
                    }`}>
                      {broadcast.channel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full bg-gray-700 text-gray-300 text-xs">
                      {broadcast.recipientCount || broadcast.recipients?.length || 0}
                    </span>
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(broadcast._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-150 flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete
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
          <svg
            className="mx-auto h-12 w-12 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-300">No scheduled broadcasts</h3>
          <p className="mt-1 text-gray-500">
            {searchTerm ? 'Try a different search term' : 'Schedule a broadcast to see it here'}
          </p>
        </div>
      )}
    </div>
  );
}