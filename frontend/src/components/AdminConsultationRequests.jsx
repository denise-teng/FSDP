import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function AdminConsultationRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const res = await axios.get('/consultation-request/pending');
      setRequests(res.data);
    };
    fetchRequests();
  }, []);

  const approve = async (id) => {
    try {
      await axios.patch(`/consultation-request/${id}/approve`);
      setRequests(prev => prev.filter(r => r._id !== id));
      toast.success('Approved and event created');
    } catch (err) {
      console.error(err);
      toast.error('Failed to approve');
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Pending Consultation Requests</h2>
      {requests.length === 0 && <p>No pending requests</p>}
      {requests.map(req => (
        <div key={req._id} className="border p-4 rounded shadow">
          <h3 className="font-bold">{req.name}</h3>
          <p>{req.description}</p>
          <p><strong>Date:</strong> {new Date(req.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> {req.startTime} – {req.endTime}</p>
          <p><strong>Location:</strong> {req.location}</p>
          <p><strong>Requested by:</strong> {req.email}</p>
          <button onClick={() => approve(req._id)} className="mt-2 bg-green-600 text-white px-3 py-1 rounded">Approve</button>
        </div>
      ))}
    </div>
  );
}
