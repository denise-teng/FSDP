import React, { useState, useEffect, useRef } from 'react';
import axios from '../lib/axios';   
import BroadcastRecipientsModal from './BroadcastRecipientsModal'; // For Recipients List
import AddBroadcastAI from './BroadcastAI'; // For AI Broadcast Generation

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

    const titleInputRef = useRef(null);

    // Fetch all broadcasts
    const fetchBroadcasts = async () => {
        try {
            const res = await axios.get('/broadcasts');
            setBroadcasts(res.data);
        } catch (error) {
            console.error('Error fetching broadcasts:', error);
        }
    };

    useEffect(() => {
        fetchBroadcasts();
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

    const clearFilters = () => {
        setSearch('');
        setFilterChannel('all');
        setFilterTag('all');
        setSortOrder('desc');
    };

    // Handle submitting the manual broadcast form
    const handleManualSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/broadcasts', {
                ...manualForm,
                tags: manualForm.tags.split(',').map((t) => t.trim()),  // Split and trim tags
                scheduledTime: new Date().toISOString(),  // Add scheduled time to the broadcast
            });
            fetchBroadcasts(); // Fetch updated list of broadcasts
            setManualForm({ title: '', listName: '', channel: 'Email', tags: '' }); // Reset form
            setShowManualModal(false); // Close modal
        } catch (err) {
            console.error('Broadcast sending failed:', err);
            alert('Failed to send broadcast');
        }
    };

    // Handle submitting the scheduled broadcast form
    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = scheduleForm.sendNow
                ? '/broadcasts'
                : '/api/scheduled-broadcasts/schedule';

            await axios.post(endpoint, {
                ...scheduleForm,
                tags: scheduleForm.tags.split(',').map((t) => t.trim()),  // Split and trim tags
                scheduledTime: new Date().toISOString(),
            });

            fetchBroadcasts(); // Fetch updated list of broadcasts
            setScheduleForm({ title: '', listName: '', channel: 'Email', tags: '', message: '', scheduledTime: '', sendNow: true });
            setShowScheduleModal(false); // Close modal
        } catch (err) {
            console.error('Broadcast sending/scheduling failed:', err);
            alert('Failed to send or schedule broadcast');
        }
    };

    // Manage focus handling (focus input when modal opens)
    useEffect(() => {
        if (showManualModal || showScheduleModal) {
            titleInputRef.current?.focus();
        }
    }, [showManualModal, showScheduleModal]);

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md text-white">
            <h2 className="text-xl font-semibold mb-4 text-emerald-300">Broadcast List</h2>

            <div className="flex flex-wrap gap-4 mb-4">
                <button
                    className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md text-white font-medium"
                    onClick={() => setShowManualModal(true)} // Show manual broadcast modal
                >
                    + Add Broadcast (Manual)
                </button>

                <button
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white font-medium"
                    onClick={() => setShowScheduleModal(true)} // Show schedule broadcast modal
                >
                    + Schedule Broadcast
                </button>

                <button
                    className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-md text-white font-medium"
                    onClick={() => setShowRecipientsModal(true)} // Show Recipients Modal
                >
                    View All Recipients
                </button>

                <button
                    className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-md text-white font-medium"
                    onClick={() => setShowAIPage(true)} // Show AI Broadcast Modal
                >
                    + Add Broadcast (AI)
                </button>
            </div>

            {/* Search / Filter / Sort Controls */}
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
            <div className="overflow-x-auto">
                <h3 className="text-lg font-semibold text-emerald-300">Manual Broadcasts</h3>
                <table className="w-full text-left bg-gray-900 rounded-md shadow border border-gray-700">
                    <thead className="bg-gray-700 text-emerald-300">
                        <tr>
                            <th className="px-4 py-2">Title</th>
                            <th className="px-4 py-2">List</th>
                            <th className="px-4 py-2">Channel</th>
                            <th className="px-4 py-2">Tags</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBroadcasts.map((b, idx) => (
                            <tr key={b._id || idx} className="border-t border-gray-700 hover:bg-gray-800">
                                <td className="px-4 py-2">{b.title}</td>
                                <td className="px-4 py-2">{b.listName}</td>
                                <td className="px-4 py-2">{b.channel}</td>
                                <td className="px-4 py-2">{(b.tags || []).join(', ')}</td>
                            </tr>
                        ))}
                        {filteredBroadcasts.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center text-gray-400 py-4">No broadcasts found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {showRecipientsModal && (
                <BroadcastRecipientsModal onClose={() => setShowRecipientsModal(false)} />
            )}

            {showAIPage && (
                <AddBroadcastAI onClose={() => setShowAIPage(false)} />
            )}

            {/* Manual Broadcast Modal */}
            {showManualModal && (
                <Modal title="Add Manual Broadcast" onClose={() => setShowManualModal(false)}>
                    <form onSubmit={handleManualSubmit}>
                        <input
                            type="text"
                            placeholder="Title"
                            value={manualForm.title}
                            onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                            className="w-full p-3 bg-gray-700 text-white rounded-md mb-4"
                        />
                        <input
                            type="text"
                            placeholder="List Name"
                            value={manualForm.listName}
                            onChange={(e) => setManualForm({ ...manualForm, listName: e.target.value })}
                            className="w-full p-3 bg-gray-700 text-white rounded-md mb-4"
                        />
                        <select
                            value={manualForm.channel}
                            onChange={(e) => setManualForm({ ...manualForm, channel: e.target.value })}
                            className="w-full p-3 bg-gray-700 text-white rounded-md mb-4"
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
                            Send Broadcast
                        </button>
                    </form>
                </Modal>
            )}

            {/* Schedule Broadcast Modal */}
            {showScheduleModal && (
                <Modal title="Schedule Broadcast" onClose={() => setShowScheduleModal(false)}>
                    <form onSubmit={handleScheduleSubmit}>
                        <input
                            type="text"
                            placeholder="Title"
                            value={scheduleForm.title}
                            onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                            className="w-full p-2 bg-gray-700 text-white rounded-md mb-3"  // Reduced padding
                        />
                        <input
                            type="text"
                            placeholder="List Name"
                            value={scheduleForm.listName}
                            onChange={(e) => setScheduleForm({ ...scheduleForm, listName: e.target.value })}
                            className="w-full p-2 bg-gray-700 text-white rounded-md mb-3"  // Reduced padding
                        />
                        <select
                            value={scheduleForm.channel}
                            onChange={(e) => setScheduleForm({ ...scheduleForm, channel: e.target.value })}
                            className="w-full p-2 bg-gray-700 text-white rounded-md mb-3"  // Reduced padding
                        >
                            <option value="Email">Email</option>
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="SMS">SMS</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Tags (comma-separated)"
                            value={scheduleForm.tags}
                            onChange={(e) => setScheduleForm({ ...scheduleForm, tags: e.target.value })}
                            className="w-full p-2 bg-gray-700 text-white rounded-md mb-3"  // Reduced padding
                        />
                        {/* Radio buttons to choose between Send Now or Schedule Later */}
                        <div className="flex items-center gap-3 mb-3">  
                            <label className="text-white">Send Now</label>
                            <input
                                type="radio"
                                checked={scheduleForm.sendNow}
                                onChange={() => setScheduleForm({ ...scheduleForm, sendNow: true })}
                            />
                            <label className="text-white">Schedule Later</label>
                            <input
                                type="radio"
                                checked={!scheduleForm.sendNow}
                                onChange={() => setScheduleForm({ ...scheduleForm, sendNow: false })}
                            />
                        </div>
                        {/* Show the scheduled time picker if "Schedule Later" is selected */}
                        {!scheduleForm.sendNow && (
                            <div>
                                <label className="text-white">Schedule Time</label>
                                <input
                                    type="datetime-local"
                                    value={scheduleForm.scheduledTime}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledTime: e.target.value })}
                                    className="w-full p-2 bg-gray-700 text-white rounded-md mb-3"  // Reduced padding
                                />
                            </div>
                        )}
                        {/* Message text box */}
                        <textarea
                            placeholder="Enter your message here..."
                            value={scheduleForm.message}
                            onChange={(e) => setScheduleForm({ ...scheduleForm, message: e.target.value })}
                            className="w-full p-2 bg-gray-700 text-white rounded-md mb-4 resize-none"  // Reduced padding and size
                            rows="4"  // Reduced rows for smaller textarea
                        />
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white font-medium">
                            {scheduleForm.sendNow ? 'Send Broadcast' : 'Save Scheduled Broadcast'}
                        </button>
                    </form>
                </Modal>
            )}

        </div>
    );
}
