import React, { useState, useEffect, Fragment } from 'react';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';

function RecentMessages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        sent: 0,
        failed: 0,
        total: 0,
        partial: 0
    });
    
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Get messages from message history endpoint
            const response = await axios.get('broadcasts/message-history');
            console.log('API Response:', response.data); // Debug log
            
            let responseData = Array.isArray(response.data) ? 
                response.data : 
                response.data?.data || [];

            // Ensure we have all the required fields
            const processedMessages = responseData.map(msg => ({
                _id: msg.id || msg._id, // Try both id and _id
                title: msg.title || 'Untitled Message',
                content: msg.content || msg.message || '', // Try both content and message fields
                channel: msg.channel || 'Unknown',
                status: msg.status || 'partial',
                sentAt: msg.sentAt || null,
                recipients: msg.recipients || [],
                error: msg.error || null
            }));

            console.log('Processed Messages:', processedMessages); // Debug log
            setMessages(processedMessages);

            // Calculate stats based on your model's status field
            const sentCount = processedMessages.reduce((acc, msg) => 
                acc + (msg.status === 'complete' ? 1 : 0), 0);
            const failedCount = processedMessages.reduce((acc, msg) => 
                acc + (msg.status === 'failed' ? 1 : 0), 0);
            const partialCount = processedMessages.reduce((acc, msg) =>
                acc + (msg.status === 'partial' ? 1 : 0), 0);

            setStats({
                sent: sentCount,
                failed: failedCount,
                partial: partialCount,
                total: responseData.length
            });

        } catch (err) {
            console.error('Error fetching message history:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load message history');
            toast.error('Failed to load message history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchMessages, 30000);
        return () => clearInterval(interval);
    }, []);

    const getContentPreview = (message) => {
        const content = message.content || message.message || '';
        if (!content.trim()) return 'No message content';
        return content.length > 50 ? `${content.substring(0, 50)}...` : content;
    };

    const filteredMessages = messages.filter(message => {
        const searchLower = searchTerm.toLowerCase();
        return (
            message.title?.toLowerCase().includes(searchLower) ||
            message.content?.toLowerCase().includes(searchLower) ||
            message.channel?.toLowerCase().includes(searchLower) ||
            message.status?.toLowerCase().includes(searchLower)
        );
    });

    const getStatusBadge = (status) => {
        const statusStyles = {
            complete: 'bg-green-900/50 text-green-300',
            partial: 'bg-yellow-900/50 text-yellow-300',
            failed: 'bg-red-900/50 text-red-300'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-700 text-gray-300'}`}>
                {status === 'complete' ? 'Sent' : 
                 status === 'partial' ? 'Partial' : 'Failed'}
            </span>
        );
    };

    const handleDelete = async (messageId) => {
        if (!messageId) {
            toast.error('Invalid message ID');
            return;
        }
        if (window.confirm('Are you sure you want to delete this message?')) {
            try {
                // Debug logging for ID verification
                console.log('Message to delete:', messageId);
                
                // Check if the messageId is a valid format
                if (typeof messageId !== 'string' && !messageId.toString) {
                    throw new Error('Invalid message ID format');
                }
                
                // Convert ObjectId to string if needed
                const id = messageId.toString();
                
                console.log('Deleting message with ID:', id); // Debug log
                
                // Using the message history delete endpoint
                const response = await axios.delete(`broadcasts/message-history/${id}`);
                console.log('Delete response:', response); // Debug log
                
                if (response.status === 200) {
                    toast.success('Message deleted successfully');
                    fetchMessages(); // Refresh the list
                } else {
                    throw new Error('Failed to delete message');
                }
            } catch (err) {
                console.error('Error deleting message:', err);
                // More detailed error message
                const errorMessage = err.response?.data?.message || 
                                  err.response?.data?.error || 
                                  err.message || 
                                  'Failed to delete message. Please try again.';
                toast.error(errorMessage);
            }
        }
    };

    const handleView = (message) => {
        console.log('Opening modal for message:', message); // Debug log
        setSelectedMessage(message);
        setIsModalOpen(true);
    };

    const getDeliveryStats = (message) => {
        const total = message.totalRecipients || message.recipients?.length || 0;
        const success = message.successCount || 
                       message.recipients?.filter(r => 
                         ['sent', 'delivered'].includes(r.status)).length || 0;
        const failed = total - success;

        return (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-green-400">✓ {success}</span>
                    <span className="text-xs text-red-400">✗ {failed}</span>
                    <span className="text-xs text-gray-400">/ {total}</span>
                </div>
                {failed > 0 && (
                    <button 
                        onClick={() => navigate(`/messages/${message._id}/retry`)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 underline"
                    >
                        Retry failed
                    </button>
                )}
            </div>
        );
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

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md text-white">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-emerald-300">Message History</h2>
                    <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-green-400">✓ {stats.sent} Sent</span>
                        <span className="text-yellow-400">↻ {stats.partial} Partial</span>
                        <span className="text-red-400">✗ {stats.failed} Failed</span>
                        <span className="text-gray-400">Total: {stats.total}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative w-64">
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-md pl-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                    <button
                        onClick={fetchMessages}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md text-sm"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {filteredMessages.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="w-full text-left">
                        <thead className="bg-gray-700 text-emerald-300">
                            <tr>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Content</th>
                                <th className="px-6 py-3">Channel</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Delivery</th>
                                <th className="px-6 py-3">Sent At</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMessages.map((message) => (
                                <tr key={message._id} className="border-t border-gray-700 hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-emerald-300">
                                        {message.title || 'Untitled Message'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-300 max-w-xs truncate">
                                        {getContentPreview(message)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getChannelBadge(message.channel)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(message.status)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getDeliveryStats(message)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">
                                        {message.sentAt ? new Date(message.sentAt).toLocaleString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleView(message);
                                                }}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-150 flex items-center gap-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                </svg>
                                                View
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleDelete(message._id);
                                                }}
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
                        {loading ? 'Loading messages...' : error ? error : 'No messages found'}
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
                                                {selectedMessage.title || 'Message Details'}
                                            </Dialog.Title>
                                            <div className="mt-4 space-y-6">
                                                {/* Title */}
                                                <div>
                                                    <h4 className="text-sm font-medium text-emerald-300 mb-2">Title</h4>
                                                    <div className="text-sm text-gray-300 bg-gray-700/50 p-3 rounded-lg">
                                                        {selectedMessage.title || 'Untitled Message'}
                                                    </div>
                                                </div>
                                                
                                                {/* Content */}
                                                <div>
                                                    <h4 className="text-sm font-medium text-emerald-300 mb-2">Message Content</h4>
                                                    <div className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-700/50 p-4 rounded-lg max-h-48 overflow-y-auto">
                                                        {selectedMessage.content || 'No content available'}
                                                    </div>
                                                </div>

                                                {/* Channel, Status, and Time */}
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-emerald-300 mb-2">Channel</h4>
                                                        <div>
                                                            {getChannelBadge(selectedMessage.channel)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-emerald-300 mb-2">Status</h4>
                                                        <div>
                                                            {getStatusBadge(selectedMessage.status)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-emerald-300 mb-2">Sent At</h4>
                                                        <p className="text-sm text-gray-300">
                                                            {selectedMessage.sentAt ? 
                                                                new Date(selectedMessage.sentAt).toLocaleString() : 
                                                                'N/A'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Delivery Stats */}
                                                <div>
                                                    <h4 className="text-sm font-medium text-emerald-300 mb-2">Delivery Statistics</h4>
                                                    <div className="bg-gray-700/50 p-4 rounded-lg">
                                                        {getDeliveryStats(selectedMessage)}
                                                    </div>
                                                </div>
                                                
                                                {/* Error Message if any */}
                                                {selectedMessage.error && (
                                                    <div>
                                                        <h4 className="text-sm font-medium text-red-400 mb-2">Error Details</h4>
                                                        <div className="text-sm text-red-300 bg-red-900/30 p-3 rounded-lg">
                                                            {selectedMessage.error}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-6 flex justify-end">
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

export default RecentMessages;
