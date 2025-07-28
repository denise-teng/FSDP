import { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import QuickMessagesTab from './tabs/QuickMessagesTab';

export default function WhatsAppReplyTabsModal({ 
  onClose, 
  onSelect, 
  contactMessage, 
  contactSubject,
  contactName 
}) {
  const [activeTab, setActiveTab] = useState('quick');
  const [manualText, setManualText] = useState('');
  const [aiReplies, setAIReplies] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAIReplies = async () => {
    setAiLoading(true);
    setError(null);
    setAIReplies([]);

    try {
      // Check if we have the required data
      if (!contactMessage || !contactSubject) {
        throw new Error('Missing contact message or subject');
      }

      const response = await axios.post('/api/ai-replies', {
        message: contactMessage,
        subject: contactSubject,
        name: contactName || '' // Make name optional
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Handle different possible response formats
      let suggestions = [];
      
      if (Array.isArray(response.data)) {
        suggestions = response.data;
      } else if (response.data?.suggestions) {
        suggestions = response.data.suggestions;
      } else if (response.data?.message) {
        suggestions = [response.data.message];
      } else {
        suggestions = ['No reply generated'];
      }

      setAIReplies(suggestions);
    } catch (err) {
      console.error('Failed to fetch AI replies:', {
        error: err,
        config: err.config,
        response: err.response
      });
      
      setError(err.response?.data?.message || 
               err.message || 
               'Failed to generate suggestions. Please try again.');
      
      // Set fallback suggestions
      setAIReplies([
        `Thank you for your message about ${contactSubject}. We'll respond shortly.`,
        `We've received your ${contactSubject} inquiry and will get back to you soon.`,
        `Regarding your ${contactSubject} question: Please contact us for more details.`
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelect = (msg) => {
    onClose();
    onSelect(msg);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'quick':
        return <QuickMessagesTab onSelect={handleSelect} />;
      case 'manual':
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
                onClick={() => manualText.trim() && handleSelect({ content: manualText, source: 'Manual Reply' })}
                className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded text-white font-semibold"
                disabled={!manualText.trim()}
              >
                Send
              </button>
            </div>
          </div>
        );
      case 'ai':
        return (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {error && (
              <div className="text-red-400 p-2 bg-red-900/30 rounded">
                {error}
              </div>
            )}
            
            {aiLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-400"></div>
                <span className="text-gray-300">Generating smart replies...</span>
              </div>
            ) : aiReplies.length === 0 ? (
              <div className="text-center text-gray-400">
                <p>No suggestions yet.</p>
                <button
                  onClick={fetchAIReplies}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-white"
                  disabled={aiLoading}
                >
                  Generate Suggestions
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={fetchAIReplies}
                  className="mb-2 bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded text-white text-sm"
                  disabled={aiLoading}
                >
                  Regenerate
                </button>
                {aiReplies.map((reply, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelect({ content: reply, source: 'AI Suggested' })}
                    className="bg-gray-700 hover:bg-emerald-700 p-3 rounded cursor-pointer text-white text-sm"
                  >
                    {reply}
                  </div>
                ))}
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-3xl shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-center text-white mb-6">WhatsApp Reply</h2>

        <div className="flex justify-center gap-4 mb-6">
          {['quick', 'manual', 'ai'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded capitalize ${
                activeTab === tab ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              {tab === 'quick' ? 'Quick Replies' : 
               tab === 'manual' ? 'Manual Reply' : 'AI Suggested Replies'}
            </button>
          ))}
        </div>

        <div className="bg-gray-800 p-4 rounded">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}