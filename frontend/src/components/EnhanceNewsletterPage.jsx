import { useState } from 'react';
import axios from 'axios';
import ErrorBoundary from '../components/ErrorBoundary';

const EnhanceNewsletterPage = () => {
  const [file, setFile] = useState(null);
  const [improvements, setImprovements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage({ text: '', isError: false });
    setImprovements([]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ text: 'Please select a file first', isError: true });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', isError: false });

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
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header Card */}
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100/50 p-8 mb-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>

            <div className="relative flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  ✨ Newsletter Enhancer
                </h2>
                <p className="text-gray-600 text-lg">
                  Upload your newsletter draft and get AI-powered suggestions to improve engagement and clarity
                </p>
              </div>
              <div className="relative">
                <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                  <svg 
                    className="h-8 w-8 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                    />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse flex items-center justify-center">
                  <span className="text-xs font-bold text-white">AI</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white/90 rounded-2xl shadow-xl border border-gray-100/50 p-8">
            {/* File Upload Section */}
            <div className="mb-8">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="file">
                Upload Newsletter File
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center px-6 py-12 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-500 transition-colors group">
                    <div className="text-center">
                      <svg 
                        className="mx-auto h-12 w-12 text-gray-400 group-hover:text-indigo-500 transition-colors" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600 group-hover:text-indigo-700 transition-colors">
                        {file ? file.name : 'Drag and drop or click to select file'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 group-hover:text-indigo-600 transition-colors">
                        Supports: TXT, DOCX, PDF (Max 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      id="file"
                      onChange={handleFileChange}
                      accept=".txt,.docx,.pdf"
                      className="hidden"
                    />
                  </div>
                </label>
              </div>
            </div>

            {/* Analyze Button */}
            <div className="flex justify-center mb-8">
              <button
                onClick={handleUpload}
                disabled={isLoading || !file}
                className={`px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-95
                  ${isLoading || !file 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'}
                `}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg 
                      className="w-5 h-5 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Analyze with AI
                  </span>
                )}
              </button>
            </div>

            {/* Message display */}
            {message.text && (
              <div className={`mb-8 p-4 rounded-xl ${message.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                <div className="flex items-center justify-center">
                  {message.isError ? (
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="font-medium">{message.text}</span>
                </div>
              </div>
            )}

            {/* Results Section */}
            {improvements.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
                  <h3 className="text-2xl font-semibold text-gray-800">
                    Improvement Suggestions
                  </h3>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                    {improvements.length} suggestions
                  </span>
                </div>
                <div className="space-y-6">
                  {improvements.map((item, index) => (
                    <div key={index} className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-4 font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-800 mb-1">{item.section}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">Current Version</p>
                              <div className="p-3 bg-white rounded-lg border border-gray-200 text-gray-700">
                                {item.current}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">Suggested Improvement</p>
                              <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-green-800">
                                {item.suggestion}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-500 mb-1">Reason</p>
                            <p className="text-gray-600">{item.reason}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default EnhanceNewsletterPage;