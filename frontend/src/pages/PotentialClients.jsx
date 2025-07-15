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
  const [activeMessage, setActiveMessage] = useState({ name: '', message: '' });





  useEffect(() => {
    fetchPotentialClients();
  }, []);

  const handleSelectedReply = (msg) => {
    setShowWhatsAppTabs(false);
    toast.success(`Reply selected: ${msg.content || msg.message}`);
    setFinalMessage({
      content: msg.content || msg.message || '',
      source: 'Quick Message',
    });
  };

  const filtered = potentialClients
  .filter(c =>
    (c.firstName + ' ' + c.lastName).toLowerCase().includes(search.toLowerCase()) &&
    (!subjectFilter || c.subject?.toLowerCase() === subjectFilter.toLowerCase())
  )
  .sort((a, b) => a.contactId - b.contactId); // 👈 sort ascending by contactId


  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-[1600px] mx-auto bg-[#1e293b] shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-bold text-emerald-400 mb-6">Potential Clients</h2>

        <div className="flex gap-4 flex-wrap items-center mb-6">
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
                <th className="p-3 border border-gray-600">AI Client Insight</th>
                <th className="p-3 border border-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((c, index) => (
                  <tr key={c._id} className="text-center border-t border-gray-700 hover:bg-gray-800">
                    <td className="p-3 border border-gray-600">{c.contactId || '-'}</td>
                    <td className="p-3 border border-gray-600">{c.firstName}</td>
                    <td className="p-3 border border-gray-600">{c.lastName}</td>
                    <td className="p-3 border border-gray-600">{c.phone}</td>
                    <td className="p-3 border border-gray-600">{c.email}</td>
                    <td className="p-3 border border-gray-600">{c.subject}</td>
                    <td className="p-3 border border-gray-600 text-emerald-400">
                      <span
                        className="underline cursor-pointer"
                        onClick={() =>
                          setActiveMessage({
                            name: `${c.firstName} ${c.lastName}`,
                            message: c.message,
                          })
                        }
                      >
                        Click to view
                      </span>
                    </td>
                    <td className="p-3 border border-gray-600 text-yellow-400 text-sm">
                      {c.reason || 'Flagged by AI'}
                    </td>
                    <td className="p-3 border border-gray-600 space-x-1">
                      <Star className="inline w-5 h-5 text-yellow-400 mr-2" />
                      <button className="bg-yellow-500 px-2 py-1 rounded hover:bg-yellow-600">Broadcast</button>
                      <button
                        onClick={() => {
                          setContactEmail(c.email); // Set the contact's email for reply
                          setShowReplyModal(true);   // Open the reply method modal
                        }}
                        className="bg-emerald-500 px-2 py-1 rounded hover:bg-emerald-600"
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
                        className="bg-red-500 px-2 py-1 rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-gray-400">No potential clients available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    {showReplyModal && (
          <ReplyMethodModal
            onClose={() => setShowReplyModal(false)}
            onSelect={(method, email) => {
              setShowReplyModal(false);
              if (method === 'whatsapp') {
                setShowWhatsAppTabs(true); // WhatsApp reply tab
              } else if (method === 'email') {
                setContactEmail(email); // Pass the contact's email
                setShowEmailModal(true); // Open the Email modal
              }
            }}
            contactEmail={contactEmail}  // Pass email here if required
          />
        )}

    {activeMessage.message && (
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
              onClick={() => setActiveMessage({ name: '', message: '' })}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded"
            >
              Close
            </button>
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
      />
    )}

    {finalMessage && (
      <FinalMessageEditModal
        initialContent={finalMessage.content}
        onClose={() => setFinalMessage(null)}
        onSend={(text) => {
          toast.success('Message sent!');
          console.log('Sending:', text);
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
