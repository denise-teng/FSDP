import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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

    const fetchMessages = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Updated endpoint to fetch from recentmessages collection
            const response = await axios.get('/broadcasts/message-history');
            
            const responseData = Array.isArray(response.data) ? 
                response.data : 
                response.data?.data || [];

            setMessages(responseData);

            // Calculate stats based on your model's status field
            const sentCount = responseData.reduce((acc, msg) => 
                acc + (msg.status === 'complete' ? 1 : 0), 0);
            const failedCount = responseData.reduce((acc, msg) => 
                acc + (msg.status === 'failed' ? 1 : 0), 0);
            const partialCount = responseData.reduce((acc, msg) =>
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

    const getContentPreview = (content) => {
        if (!content) return 'No content';
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

    // ... [keep your existing loading and error states]

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
                        {/* Search icon */}
                    </div>
                    <button
                        onClick={fetchMessages}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md text-sm"
                    >
                        {/* Refresh icon */}
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
                                        {getContentPreview(message.content)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getChannelBadge(message.channel)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(message.status)}
                                        {message.error && (
                                            <div className="text-xs text-red-400 mt-1">{message.error}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getDeliveryStats(message)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">
                                        {message.sentAt ? new Date(message.sentAt).toLocaleString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => navigate(`/messages/${message._id}`)}
                                            className="text-emerald-400 hover:text-emerald-300 text-sm"
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-gray-700/50 p-8 rounded-lg border border-dashed border-gray-600 text-center">
                    {/* No messages found UI */}
                </div>
            )}
        </div>
    );
}

export default RecentMessages;