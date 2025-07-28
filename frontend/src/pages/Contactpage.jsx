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

export default function ContactPage() {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [contacts, setContacts] = useState([]);
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
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-[1600px] mx-auto bg-[#1e293b] shadow-lg rounded-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-emerald-400">FORM CONTACTS</h2>
        </div>

        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Search by name"
              className="p-2 w-64 rounded border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className={`p-2 w-64 rounded border border-gray-600 bg-gray-800 ${
                subjectFilter === '' ? 'text-gray-400' : 'text-white'
              } focus:ring-2 focus:ring-emerald-500`}
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
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

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded"
          >
            + Add Contact
          </button>
        </div>

        <div className="overflow-x-auto rounded">
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
                <th className="p-3 border border-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length > 0 ? (
                filteredContacts.map((c) => (
                  <tr key={c._id} className="text-center border-t border-gray-700 hover:bg-gray-800">
                    <td className="p-3 border border-gray-600">{c.contactId || '-'}</td>
                    <td className="p-3 border border-gray-600">{c.firstName}</td>
                    <td className="p-3 border border-gray-600">{c.lastName}</td>
                    <td className="p-3 border border-gray-600">{c.phone}</td>
                    <td className="p-3 border border-gray-600">{c.email}</td>
                    <td className="p-3 border border-gray-600">{c.subject}</td>
                    <td className="p-3 border border-gray-600 text-emerald-400">
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
                        className="underline text-emerald-300 hover:text-emerald-500"
                      >
                        Click to view Message
                      </button>
                    </td>
                    <td className="p-3 border border-gray-600 space-x-1 flex items-center justify-center">
                      {isStarred(c) ? (
                        <Star className="text-yellow-400 w-5 h-5 mr-2" title="Potential Client" />
                      ) : (
                        <StarOff
                          className="text-gray-400 w-5 h-5 mr-2 cursor-pointer hover:text-yellow-300"
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
                      <button className="bg-yellow-500 px-2 py-1 rounded hover:bg-yellow-600">Broadcast</button>
                      <button onClick={() => setEditContact(c)} className="bg-blue-500 px-2 py-1 rounded hover:bg-blue-600">Edit</button>
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
                        className="bg-emerald-500 px-2 py-1 rounded hover:bg-emerald-600"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => setDeleteContactId(c._id)} // Set the contact ID to trigger the confirmation modal
                        className="bg-red-500 px-2 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>

                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-400">No contacts available.</td>
                </tr>
              )}
            </tbody>
          </table>
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-[90%] max-w-3xl text-white">
            <h3 className="text-2xl font-bold text-center mb-4 text-emerald-400">
              {activeMessage.name}'s Message
            </h3>
            <div className="border border-emerald-400 bg-gray-900 p-4 rounded mb-6 text-center">
              {activeMessage.message}
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setActiveMessage({ name: '', message: '', phone: '', subject: '', isViewing: false })}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {editContact && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-xl">
            <h3 className="text-2xl text-center font-bold text-emerald-400 mb-6">Edit Contact</h3>
            <div className="space-y-4">
              {['firstName', 'lastName', 'phone', 'email'].map((field) => (
                <div key={field}>
                  <label className="block text-sm text-gray-300 mb-1 capitalize">{field}</label>
                  <input
                    type="text"
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                    value={editContact[field]}
                    onChange={(e) => setEditContact({ ...editContact, [field]: e.target.value })}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Subject Type</label>
                <select
                  className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
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

              <div>
                <label className="block text-sm text-gray-300 mb-1">Message</label>
                <textarea
                  className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                  rows="3"
                  value={editContact.message}
                  onChange={(e) => setEditContact({ ...editContact, message: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setEditContact(null)} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>
              <button onClick={handleUpdate} className="bg-blue-500 px-4 py-2 rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      {deleteContactId && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold text-red-400 mb-4">Confirm Deletion</h3>
            <p className="mb-6 text-white">Are you sure you want to delete this contact?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteContactId(null)} // Cancel action
                className="bg-gray-600 px-4 py-2 rounded"
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
                className="bg-red-500 px-4 py-2 rounded"
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
    </div>
  );
}