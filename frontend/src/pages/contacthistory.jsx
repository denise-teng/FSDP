import React, { useState, useEffect } from 'react';
import useContactHistoryStore from '../stores/useContacthistoryStore';
import { toast } from 'react-hot-toast';
import { Loader2, Search } from 'lucide-react';

export default function ContactHistoryPage() {
  const [search, setSearch] = useState('');
  const [isDeleting, setIsDeleting] = useState(null);
  const [isRecovering, setIsRecovering] = useState(null);
  const [activeMessage, setActiveMessage] = useState({
    name: '',
    message: '',
    phone: '',
    subject: '',
    deletedAt: '',
    isViewing: false
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 15;
  
  const { 
    contactHistory, 
    loading, 
    error, 
    fetchContactHistory, 
    deleteContactPermanently, 
    recoverContact 
  } = useContactHistoryStore();

  useEffect(() => {
    fetchContactHistory();
  }, [fetchContactHistory]);

  const filteredContacts = contactHistory
    .filter(c => {
      const searchTerm = search.toLowerCase();
      return (
        c.firstName.toLowerCase().includes(searchTerm) ||
        c.lastName.toLowerCase().includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm) ||
        c.phone.includes(search)
      );
    })
    .sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));

  // Pagination calculations
  const totalContacts = filteredContacts.length;
  const totalPages = Math.ceil(totalContacts / contactsPerPage);
  const startIndex = (currentPage - 1) * contactsPerPage;
  const endIndex = startIndex + contactsPerPage;
  const currentContacts = filteredContacts.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    document.querySelector('.contact-history-table')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRecover = async (id) => {
    setIsRecovering(id);
    try {
      // Recover contact: move it back to the main ContactPage
      await recoverContact(id);
      toast.success('Contact recovered successfully');
    } catch (err) {
      toast.error('Failed to recover contact');
    } finally {
      setIsRecovering(null);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);

  const handleDelete = async (id) => {
    setContactToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(contactToDelete);
    try {
      // Permanently delete contact
      await deleteContactPermanently(contactToDelete);
      toast.success('Contact permanently deleted');
      setShowDeleteModal(false);
      setContactToDelete(null);
    } catch (err) {
      toast.error('Failed to delete contact');
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin h-12 w-12 text-emerald-500" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-red-500 text-lg">{error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100/50 p-6 md:p-8 mb-8 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>
          
          <div className="relative flex justify-between items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  📚 Contact History
                </span>
              </h2>
              <p className="text-gray-600 text-lg">Manage deleted contacts - recover or permanently remove</p>
            </div>
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-br from-emerald-500 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Search Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-6 mb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            {/* Enhanced Results Info */}
            <div className="text-sm text-gray-600 bg-gradient-to-r from-emerald-100 to-blue-100 px-4 py-2 rounded-full">
              🗂️ Showing {startIndex + 1}-{Math.min(endIndex, totalContacts)} of {totalContacts} deleted contacts
            </div>
          </div>
        </div>

        {/* Enhanced Contact History Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden contact-history-table">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-center text-sm font-semibold text-gray-900">
                    ID
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-900">
                    First Name
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-900">
                    Last Name
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-900">
                    Phone No.
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-900 w-32">
                    Subject Type
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-900">
                    Message
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-900 w-32">
                    Date Deleted
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-100">
                {currentContacts.length > 0 ? (
                  currentContacts.map((contact) => (
                    <tr key={contact._id} className="hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-blue-50/50 transition-all duration-300">
                      <td className="p-4 text-sm text-gray-900 font-medium">{contact.contactId}</td>
                      <td className="p-4 text-sm text-gray-900">{contact.firstName}</td>
                      <td className="p-4 text-sm text-gray-900">{contact.lastName}</td>
                      <td className="p-4 text-sm text-gray-900 font-mono">{contact.phone}</td>
                      <td className="p-4 text-sm text-gray-600">{contact.email}</td>
                      <td className="p-4 text-sm text-gray-900">{contact.subject}</td>
                      <td className="p-4 text-sm">
                        <button
                          onClick={() => {
                            setActiveMessage({
                              name: `${contact.firstName} ${contact.lastName}`,
                              message: contact.message,
                              phone: contact.phone,
                              subject: contact.subject,
                              deletedAt: contact.deletedAt,
                              isViewing: true
                            });
                          }}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-2.5 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                        >
                          View
                        </button>
                      </td>
                      <td className="p-4 text-sm text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {new Date(contact.deletedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleRecover(contact._id)}
                            disabled={isRecovering === contact._id}
                            className={`bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-2.5 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md ${isRecovering === contact._id ? 'opacity-50' : ''}`}
                          >
                            {isRecovering === contact._id ? (
                              <Loader2 className="animate-spin h-4 w-4 inline" />
                            ) : (
                              'Recover'
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(contact._id)}
                            disabled={isDeleting === contact._id}
                            className={`bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-2.5 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md ${isDeleting === contact._id ? 'opacity-50' : ''}`}
                          >
                            {isDeleting === contact._id ? (
                              <Loader2 className="animate-spin h-4 w-4 inline" />
                            ) : (
                              'Delete'
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-500">
                          {contactHistory.length === 0 ? 'No contact history available' : 'No contacts match your search'}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {contactHistory.length === 0 ? 'Deleted contacts will appear here' : 'Try adjusting your search terms'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 7) {
                        pageNum = i + 1;
                      } else if (currentPage <= 4) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        pageNum = totalPages - 6 + i;
                      } else {
                        pageNum = currentPage - 3 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
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
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
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

      {activeMessage.isViewing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-200/50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-40"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full translate-y-12 -translate-x-12 opacity-30"></div>
            
            <div className="relative">
              {/* Enhanced Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl mb-4 shadow-lg transform rotate-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {activeMessage.name}'s Message
                  </span>
                </h3>
                <p className="text-gray-600">Deleted contact message details</p>
              </div>

              {/* Enhanced Deletion Info */}
              <div className="mb-6 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200/50 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-red-800">Contact Deleted</p>
                    <p className="text-sm text-red-600">
                      <strong>Deleted on:</strong> {new Date(activeMessage.deletedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Message Display */}
              <div className="mb-8 p-8 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border border-gray-200/50 shadow-inner">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Message Content</h4>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border border-gray-200/50">
                  <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">{activeMessage.message}</p>
                </div>
              </div>

              {/* Enhanced Close Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => setActiveMessage({...activeMessage, isViewing: false})}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Close
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="bg-white p-8 rounded-xl max-w-md w-full mx-4 shadow-2xl border border-red-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <svg
                  className="h-10 w-10 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-red-600 mb-4">⚠️ Permanent Deletion Warning ⚠️</h3>
              
              {/* Message Box */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 space-y-3">
                <p className="text-gray-900 font-semibold">This action cannot be undone!</p>
                <p className="text-gray-700 text-sm">
                  You are about to permanently delete this contact from the history. 
                  This means:
                </p>
                <ul className="text-sm text-gray-700 list-disc list-inside space-y-1 text-left">
                  <li>All contact information will be permanently removed</li>
                  <li>Message history will be deleted forever</li>
                  <li>This data cannot be recovered once deleted</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setContactToDelete(null);
                  }}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="animate-spin h-4 w-4 inline mr-2" />
                  ) : null}
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
