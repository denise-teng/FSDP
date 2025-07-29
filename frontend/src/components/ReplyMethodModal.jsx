import React from 'react';
import { X, Mail, MessageSquare } from 'lucide-react';

export default function ReplyMethodModal({ onClose, onSelect, contactEmail }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200/50 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-emerald-100 rounded-full translate-y-12 -translate-x-12 opacity-30"></div>
        
        <div className="relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 text-gray-400 hover:text-gray-600 bg-white/80 backdrop-blur-sm rounded-full p-2 transition-all duration-300 hover:bg-white shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Enhanced Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mb-4 shadow-lg transform rotate-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Choose Reply Method
              </span>
            </h2>
            <p className="text-gray-600">Select how you'd like to respond to this contact</p>
          </div>

          {/* Enhanced Options */}
          <div className="flex justify-center gap-6">
            {/* WhatsApp Option */}
            <button
              onClick={() => onSelect('whatsapp')}
              className="group flex flex-col items-center p-8 border border-gray-200/50 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all duration-300 w-40 text-center transform hover:scale-105 shadow-lg hover:shadow-xl hover:border-green-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-800 group-hover:text-green-700">WhatsApp</span>
              <span className="text-xs text-gray-500 mt-1">Send instant message</span>
            </button>

            {/* Email Option */}
            <button
              onClick={() => onSelect('email', contactEmail)}
              className="group flex flex-col items-center p-8 border border-gray-200/50 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all duration-300 w-40 text-center transform hover:scale-105 shadow-lg hover:shadow-xl hover:border-blue-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-800 group-hover:text-blue-700">Email</span>
              <span className="text-xs text-gray-500 mt-1">Send email reply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
