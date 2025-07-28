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
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto bg-[#1e293b] shadow-lg rounded-lg p-4 md:p-8">
        <div className="space-y-4 md:space-y-6 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-400">Contact History</h2>
          
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="pl-10 pr-4 py-2 w-full rounded border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg">
          <table className="w-full border border-gray-600 bg-gray-900 text-sm">
            <thead className="bg-gray-700 text-gray-300">
              <tr>
                <th className="p-3 border border-gray-600">ID</th>
                <th className="p-3 border border-gray-600">First Name</th>
                <th className="p-3 border border-gray-600">Last Name</th>
                <th className="p-3 border border-gray-600">Phone No.</th>
                <th className="p-3 border border-gray-600">Email</th>
                <th className="p-3 border border-gray-600">Subject Type</th>
                <th className="p-3 border border-gray-600">Message</th>
                <th className="p-3 border border-gray-600">Date Deleted</th>
                <th className="p-3 border border-gray-600">Action</th>
              </tr>
            </thead>
            
            <tbody>
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <tr key={contact._id} className="border-t border-gray-700 hover:bg-gray-800">
                    <td className="p-3 border border-gray-600 text-center">{contact.contactId}</td>
                    <td className="p-3 border border-gray-600 text-center">{contact.firstName}</td>
                    <td className="p-3 border border-gray-600 text-center">{contact.lastName}</td>
                    <td className="p-3 border border-gray-600">{contact.phone}</td>
                    <td className="p-3 border border-gray-600 text-center">{contact.email}</td>
                    <td className="p-3 border border-gray-600 text-center">{contact.subject}</td>
                    <td className="p-3 border border-gray-600 text-emerald-400 text-center">
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
                        className="underline text-emerald-300 hover:text-emerald-500"
                      >
                        Click to view Message
                      </button>
                    </td>
                    <td className="p-3 border border-gray-600 text-yellow-400 text-sm text-center">
                      {new Date(contact.deletedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="p-3 border border-gray-600 text-center">
                      <button
                        onClick={() => handleRecover(contact._id)}
                        disabled={isRecovering === contact._id}
                        className={`bg-emerald-500 px-2 py-1 rounded hover:bg-emerald-600 text-sm mx-1 ${isRecovering === contact._id ? 'opacity-50' : ''}`}
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
                        className={`bg-red-500 px-2 py-1 rounded hover:bg-red-600 text-sm mx-1 ${isDeleting === contact._id ? 'opacity-50' : ''}`}
                      >
                        {isDeleting === contact._id ? (
                          <Loader2 className="animate-spin h-4 w-4 inline" />
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-gray-400">
                    {contactHistory.length === 0 ? 'No contact history available' : 'No contacts match your search'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeMessage.isViewing && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-[90%] max-w-3xl text-white">
            <h3 className="text-2xl font-bold text-center mb-4 text-emerald-400">
              {activeMessage.name}'s Message
            </h3>
            <p className="text-yellow-400 text-center mb-2">
              Deleted on: {new Date(activeMessage.deletedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
            <div className="border border-emerald-400 bg-gray-900 p-4 rounded mb-6 text-center">
              {activeMessage.message}
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setActiveMessage({...activeMessage, isViewing: false})}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div 
            className="bg-gray-800 p-8 rounded-lg max-w-md w-full mx-4 transform transition-all animate-modal-slide-up shadow-2xl border-2 border-red-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100/10 mb-6 animate-bounce-small">
                <svg
                  className="h-10 w-10 text-red-500"
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
              <h3 className="text-xl font-bold text-red-500 mb-4">⚠️ Permanent Deletion Warning ⚠️</h3>
              
              {/* Message Box */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 space-y-3">
                <p className="text-white font-semibold">This action cannot be undone!</p>
                <p className="text-gray-300 text-sm">
                  You are about to permanently delete this contact from the history. 
                  This means:
                </p>
                <ul className="text-sm text-gray-300 list-disc list-inside space-y-1 text-left">
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
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
