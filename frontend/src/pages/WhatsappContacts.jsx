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

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-[1600px] mx-auto bg-[#1e293b] shadow-lg rounded-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-emerald-400">WHATSAPP CONTACTS</h2>
        </div>

        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <input
            type="text"
            placeholder="Search by name"
            className="p-2 w-64 rounded border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => setShowModal(true)}
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
                <th className="p-3 border border-gray-600">Company</th>
                <th className="p-3 border border-gray-600">Event Name</th>
                <th className="p-3 border border-gray-600">Event Date</th>
                <th className="p-3 border border-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length > 0 ? (
                filteredContacts.map((c, index) => (
                  <tr key={c._id} className="text-center border-t border-gray-700 hover:bg-gray-800">
                    <td className="p-3 border border-gray-600">{contacts.findIndex(item => item._id === c._id) + 1}</td>
                    <td className="p-3 border border-gray-600">{c.firstName}</td>
                    <td className="p-3 border border-gray-600">{c.lastName}</td>
                    <td className="p-3 border border-gray-600">{c.phone}</td>
                    <td className="p-3 border border-gray-600">{c.email}</td>
                    <td className="p-3 border border-gray-600">{c.company}</td>
                    <td className="p-3 border border-gray-600">{c.eventName}</td>
                    <td className="p-3 border border-gray-600">{new Date(c.eventDate).toLocaleDateString()}</td>
                    <td className="p-3 border border-gray-600 space-x-1">
                      <button className="bg-yellow-500 px-2 py-1 rounded hover:bg-yellow-600">Broadcast</button>
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
                        className="bg-emerald-500 px-2 py-1 rounded hover:bg-emerald-600"
                      >
                        Reply
                      </button>
                      <button onClick={() => setEditContact(c)} className="bg-blue-500 px-2 py-1 rounded hover:bg-blue-600">Edit</button>
                      <button onClick={() => setDeleteContactId(c._id)} className="bg-red-500 px-2 py-1 rounded hover:bg-red-600">Delete</button>
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-xl">
            <h3 className="text-2xl text-center font-bold text-emerald-400 mb-6">Edit WhatsApp Contact</h3>
            <div className="space-y-4">
              {['firstName', 'lastName', 'phone', 'email', 'company', 'eventName', 'eventDate'].map((field) => (
                <div key={field}>
                  <label className="block text-sm text-gray-300 mb-1">{field}</label>
                  <input
                    type={field === 'eventDate' ? 'date' : 'text'}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                    value={editContact[field]}
                    onChange={(e) => setEditContact({ ...editContact, [field]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setEditContact(null)} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>
              <button onClick={handleUpdate} className="bg-blue-500 px-4 py-2 rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteContactId && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold text-red-400 mb-4">Confirm Deletion</h3>
            <p className="mb-6 text-white">Are you sure you want to delete this contact?</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setDeleteContactId(null)} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>
              <button onClick={deleteContact} className="bg-red-500 px-4 py-2 rounded">Delete</button>
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
