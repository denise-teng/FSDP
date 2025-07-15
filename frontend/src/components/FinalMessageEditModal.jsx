import { useState } from 'react';
import { X } from 'lucide-react';

export default function FinalMessageEditModal({ initialContent, onClose, onSend, onBack }) {
  const [text, setText] = useState(initialContent || '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl text-white relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-emerald-400 text-center">
          Edit & Send Message
        </h2>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
        />

        <div className="mt-4 flex justify-between">
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded"
          >
            Back
          </button>
          <button
            onClick={() => onSend(text)}
            className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
