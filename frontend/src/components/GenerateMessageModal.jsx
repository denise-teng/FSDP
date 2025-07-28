import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../lib/client';
import { FiCopy , FiRadio } from 'react-icons/fi'

const GenerateMessageModal = ({ onClose }) => {
  const [prompt, setPrompt] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
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
    // Modern clipboard API
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } 
    // Fallback for older browsers
    else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (!success) throw new Error('Copy failed');
    }
    toast.success("Copied to clipboard!");
  } catch (err) {
    toast.error("Failed to copy text");
    console.error('Copy error:', err);
  }
};

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-1 gap-4">
        {/* Input section */}
        <div className="col-span-1">
          <h3 className="text-xl font-semibold mb-4 text-emerald-400">
            Amazon Titan Text Express Generator
          </h3>
          <p className="text-sm text-gray-400 mb-2">
            Enter your prompt below. Titan works best with clear, specific instructions.
          </p>
          <textarea
            className="w-full h-24 bg-gray-700 rounded px-4 py-2 mb-4 placeholder-gray-400"
            placeholder="Example: 'Write a friendly email to a customer about a delayed order'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded"
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
            <span className="text-xs text-gray-400">
              {prompt.length > 0 ? `${prompt.length} characters` : ''}
            </span>
          </div>
        </div>

        {/* Results section */}
        <div className="col-span-1 relative">
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 text-red-200 rounded text-sm">
              {error}
            </div>
          )}

          <textarea
            className="w-full h-64 p-3 bg-gray-700 rounded resize-none placeholder-gray-400"
            placeholder={loading ? "Generating your message..." : "Your AI-generated message will appear here..."}
            value={generatedMessage}
            readOnly
          />
{generatedMessage && (
  <div className="mt-4 flex justify-end space-x-2">
    {/* Broadcast Button (no functionality yet) */}
    <button
      className="p-2 bg-gray-600 hover:bg-gray-500 rounded flex items-center"
      aria-label="Broadcast"
    >
      <FiRadio className="h-5 w-5 text-gray-300" />
    </button>
    
    {/* Copy Button (with working functionality) */}
<button
  onClick={() => handleCopy(generatedMessage)}
  className="p-2 bg-gray-600 hover:bg-gray-500 rounded flex items-center"
  aria-label="Copy to clipboard"
>
  <FiCopy className="h-5 w-5 text-gray-300" />
</button>
    
    {/* Done Button */}
    <button
      onClick={onClose}
      className="px-4 py-2 bg-emerald-600 rounded hover:bg-emerald-500"
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