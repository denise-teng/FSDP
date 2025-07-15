import { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import QuickMessagesTab from './tabs/QuickMessagesTab';

export default function WhatsAppReplyTabsModal({ onClose, onSelect }) {
  const [activeTab, setActiveTab] = useState('quick');
  const [manualText, setManualText] = useState('');
  const [aiReplies, setAIReplies] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchAIReplies = async () => {
    setAiLoading(true);
    setAIReplies([]);
    try {
      const res = await axios.post('/api/ai-replies', {
        message: 'Hi, I’m interested in your services.',
      });
      setAIReplies(res.data.replies);
    } catch (err) {
      console.error('Failed to fetch AI replies:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const renderContent = () => {
    if (activeTab === 'quick') {
      return (
        <QuickMessagesTab
          onSelect={(msg) => {
            onClose();
            onSelect(msg);
          }}
        />
      );
    } else if (activeTab === 'manual') {
      return (
        <div className="space-y-4">
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            rows={6}
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
            placeholder="Type your reply here..."
          />
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (manualText.trim()) {
                  onClose();
                  onSelect({ content: manualText, source: 'Manual Reply' });
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded text-white font-semibold"
            >
              Send
            </button>
          </div>
        </div>
      );
    } else if (activeTab === 'ai') {
      return (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {aiLoading ? (
            <p className="text-gray-300">Generating smart replies...</p>
          ) : aiReplies.length === 0 ? (
            <div className="text-center text-gray-400">
              <p>No suggestions yet.</p>
              <button
                onClick={fetchAIReplies}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-white"
              >
                Generate Suggestions
              </button>
            </div>
          ) : (
            aiReplies.map((reply, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onClose();
                  onSelect({ content: reply, source: 'AI Suggested' });
                }}
                className="bg-gray-700 hover:bg-emerald-700 p-3 rounded cursor-pointer text-white text-sm"
              >
                {reply}
              </div>
            ))
          )}
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-3xl shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-center text-white mb-6">WhatsApp Reply</h2>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab('quick')}
            className={`px-4 py-2 rounded ${
              activeTab === 'quick' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Quick Replies
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 rounded ${
              activeTab === 'manual' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Manual Reply
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 rounded ${
              activeTab === 'ai' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            AI Suggested Replies
          </button>
        </div>

        <div className="bg-gray-800 p-4 rounded">{renderContent()}</div>
      </div>
    </div>
  );
}
