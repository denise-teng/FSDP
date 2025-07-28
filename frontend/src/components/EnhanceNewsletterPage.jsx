import React, { useState } from 'react';
import axios from 'axios';

const EnhanceNewsletterPage = () => {
  const [file, setFile] = useState(null);
  const [improvements, setImprovements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage({ text: '', isError: false }); // Clear message when new file selected
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ text: 'Please select a file first', isError: true });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', isError: false });
    setImprovements([]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        '/api/enhance-newsletter/analyze',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setImprovements(response.data.improvements);
        setMessage({ text: 'Analysis complete!', isError: false });
      } else {
        setMessage({ 
          text: response.data.error || 'Analysis failed', 
          isError: true 
        });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error analyzing file';
      setMessage({ text: errorMsg, isError: true });
      console.error('Upload error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-center text-white mb-6">
        Analyze Newsletter with AI
      </h2>
      
      {/* File upload input */}
      <div className="mb-6">
        <label className="block text-white mb-2" htmlFor="file">
          Upload Newsletter File (TXT, DOCX, PDF)
        </label>
        <input
          type="file"
          id="file"
          onChange={handleFileChange}
          accept=".txt,.docx,.pdf"
          className="block w-full text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />
      </div>
      
      {/* Analyze button */}
      <button
        onClick={handleUpload}
        disabled={isLoading || !file}
        className="w-full py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-blue-400"
      >
        {isLoading ? 'Analyzing...' : 'Analyze with AI'}
      </button>

      {/* Message display */}
      {message.text && (
        <p className={`mt-4 text-center ${message.isError ? 'text-red-500' : 'text-green-500'}`}>
          {message.text}
        </p>
      )}

      {/* Results table */}
      {improvements.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">
            Improvement Suggestions
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left text-white">Section</th>
                  <th className="px-4 py-3 text-left text-white">Current</th>
                  <th className="px-4 py-3 text-left text-white">Suggested Improvement</th>
                  <th className="px-4 py-3 text-left text-white">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {improvements.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800'}>
                    <td className="px-4 py-3 text-white">{item.section}</td>
                    <td className="px-4 py-3 text-gray-300">{item.current}</td>
                    <td className="px-4 py-3 text-green-300">{item.suggestion}</td>
                    <td className="px-4 py-3 text-gray-400">{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhanceNewsletterPage;