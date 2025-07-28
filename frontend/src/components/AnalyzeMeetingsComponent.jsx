import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SendReminderForm = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/auth/users');
        setUsers(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load users');
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = async () => {
    if (!selectedUser || !message.trim()) {
      return toast.error('Select a user and enter a message');
    }

    try {
      await axios.post('/api/notifications', {
        userId: selectedUser._id,
        text: message.trim(),
        trigger: '/secret-calendar',
      });

      toast.success('Reminder sent!');
      setSelectedUser(null);
      setMessage('');
      setSearchQuery('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to send reminder');
    }
  };

  return (
    <div className="flex justify-center p-6 bg-gray-950 min-h-screen">
      <div className="w-full max-w-3xl bg-gray-900 text-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold text-emerald-400 mb-6">Send Reminder</h2>

        <div className="space-y-4 mb-6">
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedUser(null);
              }}
              placeholder="Search user by name or email..."
              className="w-full bg-gray-800 text-sm text-white rounded px-4 py-2 placeholder-gray-400 border border-gray-600"
            />
            {searchQuery && (
              <ul className="bg-gray-800 border border-gray-700 mt-1 rounded max-h-40 overflow-y-auto text-sm">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <li
                      key={user._id}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-700 ${
                        selectedUser?._id === user._id ? 'bg-gray-700' : ''
                      }`}
                      onClick={() => {
                        setSelectedUser(user);
                        setSearchQuery(`${user.name} (${user.email})`);
                      }}
                    >
                      {user.name} ({user.email})
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-400">No users found</li>
                )}
              </ul>
            )}
          </div>

          <textarea
            placeholder="Enter reminder message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full bg-gray-800 border border-gray-600 text-sm text-white rounded px-4 py-2 placeholder-gray-400"
          />

          <div className="flex justify-end">
            <button
              onClick={handleSend}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-md flex items-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
              Send Reminder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendReminderForm;
