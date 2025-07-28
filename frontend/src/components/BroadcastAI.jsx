import { useState } from 'react';
import axios from 'axios'; // To make API calls

export default function BroadcastAI({ onClose }) {
    const [url, setUrl] = useState('');
    const [channel, setChannel] = useState('Email'); // Default to 'Email'
    const [generatedList, setGeneratedList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Handle Article URL Input
    const handleUrlChange = (e) => {
        setUrl(e.target.value);
    };

    // Match users with relevant topics
    const matchUsersWithTopics = async (topics) => {
        try {
            const response = await axios.post('/api/broadcasts/match-contacts', { topics });
            return response.data;
        } catch (error) {
            console.error('Error matching contacts:', error);
            return [];
        }
    };

    const handleGenerateList = async () => {
        setLoading(true);
        setError('');

        try {
            // 1. Fetch article content
            const articleRes = await axios.post('/api/articles/fetch-article', { url });
            console.log('Fetched Article Content:', articleRes.data.content);  // Check if content is correct

            if (!articleRes.data.content) {
                setError('Failed to fetch valid article content.');
                setLoading(false);
                return;
            }

            // 2. Get AI analysis
            const aiRes = await axios.post('/api/articles/analyze', {
                articleContent: articleRes.data.content
            });

            console.log('AI Analysis Response:', aiRes.data);  // Log the full response

            // Ensure the expected response fields are present
            if (!aiRes.data.title || !aiRes.data.listName || !aiRes.data.tags) {
                setError('AI response is missing expected fields.');
                setLoading(false);
                return;
            }

            // Extract data from the AI response
            const { title, listName, tags, topics } = aiRes.data;
            console.log('Extracted AI Data:', { title, listName, tags, topics });

            // Ensure tags exist and are properly formatted
            const safeTags = Array.isArray(tags) ? tags.slice(0, 3) : ['general'];

            // 3. Match contacts (only if we have topics)
            const matchedContacts = topics?.length > 0
                ? (await axios.post('/api/broadcasts/match-contacts', {
                    topics
                })).data
                : [];

            // 4. Create broadcast
            const saveResponse = await axios.post('/api/broadcasts/ai', {
                title: title || `Untitled Broadcast`,
                listName: listName || 'General Audience',  // Use the listName (audience) as the audience for the broadcast
                channel: channel.toLowerCase(),
                recipients: matchedContacts.map(c => c._id),
                tags: safeTags,
                isAIGenerated: true
            });

            setGeneratedList(matchedContacts);
            console.log('Broadcast created:', saveResponse.data);

        } catch (err) {
            console.error('Error:', err);
            setError(err.response?.data?.message || err.message || 'Error processing article');
        } finally {
            setLoading(false);
        }
    };





    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 text-white w-full max-w-6xl rounded-2xl p-6 overflow-auto max-h-[90vh] shadow-lg border border-emerald-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-emerald-400">Generate Broadcast List (AI)</h2>
                    <button onClick={onClose} className="text-red-400 font-semibold hover:underline">Close</button>
                </div>

                {/* Form Inputs */}
                <form className="space-y-4">
                    <div className="mb-4">
                        <label className="block mb-2">Paste the Article URL</label>
                        <input
                            type="text"
                            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                            value={url}
                            onChange={handleUrlChange}
                            placeholder="Enter the article URL here..."
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">Select Channel</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="channel"
                                    value="Email"
                                    checked={channel === 'Email'}
                                    onChange={(e) => setChannel(e.target.value)}
                                    className="text-emerald-500"
                                />
                                Email
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="channel"
                                    value="WhatsApp"
                                    checked={channel === 'WhatsApp'}
                                    onChange={(e) => setChannel(e.target.value)}
                                    className="text-emerald-500"
                                />
                                WhatsApp
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="channel"
                                    value="SMS"
                                    checked={channel === 'SMS'}
                                    onChange={(e) => setChannel(e.target.value)}
                                    className="text-emerald-500"
                                />
                                SMS
                            </label>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGenerateList}
                        className="bg-green-500 text-white px-4 py-2 rounded mb-4 w-full"
                    >
                        Generate Broadcast List
                    </button>

                    {loading && <p className="text-center text-white">Generating...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                </form>

                {/* Display Generated List (Sample Data) */}
                {generatedList.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-emerald-400 mb-2">Generated Broadcast List</h3>
                        <table className="w-full text-sm mb-4">
                            <thead className="bg-emerald-700 text-white">
                                <tr>
                                    <th className="px-3 py-2">First Name</th>
                                    <th className="px-3 py-2">Last Name</th>
                                    <th className="px-3 py-2">Email</th>
                                    <th className="px-3 py-2">Subject</th>
                                    <th className="px-3 py-2">Channel</th>
                                    <th className="px-3 py-2">Tags</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800">
                                {generatedList.map((r, idx) => (
                                    <tr key={idx} className="border-b border-gray-700">
                                        <td className="px-3 py-2">{r.firstName}</td>
                                        <td className="px-3 py-2">{r.lastName}</td>
                                        <td className="px-3 py-2">{r.email}</td>
                                        <td className="px-3 py-2">{r.subject}</td>
                                        <td className="px-3 py-2">{r.channel}</td>
                                        <td className="px-3 py-2">{r.tags.join(', ')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
