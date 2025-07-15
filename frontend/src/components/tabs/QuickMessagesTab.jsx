import { useEffect, useState } from 'react';
import axios from 'axios';

export default function QuickMessagesTab({ onSelect }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchQuickMessages = async () => {
      try {
        const res = await axios.get('/api/quick-messages');
        console.log('Fetched quick messages:', res.data); // ✅ Debug log
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to load quick messages', err);
      }
    };
    fetchQuickMessages();
  }, []);

  return (
    <div className="max-h-96 overflow-y-auto space-y-2">
      {messages.length > 0 ? (
        messages.map((msg) => (
          <div
            key={msg._id}
            onClick={() => onSelect(msg)}
            className="bg-gray-700 hover:bg-emerald-700 p-3 rounded cursor-pointer text-white text-sm"
            >
            {msg.content?.trim() ? msg.content : <span className="italic text-gray-400">[Empty message]</span>}
            </div>
        ))
      ) : (
        <p className="text-gray-400 text-center">No quick messages found.</p>
      )}
    </div>
  );
}
