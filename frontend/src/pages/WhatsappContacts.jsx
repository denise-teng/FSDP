import React, { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';
import AddWhatsAppContactModal from '../components/AddWhatsAppContactModal';
import ReplyMethodModal from '../components/ReplyMethodModal';
import WhatsAppReplyTabsModal from '../components/WhatsAppReplyTabsModal';
import FinalMessageEditModal from '../components/FinalMessageEditModal';


export default function WhatsAppContacts() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [deleteContactId, setDeleteContactId] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showWhatsAppTabs, setShowWhatsAppTabs] = useState(false);
  const [finalMessage, setFinalMessage] = useState(null);
  const [activeMessage, setActiveMessage] = useState({
    name: '',
    message: '',
    phone: '',
    subject: '',
    isViewing: false
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 15;

  const fetchContacts = async () => {
    try {
      const res = await axios.get('/whatsapp-contacts');
      const sorted = res.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setContacts(sorted);
    } catch (err) {
      toast.error('Failed to fetch contacts');
    }
  };

  const handleSelectedReply = (msg) => {
    setShowWhatsAppTabs(false);
    
    // For manual replies and quick/AI messages
    if (!activeMessage.phone) {
      toast.error('No phone number available for this contact');
      return;
    }
      
    const cleanedPhoneNumber = activeMessage.phone.replace(/\D/g, '');
    const content = msg.content || msg.message || '';
    const encodedMessage = encodeURIComponent(content);
    const uniqueUrl = `https://wa.me/${cleanedPhoneNumber}?text=${encodedMessage}&ts=${Date.now()}`;
    
    // For manual replies, go directly to WhatsApp
    if (msg.source === 'Manual Reply') {
      if (window.waWindow) {
        window.waWindow.close();
      }
      window.waWindow = window.open(uniqueUrl, "_blank");
      toast.success('Opening WhatsApp...');
      return;
    }
    
    // For quick/AI messages, show final edit modal
    setFinalMessage({
      content: content,
      source: msg.source || 'Quick Message',
      phone: activeMessage.phone,
      name: activeMessage.name
    });
  };



  const deleteContact = async () => {
    try {
      await axios.delete(`/whatsapp-contacts/${deleteContactId}`);
      toast.success('Contact deleted successfully');
      setDeleteContactId(null);
      fetchContacts();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`/whatsapp-contacts/${editContact._id}`, editContact);
      toast.success('Contact updated');
      setEditContact(null);
      fetchContacts();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter((c) =>
    (c.firstName + ' ' + c.lastName).toLowerCase().includes(search.toLowerCase())
  );

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
    document.querySelector('.whatsapp-contacts-table')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100/50 p-8 mb-8 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100 to-emerald-100 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>
          
          <div className="relative flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-bold mb-3">
                <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  WhatsApp Contacts
                </span>
              </h2>
              <p className="text-gray-600 text-lg">Manage your WhatsApp event contacts and leads</p>
            </div>
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-br from-green-500 via-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Actions Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-6 mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="pl-10 pr-4 py-3 w-64 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Enhanced Results Info */}
              <div className="text-sm text-gray-600 bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-1 rounded-full">
                📊 Showing {startIndex + 1}-{Math.min(endIndex, totalContacts)} of {totalContacts} contacts
              </div>
              
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
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
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden whatsapp-contacts-table">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
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
                    Company
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-900">
                    Event Name
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-900">
                    Event Date
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentContacts.length > 0 ? (
                  currentContacts.map((c, index) => (
                    <tr key={c._id} className="hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 transition-all duration-300">
                      <td className="p-4 text-sm text-gray-900 font-medium">{contacts.findIndex(item => item._id === c._id) + 1}</td>
                      <td className="p-4 text-sm text-gray-900">{c.firstName}</td>
                      <td className="p-4 text-sm text-gray-900">{c.lastName}</td>
                      <td className="p-4 text-sm text-gray-900 font-mono">{c.phone}</td>
                      <td className="p-4 text-sm text-gray-600">{c.email}</td>
                      <td className="p-4 text-sm text-gray-900">{c.company}</td>
                      <td className="p-4 text-sm text-gray-900">{c.eventName}</td>
                      <td className="p-4 text-sm text-gray-900">{new Date(c.eventDate).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1">
                          <button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-2.5 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md">
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
                              setActiveMessage({
                                phone: c.phone,
                                name: `${c.firstName} ${c.lastName}`,
                                message: `Event: ${c.eventName}\nDate: ${new Date(c.eventDate).toLocaleDateString()}\nCompany: ${c.company}`,
                                subject: 'Event Follow-up',
                                isViewing: false
                              });
                              setShowReplyModal(true);
                            }}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-2.5 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                          >
                            Reply
                          </button>
                          <button 
                            onClick={() => setDeleteContactId(c._id)} 
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
                    <td colSpan="9" className="text-center py-16">
                      <div className="flex flex-col items-center">
                        <div className="h-24 w-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-6">
                          <svg className="h-12 w-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <p className="text-xl font-semibold text-gray-700 mb-2">No WhatsApp contacts yet</p>
                        <p className="text-gray-500 mb-6">Start building your contact list to manage your events better</p>
                        <button
                          onClick={() => setShowModal(true)}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          📱 Add Your First Contact
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full">
                  📄 Page {currentPage} of {totalPages}
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
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
                          className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-110'
                              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:border-green-300 transform hover:scale-105'
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
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
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
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <AddWhatsAppContactModal
          onClose={() => {
            setShowModal(false);
            fetchContacts();
          }}
        />
      )}

      {/* Edit Modal */}
      {editContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200/50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full -translate-y-12 translate-x-12 opacity-40"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-emerald-100 to-green-100 rounded-full translate-y-10 -translate-x-10 opacity-30"></div>
            
            <div className="relative">
              {/* Enhanced Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-3 shadow-lg transform rotate-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Edit WhatsApp Contact
                  </span>
                </h3>
                <p className="text-gray-600">Update WhatsApp event contact information</p>
              </div>

              {/* Enhanced Form */}
              <div className="space-y-4">
                {['firstName', 'lastName', 'phone', 'email', 'company', 'eventName', 'eventDate'].map((field) => (
                  <div key={field} className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize flex items-center gap-2">
                      {field === 'firstName' && <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                      {field === 'lastName' && <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                      {field === 'phone' && <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                      {field === 'email' && <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                      {field === 'company' && <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                      {field === 'eventName' && <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                      {field === 'eventDate' && <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                      {field.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <input
                      type={field === 'eventDate' ? 'date' : 'text'}
                      className="w-full p-3 rounded-xl border border-gray-200/50 bg-white/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-300"
                      value={editContact[field]}
                      onChange={(e) => setEditContact({ ...editContact, [field]: e.target.value })}
                      placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                    />
                  </div>
                ))}
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
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
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

      {/* Delete Modal */}
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
              <p className="text-gray-600">Are you sure you want to delete this WhatsApp contact? This action cannot be undone.</p>
            </div>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setDeleteContactId(null)} 
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={deleteContact} 
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
          }
        }}
      />
    )}


    {showWhatsAppTabs && (
      <WhatsAppReplyTabsModal
        onClose={() => setShowWhatsAppTabs(false)}
        onSelect={handleSelectedReply}
      />
    )}

    {finalMessage && (
      <FinalMessageEditModal
        initialContent={finalMessage.content}
        contactName={finalMessage.name}
        onClose={() => setFinalMessage(null)}
        onSend={(editedText) => {
          if (!finalMessage.phone) {
            toast.error('No phone number available for this contact');
            return;
          }
          
          const cleanedPhoneNumber = finalMessage.phone.replace(/\D/g, '');
          const encodedMessage = encodeURIComponent(editedText);
          const uniqueUrl = `https://wa.me/${cleanedPhoneNumber}?text=${encodedMessage}&ts=${Date.now()}`;
          
          if (window.waWindow) {
            window.waWindow.close();
          }
          
          window.waWindow = window.open(uniqueUrl, "_blank");
          setFinalMessage(null);
          toast.success('Opening WhatsApp...');
        }}
        onBack={() => {
          setFinalMessage(null);
          setShowWhatsAppTabs(true);
        }}
      />
    )}

      {/* Reply Method Modal */}
      {showReplyModal && (
        <ReplyMethodModal
          onClose={() => setShowReplyModal(false)}
          onSelect={(method) => {
            setShowReplyModal(false);
            if (method === 'whatsapp') {
              // Make sure we have message and subject before showing WhatsApp tabs
              if (!activeMessage.message || !activeMessage.subject) {
                toast.error('Message or subject is missing');
                return;
              }
              setShowWhatsAppTabs(true);
            }
          }}
        />
      )}

      {/* WhatsApp Reply Tabs Modal */}
      {showWhatsAppTabs && (
        <WhatsAppReplyTabsModal
          onClose={() => setShowWhatsAppTabs(false)}
          onSelect={handleSelectedReply}
          contactMessage={activeMessage.message}
          contactSubject={activeMessage.subject}
          contactName={activeMessage.name}
        />
      )}

    </div>
  );
}
