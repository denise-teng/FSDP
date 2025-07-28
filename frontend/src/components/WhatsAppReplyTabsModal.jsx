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

  const fetchAIReplies = async (retryCount = 0) => {
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
        timeout: 30000, // Increased to 30 second timeout
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
        response: err.response,
        retryCount
      });
      
      // Handle timeout errors with retry logic
      if (err.code === 'ECONNABORTED' && retryCount < 2) {
        console.log(`Timeout occurred, retrying... (${retryCount + 1}/2)`);
        return fetchAIReplies(retryCount + 1);
      }
      
      let errorMessage = 'Failed to generate suggestions. Please try again.';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. The AI service may be busy. Please try again in a moment.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error occurred. Please try again later.';
      } else if (err.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
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
          <div className="space-y-6">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Compose your personalized reply
              </label>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                rows={6}
                className="w-full p-4 rounded-xl border border-gray-200/50 bg-white/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-300 resize-none"
                placeholder="Type your personal message here..."
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => manualText.trim() && handleSelect({ content: manualText, source: 'Manual Reply' })}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={!manualText.trim()}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Reply
                </span>
              </button>
            </div>
          </div>
        );
      case 'ai':
        return (
          <div className="space-y-6">
            {error && (
              <div className="text-red-600 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl shadow-md">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <strong>Error:</strong> {error}
                </div>
              </div>
            )}
            
            {aiLoading ? (
              <div className="flex items-center justify-center gap-3 py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <span className="text-gray-600 font-semibold">🤖 Generating smart replies...</span>
              </div>
            ) : aiReplies.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-gray-700 font-semibold mb-2">AI-Powered Reply Suggestions</p>
                <p className="text-gray-600 mb-6">Let our AI create personalized responses based on the contact's message</p>
                <button
                  onClick={fetchAIReplies}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  disabled={aiLoading}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Smart Suggestions
                  </span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h4 className="font-semibold text-gray-800">AI-Generated Suggestions</h4>
                  </div>
                  <button
                    onClick={fetchAIReplies}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md text-sm font-medium"
                    disabled={aiLoading}
                  >
                    🔄 Regenerate
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto space-y-3">
                  {aiReplies.map((reply, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelect({ content: reply, source: 'AI Suggested' })}
                      className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-102 shadow-md hover:shadow-lg group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 text-sm leading-relaxed">{reply}</p>
                          <p className="text-xs text-purple-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Click to use this suggestion</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl w-full max-w-5xl shadow-2xl relative max-h-[90vh] overflow-y-auto border border-gray-200/50 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-100 to-purple-100 rounded-full translate-y-12 -translate-x-12 opacity-30"></div>
        
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 bg-white/80 backdrop-blur-sm rounded-full p-2 transition-all duration-300 hover:bg-white shadow-lg z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Enhanced Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg transform rotate-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                WhatsApp Reply Options
              </span>
            </h2>
            <p className="text-gray-600">Choose your preferred method to craft the perfect response</p>
          </div>

          {/* Enhanced Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            {['quick', 'manual', 'ai'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl capitalize font-semibold transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                    : 'bg-white/50 backdrop-blur-sm text-gray-700 hover:bg-white/80 border border-gray-200/50 shadow-md'
                }`}
              >
                {tab === 'quick' ? '⚡ Quick Replies' : 
                 tab === 'manual' ? '✏️ Manual Reply' : '🤖 AI Suggested Replies'}
              </button>
            ))}
          </div>

          {/* Enhanced Content Area */}
          <div className="bg-white/50 backdrop-blur-sm border border-gray-200/50 p-6 rounded-2xl shadow-inner">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}