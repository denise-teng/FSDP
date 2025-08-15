import React, { useState, useEffect, useRef } from 'react';
import axios from '../lib/axios';
import BroadcastRecipientsModal from './BroadcastRecipientsModal';
import AddBroadcastAI from './BroadcastAI';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const Modal = React.memo(({ title, onClose, children }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">{title}</h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-indigo-200 transition-colors duration-200"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-auto p-8 bg-white">
                    {children}
                </div>
            </div>
        </div>
    );
});

export default function BroadcastList() {
    const [broadcasts, setBroadcasts] = useState([]);
    const [search, setSearch] = useState('');
    const [filterChannel, setFilterChannel] = useState('all');
    const [filterTag, setFilterTag] = useState('all');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showRecipientsModal, setShowRecipientsModal] = useState(false);
    const [showAIPage, setShowAIPage] = useState(false);
    const [selectedBroadcast, setSelectedBroadcast] = useState(null);
    const [recipients, setRecipients] = useState([]);
    const [allRecipients, setAllRecipients] = useState([]);
    const [sendNow, setSendNow] = useState(true);
    const [scheduledTime, setScheduledTime] = useState('');
    const [emailMessage, setEmailMessage] = useState("");
    const [scheduledBroadcasts, setScheduledBroadcasts] = useState([]);
    const [messageHistory, setMessageHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('manual'); // 'manual', 'scheduled', or 'history'
    const [loading, setLoading] = useState(false);

    // Form state for Manual Broadcast
    const [manualForm, setManualForm] = useState({
        title: '',
        listName: '',
        channel: 'Email',
        tags: ''
    });

    const [showManualModal, setShowManualModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [broadcastToDelete, setBroadcastToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState('regular'); // 'regular' or 'scheduled'

    const titleInputRef = useRef(null);

    const fetchBroadcasts = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/broadcasts?populate=recipients');
            setBroadcasts(res.data);

            const allRecips = res.data.flatMap(b => b.recipients || []);
            setAllRecipients([...new Map(allRecips.map(item => [item._id, item])).values()]);
        } catch (error) {
            console.error('Error fetching broadcasts:', error);
            
            // Handle specific error cases
            if (error.response?.status === 401) {
                toast.error('Authentication required. Please log in again.');
            } else if (error.response?.status === 403) {
                toast.error('Access denied. You do not have permission to view broadcasts.');
            } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                toast.error('Network error. Please check your connection.');
            } else {
                toast.error('Failed to load broadcasts. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchScheduledBroadcasts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/broadcasts/scheduled');
            setScheduledBroadcasts(response.data);
        } catch (error) {
            console.error('Error fetching scheduled broadcasts:', error);
            
            if (error.response?.status === 401) {
                toast.error('Authentication required. Please log in again.');
            } else if (error.response?.status === 403) {
                toast.error('Access denied.');
            } else {
                toast.error('Failed to load scheduled broadcasts');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchMessageHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/broadcasts/message-history');
            setMessageHistory(response.data);
        } catch (error) {
            console.error('Error fetching message history:', error);
            
            if (error.response?.status === 401) {
                toast.error('Authentication required. Please log in again.');
            } else if (error.response?.status === 403) {
                toast.error('Access denied.');
            } else {
                toast.error('Failed to load message history');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchRecipients = async (broadcastId) => {
        try {
            const res = await axios.get(`/broadcasts/${broadcastId}/recipients`);
            setRecipients(res.data);
        } catch (error) {
            console.error('Error fetching recipients:', error);
            toast.error('Failed to load recipients');
        }
    };

    const handleViewRecipients = async (broadcast) => {
        try {
            await fetchRecipients(broadcast._id);
            setSelectedBroadcast(broadcast);
            setShowRecipientsModal(true);
        } catch (error) {
            toast.error('Failed to load recipients');
        }
    };

    const handleViewAllRecipients = async () => {
        try {
            const res = await axios.get('/broadcasts/recipients');
            setRecipients(res.data);
            setSelectedBroadcast(null); // Clear selected broadcast for "View All"
            setShowRecipientsModal(true);
        } catch (error) {
            toast.error('Failed to load recipients');
        }
    };

    useEffect(() => {
        fetchBroadcasts();
        fetchScheduledBroadcasts();
        fetchMessageHistory();
    }, []);

    const allTags = [...new Set((broadcasts || []).flatMap((b) => b.tags || []))];

    const filteredBroadcasts = broadcasts
        .filter((b) => b.title.toLowerCase().includes(search.toLowerCase()))
        .filter((b) => (filterChannel === 'all' ? true : b.channel?.toLowerCase() === filterChannel.toLowerCase()))
        .filter((b) => (filterTag === 'all' ? true : (b.tags || []).includes(filterTag)))
        .sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
        });

    const filteredScheduledBroadcasts = scheduledBroadcasts
        .filter(b => b.status === 'Scheduled' || b.status === 'Processing' || b.status === 'Sent' || b.status === 'Failed')
        .filter((b) => b.title.toLowerCase().includes(search.toLowerCase()))
        .filter((b) => (filterChannel === 'all' ? true : b.channel?.toLowerCase() === filterChannel.toLowerCase()))
        .sort((a, b) => {
            const timeA = new Date(a.scheduledTime).getTime();
            const timeB = new Date(b.scheduledTime).getTime();
            return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
        });

    const filteredMessageHistory = messageHistory
        .filter((m) => m.title.toLowerCase().includes(search.toLowerCase()))
        .filter((m) => (filterChannel === 'all' ? true : m.channel?.toLowerCase() === filterChannel.toLowerCase()))
        .sort((a, b) => {
            const timeA = new Date(a.sentAt).getTime();
            const timeB = new Date(b.sentAt).getTime();
            return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
        });

    const clearFilters = () => {
        setSearch('');
        setFilterChannel('all');
        setFilterTag('all');
        setSortOrder('desc');
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/broadcasts', {
                ...manualForm,
                tags: manualForm.tags.split(',').map((t) => t.trim()), // Convert tags into an array
                channel: manualForm.channel.toLowerCase(), // Ensure channel is in lowercase
                scheduledTime: new Date().toISOString(),
            });
            fetchBroadcasts();
            setManualForm({ title: '', listName: '', channel: 'email', tags: '' });
            setShowManualModal(false);
            toast.success('Broadcast created successfully');
        } catch (err) {
            console.error('Broadcast sending failed:', err.response ? err.response.data : err);
            toast.error('Failed to create broadcast');
        }
    };



    const handleScheduleSubmit = async (broadcast) => {
        try {
            // Validate inputs
            if (!sendNow && (!scheduledTime || new Date(scheduledTime) < new Date())) {
                toast.error('Please select a future time');
                return;
            }

            if (!emailMessage.trim()) {
                toast.error('Please enter a message');
                return;
            }

            const loadingToast = toast.loading(
                sendNow ? 'Sending emails...' : 'Scheduling broadcast...'
            );

            // Prepare request data
            const requestData = {
                broadcastId: broadcast._id,
                title: broadcast.title, // Add title from the broadcast
                channel: broadcast.channel, // Add channel from the broadcast
                message: emailMessage,
                ...(!sendNow && { scheduledTime: new Date(scheduledTime).toISOString() })
            };

            console.log('Sending request with data:', requestData); // Debug log
            console.log('Selected broadcast details:', {
                id: broadcast._id,
                title: broadcast.title,
                recipientsLength: broadcast.recipients?.length,
                recipients: broadcast.recipients
            }); // Additional debug log

            // Make the API call
            const response = await axios.post(
                sendNow ? '/broadcasts/send-now' : '/broadcasts/schedule',
                requestData
            );

            console.log('API Response:', response.data); // Debug log

            toast.dismiss(loadingToast);
            toast.success(
                sendNow
                    ? `Successfully sent to ${response.data.data?.recipients?.length || 0} recipients!`
                    : `Successfully scheduled for ${new Date(scheduledTime).toLocaleString()}!`
                , {
                    duration: 4000
                }
            );

            // Reset form and refresh data
            setEmailMessage("");
            setScheduledTime("");
            setShowScheduleModal(false);
            await fetchBroadcasts();
            await fetchScheduledBroadcasts();
            await fetchMessageHistory();

        } catch (error) {
            toast.dismiss(loadingToast);

            console.error('Full error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                request: error.config,
                headers: error.config?.headers
            });

            let errorMsg = 'Failed to process broadcast';

            if (error.response) {
                // The request was made and the server responded with a status code
                errorMsg = error.response.data?.error ||
                    error.response.data?.message ||
                    `Server error: ${error.response.status}`;
                
                // Log additional details for debugging
                console.error('Server error details:', error.response.data?.details);
                console.error('Server error stack:', error.response.data?.stack);
            } else if (error.request) {
                // The request was made but no response was received
                errorMsg = 'No response from server';
            }

            toast.error(`Error: ${errorMsg}`, {
                duration: 4000
            });
        }
    };

    const handleSendNow = async (broadcast, message) => {
        let loadingToast;
        try {
            loadingToast = toast.loading(`Sending to ${broadcast.recipients?.length || 0} recipients...`);
            
            const response = await axios.post('/broadcasts/send-now', {
                broadcastId: broadcast._id,
                title: broadcast.title,
                channel: broadcast.channel,
                message
            });
            
            toast.dismiss(loadingToast);
            toast.success(`Successfully sent to ${response.data.data?.recipients?.length || broadcast.recipients?.length || 0} recipients!`, {
                duration: 4000
            });
            
            // Reset form and close modal
            setEmailMessage("");
            setScheduledTime("");
            setShowScheduleModal(false);
            await fetchBroadcasts();
            await fetchScheduledBroadcasts();
            await fetchMessageHistory();
        } catch (error) {
            if (loadingToast) toast.dismiss(loadingToast);
            console.error('Error sending broadcast:', error);
            toast.error(`Failed to send: ${error.response?.data?.message || error.message}`, {
                duration: 4000
            });
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            await axios.delete(`/broadcasts/message-history/${messageId}`);
            setMessageHistory(prev => prev.filter(m => m._id !== messageId));
            toast.success('Message deleted successfully');
        } catch (error) {
            toast.error('Failed to delete message');
            console.error(error);
        }
    };

    const handleDeleteBroadcast = async (broadcastId) => {
        try {
            console.log('Attempting to delete scheduled broadcast:', broadcastId);
            const response = await axios.delete(`/broadcasts/scheduled/${broadcastId}`);
            console.log('Delete response:', response.data);
            setScheduledBroadcasts(prev => prev.filter(b => b._id !== broadcastId));
            toast.success('Scheduled broadcast cancelled');
        } catch (error) {
            console.error('Delete error:', error);
            console.error('Error response:', error.response?.data);
            toast.error(`Failed to cancel scheduled broadcast: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleConfirmDelete = async () => {
        try {
            console.log('Attempting to delete broadcast:', broadcastToDelete, 'Type:', deleteType);
            
            let response;
            if (deleteType === 'scheduled') {
                // Use scheduled broadcasts endpoint
                response = await axios.delete(`/broadcasts/scheduled/${broadcastToDelete}`);
                // Update scheduled broadcasts list
                setScheduledBroadcasts(prev => prev.filter(b => b._id !== broadcastToDelete));
                toast.success('Scheduled broadcast deleted successfully');
            } else {
                // Use regular broadcasts endpoint  
                response = await axios.delete(`/broadcasts/${broadcastToDelete}`);
                // Refresh regular broadcasts list
                fetchBroadcasts();
                toast.success('Broadcast deleted successfully');
            }
            
            console.log('Delete response:', response.data);
            setShowDeleteModal(false);
            setBroadcastToDelete(null);
            setDeleteType('regular');
            
        } catch (err) {
            console.error('Delete error:', err);
            console.error('Error response:', err.response?.data);
            const errorMessage = err.response?.data?.error || err.message;
            toast.error(`Failed to delete broadcast: ${errorMessage}`);
        }
    };

    const handleCloseModal = () => {
        setShowDeleteModal(false);
        setBroadcastToDelete(null);
        setDeleteType('regular');
    };

    const formatDateTime = (dateString) => {
        return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Enhanced Header Section */}
                <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100/50 p-8 mb-8 overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>
                    
                    <div className="relative flex justify-between items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-3">
                                <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    📢 Broadcast Management
                                </span>
                            </h2>
                            <p className="text-gray-600 text-lg">Create and manage your broadcast campaigns</p>
                        </div>
                        <div className="relative">
                            <div className="h-16 w-16 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                            <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Tab Navigation */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-6 mb-8">
                    <div className="flex border-b border-gray-200">
                        <button
                            className={`px-6 py-3 font-semibold text-lg transition-all duration-300 ${
                                activeTab === 'manual' 
                                    ? 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50' 
                                    : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50/30'
                            }`}
                            onClick={() => setActiveTab('manual')}
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Broadcast Lists
                            </span>
                        </button>
                        <button
                            className={`px-6 py-3 font-semibold text-lg transition-all duration-300 ${
                                activeTab === 'scheduled' 
                                    ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50/50' 
                                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50/30'
                            }`}
                            onClick={() => setActiveTab('scheduled')}
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Scheduled Broadcasts
                            </span>
                        </button>
                        <button
                            className={`px-6 py-3 font-semibold text-lg transition-all duration-300 ${
                                activeTab === 'history' 
                                    ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50/50' 
                                    : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50/30'
                            }`}
                            onClick={() => setActiveTab('history')}
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Message History
                            </span>
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-6 mb-8">
                    <div className="flex flex-wrap gap-4">
                        <button
                            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                            onClick={() => setShowManualModal(true)}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Manual Broadcast
                        </button>

                        <button
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                            onClick={() => setShowScheduleModal(true)}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Schedule Broadcast
                        </button>

                        <button
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                            onClick={handleViewAllRecipients}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            View All Recipients
                        </button>

                        <button
                            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                            onClick={() => setShowAIPage(true)}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Add AI Broadcast
                        </button>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-6 mb-8">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by title..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-4 py-3 w-64 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>

                        <select
                            value={filterChannel}
                            onChange={(e) => setFilterChannel(e.target.value)}
                            className="p-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                        >
                            <option value="all">All Channels</option>
                            <option value="email">Email</option>
                            <option value="whatsapp">WhatsApp</option>
                        </select>

                        {activeTab === 'manual' && (
                            <select
                                value={filterTag}
                                onChange={(e) => setFilterTag(e.target.value)}
                                className="p-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                            >
                                <option value="all">All Tags</option>
                                {allTags.map((tag) => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                        )}

                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="p-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                        >
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </select>

                        <button
                            onClick={clearFilters}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Content based on active tab */}
                {activeTab === 'manual' && (
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-bold text-emerald-700 flex items-center gap-2">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Broadcast Lists
                                    </h3>
                                    <p className="text-emerald-600 mt-1">These are all the Broadcast Lists created</p>
                                </div>
                                <button
                                    onClick={fetchBroadcasts}
                                    disabled={loading}
                                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-md flex items-center gap-2"
                                >
                                    <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    {loading ? 'Refreshing...' : 'Refresh'}
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-gray-200">
                                    <tr>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900">Title</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900">List Name</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900">Channel</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900">Tags</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900">Recipients</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-12">
                                                <div className="flex flex-col items-center">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                                                    <p className="text-gray-500 mt-4">Loading broadcasts...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredBroadcasts.length > 0 ? (
                                        filteredBroadcasts.map((b, idx) => (
                                            <tr key={b._id || idx} className="hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-blue-50/50 transition-all duration-300">
                                                <td className="p-4 text-sm text-gray-900 font-medium">{b.title}</td>
                                                <td className="p-4 text-sm text-gray-600">{b.listName}</td>
                                                <td className="p-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        b.channel === 'email' ? 'bg-blue-100 text-blue-800' :
                                                        b.channel === 'whatsapp' ? 'bg-green-100 text-green-800' :
                                                        'bg-purple-100 text-purple-800'
                                                    }`}>
                                                        {b.channel?.charAt(0).toUpperCase() + b.channel?.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">{(b.tags || []).join(', ') || '-'}</td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => handleViewRecipients(b)}
                                                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                                                    >
                                                        View ({b.recipients?.length || 0})
                                                    </button>
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => {
                                                            setBroadcastToDelete(b._id);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-12">
                                                <div className="flex flex-col items-center">
                                                    <svg className="h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                    </svg>
                                                    <p className="text-lg font-medium text-gray-500">No broadcast lists found</p>
                                                    <p className="text-sm text-gray-400 mt-1">Create your first broadcast list to get started</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'scheduled' && (
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Scheduled Broadcasts
                                    </h3>
                                    <p className="text-blue-600 mt-1">Broadcasts scheduled for future delivery</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={fetchScheduledBroadcasts}
                                        disabled={loading}
                                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-md flex items-center gap-2"
                                    >
                                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        {loading ? 'Refreshing...' : 'Refresh'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                                    <tr>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900">Title</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900">Channel</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900">Scheduled Time</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900">Recipients</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-12">
                                                <div className="flex flex-col items-center">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                                    <p className="text-gray-500 mt-4">Loading scheduled broadcasts...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredScheduledBroadcasts.length > 0 ? (
                                        filteredScheduledBroadcasts.map((b) => (
                                            <tr key={b._id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300">
                                                <td className="p-4 text-sm text-gray-900 font-medium">{b.title}</td>
                                                <td className="p-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        b.channel === 'email' ? 'bg-blue-100 text-blue-800' :
                                                        b.channel === 'whatsapp' ? 'bg-green-100 text-green-800' :
                                                        'bg-purple-100 text-purple-800'
                                                    }`}>
                                                        {b.channel?.charAt(0).toUpperCase() + b.channel?.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600 font-mono">{formatDateTime(b.scheduledTime)}</td>
                                                <td className="p-4 text-sm text-gray-900 font-semibold">
                                                    {/* Display recipient count - prioritize recipientCount field over array length */}
                                                    {(() => {
                                                        // Always use recipientCount if available, as it's the calculated field
                                                        const storedCount = b.recipientCount || 0;
                                                        const actualCount = b.recipients?.length || 0;
                                                        
                                                        // If recipientCount exists and is greater than 0, use it
                                                        if (storedCount > 0) {
                                                            return storedCount;
                                                        }
                                                        
                                                        // Otherwise fall back to array length
                                                        return actualCount;
                                                    })()}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        b.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                                        b.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                                        b.status === 'Sent' ? 'bg-green-100 text-green-800' :
                                                        b.status === 'Failed' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {b.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        {b.status === 'Scheduled' && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedBroadcast(b);
                                                                        setShowScheduleModal(true);
                                                                    }}
                                                                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteBroadcast(b._id)}
                                                                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setBroadcastToDelete(b._id);
                                                                        setDeleteType('scheduled');
                                                                        setShowDeleteModal(true);
                                                                    }}
                                                                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}
                                                        {(b.status === 'Sent' || b.status === 'Failed' || b.status === 'Processing') && (
                                                            <div className="flex gap-2 items-center">
                                                                {b.status === 'Sent' && (
                                                                    <span className="text-green-600 text-sm font-medium">✓ Completed</span>
                                                                )}
                                                                {b.status === 'Failed' && (
                                                                    <span className="text-red-600 text-sm font-medium">✗ Failed</span>
                                                                )}
                                                                {b.status === 'Processing' && (
                                                                    <span className="text-blue-600 text-sm font-medium">⏳ Processing</span>
                                                                )}
                                                                <button
                                                                    onClick={() => {
                                                                        setBroadcastToDelete(b._id);
                                                                        setDeleteType('scheduled');
                                                                        setShowDeleteModal(true);
                                                                    }}
                                                                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-12">
                                                <div className="flex flex-col items-center">
                                                    <svg className="h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p className="text-lg font-medium text-gray-500">No scheduled broadcasts found</p>
                                                    <p className="text-sm text-gray-400 mt-1">Schedule your first broadcast for future delivery</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-bold text-purple-700 flex items-center gap-2">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Message History
                                    </h3>
                                    <p className="text-purple-600 mt-1">Previously sent broadcast messages</p>
                                    <p className="text-purple-500 text-sm mt-2 italic">
                                        💡 "Delivered" means emails were successfully queued by SendGrid. Emails may appear in spam folders - this is normal for new senders.
                                    </p>
                                </div>
                                <button
                                    onClick={fetchMessageHistory}
                                    disabled={loading}
                                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-md flex items-center gap-2"
                                >
                                    <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    {loading ? 'Refreshing...' : 'Refresh'}
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                                    <tr>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900">Title</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900">Channel</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900">Sent At</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900">Recipients</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-12">
                                                <div className="flex flex-col items-center">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                                                    <p className="text-gray-500 mt-4">Loading message history...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredMessageHistory.length > 0 ? (
                                        filteredMessageHistory.map((m) => (
                                            <tr key={m._id} className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-300">
                                                <td className="p-4 text-sm text-gray-900 font-medium">{m.title}</td>
                                                <td className="p-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        m.channel === 'Email' ? 'bg-blue-100 text-blue-800' :
                                                        m.channel === 'WhatsApp' ? 'bg-green-100 text-green-800' :
                                                        'bg-purple-100 text-purple-800'
                                                    }`}>
                                                        {m.channel}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600 font-mono">{formatDateTime(m.sentAt)}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        m.status === 'complete' ? 'bg-green-100 text-green-800' :
                                                        m.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {m.status === 'complete' ? 'Completed' :
                                                         m.status === 'partial' ? 'Partial' : 'Failed'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                                                            {m.recipients ? m.recipients.length : 0} recipients
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleDeleteMessage(m._id)}
                                                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-12">
                                                <div className="flex flex-col items-center">
                                                    <svg className="h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p className="text-lg font-medium text-gray-500">No message history found</p>
                                                    <p className="text-sm text-gray-400 mt-1">Send your first broadcast to see message history</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Recipients Modal */}
            {showRecipientsModal && (
                <BroadcastRecipientsModal
                    onClose={() => setShowRecipientsModal(false)}
                    selectedBroadcast={selectedBroadcast}
                    recipients={recipients}
                />
            )}

            {/* Modals */}
            {showAIPage && (
                <AddBroadcastAI 
                    onClose={() => setShowAIPage(false)} 
                    onBroadcastCreated={() => {
                        fetchBroadcasts();
                        setShowAIPage(false);
                    }}
                />
            )}

            {showDeleteModal && (
                <Modal title="Are you sure you want to delete?" onClose={handleCloseModal}>
                    <div className="space-y-6">
                        <p className="text-gray-700 text-lg">This action cannot be undone.</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={handleCloseModal}
                                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {showManualModal && (
                <Modal title="Add Manual Broadcast" onClose={() => setShowManualModal(false)}>
                    <form onSubmit={handleManualSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                placeholder="Enter broadcast title"
                                value={manualForm.title}
                                onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                                className="w-full p-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                ref={titleInputRef}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">List Name</label>
                            <input
                                type="text"
                                placeholder="Enter list name"
                                value={manualForm.listName}
                                onChange={(e) => setManualForm({ ...manualForm, listName: e.target.value })}
                                className="w-full p-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
                            <select
                                value={manualForm.channel}
                                onChange={(e) => setManualForm({ ...manualForm, channel: e.target.value })}
                                className="w-full p-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            >
                                <option value="Email">Email</option>
                                <option value="WhatsApp">WhatsApp</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                            <input
                                type="text"
                                placeholder="Enter tags (comma-separated)"
                                value={manualForm.tags}
                                onChange={(e) => setManualForm({ ...manualForm, tags: e.target.value })}
                                className="w-full p-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                        >
                            Add Broadcast
                        </button>
                    </form>
                </Modal>
            )}

            {showScheduleModal && (
                <Modal title={selectedBroadcast ? "Edit Scheduled Broadcast" : "Schedule Broadcast"} onClose={() => {
                    setSelectedBroadcast(null);
                    setEmailMessage("");
                    setScheduledTime("");
                    setShowScheduleModal(false);
                }}>
                    {!selectedBroadcast ? (
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Broadcast Group
                            </label>
                            <div className="relative">
                                <select
                                    onChange={(e) => {
                                        const selected = broadcasts.find(b => b._id === e.target.value);
                                        console.log('Selected broadcast from dropdown:', {
                                            id: selected?._id,
                                            title: selected?.title,
                                            recipientsLength: selected?.recipients?.length,
                                            recipients: selected?.recipients
                                        });
                                        setSelectedBroadcast(selected);
                                    }}
                                    className="w-full p-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                                    required
                                >
                                    <option value="">Select a group...</option>
                                    {broadcasts.map((broadcast) => (
                                        <option key={broadcast._id} value={broadcast._id}>
                                            {broadcast.title} ({broadcast.channel})
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-gray-200">
                                <h4 className="text-xl font-bold text-indigo-700 mb-4">{selectedBroadcast.title}</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600 font-medium">List Name</p>
                                        <p className="text-gray-900 font-semibold">{selectedBroadcast.listName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 font-medium">Channel</p>
                                        <p className="text-gray-900 font-semibold">{selectedBroadcast.channel}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 font-medium">Recipients</p>
                                        <p className="text-gray-900 font-semibold">{selectedBroadcast.recipients?.length || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message Content
                                </label>
                                <textarea
                                    value={emailMessage}
                                    onChange={(e) => setEmailMessage(e.target.value)}
                                    placeholder="Write your message here..."
                                    className="w-full p-4 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-40 resize-none"
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex space-x-6">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={sendNow}
                                            onChange={() => setSendNow(true)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-gray-700 font-medium">Send Immediately</span>
                                    </label>
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={!sendNow}
                                            onChange={() => setSendNow(false)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-gray-700 font-medium">Schedule</span>
                                    </label>
                                </div>

                                {!sendNow && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            value={scheduledTime}
                                            onChange={(e) => setScheduledTime(e.target.value)}
                                            min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                                            className="w-full p-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setSelectedBroadcast(null)}
                                    className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
                                >
                                    Back
                                </button>

                                <button
                                    onClick={async () => {
                                        if (sendNow) {
                                            if (!emailMessage.trim()) {
                                                toast.error("Please enter a message");
                                                return;
                                            }
                                            await handleSendNow(selectedBroadcast, emailMessage);
                                        } else {
                                            await handleScheduleSubmit(selectedBroadcast);
                                        }
                                    }}
                                    className={`px-6 py-2 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md ${sendNow
                                        ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                        }`}
                                    disabled={!selectedBroadcast || (!sendNow && !scheduledTime)}
                                >
                                    {sendNow ? 'Send Now' : 'Schedule Broadcast'}
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
}