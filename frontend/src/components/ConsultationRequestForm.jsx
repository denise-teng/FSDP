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
    const finalDescription = `${formData.description} (with ${user.email})`;

    await axios.post('/api/consultation-request', {
      ...formData,
      description: finalDescription,
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
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-2xl shadow-md w-full max-w-2xl mx-auto border border-gray-200">
      <h2 className="text-xl font-semibold text-blue-600">Request a Consultation</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Project Discussion"
          required
          className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Briefly describe what the consultation is about"
          required
          rows={4}
          className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          min={minDate}
          required
          readOnly
          onFocus={(e) => e.target.removeAttribute('readonly')}
          className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location (optional)</label>
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Zoom, Meeting Room, etc."
          className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg shadow"
        >
          Submit Request
        </button>
      </div>
    </form>
  );
}
