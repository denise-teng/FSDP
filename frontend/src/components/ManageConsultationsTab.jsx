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

  const deleteRequest = async (id) => {
    try {
      await axios.delete(`/consultations/consultation-request/${id}`);
      toast.success('Request deleted');
      fetchPendingRequests();
    } catch {
      toast.error('Failed to delete request');
    }
  };

  return (
    <div className="bg-[#f3f5ff] min-h-screen p-6 flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-blue-600 mb-6">
          Pending Consultation Requests
        </h2>

        {requests.length === 0 ? (
          <div className="text-center text-gray-500 italic">
            No pending consultations.
          </div>
        ) : (
          <ul className="space-y-6">
            {requests.map((r) => (
              <li
                key={r._id}
                className="bg-gray-50 border border-gray-200 p-6 rounded-xl shadow-sm"
              >
                <p className="mb-1">
                  <strong className="text-gray-700">Topic:</strong> {r.name}
                </p>
                <p className="mb-1">
                  <strong className="text-gray-700">Email:</strong> {r.email}
                </p>
                <p className="mb-1">
                  <strong className="text-gray-700">Date:</strong>{' '}
                  {new Date(r.date).toDateString()}
                </p>
                <p className="mb-1">
                  <strong className="text-gray-700">Time:</strong> {r.startTime}
                </p>
                <p className="mb-2">
                  <strong className="text-gray-700">Description:</strong> {r.description}
                </p>

                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => approveRequest(r._id)}
                    className="px-4 py-2 rounded text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
                  >
                    Approve & Create Event
                  </button>
                  <button
                    onClick={() => deleteRequest(r._id)}
                    className="px-4 py-2 rounded text-sm font-semibold text-red-600 border border-red-300 bg-red-50 hover:bg-red-100"
                  >
                    Delete Request
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManageConsultationsTab;
