import React from 'react';
import { X, Mail, MessageSquare } from 'lucide-react';

export default function ReplyMethodModal({ onClose, onSelect, contactEmail }) {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="relative bg-[#1e293b] text-white rounded-xl p-10 w-full max-w-xl shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-bold text-center mb-10 text-emerald-400">Reply</h2>

        <div className="flex justify-center gap-16">
          {/* WhatsApp Option */}
          <button
            onClick={() => onSelect('whatsapp')} // No change for WhatsApp
            className="flex flex-col items-center p-6 border border-gray-600 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all w-40 text-center"
          >
            <MessageSquare className="w-12 h-12 text-green-400 mb-3" />
            <span className="text-lg font-semibold text-white">WhatsApp</span>
          </button>

          {/* Email Option */}
          <button
            onClick={() => onSelect('email', contactEmail)} // Pass the contact's email here
            className="flex flex-col items-center p-6 border border-gray-600 rounded-lg bg-gray-800 hover:bg-emerald-600 transition-all w-40 text-center"
          >
            <Mail className="w-12 h-12 text-emerald-400 mb-3" />
            <span className="text-lg font-semibold text-white">Email</span>
          </button>
        </div>
      </div>
    </div>
  );
}
