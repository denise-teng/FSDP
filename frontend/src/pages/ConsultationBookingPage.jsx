import { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from '../lib/axios';
import { useUserStore } from '../stores/useUserStore';

const ConsultationBooking = () => {
  const { user } = useUserStore();

  const [formData, setFormData] = useState({
    topic: '',
    preferredDate: '',
    preferredTime: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!user || !user.email) {
    toast.error('Please log in to request a consultation.');
    return;
  }

  const selectedDate = new Date(formData.preferredDate);
  const today = new Date();
  const oneWeekFromToday = new Date(today.setDate(today.getDate() + 7));

  if (selectedDate < oneWeekFromToday) {
    toast.error('Please select a date at least 7 days from today.');
    return;
  }

  try {
    await axios.post('/consultations/consultation-request', {
      name: formData.topic,
      description: `Requested consultation on ${formData.topic} with email ${user.email}`,
      date: formData.preferredDate,
      startTime: formData.preferredTime,
      endTime: null,
      email: user.email,
      userId: user._id,
    });

    toast.success('Consultation request submitted!');
    setFormData({ topic: '', preferredDate: '', preferredTime: '' });
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.message || 'Failed to submit consultation request');
  }
};



  const minDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-8 text-blue-700 text-center">Book a Consultation</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold text-gray-800 text-base mb-1">Topic</label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
              placeholder="e.g., Tax Tips, Inheritance distribution..."
              className="w-full border border-gray-300 rounded-lg px-5 py-3 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

<div>
  <label className="block font-semibold text-gray-800 text-base mb-1">Preferred Date</label>
  <input
    type="date"
    name="preferredDate"
    value={formData.preferredDate}
    onChange={handleChange}
    min={minDate}
    onKeyDown={(e) => e.preventDefault()} // block manual typing
    className="w-full border border-gray-300 rounded-lg px-5 py-3 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500
      [&::-webkit-calendar-picker-indicator]:opacity-100
      [&::-webkit-calendar-picker-indicator]:cursor-pointer"
  />
</div>



          <div>
            <label className="block font-semibold text-gray-800 text-base mb-1">Preferred Time</label>
            <input
              type="time"
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-5 py-3 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base py-3 px-6 rounded-lg transition"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConsultationBooking;
