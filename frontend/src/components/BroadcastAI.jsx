import { useState } from 'react';

export default function BroadcastAI({ onClose }) {
    const [url, setUrl] = useState('');
    const [channel, setChannel] = useState('Email'); // Default to 'Email'
    const [generatedList, setGeneratedList] = useState([
        { firstName: 'Brandon', lastName: 'Koh', email: 'brandon@example.com', subject: 'Estate Planning', channel: 'Email', tags: ['Retirement', 'Financial Planning'] },
        { firstName: 'Lisa', lastName: 'Manoban', email: 'lisa@example.com', subject: 'Insurance Policy', channel: 'WhatsApp', tags: ['Insurance', 'Policy'] },
        { firstName: 'Jennie', lastName: 'Kim', email: 'jennie@example.com', subject: 'Retirement Plan', channel: 'SMS', tags: ['Retirement', 'Finance'] },
    ]);

    const handleGenerateList = () => {
        console.log('Generating list for URL:', url);
        // Dummy data is already being shown for now.
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
                            onChange={(e) => setUrl(e.target.value)}
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
                </form>

                {/* Display Generated List (Dummy Data) */}
                <div>
                    <h3 className="text-lg font-semibold text-emerald-400 mb-2">Generated Broadcast List (Sample)</h3>
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
            </div>
        </div>
    );
}
