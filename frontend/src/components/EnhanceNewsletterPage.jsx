// src/pages/EnhanceNewsletterPage.jsx
import React, { useState } from 'react';
import axios from 'axios';

const EnhanceNewsletterPage = () => {
  const [newsletterId, setNewsletterId] = useState('');
  const [enhancedContent, setEnhancedContent] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);  // To manage the loading state

  const handleEnhanceNewsletter = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/newsletters/enhance', {
        newsletterId,
        enhancedContent,
      });
      setMessage('Newsletter enhanced successfully!');
    } catch (error) {
      setMessage('Error enhancing newsletter');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-center text-white mb-6">Enhance Your Newsletter</h2>
      
      <div className="mb-4">
        <label htmlFor="newsletterId" className="block text-white mb-2">Newsletter ID</label>
        <input
          id="newsletterId"
          type="text"
          placeholder="Enter Newsletter ID"
          value={newsletterId}
          onChange={(e) => setNewsletterId(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-700 text-white border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="enhancedContent" className="block text-white mb-2">Enhanced Content</label>
        <textarea
          id="enhancedContent"
          placeholder="Write the enhanced content here"
          value={enhancedContent}
          onChange={(e) => setEnhancedContent(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-700 text-white border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="6"
        ></textarea>
      </div>
      
      <button
        onClick={handleEnhanceNewsletter}
        className="w-full py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        disabled={isLoading || !newsletterId || !enhancedContent}
      >
        {isLoading ? 'Enhancing...' : 'Enhance Newsletter'}
      </button>

      {message && (
        <p className={`mt-4 text-center ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default EnhanceNewsletterPage;
