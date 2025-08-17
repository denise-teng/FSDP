import React, { useState } from 'react';
import { FiCopy, FiRadio, FiCheck, FiFileText } from 'react-icons/fi';
import { useDraftStore } from '../stores/useDraftsStore';
import axiosInstance from '../lib/axios';
import { toast } from 'react-hot-toast';

const GenerateMessageModal = ({ onClose }) => {
  const [prompt, setPrompt] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  const { addDraft } = useDraftStore();

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
      const response = await axiosInstance.post("generate", {
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
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard!", {
        autoClose: 2000,
        hideProgressBar: true,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy text");
      console.error('Copy error:', err);
    }
  };

  const handleSaveToDraft = async () => {
    if (!generatedMessage) {
      toast.error("No message to save as draft");
      return;
    }

    setSaving(true);
    try {
      const formData = {
        title: `Generated Email - ${new Date().toLocaleString()}`,
        content: [generatedMessage],
        type: 'generated',
        sendTo: ['Email'], // Automatically set to Email
        status: 'draft',
        tags: ['ai-generated'],
        audience: [],
        category: 'Financial Planning'
      };

      await addDraft(formData);
      
      toast.success(
        <div className="flex items-center">
          <FiCheck className="text-green-500 mr-2" />
          <span>Saved to drafts!</span>
        </div>,
        { duration: 2000 }
      );

      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save draft",
        { duration: 4000 }
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSendGenerated = async () => {
    if (!generatedMessage.trim()) {
      toast.error("No message to send");
      return;
    }
    
    setSending(true);
    try {
      const resp = await axiosInstance.post("publish-generate/send", {
        title: `Message - ${new Date().toLocaleDateString()}`,
        content: generatedMessage,
        category: "General"
      });
      
      toast.success(
        <div className="flex items-center">
          <FiCheck className="text-green-500 mr-2" />
          <span>Sent to {resp.data.sent} subscribers via Email</span>
        </div>,
        { duration: 3000 }
      );
    } catch (err) {
      console.error("Send error:", err.response?.data || err.message);
      toast.error(
        err.response?.data?.message || "Failed to send message",
        { duration: 4000 }
      );
    } finally {
      setSending(false);
    }
  };

  const handleDone = () => {
    onClose();
  };

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-2xl border border-gray-200 w-full max-w-3xl mx-auto">
      <div className="grid grid-cols-1 gap-4">
        {/* Input Section - Keep your existing input UI */}
        <div className="col-span-1">
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Your Personal Message Generator
          </h3>
          <textarea
            className="w-full h-24 bg-white border border-gray-300 rounded-xl px-4 py-3 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Enter your prompt..."
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
              {loading ? "Generating..." : "Generate Message"}
            </button>
            <span className="text-xs text-indigo-400">
              {prompt.length > 0 ? `${prompt.length} characters` : ''}
            </span>
          </div>
        </div>

        {/* Output Section - Keep your existing output UI */}
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
              <button
                onClick={handleSaveToDraft}
                disabled={saving}
                className={`p-2 rounded-xl shadow flex items-center ${
                  saving ? 'bg-gray-300 text-gray-500' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-600'
                }`}
              >
                {saving ? (
                  <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <FiFileText className="h-5 w-5" />
                )}
                <span className="ml-1 text-sm">Save</span>
              </button>

              <button
                onClick={handleSendGenerated}
                disabled={sending}
                className={`p-2 rounded-xl flex items-center shadow ${
                  sending ? "bg-gray-300 text-gray-500" : "bg-indigo-100 hover:bg-indigo-200"
                }`}
              >
                <FiRadio className="h-5 w-5 text-indigo-600" />
                <span className="ml-1 text-sm">Send</span>
              </button>

              <button
                onClick={() => handleCopy(generatedMessage)}
                className={`p-2 rounded-xl shadow transition-colors flex items-center ${
                  copied ? 'bg-green-100 text-green-600' : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                }`}
              >
                {copied ? (
                  <>
                    <FiCheck className="h-5 w-5 mr-1" />
                    <span className="text-sm">Copied!</span>
                  </>
                ) : (
                  <>
                    <FiCopy className="h-5 w-5 mr-1" />
                    <span className="text-sm">Copy</span>
                  </>
                )}
              </button>

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