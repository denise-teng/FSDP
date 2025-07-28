import { useEffect, useState } from 'react';
import { usePotentialClientStore } from '../stores/usePotentialClientStore';
import axios from 'axios';
import { Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReplyMethodModal from '../components/ReplyMethodModal';
import WhatsAppReplyTabsModal from '../components/WhatsAppReplyTabsModal';
import FinalMessageEditModal from '../components/FinalMessageEditModal';
import EmailReplyModal from '../components/EmailReplyModal';

export default function PotentialClientsPage() {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const { potentialClients, fetchPotentialClients } = usePotentialClientStore();
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showWhatsAppTabs, setShowWhatsAppTabs] = useState(false);
  const [finalMessage, setFinalMessage] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [activeMessage, setActiveMessage] = useState({ name: '', message: '', phone: '', subject: '' });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 15;

  useEffect(() => {
    fetchPotentialClients();
  }, []);

  const handleSelectedReply = (msg) => {
    setShowWhatsAppTabs(false);
    
    // For manual replies, go directly to WhatsApp
    if (msg.source === 'Manual Reply') {
      if (!activeMessage.phone) {
        toast.error('No phone number available for this contact');
        return;
      }
      
      const cleanedPhoneNumber = activeMessage.phone.replace(/\D/g, '');
      const encodedMessage = encodeURIComponent(msg.content);
      const uniqueUrl = `https://wa.me/${cleanedPhoneNumber}?text=${encodedMessage}&ts=${Date.now()}`;
      
      if (window.waWindow) {
        window.waWindow.close();
      }
      
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

  const filtered = potentialClients
    .filter(c =>
      (c.firstName + ' ' + c.lastName).toLowerCase().includes(search.toLowerCase()) &&
      (!subjectFilter || c.subject?.toLowerCase() === subjectFilter.toLowerCase())
    )
    .sort((a, b) => a.contactId - b.contactId);

  // Pagination calculations
  const totalContacts = filtered.length;
  const totalPages = Math.ceil(totalContacts / contactsPerPage);
  const startIndex = (currentPage - 1) * contactsPerPage;
  const endIndex = startIndex + contactsPerPage;
  const currentContacts = filtered.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, subjectFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    document.querySelector('.potential-clients-table')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100/50 p-8 mb-8 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>
          
          <div className="relative flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-bold mb-3">
                <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Potential Clients
                </span>
              </h2>
              <p className="text-gray-600 text-lg">High-priority leads and flagged contacts requiring attention</p>
            </div>
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-6 mb-8">
          <div className="flex gap-4 flex-wrap items-center justify-between">
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
                  className="pl-10 pr-4 py-3 w-64 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className={`py-3 px-4 w-64 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm ${
                  subjectFilter === '' ? 'text-gray-500' : 'text-gray-900'
                } focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300`}
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <option value="">📋 Select Subject Type</option>
                <option value="General Inquiry">� General Inquiry</option>
                <option value="Investment Strategy Discussion">� Investment Strategy Discussion</option>
                <option value="Retirement Planning Consultation">🏖️ Retirement Planning Consultation</option>
                <option value="Estate/Legacy Planning">🏛️ Estate/Legacy Planning</option>
                <option value="Insurance Policy Review">🛡️ Insurance Policy Review</option>
                <option value="Corporate Financial Seminar Inquiry">🏢 Corporate Financial Seminar Inquiry</option>
                <option value="Others">📝 Others</option>
              </select>
            </div>
            
            {/* Enhanced Results Info */}
            <div className="text-sm text-gray-600 bg-gradient-to-r from-purple-100 to-indigo-100 px-4 py-2 rounded-full">
              ⭐ Showing {startIndex + 1}-{Math.min(endIndex, totalContacts)} of {totalContacts} potential clients
            </div>
          </div>
        </div>

        {/* Enhanced Potential Clients Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden potential-clients-table">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
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
                    Flagged Reason
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentContacts.length > 0 ? (
                  currentContacts.map((c) => (
                    <tr key={c._id} className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-indigo-50/50 transition-all duration-300">
                      <td className="p-4 text-sm text-gray-900 font-medium">{c.contactId || '-'}</td>
                      <td className="p-4 text-sm text-gray-900">{c.firstName}</td>
                      <td className="p-4 text-sm text-gray-900">{c.lastName}</td>
                      <td className="p-4 text-sm text-gray-900 font-mono">{c.phone}</td>
                      <td className="p-4 text-sm text-gray-600">{c.email}</td>
                      <td className="p-4 text-sm text-gray-900">{c.subject}</td>
                      <td className="p-4 text-sm">
                        <button
                          onClick={() =>
                            setActiveMessage({
                              name: `${c.firstName} ${c.lastName}`,
                              message: c.message,
                              phone: c.phone,
                              subject: c.subject,
                              isViewing: true
                            })
                          }
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-2.5 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                        >
                          View
                        </button>
                      </td>
                      <td className="p-4 text-sm text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {c.reason || 'Flagged by AI'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-6 h-6 text-yellow-400" />
                          <button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-2.5 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md">
                            Broadcast
                          </button>
                          <button
                            onClick={() => {
                              setContactEmail(c.email);
                              setActiveMessage({
                                phone: c.phone,
                                name: `${c.firstName} ${c.lastName}`,
                                message: c.message,
                                subject: c.subject
                              });
                              setShowReplyModal(true);
                            }}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-2.5 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                          >
                            Reply
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await axios.delete(`/api/potential-clients/${c._id}`);
                                toast.success(`${c.firstName} removed from Potential Clients`);
                                fetchPotentialClients();
                              } catch (err) {
                                toast.error('Failed to remove client');
                              }
                            }}
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-2.5 py-1 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center">
                        <Star className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-lg font-medium text-gray-500">No potential clients available</p>
                        <p className="text-sm text-gray-400 mt-1">Flagged contacts will appear here automatically</p>
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

      {showReplyModal && (
        <ReplyMethodModal
          onClose={() => setShowReplyModal(false)}
          onSelect={(method, email) => {
            setShowReplyModal(false);
            if (method === 'whatsapp') {
              setShowWhatsAppTabs(true);
            } else if (method === 'email') {
              setContactEmail(email);
              setShowEmailModal(true);
            }
          }}
          contactEmail={contactEmail}
        />
      )}

      {activeMessage.message && activeMessage.isViewing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-200/50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full -translate-y-16 translate-x-16 opacity-40"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full translate-y-12 -translate-x-12 opacity-30"></div>
            
            <div className="relative">
              {/* Enhanced Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-4 shadow-lg transform rotate-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    {activeMessage.name}'s Message
                  </span>
                </h3>
                <p className="text-gray-600">High-priority potential client message</p>
              </div>

              {/* Enhanced Subject Info */}
              <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200/50 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-purple-800">Subject Type</p>
                    <p className="text-sm text-purple-600">{activeMessage.subject}</p>
                  </div>
                </div>
              </div>

              {/* Enhanced Message Display */}
              <div className="mb-8 p-8 bg-gradient-to-br from-gray-50 to-purple-50/30 rounded-xl border border-gray-200/50 shadow-inner">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
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
    </div>
  );
}