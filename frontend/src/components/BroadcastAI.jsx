import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function BroadcastAI({ onClose, onBroadcastCreated }) {
    const [step, setStep] = useState('input'); // 'input', 'preview', 'loading'
    const [url, setUrl] = useState('');
    const [channel, setChannel] = useState('email');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Preview data that user can edit
    const [previewData, setPreviewData] = useState({
        title: '',
        listName: '',
        tags: [],
        topics: [],
        matchedContacts: []
    });
    
    // Editable fields
    const [editableData, setEditableData] = useState({
        title: '',
        listName: '',
        tags: '',
        channel: 'email'
    });

    const handleGeneratePreview = async () => {
        if (!url.trim()) {
            toast.error('Please enter an article URL');
            return;
        }

        setLoading(true);
        setError('');
        setStep('loading');

        try {
            // 1. Fetch article content
            const articleRes = await axios.post('/api/articles/fetch-article', { url });
            
            if (!articleRes.data.content) {
                throw new Error('Failed to fetch valid article content');
            }

            // 2. Get AI analysis
            const aiRes = await axios.post('/api/articles/analyze', {
                articleContent: articleRes.data.content
            });

            if (!aiRes.data.title || !aiRes.data.listName || !aiRes.data.tags) {
                throw new Error('AI response is missing expected fields');
            }

            // 3. Match contacts
            const { title, listName, tags, topics } = aiRes.data;
            const matchedContacts = topics?.length > 0
                ? (await axios.post('/api/broadcasts/match-contacts', { topics })).data
                : [];

            // Set preview data
            setPreviewData({
                title: title || 'Untitled Broadcast',
                listName: listName || 'General Audience',
                tags: Array.isArray(tags) ? tags.slice(0, 3) : ['general'],
                topics: topics || [],
                matchedContacts
            });

            // Set editable data
            setEditableData({
                title: title || 'Untitled Broadcast',
                listName: listName || 'General Audience',
                tags: Array.isArray(tags) ? tags.slice(0, 3).join(', ') : 'general',
                channel
            });

            setStep('preview');

        } catch (err) {
            console.error('Error:', err);
            setError(err.response?.data?.message || err.message || 'Error processing article');
            setStep('input');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBroadcast = async () => {
        setLoading(true);
        
        try {
            const tagsArray = editableData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            
            const response = await axios.post('/api/broadcasts', {
                title: editableData.title,
                listName: editableData.listName,
                channel: editableData.channel.toLowerCase(),
                recipients: previewData.matchedContacts.map(c => c._id),
                tags: tagsArray,
                isAIGenerated: true
            });

            toast.success('AI Broadcast created successfully!');
            onBroadcastCreated?.();
            onClose();

        } catch (err) {
            console.error('Error creating broadcast:', err);
            toast.error(err.response?.data?.message || 'Failed to create broadcast');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setStep('input');
        setError('');
    };

    const handleCancel = () => {
        setStep('input');
        setError('');
        setPreviewData({
            title: '',
            listName: '',
            tags: [],
            topics: [],
            matchedContacts: []
        });
        setEditableData({
            title: '',
            listName: '',
            tags: '',
            channel: 'email'
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">AI Broadcast Generator</h2>
                                <p className="text-purple-100 text-sm">Generate intelligent broadcast lists from articles</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-purple-200 transition-colors duration-200"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-8">
                    
                    {/* Step 1: Input Form */}
                    {step === 'input' && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    Article URL
                                </h3>
                                <input
                                    type="url"
                                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com/article"
                                />
                                <p className="text-sm text-gray-600 mt-2">Paste the URL of the article you want to analyze</p>
                            </div>

                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-2.517-.403l-4.418 1.473a1.5 1.5 0 01-1.943-1.943l1.473-4.418A8.013 8.013 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                                    </svg>
                                    Communication Channel
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {['email', 'whatsapp'].map((channelOption) => (
                                        <label key={channelOption} className="relative">
                                            <input
                                                type="radio"
                                                name="channel"
                                                value={channelOption}
                                                checked={channel === channelOption}
                                                onChange={(e) => setChannel(e.target.value)}
                                                className="sr-only"
                                            />
                                            <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center ${
                                                channel === channelOption
                                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                                            }`}>
                                                <div className="font-medium capitalize">{channelOption}</div>
                                                {channel === channelOption && (
                                                    <svg className="h-4 w-4 text-purple-600 mx-auto mt-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <svg className="h-5 w-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-red-800">{error}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleGeneratePreview}
                                    disabled={!url.trim() || loading}
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-8 py-3 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center"
                                >
                                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    Generate Preview
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {step === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mt-6">Analyzing Article</h3>
                            <p className="text-gray-600 mt-2">AI is processing your content and finding relevant contacts...</p>
                            <div className="flex space-x-1 mt-4">
                                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Preview & Edit */}
                    {step === 'preview' && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Preview & Edit Broadcast Details
                                </h3>
                                <p className="text-gray-600 mb-6">Review and modify the AI-generated broadcast details before creating</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Broadcast Title</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                                            value={editableData.title}
                                            onChange={(e) => setEditableData({...editableData, title: e.target.value})}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">List Name</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                                            value={editableData.listName}
                                            onChange={(e) => setEditableData({...editableData, listName: e.target.value})}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                                            value={editableData.tags}
                                            onChange={(e) => setEditableData({...editableData, tags: e.target.value})}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
                                        <select
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                                            value={editableData.channel}
                                            onChange={(e) => setEditableData({...editableData, channel: e.target.value})}
                                        >
                                            <option value="email">Email</option>
                                            <option value="whatsapp">WhatsApp</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Matched Contacts */}
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                                <div className="border-b border-gray-200 px-6 py-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                        <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Matched Contacts ({previewData.matchedContacts.length})
                                    </h3>
                                    <p className="text-gray-600 text-sm mt-1">Contacts that match the article topics</p>
                                </div>
                                
                                {previewData.matchedContacts.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {previewData.matchedContacts.slice(0, 10).map((contact, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                                            {contact.firstName} {contact.lastName}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{contact.email}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{contact.subject}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-wrap gap-1">
                                                                {(contact.tags || []).slice(0, 3).map((tag, tagIdx) => (
                                                                    <span key={tagIdx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {previewData.matchedContacts.length > 10 && (
                                            <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600">
                                                And {previewData.matchedContacts.length - 10} more contacts...
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center">
                                        <svg className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <p className="text-gray-600">No matching contacts found for this article</p>
                                        <p className="text-gray-500 text-sm mt-1">The broadcast will be created without any recipients</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between">
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleBack}
                                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium flex items-center"
                                    >
                                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Back
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="px-6 py-3 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors duration-200 font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                                
                                <button
                                    onClick={handleCreateBroadcast}
                                    disabled={loading || !editableData.title.trim() || !editableData.listName.trim()}
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 py-3 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Create Broadcast
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
