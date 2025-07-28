import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function ConsultationRequestForm({ user }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    email: user?.email || '',
  });

  const today = new Date();
  const minDate = new Date(today.setDate(today.getDate() + 7))
    .toISOString()
    .split('T')[0]; // Format YYYY-MM-DD

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedDate = new Date(formData.date);
    const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (selectedDate < oneWeekFromNow) {
      toast.error('Please select a date at least 7 days from today.');
      return;
    }

    try {
      await axios.post('/api/consultation-request', {
        ...formData,
        userId: user._id,
      });

      toast.success('Consultation request submitted!');
      setFormData({
        name: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        email: user.email,
      });
    } catch (err) {
      console.error('Request failed:', err);
      toast.error('Failed to submit consultation request.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold text-gray-800">Request a Consultation</h2>

      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Title"
        required
        className="w-full border p-2 rounded"
      />

      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        required
        className="w-full border p-2 rounded"
      />

      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        min={minDate}
        required
        className="w-full border p-2 rounded"
      />

      <input
        type="time"
        name="startTime"
        value={formData.startTime}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      <input
        type="time"
        name="endTime"
        value={formData.endTime}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      <input
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="Location (optional)"
        className="w-full border p-2 rounded"
      />

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </form>
  );
}
