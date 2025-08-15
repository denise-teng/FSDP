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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/95 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl shadow-2xl border border-gray-100/50 w-full max-w-xs sm:max-w-md lg:max-w-lg space-y-4 sm:space-y-6 relative overflow-hidden max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
      >
        {/* Background decoration - responsive sizes */}
        <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full -translate-y-8 translate-x-8 sm:-translate-y-10 sm:translate-x-10 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-tr from-emerald-100 to-blue-100 rounded-full translate-y-6 -translate-x-6 sm:translate-y-8 sm:-translate-x-8 opacity-40"></div>
        
        <div className="relative text-center">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3">
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
              💬 Add WhatsApp Contact
            </span>
          </h3>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Add a new contact for WhatsApp events</p>
        </div>

        {['firstName', 'lastName', 'phone', 'email', 'company', 'eventName'].map((field) => {
          const fieldIcons = {
            firstName: '👤',
            lastName: '👥', 
            phone: '📱',
            email: '📧',
            company: '🏢',
            eventName: '🎉'
          };
          
          return (
            <div key={field} className="relative">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                {fieldIcons[field]} {field.replace(/([A-Z])/g, ' $1')}
              </label>
              <input
                type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                name={field}
                placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}...`}
                value={formData[field]}
                onChange={handleChange}
                required
                className="w-full p-2 sm:p-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-900 text-sm sm:text-base focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          );
        })}

        <div className="relative">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">📅 Event Date</label>
          <input
            type="date"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            required
            className="w-full p-2 sm:p-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-900 text-sm sm:text-base focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200/50 relative">
          <button
            type="button"
            onClick={onClose}
            className="bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200/50 hover:bg-white hover:border-gray-300 font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-xl text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl order-1 sm:order-2"
          >
            Add Contact
          </button>
        </div>
      </form>
    </div>
  );
}
