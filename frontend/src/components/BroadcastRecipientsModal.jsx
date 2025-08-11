import { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

export default function BroadcastRecipientsModal({ onClose, selectedBroadcast, recipients: propRecipients }) {
  const [recipients, setRecipients] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedRow, setEditedRow] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recipientsPerPage = 10;

  useEffect(() => {
    if (propRecipients) {
      // Add auto-generated IDs if they don't exist
      const recipientsWithIds = propRecipients.map((recipient, index) => ({
        ...recipient,
        contactId: recipient.contactId || (index + 1)
      }));
      setRecipients(recipientsWithIds);
    } else {
      fetchAllRecipients();
    }
  }, [propRecipients]);

  const fetchAllRecipients = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/contacts/shared-contacts');
      console.log('✅ Fetched contacts:', res.data);
      
      // Add auto-generated IDs if they don't exist
      const recipientsWithIds = res.data.map((recipient, index) => ({
        ...recipient,
        contactId: recipient.contactId || (index + 1)
      }));
      
      setRecipients(recipientsWithIds);
    } catch (err) {
      console.error('❌ Failed to fetch contacts:', err);
      toast.error('Failed to load recipients');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (recipient) => {
    setEditingId(recipient._id);
    setEditedRow({ ...recipient });
  };

  const saveEdit = async () => {
    try {
      // If this is connected to backend, you could save here
      setRecipients((prev) =>
        prev.map((r) => (r._id === editingId ? editedRow : r))
      );
      setEditingId(null);
      toast.success('Recipient updated successfully');
    } catch (error) {
      toast.error('Failed to update recipient');
    }
  };

  const deleteRecipient = async (id) => {
    try {
      setRecipients((prev) => prev.filter((r) => r._id !== id));
      if (editingId === id) setEditingId(null);
      toast.success('Recipient removed successfully');
    } catch (error) {
      toast.error('Failed to remove recipient');
    }
  };

  // Filter recipients based on search
  const filteredRecipients = recipients.filter(recipient => 
    recipient.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    recipient.lastName?.toLowerCase().includes(search.toLowerCase()) ||
    recipient.email?.toLowerCase().includes(search.toLowerCase()) ||
    recipient.phone?.includes(search) ||
    recipient.subject?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const indexOfLastRecipient = currentPage * recipientsPerPage;
  const indexOfFirstRecipient = indexOfLastRecipient - recipientsPerPage;
  const currentRecipients = filteredRecipients.slice(indexOfFirstRecipient, indexOfLastRecipient);
  const totalPages = Math.ceil(filteredRecipients.length / recipientsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-7xl rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedBroadcast ? `${selectedBroadcast.title} Recipients` : 'Broadcast Recipients'}
                </h2>
                <p className="text-indigo-100 text-sm">
                  {filteredRecipients.length} total recipients
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-indigo-200 transition-colors duration-200"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search recipients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Page {currentPage} of {totalPages}</span>
              <span>•</span>
              <span>{filteredRecipients.length} recipients</span>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Loading recipients...</span>
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-sm">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="p-4 text-center text-sm font-semibold text-gray-900">ID</th>
                    <th className="p-4 text-center text-sm font-semibold text-gray-900">First Name</th>
                    <th className="p-4 text-center text-sm font-semibold text-gray-900">Last Name</th>
                    <th className="p-4 text-center text-sm font-semibold text-gray-900">Phone No.</th>
                    <th className="p-4 text-center text-sm font-semibold text-gray-900">Email</th>
                    <th className="p-4 text-center text-sm font-semibold text-gray-900">Subject Type</th>
                    <th className="p-4 text-center text-sm font-semibold text-gray-900">Channel</th>
                    <th className="p-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentRecipients.length > 0 ? (
                    currentRecipients.map((r) => (
                      <tr key={r._id} className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300">
                        <td className="p-4 text-sm text-gray-900 font-medium text-center">
                          {r.contactId}
                        </td>
                        
                        {editingId === r._id ? (
                          <>
                            <td className="p-4">
                              <input 
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                value={editedRow.firstName || ''} 
                                onChange={(e) => setEditedRow({ ...editedRow, firstName: e.target.value })} 
                              />
                            </td>
                            <td className="p-4">
                              <input 
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                value={editedRow.lastName || ''} 
                                onChange={(e) => setEditedRow({ ...editedRow, lastName: e.target.value })} 
                              />
                            </td>
                            <td className="p-4">
                              <input 
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 font-mono"
                                value={editedRow.phone || ''} 
                                onChange={(e) => setEditedRow({ ...editedRow, phone: e.target.value })} 
                              />
                            </td>
                            <td className="p-4">
                              <input 
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                value={editedRow.email || ''} 
                                onChange={(e) => setEditedRow({ ...editedRow, email: e.target.value })} 
                              />
                            </td>
                            <td className="p-4">
                              <input 
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                value={editedRow.subject || ''} 
                                onChange={(e) => setEditedRow({ ...editedRow, subject: e.target.value })} 
                              />
                            </td>
                            <td className="p-4">
                              <select 
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                value={editedRow.channel || ''} 
                                onChange={(e) => setEditedRow({ ...editedRow, channel: e.target.value })}
                              >
                                <option value="">Select Channel</option>
                                <option value="email">Email</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="sms">SMS</option>
                              </select>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-4 text-sm text-gray-900">{r.firstName}</td>
                            <td className="p-4 text-sm text-gray-900">{r.lastName}</td>
                            <td className="p-4 text-sm text-gray-900 font-mono">{r.phone}</td>
                            <td className="p-4 text-sm text-gray-600">{r.email}</td>
                            <td className="p-4 text-sm text-gray-900">{r.subject}</td>
                            <td className="p-4 text-sm text-gray-900">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                r.channel === 'email' ? 'bg-blue-100 text-blue-800' :
                                r.channel === 'whatsapp' ? 'bg-green-100 text-green-800' :
                                r.channel === 'sms' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {r.channel || '—'}
                              </span>
                            </td>
                          </>
                        )}
                        
                        <td className="p-4">
                          <div className="flex items-center justify-center space-x-2">
                            {editingId === r._id ? (
                              <>
                                <button 
                                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                                  onClick={saveEdit}
                                >
                                  Save
                                </button>
                                <button 
                                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                                  onClick={() => setEditingId(null)}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                                  onClick={() => startEdit(r)}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                                  onClick={() => deleteRecipient(r._id)}
                                >
                                  Remove
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <svg className="h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="text-lg font-medium text-gray-500">No recipients found</p>
                          <p className="text-gray-400 text-sm mt-1">
                            {search ? 'Try adjusting your search criteria' : 'This broadcast has no recipients yet'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstRecipient + 1} to {Math.min(indexOfLastRecipient, filteredRecipients.length)} of {filteredRecipients.length} recipients
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      currentPage === index + 1
                        ? 'bg-indigo-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
