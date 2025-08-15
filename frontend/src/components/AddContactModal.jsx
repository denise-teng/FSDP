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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/95 backdrop-blur-sm w-full max-w-xs sm:max-w-lg lg:max-w-2xl p-4 sm:p-6 lg:p-8 rounded-2xl shadow-2xl border border-gray-100/50 space-y-4 sm:space-y-6 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto relative"
      >
        {/* Background decoration - responsive sizes */}
        <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -translate-y-10 translate-x-10 sm:-translate-y-12 sm:translate-x-12 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full translate-y-6 -translate-x-6 sm:translate-y-8 sm:-translate-x-8 opacity-40"></div>
        
        <div className="relative text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              ➕ Add Contact
            </span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Create a new contact in the system</p>
        </div>

        {/* Enhanced First & Last Name */}
        <div className="relative flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">👤 First Name <span className="text-red-500">*</span></label>
            <div className="flex items-center">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-2 sm:p-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-900 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter first name..."
              />
              {getIcon('firstName')}
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">👥 Last Name <span className="text-red-500">*</span></label>
            <div className="flex items-center">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-2 sm:p-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-900 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter last name..."
              />
              {getIcon('lastName')}
            </div>
          </div>
        </div>

        {/* Enhanced Phone */}
        <div className="relative">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">📱 Phone Number (E.g. +6512345678) <span className="text-red-500">*</span></label>
          <div className="flex items-center">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 sm:p-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-900 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 font-mono"
              placeholder="+6512345678"
            />
            {getIcon('phone')}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">📧 Email <span className="text-red-500">*</span></label>
          <div className="flex items-center">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 sm:p-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-900 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter email address..."
            />
            {getIcon('email')}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">📋 Subject <span className="text-red-500">*</span></label>
          <div className="flex items-center">
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full p-2 sm:p-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                formData.subject === '' ? 'text-gray-500' : 'text-gray-900'
              }`}
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
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">💬 Message <span className="text-red-500">*</span></label>
          <div className="flex items-start">
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 sm:p-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-900 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 resize-none"
              placeholder="Enter your message here..."
            />
            <div className="ml-2 mt-1">
              {getIcon('message')}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200/50">
          <button
            type="button"
            onClick={onClose}
            className="bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200/50 hover:bg-white hover:border-gray-300 font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-xl text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !allValid}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-xl text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none order-1 sm:order-2"
          >
            {loading ? 'Submitting...' : 'Submit Contact'}
          </button>
        </div>
      </form>
    </div>
  );
}
