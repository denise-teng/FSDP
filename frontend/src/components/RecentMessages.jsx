import { useEffect, useState } from 'react';
import axios from '../lib/axios';

export default function RecentMessages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/broadcasts/recent')
            .then(res => {
                console.log(' Recent messages response:', res.data);
                setMessages(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(' Error fetching recent broadcasts:', err);
                setLoading(false);
            });
    }, []);

    const todayMessages = messages
        ?.filter(msg => msg.createdAt)
        ?.filter(msg => new Date(msg.createdAt).toDateString() === new Date().toDateString()) || [];

    return (
        <div className="mt-10">
            <h3 className="text-lg font-semibold text-emerald-300 mb-3">Recent Messages</h3>

            {loading ? (
                <p className="text-gray-400">Loading recent messages...</p>
            ) : (
                <table className="w-full text-left bg-gray-900 rounded-md shadow border border-gray-700">
                    <thead className="bg-gray-700 text-emerald-300">
                        <tr>
                            <th className="px-4 py-2">Message Title</th>
                            <th className="px-4 py-2">List</th>
                            <th className="px-4 py-2">Date Sent</th>
                            <th className="px-4 py-2">Delivered</th>
                            <th className="px-4 py-2">Failed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {todayMessages.length > 0 ? (
                            todayMessages.map((msg, idx) => (
                                <tr key={msg._id || idx} className="border-t border-gray-700 hover:bg-gray-800">
                                    <td className="px-4 py-2">{msg.title || '-'}</td>
                                    <td className="px-4 py-2">{msg.listName || '-'}</td>
                                    <td className="px-4 py-2">
                                        {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-4 py-2">{msg.delivered ?? 20}</td>
                                    <td className="px-4 py-2">{msg.failed ?? 0}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center text-gray-400 py-4">
                                    No recent messages found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}
