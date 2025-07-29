import { useState, useEffect } from 'react';
import { Pencil, Trash2, MessageSquare } from 'lucide-react';
import AddEditQuickMessageModal from '../components/AddEditQuickMessageModal';
import { useQuickMessageStore } from '../stores/useQuickMessageStore';
import Navbar from '../components/Navbar';

export default function QuickMessagesPage() {
  const { messages, fetchMessages, deleteMessage } = useQuickMessageStore();
  const [showModal, setShowModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 6;

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Pagination calculations
  const totalMessages = messages.length;
  const totalPages = Math.ceil(totalMessages / messagesPerPage);
  const startIndex = (currentPage - 1) * messagesPerPage;
  const endIndex = startIndex + messagesPerPage;
  const currentMessages = messages.slice(startIndex, endIndex);

  // Reset to first page when messages change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [messages, currentPage, totalPages]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    document.querySelector('.messages-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEdit = (msg) => {
    setEditingMessage(msg);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteMessage(deletingMessageId);
      setDeletingMessageId(null);
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="pt-20 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section with Enhanced Styling */}
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100/50 p-8 mb-8 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>
            
            <div className="relative flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Quick Messages
                  </span>
                </h2>
                <p className="text-gray-600 text-lg">Manage your quick message templates for faster responses</p>
              </div>
              <div className="relative">
                <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Enhanced Actions Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 mb-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                <div className="text-gray-700 font-medium">
                  <span className="text-2xl font-bold text-indigo-600">{totalMessages}</span>
                  <span className="ml-2">quick message{totalMessages !== 1 ? 's' : ''} total</span>
                  {totalMessages > 0 && (
                    <span className="ml-2 text-gray-500">
                      • Showing {startIndex + 1}-{Math.min(endIndex, totalMessages)} of {totalMessages}
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => {
                  setEditingMessage(null);
                  setShowModal(true);
                }}
                className="group relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-2xl">+</span>
                  New Message
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>

          {/* Enhanced Messages List */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden messages-container">
            {currentMessages.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {currentMessages.map((msg, index) => (
                  <div 
                    key={msg._id} 
                    className="group relative p-4 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-blue-50/50 transition-all duration-300 transform hover:scale-[1.01]"
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    {/* Message card with enhanced styling */}
                    <div className="relative">
                      {/* Decorative element */}
                      <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-indigo-500 via-purple-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-4">
                          {/* Message content with enhanced typography */}
                          <div className="relative bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg font-medium">
                              {msg.content}
                            </p>
                            {/* Subtle highlight effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/20 to-blue-100/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        </div>
                        
                        {/* Enhanced action buttons */}
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleEdit(msg)} 
                            title="Edit Message"
                            className="group/btn relative p-3 text-blue-500 hover:text-white bg-blue-50 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                          >
                            <Pencil className="w-5 h-5 relative z-10" />
                            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                          </button>
                          <button 
                            onClick={() => setDeletingMessageId(msg._id)} 
                            title="Delete Message"
                            className="group/btn relative p-3 text-red-500 hover:text-white bg-red-50 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                          >
                            <Trash2 className="w-5 h-5 relative z-10" />
                            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="flex flex-col items-center">
                  {/* Enhanced empty state */}
                  <div className="relative mb-6">
                    <div className="h-24 w-24 bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 rounded-full flex items-center justify-center shadow-lg">
                      <MessageSquare className="h-12 w-12 text-indigo-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">No quick messages yet</h3>
                  <p className="text-gray-500 text-lg mb-6 max-w-md">Create your first quick message template to streamline your communication</p>
                  <button
                    onClick={() => {
                      setEditingMessage(null);
                      setShowModal(true);
                    }}
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    Create First Message
                  </button>
                </div>
              </div>
            )}
            
            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 font-medium">
                    Page {currentPage} of {totalPages}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 shadow-sm hover:shadow-md transform hover:scale-105'
                      }`}
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                              currentPage === pageNum
                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg transform scale-105'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 shadow-sm hover:shadow-md transform hover:scale-105'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 shadow-sm hover:shadow-md transform hover:scale-105'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <AddEditQuickMessageModal
          message={editingMessage}
          onClose={() => setShowModal(false)}
          onSaved={fetchMessages}
        />
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {deletingMessageId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full mx-4 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100 to-pink-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
            
            <div className="relative p-8 text-center">
              <div className="mb-6">
                {/* Enhanced icon with animation */}
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-red-100 to-red-200 mb-4 animate-pulse">
                  <Trash2 className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Delete Quick Message</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Are you sure you want to delete this quick message? This action cannot be undone.</p>
              </div>
              
              {/* Enhanced buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setDeletingMessageId(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
