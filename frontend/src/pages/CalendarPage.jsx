import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Mail,
  BarChart,
  Users
} from 'lucide-react';
import { useEventStore } from '../stores/useEventStore';
import CalendarView from '../components/CalendarView';
import SendReminderForm from '../components/SendReminderForm';
import AnalyzeMeetingsComponent from '../components/AnalyzeMeetingsComponent';
import ManageConsultationsTab from '../components/ManageConsultationsTab';

const CalendarPage = () => {
  const { fetchAllEvents } = useEventStore();
  const [activeTab, setActiveTab] = useState('calendar');

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const tabOptions = [
    { key: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { key: 'reminder', label: 'Reminders', icon: Mail },
    { key: 'analyze', label: 'Opportunities', icon: BarChart },
    { key: 'consultations', label: 'Consultations', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-[#eef1fd] px-4 py-12 text-gray-800">
      <h1 className="text-3xl font-bold text-center text-indigo-600 mb-10">
        Calendar Dashboard
      </h1>

      {/* Button Group Styled Like Admin Panel */}
      <div className="flex justify-center flex-wrap gap-4 mb-10">
        {tabOptions.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium shadow-sm transition-all
              ${
                activeTab === key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-indigo-50 border border-indigo-200'
              }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Content Panel */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 transition-all">
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'reminder' && <SendReminderForm />}
        {activeTab === 'analyze' && <AnalyzeMeetingsComponent />}
        {activeTab === 'consultations' && <ManageConsultationsTab />}
      </div>
    </div>
  );
};

export default CalendarPage;
