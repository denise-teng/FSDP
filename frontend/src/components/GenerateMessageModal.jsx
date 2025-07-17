import { useState } from "react";
import toast from "react-hot-toast";
import axios from "../lib/axios";
import { Send, Pencil, Save } from "lucide-react";

const GenerateMessageModal = ({ onClose }) => {
  const [prompt, setPrompt] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return toast.error("Please enter a prompt");
    setLoading(true);
    setGeneratedMessage("");

    try {
      const res = await axios.post("/generate", { prompt });
      setGeneratedMessage(res.data.generatedText);
    } catch {
      toast.error("Failed to generate message");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedMessage) return toast.error("Nothing to save");

    try {
      await axios.post("/drafts", {
        title: prompt,
        content: generatedMessage,
        type: "generated",
      });
      toast.success("Saved to drafts!");
      if (onClose) onClose();
    } catch (err) {
      toast.error("Save failed");
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-1 gap-4">
        <div className="col-span-1">
          <h3 className="text-xl font-semibold mb-4 text-emerald-400">Message Generator</h3>
          <input
            className="w-full bg-gray-700 rounded px-4 py-2 mb-4 placeholder-gray-400"
            placeholder="Describe what you want to generate"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded mb-4"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Message"}
          </button>
        </div>

        <div className="col-span-1 relative">
          <textarea
            className="w-full h-48 p-3 bg-gray-700 rounded resize-none placeholder-gray-400"
            placeholder="Generated message appears here..."
            value={generatedMessage}
            onChange={(e) => setGeneratedMessage(e.target.value)}
            readOnly={!isEditable}
          />

          <div className="absolute bottom-2 right-2 flex space-x-2">
            <button className="text-gray-300 hover:text-blue-400">
              <Send size={18} />
            </button>
            <button
              onClick={() => setIsEditable(!isEditable)}
              className="text-gray-300 hover:text-yellow-400"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={handleSave}
              className="text-gray-300 hover:text-green-400"
            >
              <Save size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateMessageModal;