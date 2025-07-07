import { useEffect, useState } from 'react';
import axios from '../lib/axios';

export default function BroadcastRecipientsModal({ onClose }) {
  const [recipients, setRecipients] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedRow, setEditedRow] = useState({});

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const res = await axios.get('/contacts/shared-contacts');
        console.log('✅ Fetched contacts:', res.data);
        setRecipients(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch contacts:', err);
      }
    };

    fetchRecipients();
  }, []);

  const startEdit = (recipient) => {
    setEditingId(recipient._id);
    setEditedRow({ ...recipient });
  };

  const saveEdit = () => {
    setRecipients((prev) =>
      prev.map((r) => (r._id === editingId ? editedRow : r))
    );
    setEditingId(null);
  };

  const deleteRecipient = (id) => {
    setRecipients((prev) => prev.filter((r) => r._id !== id));
    if (editingId === id) setEditingId(null);
  };

  const inputClass =
    'bg-gray-700 text-white w-full rounded px-2 py-1 h-8 text-sm';

  const buttonClass = 'px-3 py-1 h-8 text-sm rounded w-20';

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 text-white w-full max-w-6xl rounded-2xl p-6 overflow-auto max-h-[90vh] shadow-lg border border-emerald-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-emerald-400">Broadcast Recipients</h2>
          <button onClick={onClose} className="text-red-400 font-semibold hover:underline">
            Close
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-emerald-700 text-white rounded-t-lg">
            <tr>
              <th className="px-3 py-2">NO</th>
              <th className="px-3 py-2">First Name</th>
              <th className="px-3 py-2">Last Name</th>
              <th className="px-3 py-2">Phone No.</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Subject</th>
              <th className="px-3 py-2">Channel</th>
              <th className="px-3 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800">
            {recipients.map((r, idx) => (
              <tr key={r._id} className="border-b border-gray-700">
                <td className="px-3 py-2">{r.contactId || idx + 1}</td>
                {editingId === r._id ? (
                  <>
                    <td className="px-3 py-2">
                      <input className={inputClass} value={editedRow.firstName} onChange={(e) => setEditedRow({ ...editedRow, firstName: e.target.value })} />
                    </td>
                    <td className="px-3 py-2">
                      <input className={inputClass} value={editedRow.lastName} onChange={(e) => setEditedRow({ ...editedRow, lastName: e.target.value })} />
                    </td>
                    <td className="px-3 py-2">
                      <input className={inputClass} value={editedRow.phone} onChange={(e) => setEditedRow({ ...editedRow, phone: e.target.value })} />
                    </td>
                    <td className="px-3 py-2">
                      <input className={inputClass} value={editedRow.email} onChange={(e) => setEditedRow({ ...editedRow, email: e.target.value })} />
                    </td>
                    <td className="px-3 py-2">
                      <input className={inputClass} value={editedRow.subject} onChange={(e) => setEditedRow({ ...editedRow, subject: e.target.value })} />
                    </td>
                    <td className="px-3 py-2">
                      <input className={inputClass} value={editedRow.channel} onChange={(e) => setEditedRow({ ...editedRow, channel: e.target.value })} />
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-2">{r.firstName}</td>
                    <td className="px-3 py-2">{r.lastName}</td>
                    <td className="px-3 py-2">{r.phone}</td>
                    <td className="px-3 py-2">{r.email}</td>
                    <td className="px-3 py-2">{r.subject}</td>
                    <td className="px-3 py-2">{r.channel || '—'}</td>
                  </>
                )}
                <td className="px-3 py-2 text-center">
                  <div className="flex flex-col space-y-1 items-center">
                    {editingId === r._id ? (
                      <button className={`bg-green-500 text-white ${buttonClass}`} onClick={saveEdit}>
                        Save
                      </button>
                    ) : (
                      <button className={`bg-yellow-500 text-black ${buttonClass}`} onClick={() => startEdit(r)}>
                        Edit
                      </button>
                    )}
                    <button className={`bg-red-600 text-white ${buttonClass}`} onClick={() => deleteRecipient(r._id)}>
                      Del
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
