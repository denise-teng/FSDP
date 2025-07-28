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
        description: `Requested consultation on ${formData.topic}`,
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
    <div className="min-h-screen bg-gray-900 text-white px-4 py-8">
      <div className="max-w-4xl mx-auto bg-[#1f2937] p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-emerald-400">Book a Consultation</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Topic</label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600"
              placeholder="e.g., Project review, Code help..."
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Preferred Date</label>
            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              min={minDate}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 placeholder:text-gray-400 
                     focus:outline-none focus:ring-2 focus:ring-emerald-500 
                     [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Preferred Time</label>
            <input
              type="time"
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600
                     [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2 rounded bg-emerald-600 hover:bg-emerald-700 transition font-semibold"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConsultationBooking;
