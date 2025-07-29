import { useState } from 'react';
import { X } from 'lucide-react';

export default function FinalMessageEditModal({ initialContent, onClose, onSend, onBack, contactName }) {
  const [text, setText] = useState(initialContent || '');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl w-full max-w-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto border border-gray-200/50 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full -translate-y-16 translate-x-16 opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-100 to-blue-100 rounded-full translate-y-12 -translate-x-12 opacity-30"></div>
        
        <div className="relative">
          {/* Enhanced Close Button */}
          <button
            onClick={onClose}
            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 bg-white/80 backdrop-blur-sm rounded-full p-2 transition-all duration-300 hover:bg-white shadow-lg z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Enhanced Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg transform rotate-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Edit & Send Message
              </span>
            </h2>
            <p className="text-gray-600">Customize your message before sending via WhatsApp</p>
            {contactName && (
              <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>To: {contactName}</span>
              </div>
            )}
          </div>

          {/* Enhanced Content Area */}
          <div className="bg-white/50 backdrop-blur-sm border border-gray-200/50 p-6 rounded-2xl shadow-inner space-y-6">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Your WhatsApp message
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                className="w-full p-4 rounded-xl border border-gray-200/50 bg-white/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-300 resize-none"
                placeholder="Type your WhatsApp message here..."
              />
              <div className="flex items-center justify-end mt-2">
                <p className="text-xs text-gray-400">{text.length} characters</p>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex justify-between gap-4 pt-4">
              <button
                onClick={onBack}
                className="bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200/50 hover:bg-white hover:border-gray-300 font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Options
              </button>
              
              <button
                onClick={() => onSend(text)}
                disabled={!text.trim()}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send via WhatsApp
              </button>
            </div>

            {/* WhatsApp Info Card */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200/50 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-green-800">Ready to Send</p>
                  <p className="text-sm text-green-600">This will open WhatsApp Web with your message ready to send</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
