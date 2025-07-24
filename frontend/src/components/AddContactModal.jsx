import { useState } from 'react';
import { useContactStore } from '../stores/useContactStore';

export default function AddContactModal({ onClose }) {
  const { createContact, loading } = useContactStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const isValid = {
    firstName: formData.firstName.trim() !== '',
    lastName: formData.lastName.trim() !== '',
    // Phone validation to ensure country code + followed by 8 digits
    phone: /^\+([0-9]{1,4})\d{8}$/.test(formData.phone), // regex for valid phone number with country code
    email: formData.email.includes('@'),
    subject: formData.subject !== '',
    message: formData.message.trim() !== ''
  };

  const allValid = Object.values(isValid).every(Boolean);

  const getIcon = (field) => {
    if (!touched[field]) return null;
    return (
      <span className={`ml-2 text-xl ${isValid[field] ? 'text-emerald-400' : 'text-red-500'}`}>
        {isValid[field] ? '✅' : '❌'}
      </span>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allValid) {
      alert('Please correct the errors in the form.');
      return;
    }

    try {
      await createContact(formData);
      onClose(); // Close modal on success
    } catch (error) {
      console.error('Error submitting contact:', error);
      alert(error?.response?.data?.error || 'Failed to submit contact. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1e293b] w-full max-w-2xl p-8 rounded-lg shadow-md space-y-6 mx-4"
      >
        <h2 className="text-3xl font-bold text-emerald-400 text-center">Add Contact</h2>

        {/* First & Last Name */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[48%]">
            <label className="block text-sm font-medium text-white mb-1">First Name <span className="text-red-500">*</span></label>
            <div className="flex items-center">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-emerald-500"
              />
              {getIcon('firstName')}
            </div>
          </div>
          <div className="flex-1 min-w-[48%]">
            <label className="block text-sm font-medium text-white mb-1">Last Name <span className="text-red-500">*</span></label>
            <div className="flex items-center">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-emerald-500"
              />
              {getIcon('lastName')}
            </div>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-white mb-1">Phone Number (E.g. +6512345678) <span className="text-red-500">*</span></label>
          <div className="flex items-center">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-emerald-500"
            />
            {getIcon('phone')}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-white mb-1">Email <span className="text-red-500">*</span></label>
          <div className="flex items-center">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-emerald-500"
            />
            {getIcon('email')}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-white mb-1">Subject <span className="text-red-500">*</span></label>
          <div className="flex items-center">
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full p-2 rounded bg-gray-800 border border-gray-600 ${
                formData.subject === '' ? 'text-gray-400' : 'text-white'
              } focus:ring-2 focus:ring-emerald-500`}
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
            {getIcon('subject')}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-white mb-1">Message <span className="text-red-500">*</span></label>
          <div className="flex items-center">
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-emerald-500"
            />
            {getIcon('message')}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !allValid}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
