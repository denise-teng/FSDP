import React, { useState } from 'react';
import { useWhatsappContactStore } from '../stores/useWhatsappContactStore';


export default function AddWhatsAppContactModal({ onClose }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    company: '',
    eventName: '',
    eventDate: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const { createWhatsappContact } = useWhatsappContactStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('🚀 Modal submitting data:', formData); // Debug log
      await createWhatsappContact(formData);
      onClose();
    } catch (err) {
      console.error('❌ Modal error:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-md space-y-4 text-white"
      >
        <h3 className="text-xl font-bold text-emerald-400 text-center">Add WhatsApp Contact</h3>

        {['firstName', 'lastName', 'phone', 'email', 'company', 'eventName'].map((field) => (
          <input
            key={field}
            type="text"
            name={field}
            placeholder={field.replace(/([A-Z])/g, ' $1')}
            value={formData[field]}
            onChange={handleChange}
            required
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 placeholder-gray-400"
          />
        ))}

        <input
          type="date"
          name="eventDate"
          value={formData.eventDate}
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
        />

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
