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

  const tabs = [
    { key: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { key: 'reminder', label: 'Reminders', icon: Mail },
    { key: 'analyze', label: 'Opportunities', icon: BarChart },
    { key: 'consultations', label: 'Consultations', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9ff] to-[#eef1fd] px-3 sm:px-6 py-10 text-gray-800">
      {/* Page Header Card */}
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl border border-indigo-50 px-6 sm:px-10 py-8">
          {/* soft corner blobs */}
          <span className="pointer-events-none absolute -left-8 -bottom-8 h-28 w-28 rounded-full bg-fuchsia-100/70 blur-xl" />
          <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-100/70 blur-xl" />

          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-6 w-6 text-indigo-500" />
                <p className="text-sm tracking-wide text-indigo-500 font-semibold">
                  Dashboard
                </p>
              </div>
              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold leading-tight bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                Calendar & Meetings Hub
              </h1>
              <p className="mt-2 text-gray-500">
                Manage events, send reminders, analyze opportunities, and handle consultations — all in one place.
              </p>
            </div>

            {/* gradient icon badge like the reference */}
            <div className="shrink-0">
              <div className="relative">
                <div className="h-14 w-14 rounded-2xl shadow-lg grid place-items-center
                                bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
                  <CalendarIcon className="h-6 w-6" />
                </div>
                <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-amber-400 ring-4 ring-white" />
              </div>
            </div>
          </div>

          {/* Tabs — pill buttons bar */}
          <div className="mt-7">
            <div className="flex flex-wrap gap-3">
              {tabs.map(({ key, label, icon: Icon }) => {
                const active = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={[
                      'group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all',
                      'border',
                      active
                        ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white border-transparent shadow-md'
                        : 'bg-white text-gray-700 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50'
                    ].join(' ')}
                  >
                    <Icon className={active ? 'h-4 w-4 text-white' : 'h-4 w-4 text-indigo-500'} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="mt-8">
          <div className="mx-auto max-w-7xl rounded-3xl bg-white border border-indigo-50 shadow-lg p-5 sm:p-8">
            {activeTab === 'calendar' && <CalendarView />}
            {activeTab === 'reminder' && <SendReminderForm />}
            {activeTab === 'analyze' && <AnalyzeMeetingsComponent />}
            {activeTab === 'consultations' && <ManageConsultationsTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
