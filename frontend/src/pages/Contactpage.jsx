// ContactPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AddContactModal from '../components/AddContactModal';
import ReplyMethodModal from '../components/ReplyMethodModal';
import { Star, StarOff } from 'lucide-react';
import WhatsAppReplyTabsModal from '../components/WhatsAppReplyTabsModal';
import FinalMessageEditModal from '../components/FinalMessageEditModal';
import EmailReplyModal from '../components/EmailReplyModal';
import BroadcastMenu from '../components/BroadcastMenu';

export default function ContactPage() {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [contacts, setContacts] = useState([]);
  const [showBroadcastMenu, setShowBroadcastMenu] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [activeMessage, setActiveMessage] = useState({ name: '', message: '', phone: '' });
  const [editContact, setEditContact] = useState(null);
  const [deleteContactId, setDeleteContactId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [potentialClients, setPotentialClients] = useState([]);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showWhatsAppTabs, setShowWhatsAppTabs] = useState(false);
  const [finalMessage, setFinalMessage] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 15;

  const FLAGGED_KEYWORDS = ['schedule', 'meeting', 'help', 'urgent'];

  const checkForFlaggedKeywords = (message) => {
    const messageLower = message.toLowerCase();
    const flagged = FLAGGED_KEYWORDS.filter(keyword => messageLower.includes(keyword));
    return flagged.length ? flagged : null;
  };


  useEffect(() => {
    fetchContacts();
    fetchPotentialClients();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await axios.get('/api/contacts');
      setContacts(res.data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  const handleReply = (contact) => {
  setContactEmail(contact.email);
  setActiveMessage({
    phone: contact.phone,
    name: `${contact.firstName} ${contact.lastName}`,
    message: contact.message || "No message provided", // Fallback if empty
    subject: contact.subject || "General Inquiry"     // Fallback if empty
  });
  setShowReplyModal(true);
};

  const handleSelectedReply = (msg) => {
    setShowWhatsAppTabs(false);
    
    // Get phone number (common for both paths)
    if (!activeMessage.phone) {
      toast.error('No phone number available for this contact');
      return;
    }
    
    const cleanedPhoneNumber = activeMessage.phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(msg.content || msg.message);
    
    // For manual replies, go directly to WhatsApp with refresh fix
    if (msg.source === 'Manual Reply') {
      // Add timestamp to force refresh
      const uniqueUrl = `https://wa.me/${cleanedPhoneNumber}?text=${encodedMessage}&ts=${Date.now()}`;
      
      // Close previous window if exists
      if (window.waWindow) {
        window.waWindow.close();
      }
      
      // Open new window and store reference
      window.waWindow = window.open(uniqueUrl, "_blank");
      return;
    }
    
    // For quick/AI messages, show final edit modal
    setFinalMessage({
      content: msg.content || msg.message,
      source: msg.source || 'Quick Message',
      phone: activeMessage.phone,
      name: activeMessage.name
    });
  };

  const fetchPotentialClients = async () => {
    try {
      const res = await axios.get('/api/potential-clients');
      setPotentialClients(res.data);
    } catch (err) {
      console.error('Failed to fetch potential clients:', err);
    }
  };

  const isStarred = (contact) => {
    return potentialClients.some((pc) => pc.contactId === contact.contactId);
  };

  const filteredContacts = contacts
  .filter(c =>
    (c.firstName + ' ' + c.lastName).toLowerCase().includes(search.toLowerCase()) &&
    (!subjectFilter || c.subject.toLowerCase() === subjectFilter.toLowerCase())
  )
  .sort((a, b) => (a.contactId || 0) - (b.contactId || 0));

  // Pagination calculations
  const totalContacts = filteredContacts.length;
  const totalPages = Math.ceil(totalContacts / contactsPerPage);
  const startIndex = (currentPage - 1) * contactsPerPage;
  const endIndex = startIndex + contactsPerPage;
  const currentContacts = filteredContacts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, subjectFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of table when page changes
    document.querySelector('.contacts-table')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`/api/contacts/${editContact._id}`, editContact);
      setContacts(prev => prev.map(c => (c._id === editContact._id ? editContact : c)));
      setEditContact(null);
      toast.success('Contact updated successfully!');
    } catch (err) {
      console.error('Error updating contact:', err);
      toast.error('Failed to update contact.');
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100/50 p-8 mb-8 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>
          
          <div className="relative flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-bold mb-3">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  📝 Form Contacts
                </span>
              </h2>
              <p className="text-gray-600 text-lg">Manage and respond to customer inquiries from contact forms</p>
            </div>
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters and Actions Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-6 mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-4 flex-wrap">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="pl-10 pr-4 py-3 w-64 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className={`p-3 w-64 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm ${
                  subjectFilter === '' ? 'text-gray-500' : 'text-gray-900'
                } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300`}
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <option value="">📋 Select Subject Type</option>
                <option value="General Inquiry">💬 General Inquiry</option>
                <option value="Investment Strategy Discussion">💰 Investment Strategy Discussion</option>
                <option value="Retirement Planning Consultation">🏖️ Retirement Planning Consultation</option>
                <option value="Estate/Legacy Planning">🏛️ Estate/Legacy Planning</option>
                <option value="Insurance Policy Review">🛡️ Insurance Policy Review</option>
                <option value="Corporate Financial Seminar Inquiry">🏢 Corporate Financial Seminar Inquiry</option>
                <option value="Others">📝 Others</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              {/* Enhanced Results Info */}
              <div className="text-sm text-gray-600 bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-full">
                📊 Showing {startIndex + 1}-{Math.min(endIndex, totalContacts)} of {totalContacts} contacts
              </div>
              
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Contact
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Contacts Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden contacts-table">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
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
                  <th className="p-4 text-center text-sm font-semibold text-gray-900">
                    Subject Type
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-900">
                    Message
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentContacts.length > 0 ? (
                  currentContacts.map((c) => (
                    <tr key={c._id} className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300">
                      <td className="p-4 text-sm text-gray-900 font-medium">{c.contactId || '-'}</td>
                      <td className="p-4 text-sm text-gray-900">{c.firstName}</td>
                      <td className="p-4 text-sm text-gray-900">{c.lastName}</td>
                      <td className="p-4 text-sm text-gray-900 font-mono">{c.phone}</td>
                      <td className="p-4 text-sm text-gray-600">{c.email}</td>
                      <td className="p-4 text-sm text-gray-900">{c.subject}</td>
                      <td className="p-4 text-sm">
                        <button
                          onClick={() => {
                            // Only set message viewing related state
                            setActiveMessage({
                              name: `${c.firstName} ${c.lastName}`,
                              message: c.message,
                              phone: c.phone,
                              subject: c.subject,
                              isViewing: true  // Add this flag
                            });
                          }}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-2.5 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                        >
                          View
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1">
                          {isStarred(c) ? (
                            <Star className="text-yellow-400 w-6 h-6" title="Potential Client" />
                          ) : (
                            <StarOff
                              className="text-gray-400 w-6 h-6 cursor-pointer hover:text-yellow-400 transition-colors"
                              title="Mark as Potential Client"
                              onClick={async () => {
                                try {
                                  await axios.post('/api/potential-clients', {
                                    contactId: c.contactId,
                                    firstName: c.firstName,
                                    lastName: c.lastName,
                                    email: c.email,
                                    phone: c.phone,
                                    subject: c.subject,
                                    message: c.message,
                                    reason: 'Manually flagged by admin.',
                                  });
                                  fetchPotentialClients();
                                  toast.success('Added to potential clients');
                                } catch (err) {
                                  console.error('Failed to add to potential clients:', err);
                                  toast.error('Failed to add client');
                                }
                              }}
                            />
                          )}
                          <button 
                            onClick={() => {
                              setSelectedContactId(c._id);
                              setShowBroadcastMenu(true);
                            }} 
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-2.5 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md flex items-center gap-1"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                            Broadcast
                          </button>
                          <button 
                            onClick={() => setEditContact(c)} 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-2.5 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              console.log('Contact data before reply:', {  // Debug log
                                message: c.message,
                                subject: c.subject,
                                name: `${c.firstName} ${c.lastName}`,
                                phone: c.phone
                              });
                              
                              setContactEmail(c.email);
                              setActiveMessage({
                                phone: c.phone,
                                name: `${c.firstName} ${c.lastName}`,
                                message: c.message,          // Ensure message exists
                                subject: c.subject           // Ensure subject exists
                              });
                              setShowReplyModal(true);
                            }}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-2.5 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                          >
                            Reply
                          </button>
                          <button
                            onClick={() => setDeleteContactId(c._id)} // Set the contact ID to trigger the confirmation modal
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-2.5 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-500">No contacts available</p>
                        <p className="text-sm text-gray-400 mt-1">Get started by adding your first contact</p>
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

      {showAddModal && (
        <AddContactModal
          onClose={() => {
            setShowAddModal(false);
            fetchContacts();
          }}
        />
      )}

      {activeMessage.isViewing && activeMessage.message && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-[90%] max-w-3xl border border-gray-200">
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-900">
              {activeMessage.name}'s Message
            </h3>
            <div className="border border-gray-200 bg-gray-50 p-6 rounded-lg mb-6">
              <p className="text-gray-700 leading-relaxed">{activeMessage.message}</p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setActiveMessage({ name: '', message: '', phone: '', subject: '', isViewing: false })}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {editContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200/50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -translate-y-10 translate-x-10 opacity-40"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full translate-y-8 -translate-x-8 opacity-30"></div>
            
            <div className="relative">
              {/* Enhanced Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-3 shadow-lg transform rotate-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Edit Contact
                  </span>
                </h3>
                <p className="text-gray-600 text-sm">Update contact information</p>
              </div>

              {/* Enhanced Form */}
              <div className="space-y-4">
                {['firstName', 'lastName', 'phone', 'email'].map((field) => (
                  <div key={field} className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize flex items-center gap-2">
                      {field === 'firstName' && <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                      {field === 'lastName' && <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                      {field === 'phone' && <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                      {field === 'email' && <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                      {field.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 rounded-xl border border-gray-200/50 bg-white/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 group-hover:border-indigo-300"
                      value={editContact[field]}
                      onChange={(e) => setEditContact({ ...editContact, [field]: e.target.value })}
                      placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                    />
                  </div>
                ))}
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Subject Type
                  </label>
                  <select
                    className="w-full p-3 rounded-xl border border-gray-200/50 bg-white/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 group-hover:border-indigo-300"
                    value={editContact.subject}
                    onChange={(e) => setEditContact({ ...editContact, subject: e.target.value })}
                  >
                    <option value="">Select Subject Type</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Investment Strategy Discussion">Investment Strategy Discussion</option>
                    <option value="Retirement Planning Consultation">Retirement Planning Consultation</option>
                    <option value="Estate/Legacy Planning">Estate/Legacy Planning</option>
                    <option value="Insurance Policy Review">Insurance Policy Review</option>
                    <option value="Corporate Financial Seminar Inquiry">Corporate Financial Seminar Inquiry</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Message
                  </label>
                  <textarea
                    className="w-full p-3 rounded-xl border border-gray-200/50 bg-white/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 group-hover:border-indigo-300 resize-none"
                    rows="3"
                    value={editContact.message}
                    onChange={(e) => setEditContact({ ...editContact, message: e.target.value })}
                    placeholder="Enter message content..."
                  />
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex justify-center gap-3 mt-6">
                <button 
                  onClick={() => setEditContact(null)} 
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </span>
                </button>
                <button 
                  onClick={handleUpdate} 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteContactId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center border border-gray-200 max-w-md mx-4">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Contact</h3>
              <p className="text-gray-600">Are you sure you want to delete this contact? This action cannot be undone.</p>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteContactId(null)} // Cancel action
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const contact = contacts.find(c => c._id === deleteContactId);

                    // Delete the contact - the backend will handle archiving
                    const deleteRes = await axios.delete(`/api/contacts/${contact._id}`);

                    // Check if deletion was successful
                    if (deleteRes.status !== 200) {
                      throw new Error('Failed to delete contact');
                    }

                    // Update UI after deleting
                    setContacts(prev => prev.filter(c => c._id !== contact._id));  // Remove contact from list

                    // Close modal and show success message
                    setDeleteContactId(null); // Close confirmation modal
                    toast.success('Contact deleted successfully');

                  } catch (err) {
                    console.error("DELETE ERROR:", err.response?.data || err.message);
                    toast.error(
                      err.response?.data?.message || 
                      "Server error. Check console for details."
                    );

                    // Refresh list as fallback to make sure UI is consistent
                    fetchContacts();
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}


      {showReplyModal && (
        <ReplyMethodModal
          onClose={() => setShowReplyModal(false)}
          onSelect={(method) => {
            setShowReplyModal(false);
            if (method === 'whatsapp') {
              setShowWhatsAppTabs(true);
            } else if (method === 'email') {
              setShowEmailModal(true);
            }
          }}
          contactEmail={contactEmail}
          contactPhone={activeMessage.phone} // Pass the phone number
          contactName={activeMessage.name} // Pass the name
        />
      )}

      {showEmailModal && (
        <EmailReplyModal
          onClose={() => setShowEmailModal(false)}
          contactEmail={contactEmail}
        />
      )}

      {showWhatsAppTabs && (
        <WhatsAppReplyTabsModal
          onClose={() => setShowWhatsAppTabs(false)}
          onSelect={handleSelectedReply}
          contactMessage={activeMessage.message}
          contactSubject={activeMessage.subject}
          contactName={activeMessage.name}
        />
      )}

      {activeMessage.message && activeMessage.isViewing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-200/50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-40"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full translate-y-12 -translate-x-12 opacity-30"></div>
            
            <div className="relative">
              {/* Enhanced Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg transform rotate-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {activeMessage.name}'s Message
                  </span>
                </h3>
                <p className="text-gray-600">Contact inquiry details</p>
              </div>

              {/* Enhanced Subject Info */}
              <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200/50 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-indigo-800">Subject Type</p>
                    <p className="text-sm text-indigo-600">{activeMessage.subject}</p>
                  </div>
                </div>
              </div>

              {/* Enhanced Message Display */}
              <div className="mb-8 p-8 bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-xl border border-gray-200/50 shadow-inner">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
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
                  onClick={() => setActiveMessage({ ...activeMessage, isViewing: false })}
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

      {finalMessage && (
        <FinalMessageEditModal
          initialContent={finalMessage.content}
          contactName={finalMessage.name}
          onClose={() => setFinalMessage(null)}
          onSend={(editedText) => {
            const cleanedPhoneNumber = finalMessage.phone.replace(/\D/g, '');
            const encodedMessage = encodeURIComponent(editedText);
            window.open(`https://wa.me/${cleanedPhoneNumber}?text=${encodedMessage}`, "_blank");
            setFinalMessage(null);
          }}
          onBack={() => {
            setFinalMessage(null);
            setShowWhatsAppTabs(true);
          }}
        />
      )}

      {/* Broadcast Menu */}
      <BroadcastMenu
        isOpen={showBroadcastMenu}
        onClose={() => {
          setShowBroadcastMenu(false);
          setSelectedContactId(null);
        }}
        contactId={selectedContactId}
      />
    </div>
  );
}