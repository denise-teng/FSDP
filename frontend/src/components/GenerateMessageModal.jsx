import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../lib/client_backup';
import { FiCopy, FiRadio, FiCheck, FiFileText } from 'react-icons/fi';

const GenerateMessageModal = ({ onClose }) => {
  const [prompt, setPrompt] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter some text in the prompt box", {
        className: 'bg-red-50 text-red-800 font-medium'
      });
      return;
    }

    setLoading(true);
    setGeneratedMessage("");
    setError(null);

    try {
      const response = await axiosInstance.post("/api/generate", {
        prompt,
        model: "titan-text-express"
      });

      let responseData;
      if (typeof response === 'string') {
        responseData = JSON.parse(response);
      } else if (response.data && typeof response.data === 'string') {
        responseData = JSON.parse(response.data);
      } else {
        responseData = response.data || response;
      }

      const generatedText = responseData.generatedText ||
        responseData.data?.generatedText ||
        responseData;

      if (typeof generatedText !== 'string') {
        throw new Error("Invalid response format");
      }

      setGeneratedMessage(generatedText);
    } catch (error) {
      console.error("Error details:", {
        error,
        response: error.response,
        message: error.message
      });
      setError(error.message || "Failed to generate message");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!success) throw new Error('Copy failed');
      }
      
      setCopied(true);
      toast.success(
        <div className="flex items-center">
          <FiCheck className="text-green-500 mr-2" />
          <span>Copied to clipboard!</span>
        </div>,
        {
          autoClose: 2000,
          hideProgressBar: true,
          closeButton: false,
          className: 'bg-green-50 text-green-800 font-medium'
        }
      );
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error(
        <div className="flex items-center">
          <span>Failed to copy text</span>
        </div>,
        {
          className: 'bg-red-50 text-red-800 font-medium'
        }
      );
      console.error('Copy error:', err);
    }
  };

  const handleSaveToDraft = () => {
    if (!generatedMessage) {
      toast.error("No message to save as draft", {
        className: 'bg-red-50 text-red-800 font-medium'
      });
      return;
    }
    
    // Here you would typically save to your database
    toast.success("Saved to drafts!", {
      className: 'bg-green-50 text-green-800 font-medium'
    });
  };

  const handleDone = () => {
    window.location.reload(); // Refresh the page
    onClose(); // Close the modal if needed
  };

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-2xl border border-gray-200 w-full max-w-3xl mx-auto">
      <div className="grid grid-cols-1 gap-4">
        {/* Input Section */}
        <div className="col-span-1">
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Amazon Titan Text Express Generator
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Enter your prompt below. Titan works best with clear, specific instructions.
          </p>
          <textarea
            className="w-full h-24 bg-white border border-gray-300 rounded-xl px-4 py-3 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Example: 'Write a friendly email to a customer about a delayed order'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />
          <div className="flex justify-between items-center mt-3">
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className={`font-semibold py-2 px-6 rounded-xl hover:scale-105 transition-transform shadow ${
                loading || !prompt.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : "Generate Message"}
            </button>
            <span className="text-xs text-indigo-400">
              {prompt.length > 0 ? `${prompt.length} characters` : ''}
            </span>
          </div>
        </div>

        {/* Output Section */}
        <div className="col-span-1 mt-4 relative">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <textarea
            className="w-full h-64 p-4 bg-white border border-gray-300 rounded-xl resize-none placeholder-gray-400 shadow-sm"
            placeholder={loading ? "Generating your message..." : "Your AI-generated message will appear here..."}
            value={generatedMessage}
            readOnly
          />

          {generatedMessage && (
            <div className="mt-4 flex justify-end space-x-2">
              {/* Save to Draft button with tooltip */}
              <div className="relative group">
                <button
                  onClick={handleSaveToDraft}
                  className="p-2 rounded-xl bg-indigo-100 hover:bg-indigo-200 shadow flex items-center"
                  aria-label="Save to draft"
                >
                  <FiFileText className="h-5 w-5 text-indigo-600" />
                </button>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Save to Draft
                </span>
              </div>

              {/* Broadcast button with tooltip */}
              <div className="relative group">
                <button
                  className="p-2 rounded-xl bg-indigo-100 hover:bg-indigo-200 shadow"
                  aria-label="Broadcast"
                >
                  <FiRadio className="h-5 w-5 text-indigo-600" />
                </button>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Broadcast
                </span>
              </div>

              {/* Copy button with tooltip */}
              <div className="relative group">
                <button
                  onClick={() => handleCopy(generatedMessage)}
                  className={`p-2 rounded-xl shadow transition-colors flex items-center ${
                    copied 
                      ? 'bg-green-100 text-green-600'
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                  }`}
                  aria-label="Copy"
                >
                  {copied ? (
                    <>
                      <FiCheck className="h-5 w-5 mr-1" />
                      <span className="text-sm">Copied!</span>
                    </>
                  ) : (
                    <FiCopy className="h-5 w-5" />
                  )}
                </button>
                {!copied && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Copy to Clipboard
                  </span>
                )}
              </div>

              <button
                onClick={handleDone}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-xl shadow hover:scale-105 transition-transform"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateMessageModal;