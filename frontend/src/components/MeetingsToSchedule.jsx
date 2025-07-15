import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Info, Send } from 'lucide-react';

const MeetingsToSchedule = () => {
  const [activeMessage, setActiveMessage] = useState(null);
  const [showSendPopup, setShowSendPopup] = useState(null);
  const [sendText, setSendText] = useState('');

  const meetings = [
    { name: 'Victor Chew', phone: '+66 9912 9192' },
    { name: 'Lee Xing Hui', phone: '+65 6152 1922' },
  ];

  const handleSend = (name) => {
    toast.success(`Message sent to ${name}`);
    setShowSendPopup(null);
    setSendText('');
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-xl shadow-md max-w-3xl mx-auto mt-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">Meetings to Schedule</h2>

      {meetings.map((m, i) => (
        <div key={i} className="bg-gray-700 rounded-lg p-4 mb-4 border border-gray-600 shadow-sm">
          <div className="font-bold text-lg">{m.name}</div>
          <div className="text-gray-300">{m.phone}</div>

          <div className="mt-2 text-sm flex items-center">
            <span className="mr-2 text-gray-400">Rec timing: 1:00PM - 6:00PM</span>
            <div className="relative group inline-block cursor-pointer">
              <Info className="w-4 h-4 text-gray-400" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded shadow">
                Answers texts most frequently: Sunday, 12PM–5PM
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
              onClick={() => setActiveMessage(i)}
            >
              View Message
            </button>
            <button
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-sm"
              onClick={() => {
                setShowSendPopup(i);
                setSendText(`Hi ${m.name}, just checking when you'd be available to meet?`);
              }}
            >
              Send
            </button>
          </div>

          {activeMessage === i && (
            <div className="bg-gray-900 border border-gray-700 mt-3 p-3 rounded relative text-gray-200">
              <p className="mb-2 italic">“Yeah sure I'd love to meet up to discuss this further!”</p>
              <button
                className="absolute top-1 right-2 text-xs text-gray-500 hover:text-white"
                onClick={() => setActiveMessage(null)}
              >
                ✖
              </button>
            </div>
          )}

          {showSendPopup === i && (
            <div className="bg-gray-900 border border-gray-700 mt-3 p-3 rounded relative">
              <textarea
                className="w-full bg-gray-800 text-white p-2 border border-gray-600 rounded mb-2"
                value={sendText}
                onChange={(e) => setSendText(e.target.value)}
              />
              <div className="flex justify-between">
                <button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
                  onClick={() => handleSend(m.name)}
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
                <button
                  className="text-sm text-gray-400 hover:text-white"
                  onClick={() => setShowSendPopup(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MeetingsToSchedule;
