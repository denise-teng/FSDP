import React, { useState } from 'react';
import { X } from 'lucide-react';
import emailjs from 'emailjs-com';
import { toast } from 'react-hot-toast';

export default function EmailReplyModal({ onClose, contactEmail }) {
  const [emailContent, setEmailContent] = useState('');

  // Function to send email using EmailJS
  const sendEmail = () => {
    const templateParams = {
      user_email: contactEmail,  // Recipient's email
      message: emailContent,     // Admin's reply message
    };

    // Sending the email through EmailJS
    emailjs
      .send("service_u9ka93t", "template_k5jytrj", templateParams, "THxfsTJQmnKaGFX_-")
      .then(
        (response) => {
          console.log("Email sent successfully:", response);
          toast.success("Email sent successfully!");
          onClose();  // Close the modal after email is sent
        },
        (error) => {
          console.log("Email send error:", error);
          toast.error("Failed to send email");
        }
      );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto border border-gray-200/50 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-40"></div>
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg transform rotate-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                Reply via Email
              </span>
            </h2>
            <p className="text-gray-600">Compose and send your email response</p>
            <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              <span>To: {contactEmail}</span>
            </div>
          </div>

          {/* Enhanced Content Area */}
          <div className="bg-white/50 backdrop-blur-sm border border-gray-200/50 p-6 rounded-2xl shadow-inner space-y-6">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Compose your email message
              </label>
              <textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                rows={8}
                className="w-full p-4 rounded-xl border border-gray-200/50 bg-white/50 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300 resize-none"
                placeholder="Type your email message here..."
              />
            </div>
            
            {/* Enhanced Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={onClose}
                className="bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200/50 hover:bg-white hover:border-gray-300 font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </span>
              </button>
              <button
                onClick={sendEmail}
                disabled={!emailContent.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Email
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
