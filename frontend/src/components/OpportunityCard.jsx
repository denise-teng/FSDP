import React from 'react';
import { Send, Trash2 } from 'lucide-react';

const OpportunityCard = ({ name, message, gender, onSend, onDelete }) => {
  return (
    <div className="bg-gray-800 text-white rounded-xl p-4 shadow border border-gray-700 hover:shadow-md transition">
      <div className="mb-2">
        <span className="font-semibold text-base">{name}</span>{' '}
        <span className="text-sm text-gray-400">replied:</span>
      </div>

      <blockquote className="italic border-l-4 border-gray-600 pl-4 text-sm text-gray-300 mb-3">
        “{message}”
      </blockquote>

      <p className="text-sm text-gray-400 mb-4">
        Would you like to send an automated message to schedule a meeting with {gender === 'male' ? 'him' : 'her'}?
      </p>

      <div className="flex gap-3">
        <button
          onClick={onSend}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1 rounded flex items-center gap-1"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
        <button
          onClick={onDelete}
          className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default OpportunityCard;
