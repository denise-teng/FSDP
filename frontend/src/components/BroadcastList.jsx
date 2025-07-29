import React, { useState, useEffect, useRef } from 'react';
import axios from '../lib/axios';
import BroadcastRecipientsModal from './BroadcastRecipientsModal';
import AddBroadcastAI from './BroadcastAI';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const Modal = React.memo(({ title, onClose, children }) => {
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full sm:w-[500px]">
                <div className="flex justify-between items-center mb-6 border-b-2 border-gray-600 pb-2">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-white text-xl font-bold hover:text-red-600">X</button>
                </div>
                <div className="space-y-6">{children}</div>
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
    const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'scheduled'
    const [loading, setLoading] = useState(false);

    // Form state for Manual Broadcast
    const [manualForm, setManualForm] = useState({
        title: '',
        listName: '',
        channel: 'Email',
        tags: ''
    });

    // Form state for Scheduled Broadcast
    const [scheduleForm, setScheduleForm] = useState({
        title: '',
        listName: '',
        channel: 'Email',
        tags: '',
        message: '',
        sendNow: true,
        scheduledTime: '',
    });

    const [showManualModal, setShowManualModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [broadcastToDelete, setBroadcastToDelete] = useState(null);

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
            toast.error('Failed to load broadcasts');
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
            toast.error('Failed to load scheduled broadcasts');
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
            setShowRecipientsModal(true);
        } catch (error) {
            toast.error('Failed to load recipients');
        }
    };

    useEffect(() => {
        fetchBroadcasts();
        fetchScheduledBroadcasts();
    }, []);

    const allTags = [...new Set((broadcasts || []).flatMap((b) => b.tags || []))];

    const filteredBroadcasts = broadcasts
        .filter((b) => b.title.toLowerCase().includes(search.toLowerCase()))
        .filter((b) => (filterChannel === 'all' ? true : b.channel === filterChannel))
        .filter((b) => (filterTag === 'all' ? true : (b.tags || []).includes(filterTag)))
        .sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
        });

    const filteredScheduledBroadcasts = scheduledBroadcasts
        .filter(b => b.status === 'Scheduled' || b.status === 'Processing')
        .filter((b) => b.title.toLowerCase().includes(search.toLowerCase()))
        .filter((b) => (filterChannel === 'all' ? true : b.channel === filterChannel))
        .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));

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
                message: emailMessage
            };

            if (!sendNow) {
                requestData.scheduledTime = new Date(scheduledTime).toISOString();
            }

            console.log('Sending request with data:', requestData); // Debug log

            // Make the API call
            const response = await axios.post(
                sendNow ? '/broadcasts/send-now' : '/broadcasts/schedule',
                {
                    broadcastId: broadcast._id,
                    title: broadcast.title, // Add title from the broadcast
                    channel: broadcast.channel, // Add channel from the broadcast
                    message: emailMessage,
                    ...(!sendNow && { scheduledTime: new Date(scheduledTime).toISOString() })
                }
            );

            console.log('API Response:', response.data); // Debug log

            toast.dismiss(loadingToast);
            toast.success(
                sendNow
                    ? `Sent to ${response.data.data?.recipients?.length || 0} recipients`
                    : `Scheduled for ${new Date(scheduledTime).toLocaleString()}`
            );

            // Reset form and refresh data
            setEmailMessage("");
            setScheduledTime("");
            setShowScheduleModal(false);
            await fetchBroadcasts();
            await fetchScheduledBroadcasts();

        } catch (error) {
            toast.dismiss();

            console.error('Full error details:', {
                message: error.message,
                response: error.response?.data,
                request: error.config
            });

            let errorMsg = 'Failed to process broadcast';

            if (error.response) {
                // The request was made and the server responded with a status code
                errorMsg = error.response.data?.error ||
                    error.response.data?.message ||
                    `Server error: ${error.response.status}`;
            } else if (error.request) {
                // The request was made but no response was received
                errorMsg = 'No response from server';
            }

            toast.error(`Error: ${errorMsg}`);
        }
    };

    const handleSendNow = async (broadcast, message) => {
        try {
            toast.loading(`Sending to ${broadcast.recipients?.length} recipients...`);
            await axios.post('/broadcasts/send-now', {
                broadcastId: broadcast._id,
                message,
                accountType: 'user1'
            });
            toast.success('Sent successfully!');
            setShowScheduleModal(false);
            fetchScheduledBroadcasts();
        } catch (error) {
            toast.error(`Failed to send: ${error.message}`);
        }
    };

    const handleDeleteBroadcast = async (broadcastId) => {
        try {
            await axios.delete(`/broadcasts/scheduled/${broadcastId}`);
            setScheduledBroadcasts(prev => prev.filter(b => b._id !== broadcastId));
            toast.success('Scheduled broadcast cancelled');
        } catch (error) {
            toast.error('Failed to cancel scheduled broadcast');
            console.error(error);
        }
    };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`/broadcasts/${broadcastToDelete}`);
            fetchBroadcasts();
            setShowDeleteModal(false);
            toast.success('Broadcast deleted successfully');
        } catch (err) {
            console.error('Error deleting broadcast:', err);
            toast.error('Failed to delete broadcast');
        }
    };

    const handleCloseModal = () => {
        setShowDeleteModal(false);
    };

    const formatDateTime = (dateString) => {
        return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md text-white">
            <h2 className="text-xl font-semibold mb-4 text-emerald-300">Broadcast Management</h2>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-700 mb-6">
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'manual' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setActiveTab('manual')}
                >
                    Manual Broadcasts
                </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-4">
                <button
                    className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md text-white font-medium"
                    onClick={() => setShowManualModal(true)}
                >
                    + Add Broadcast (Manual)
                </button>

                <button
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white font-medium"
                    onClick={() => setShowScheduleModal(true)}
                >
                    + Schedule Broadcast
                </button>

                <button
                    className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-md text-white font-medium"
                    onClick={handleViewAllRecipients}
                >
                    View All Recipients
                </button>

                <button
                    className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-md text-white font-medium"
                    onClick={() => setShowAIPage(true)}
                >
                    + Add Broadcast (AI)
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6 items-center">
                <input
                    type="text"
                    placeholder="Search by title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md w-60"
                />

                <select
                    value={filterChannel}
                    onChange={(e) => setFilterChannel(e.target.value)}
                    className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md"
                >
                    <option value="all">All Channels</option>
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="SMS">SMS</option>
                </select>

                {activeTab === 'manual' && (
                    <select
                        value={filterTag}
                        onChange={(e) => setFilterTag(e.target.value)}
                        className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md"
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
                    className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md"
                >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                </select>

                <button
                    onClick={clearFilters}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-white font-medium"
                >
                    Clear Filters
                </button>
            </div>

            {/* Manual Broadcasts Table */}
            {activeTab === 'manual' && (
                <div className="overflow-x-auto mb-8">
                    <h3 className="text-lg font-semibold text-emerald-300 mb-4">Manual Broadcasts</h3>
                    <table className="w-full text-left bg-gray-900 rounded-md shadow border border-gray-700">
                        <thead className="bg-gray-700 text-emerald-300">
                            <tr>
                                <th className="px-4 py-2">Title</th>
                                <th className="px-4 py-2">List</th>
                                <th className="px-4 py-2">Channel</th>
                                <th className="px-4 py-2">Tags</th>
                                <th className="px-4 py-2">Recipients</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBroadcasts.map((b, idx) => (
                                <tr key={b._id || idx} className="border-t border-gray-700 hover:bg-gray-800">
                                    <td className="px-4 py-2">{b.title}</td>
                                    <td className="px-4 py-2">{b.listName}</td>
                                    <td className="px-4 py-2">{b.channel}</td>
                                    <td className="px-4 py-2">{(b.tags || []).join(', ')}</td>
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => handleViewRecipients(b)}
                                            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-white text-sm"
                                        >
                                            View ({b.recipients?.length || 0})
                                        </button>
                                    </td>
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => {
                                                setBroadcastToDelete(b._id);
                                                setShowDeleteModal(true);
                                            }}
                                            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-white text-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Scheduled Broadcasts Table */}
            {activeTab === 'scheduled' && (
                <div className="overflow-x-auto">
                    <h3 className="text-lg font-semibold text-emerald-300 mb-4">Scheduled Broadcasts</h3>
                    <table className="w-full text-left bg-gray-900 rounded-md shadow border border-gray-700">
                        <thead className="bg-gray-700 text-emerald-300">
                            <tr>
                                <th className="px-4 py-2">Title</th>
                                <th className="px-4 py-2">Channel</th>
                                <th className="px-4 py-2">Scheduled Time</th>
                                <th className="px-4 py-2">Recipients</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredScheduledBroadcasts.map((b) => (
                                <tr key={b._id} className="border-t border-gray-700 hover:bg-gray-800">
                                    <td className="px-4 py-2">{b.title}</td>
                                    <td className="px-4 py-2">{b.channel}</td>
                                    <td className="px-4 py-2">{formatDateTime(b.scheduledTime)}</td>
                                    <td className="px-4 py-2">{b.recipientCount || b.recipients?.length || 0}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 rounded-full text-xs ${b.status === 'Scheduled' ? 'bg-yellow-500 text-yellow-900' :
                                            b.status === 'Processing' ? 'bg-blue-500 text-blue-900' :
                                                'bg-gray-500 text-gray-900'
                                            }`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 space-x-2">
                                        <button
                                            onClick={() => {
                                                setSelectedBroadcast(b);
                                                setShowScheduleModal(true);
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-white text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBroadcast(b._id)}
                                            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-white text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Recipients Modal */}
            {showRecipientsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-emerald-500/20">
                        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900/40 to-gray-800 border-b border-emerald-500/20 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-emerald-400">
                                {selectedBroadcast
                                    ? `Recipients: ${selectedBroadcast.title}`
                                    : 'All Recipients'}
                            </h3>
                            <button
                                onClick={() => setShowRecipientsModal(false)}
                                className="text-emerald-400 hover:text-emerald-300"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 p-6 bg-gray-800/80">
                            <div className="relative overflow-x-auto rounded-lg border border-emerald-500/20">
                                <table className="w-full text-sm text-left text-gray-300">
                                    <thead className="text-xs text-emerald-400 uppercase bg-gray-700/80">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Name</th>
                                            <th scope="col" className="px-6 py-3">Email</th>
                                            <th scope="col" className="px-6 py-3">Phone</th>
                                            {!selectedBroadcast && <th scope="col" className="px-6 py-3">Member Of</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recipients.map((recipient) => (
                                            <tr key={recipient._id} className="border-b border-emerald-500/10 hover:bg-gray-700/50">
                                                <td className="px-6 py-4 font-medium text-emerald-300 whitespace-nowrap">
                                                    {recipient.firstName} {recipient.lastName}
                                                </td>
                                                <td className="px-6 py-4">{recipient.email || '-'}</td>
                                                <td className="px-6 py-4">{recipient.phone || '-'}</td>
                                                {!selectedBroadcast && (
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            {recipient.broadcastGroups?.map(group => (
                                                                <span
                                                                    key={group.id}
                                                                    className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-400/30"
                                                                >
                                                                    {group.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="px-6 py-3 bg-gray-800 border-t border-emerald-500/20 flex justify-end">
                            <button
                                onClick={() => setShowRecipientsModal(false)}
                                className="px-4 py-2 bg-emerald-900/70 text-emerald-300 rounded-lg hover:bg-emerald-800 border border-emerald-500/20"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showAIPage && (
                <AddBroadcastAI onClose={() => setShowAIPage(false)} />
            )}

            {showDeleteModal && (
                <Modal title="Are you sure you want to delete?" onClose={handleCloseModal}>
                    <div className="space-y-4">
                        <p className="text-white">This action cannot be undone.</p>
                        <div className="flex justify-between">
                            <button
                                onClick={handleConfirmDelete}
                                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-white font-medium"
                            >
                                Delete
                            </button>
                            <button
                                onClick={handleCloseModal}
                                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md text-white font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {showManualModal && (
                <Modal title="Add Manual Broadcast" onClose={() => setShowManualModal(false)}>
                    <form onSubmit={handleManualSubmit}>
                        <input
                            type="text"
                            placeholder="Title"
                            value={manualForm.title}
                            onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                            className="w-full p-3 bg-gray-700 text-white rounded-md mb-4"
                            ref={titleInputRef}
                            required
                        />
                        <input
                            type="text"
                            placeholder="List Name"
                            value={manualForm.listName}
                            onChange={(e) => setManualForm({ ...manualForm, listName: e.target.value })}
                            className="w-full p-3 bg-gray-700 text-white rounded-md mb-4"
                            required
                        />
                        <select
                            value={manualForm.channel}
                            onChange={(e) => setManualForm({ ...manualForm, channel: e.target.value })}
                            className="w-full p-3 bg-gray-700 text-white rounded-md mb-4"
                            required
                        >
                            <option value="Email">Email</option>
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="SMS">SMS</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Tags (comma-separated)"
                            value={manualForm.tags}
                            onChange={(e) => setManualForm({ ...manualForm, tags: e.target.value })}
                            className="w-full p-3 bg-gray-700 text-white rounded-md mb-4"
                        />
                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md text-white font-medium">
                            Add Broadcast
                        </button>
                    </form>
                </Modal>
            )}

            {showScheduleModal && (
                <Modal title={selectedBroadcast ? "Edit Scheduled Broadcast" : "Schedule Broadcast"} onClose={() => {
                    setSelectedBroadcast(null);
                    setShowScheduleModal(false);
                }}>
                    {!selectedBroadcast ? (
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Select Broadcast Group
                            </label>
                            <div className="relative">
                                <select
                                    onChange={(e) => {
                                        const selected = broadcasts.find(b => b._id === e.target.value);
                                        setSelectedBroadcast(selected);
                                    }}
                                    className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-1 focus:ring-emerald-500 appearance-none"
                                    required
                                >
                                    <option value="">Select a group...</option>
                                    {broadcasts.map((broadcast) => (
                                        <option key={broadcast._id} value={broadcast._id}>
                                            {broadcast.title} ({broadcast.channel})
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-gray-700/50 p-4 rounded-md border border-gray-600">
                                <h4 className="text-lg font-medium text-emerald-400 mb-2">{selectedBroadcast.title}</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-400">List Name</p>
                                        <p className="text-white">{selectedBroadcast.listName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Channel</p>
                                        <p className="text-white">{selectedBroadcast.channel}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Recipients</p>
                                        <p className="text-white">{selectedBroadcast.recipients?.length || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Message Content
                                </label>
                                <textarea
                                    value={emailMessage}
                                    onChange={(e) => setEmailMessage(e.target.value)}
                                    placeholder="Write your message here..."
                                    className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-1 focus:ring-emerald-500 h-40"
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex space-x-6">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={sendNow}
                                            onChange={() => setSendNow(true)}
                                            className="h-4 w-4 text-emerald-500 focus:ring-emerald-500"
                                        />
                                        <span className="text-gray-300">Send Immediately</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={!sendNow}
                                            onChange={() => setSendNow(false)}
                                            className="h-4 w-4 text-emerald-500 focus:ring-emerald-500"
                                        />
                                        <span className="text-gray-300">Schedule</span>
                                    </label>
                                </div>

                                {!sendNow && (
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Schedule Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            value={scheduledTime}
                                            onChange={(e) => setScheduledTime(e.target.value)}
                                            min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                                            className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-1 focus:ring-emerald-500"
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => setSelectedBroadcast(null)}
                                    className="px-4 py-2 text-gray-300 hover:text-white"
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
                                    className={`px-4 py-2 text-white rounded-md ${sendNow
                                        ? "bg-emerald-600 hover:bg-emerald-500"
                                        : "bg-blue-600 hover:bg-blue-500"
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