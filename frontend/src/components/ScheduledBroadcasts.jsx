import { useEffect, useState } from 'react';
import axios from '../lib/axios';

export default function ScheduledBroadcasts() {
  const [scheduled, setScheduled] = useState([]);

  useEffect(() => {
    axios.get('/broadcasts/scheduled').then(res => setScheduled(res.data));
  }, []);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md text-white">
      <h2 className="text-xl font-semibold mb-4 text-emerald-300">Scheduled Broadcast</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left bg-gray-900 rounded-md shadow border border-gray-700">
          <thead className="bg-gray-700 text-emerald-300">
            <tr>
              <th className="px-4 py-2">Message Title</th>
              <th className="px-4 py-2">List</th>
              <th className="px-4 py-2">Schedule Date</th>
              <th className="px-4 py-2">Channel</th>
              <th className="px-4 py-2">Recipients</th>
              <th className="px-4 py-2">Sync with Calendar</th>
            </tr>
          </thead>
          <tbody>
            {scheduled.map((item, idx) => (
              <tr key={idx} className="border-t border-gray-700 hover:bg-gray-800">
                <td className="px-4 py-2">{item.title}</td>
                <td className="px-4 py-2">{item.listName}</td>
                <td className="px-4 py-2">{new Date(item.scheduledTime).toLocaleString()}</td>
                <td className="px-4 py-2">{item.channel}</td>
                <td className="px-4 py-2">{item.recipients}</td>
                <td className="px-4 py-2">
                  <input type="checkbox" checked={item.syncCalendar} readOnly />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
