import { useState, useEffect } from 'react';
import { useEventStore } from '../stores/useEventStore';
import CalendarView from '../components/CalendarView';
import SendReminderForm from '../components/SendReminderForm';
import AnalyzeMeetingsComponent from '../components/AnalyzeMeetingsComponent';

const CalendarPage = () => {
  const { fetchAllEvents } = useEventStore();
  const [activeTab, setActiveTab] = useState('calendar');

  useEffect(() => {
    fetchAllEvents();
  }, []);

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-900 text-white">
      {/* Toggle Buttons */}
      <div className="flex justify-center flex-wrap gap-4 mb-8">
        <button
          className={`px-5 py-2 rounded font-semibold ${
            activeTab === 'calendar' ? 'bg-emerald-600' : 'bg-gray-700'
          }`}
          onClick={() => setActiveTab('calendar')}
        >
          Show Calendar
        </button>
        <button
          className={`px-5 py-2 rounded font-semibold ${
            activeTab === 'reminder' ? 'bg-emerald-600' : 'bg-gray-700'
          }`}
          onClick={() => setActiveTab('reminder')}
        >
          Send Reminder
        </button>
        <button
          className={`px-5 py-2 rounded font-semibold ${
            activeTab === 'analyze' ? 'bg-emerald-600' : 'bg-gray-700'
          }`}
          onClick={() => setActiveTab('analyze')}
        >
          Analyze Meetings
        </button>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto bg-[#1f2937] p-6 rounded-lg shadow-md">
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'reminder' && <SendReminderForm />}
        {activeTab === 'analyze' && <AnalyzeMeetingsComponent />}
      </div>
    </div>
  );
};

export default CalendarPage;
