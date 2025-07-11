import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUserStore } from '../stores/useUserStore';
import { toast } from 'react-hot-toast';

const Notifications = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const { user } = useUserStore();

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`/api/notifications/${user?._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      toast.error('Failed to load notifications');
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      toast.success('Notification deleted!');
      setMessages((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete notification');
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
    }
  }, [user]);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-md mx-auto border border-gray-200">
      <h2 className="text-xl font-semibold mb-3 text-emerald-600">Notifications</h2>
      <ul className="space-y-2">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <li
              key={msg._id}
              className="bg-gray-100 p-3 rounded text-gray-800 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <span>{msg.text}</span>
                <button
                  onClick={() => handleDeleteNotification(msg._id)}
                  className="text-red-500 text-sm"
                >
                  ❌
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="text-gray-500">No new notifications.</p>
        )}
      </ul>
    </div>
  );
};

export default Notifications;
