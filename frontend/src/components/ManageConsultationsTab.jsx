// components/ManageConsultationsTab.jsx
import { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

const ManageConsultationsTab = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get('/consultations/consultation-request/pending');
      setRequests(res.data);
    } catch {
      toast.error('Failed to fetch requests');
    }
  };

  const approveRequest = async (id) => {
    try {
      await axios.patch(`/consultations/consultation-request/${id}/approve`);
      toast.success('Approved!');
      fetchPendingRequests();
    } catch {
      toast.error('Failed to approve');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-emerald-400">Pending Consultation Requests</h2>
      {requests.length === 0 ? (
        <p>No pending consultations.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((r) => (
            <li key={r._id} className="bg-gray-800 p-4 rounded">
              <p><strong>Topic:</strong> {r.name}</p>
              <p><strong>Email:</strong> {r.email}</p>
              <p><strong>Date:</strong> {new Date(r.date).toDateString()}</p>
              <p><strong>Time:</strong> {r.startTime}</p>
              <p><strong>Description:</strong> {r.description}</p>
              <button
                onClick={() => approveRequest(r._id)}
                className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded"
              >
                Approve & Create Event
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManageConsultationsTab;
