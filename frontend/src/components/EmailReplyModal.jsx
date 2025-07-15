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
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="relative bg-[#1e293b] text-white rounded-xl p-10 w-full max-w-xl shadow-2xl">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-white">
          <span className="text-2xl">&times;</span>
        </button>

        <h2 className="text-3xl font-bold text-center mb-10 text-emerald-400">Reply via Email</h2>

        <div className="space-y-4">
          {/* Email Content */}
          <textarea
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
            rows="6"
            placeholder="Enter your reply message here..."
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
          ></textarea>

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={sendEmail}
              className="bg-emerald-600 px-6 py-2 rounded hover:bg-emerald-700 transition text-white"
            >
              Send Email
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 px-6 py-2 rounded hover:bg-gray-700 transition text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
