import { useState, useEffect } from 'react'
import { useEventStore } from '../stores/useEventStore'
import CalendarView from '../components/CalendarView'
import NearEvents from '../components/NearEvents'
import PotentialOpportunities from '../components/PotentialOpportunities'
import MeetingsToSchedule from '../components/MeetingsToSchedule'
import SendReminderForm from '../components/SendReminderForm'
import MessageForm from '../components/MessageForm'

const CalendarPage = () => {
  const { fetchAllEvents } = useEventStore()
  const [activeTab, setActiveTab] = useState('calendar')

  useEffect(() => {
    fetchAllEvents()
  }, [])

  return (
    <div className="min-h-screen px-4 py-6">
      {/* ✅ Centered Toggle Buttons */}
      <div className="flex justify-center flex-wrap gap-4 mb-6">
        <button
          className={`px-5 py-2 rounded font-semibold text-white ${
            activeTab === 'calendar' ? 'bg-emerald-600' : 'bg-gray-700'
          }`}
          onClick={() => setActiveTab('calendar')}
        >
          Show Calendar
        </button>
        <button
          className={`px-5 py-2 rounded font-semibold text-white ${
            activeTab === 'opportunities' ? 'bg-emerald-600' : 'bg-gray-700'
          }`}
          onClick={() => setActiveTab('opportunities')}
        >
          Show Opportunities
        </button>
        <button
          className={`px-5 py-2 rounded font-semibold text-white ${
            activeTab === 'meetings' ? 'bg-emerald-600' : 'bg-gray-700'
          }`}
          onClick={() => setActiveTab('meetings')}
        >
          To Schedule
        </button>
        <button
          className={`px-5 py-2 rounded font-semibold text-white ${
            activeTab === 'reminder' ? 'bg-emerald-600' : 'bg-gray-700'
          }`}
          onClick={() => setActiveTab('reminder')}
        >
          Send Reminder
        </button>
      </div>

      {activeTab === 'calendar' && (
        <>
          <CalendarView />
     
        </>
      )}

      {activeTab === 'opportunities' && (
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            <PotentialOpportunities />
          </div>
        </div>
      )}

      {activeTab === 'meetings' && (
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            <MeetingsToSchedule />
          </div>
        </div>
      )}

      {activeTab === 'reminder' && (
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            <SendReminderForm />
          </div>
        </div>

        
      )}<div>
      <h1>Send WhatsApp Message</h1>
      <MessageForm /> {/* Use the MessageForm component */}
    </div>
    </div>


      
  )
}

export default CalendarPage
