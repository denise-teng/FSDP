import { useEffect, useState } from 'react';
import axios from 'axios';

export default function QuickMessagesTab({ onSelect }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 6;

  useEffect(() => {
    const fetchQuickMessages = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/quick-messages');
        console.log('Fetched quick messages:', res.data);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to load quick messages', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuickMessages();
  }, []);

  // Pagination calculations
  const totalMessages = messages.length;
  const totalPages = Math.ceil(totalMessages / messagesPerPage);
  const startIndex = (currentPage - 1) * messagesPerPage;
  const endIndex = startIndex + messagesPerPage;
  const currentMessages = messages.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">⚡ Loading quick replies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {totalMessages > 0 ? (
        <>
          {/* Enhanced Quick Messages Grid */}
          <div className="grid gap-2">
            {currentMessages.map((msg, index) => (
              <div
                key={msg._id}
                onClick={() => onSelect(msg)}
                className="group bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-102 shadow-md hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 text-sm leading-relaxed line-clamp-3">
                      {msg.content?.trim() ? 
                        msg.content : 
                        <span className="italic text-gray-400">[Empty message - needs content]</span>
                      }
                    </p>
                  </div>
                  
                  {/* Arrow Indicator */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1 rounded-full">
                  📄 Showing {startIndex + 1}-{Math.min(endIndex, totalMessages)} of {totalMessages} quick replies
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:border-green-300 transform hover:scale-105 shadow-md'
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-110'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:border-green-300 transform hover:scale-105'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:border-green-300 transform hover:scale-105 shadow-md'
                    }`}
                  >
                    Next
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Enhanced Empty State */
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-green-100 rounded-2xl mb-6 shadow-lg">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-gray-700 mb-2">No Quick Replies Available</p>
          <p className="text-gray-500 mb-6">Create quick reply templates to speed up your responses</p>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 max-w-md mx-auto">
            <p className="text-sm text-green-700">💡 <strong>Tip:</strong> Quick replies help you respond faster to common inquiries</p>
          </div>
        </div>
      )}
    </div>
  );
}
