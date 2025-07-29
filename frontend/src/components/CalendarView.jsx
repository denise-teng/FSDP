import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '../stores/useUserStore';
import { useEventStore } from '../stores/useEventStore';
import CreateEventForm from './CreateEventForm';
import EventCard from './EventCard';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarView = ({ mode = 'admin' }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState(mode === 'admin' ? '' : 'Consultation');
  const [searchName, setSearchName] = useState('');
  const { user } = useUserStore();
  const { events, fetchAllEvents, updateEvent } = useEventStore();
  const [hoveredDay, setHoveredDay] = useState(null);

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const handleApprove = async (eventId) => {
    await updateEvent(eventId, { status: 'approved' });
    fetchAllEvents();
  };

  const handleReject = async (eventId) => {
    await updateEvent(eventId, { status: 'rejected' });
    fetchAllEvents();
  };

  const selectedEvents = useMemo(() => {
    if (!selectedDate || !events) return [];
    return events.filter((event) => {
      const d = new Date(event.date);
      const isSameDay =
        d.getDate() === selectedDate.getDate() &&
        d.getMonth() === selectedDate.getMonth() &&
        (d.getFullYear() === selectedDate.getFullYear() || event.isPermanent);
      const matchesType = filterType ? event.type === filterType : true;
      const matchesSearch = searchName
        ? event.name?.toLowerCase().includes(searchName.toLowerCase())
        : true;
      const isOwnRequest = mode === 'request' && event.requestedBy === user?.email;
      
      return isSameDay && matchesType && matchesSearch && 
             (mode === 'admin' || isOwnRequest || event.status === 'approved');
    });
  }, [selectedDate, events, filterType, searchName, mode, user]);

  const getEventColorsForDay = (day) => {
    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      const isPermanentEvent =
        event.isPermanent &&
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentMonth;
      const isSameDay =
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentMonth &&
        eventDate.getFullYear() === currentYear;
      return (isSameDay || isPermanentEvent) && 
             (filterType ? event.type === filterType : true) &&
             (mode === 'admin' || event.status === 'approved');
    });

    const eventColors = {
      Broadcast: 'bg-blue-500',
      Consultation: mode === 'admin' ? 'bg-green-500' : 'bg-green-300',
      Sales: 'bg-yellow-500',
      Service: 'bg-purple-500',
      'Policy-updates': 'bg-red-500',
    };

    const colors = dayEvents.slice(0, 3).map((event) => 
      eventColors[event.type] || 'bg-gray-500'
    );

    return { colors, totalEvents: dayEvents.length };
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const types = ['Broadcast', 'Consultation', 'Sales', 'Service', 'Policy-updates'];
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const calendarDays = Array.from({ length: firstDayOfWeek + daysInMonth }, (_, i) => {
    const day = i - firstDayOfWeek + 1;
    if (i < firstDayOfWeek) return <div key={`empty-${i}`}></div>;

    const { colors, totalEvents } = getEventColorsForDay(day);
    const isSelected =
      selectedDate &&
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear;

    return (
      <div
        key={day}
        onClick={() => setSelectedDate(new Date(currentYear, currentMonth, day))}
        onMouseEnter={() => setHoveredDay(day)}
        onMouseLeave={() => setHoveredDay(null)}
        className={`cursor-pointer relative rounded-md border ${
  isSelected ? 'bg-emerald-100 border-emerald-400' : 'bg-white'
} hover:bg-emerald-50`}

      >
        <span className="relative z-10 text-black font-medium">{day}</span>


        {colors.length > 0 && (
          <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-start">
            {colors.map((color, idx) => (
              <div key={idx} className={`${color} w-full h-1/6`} />
            ))}
          </div>
        )}

        {hoveredDay === day && totalEvents > 3 && (
          <div className="absolute top-0 left-0 w-full h-full bg-gray-800 bg-opacity-80 text-white flex items-center justify-center text-xs z-20">
            <span>{`+${totalEvents - 3} more ${mode === 'admin' ? 'events' : 'bookings'}`}</span>
          </div>
        )}
      </div>
    );
  });

  return (
    <motion.div
      className="bg-gray-100 shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="text-3xl font-bold text-blue-600 mb-2">
  {mode === 'admin' ? 'CALENDAR MANAGEMENT' : 'BOOK CONSULTATION'}
</h1>


      {/* Month Nav */}
      <div className="flex items-center justify-between mb-4 text-gray-700 font-medium">

        <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full px-4 py-1 text-sm" onClick={handlePrevMonth}>
          Prev
        </button>
        <h2>
          {new Date(currentYear, currentMonth).toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full px-4 py-1 text-sm" onClick={handleNextMonth}>
          Next
        </button>
      </div>

      {/* Filter/Search (only for admin) */}
      {mode === 'admin' && (
        <div className="flex flex-col sm:flex-row justify-between gap-2 mb-4">
          <input
  type="text"
  placeholder="Search by event name..."
  value={searchName}
  onChange={(e) => setSearchName(e.target.value)}
  className="w-full sm:w-1/2 px-3 py-1 rounded-md bg-white text-gray-800 border border-gray-300"
/>
<select
  value={filterType}
  onChange={(e) => setFilterType(e.target.value)}
  className="w-full sm:w-1/2 px-3 py-1 rounded-md bg-white text-gray-800 border border-gray-300"
>

            <option value="">All Types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-gray-700 text-sm gap-px bg-gray-100 [&>div]:p-2 text-center font-semibold uppercase">

        {weekdays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-100 [&>div]:p-4 [&>div]:text-gray-800 text-center">

        {calendarDays}
      </div>

      {/* Events for Selected Date */}
      {selectedDate && (
        <div className="text-gray-800 mt-6 text-center">

          <p className="mb-2">Selected Date: {selectedDate.toDateString()}</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-1 rounded text-sm font-medium"
          >
            {mode === 'admin' ? 'Add Event' : 'Request Consultation'}
          </button>
        </div>
      )}

      {selectedDate && selectedEvents.length > 0 && (
        <div className="mt-4 space-y-4">
          {selectedEvents.map((event, idx) => (
            <EventCard
              key={idx}
              event={event}
              mode={mode}
              onEdit={(event) => {
                setSelectedDate(new Date(event.date));
                setShowForm(true);
              }}
              onApprove={mode === 'admin' ? () => handleApprove(event._id) : null}
              onReject={mode === 'admin' ? () => handleReject(event._id) : null}
            />
          ))}
        </div>
      )}
      {selectedDate && selectedEvents.length === 0 && (
        <div className="text-gray-500 text-center mt-4 italic">

          {mode === 'admin' ? 'No events on this date' : 'No available slots on this date'}
        </div>
      )}

      {showForm && (
        <CreateEventForm
          selectedDate={selectedDate}
          mode={mode}
          defaultType={mode === 'request' ? 'Consultation' : undefined}
          defaultStatus={mode === 'request' ? 'pending' : 'approved'}
          userEmail={user?.email}
          onClose={() => {
            setShowForm(false);
            setSelectedDate(null);
          }}
        />
      )}
    </motion.div>
  );
};

export default CalendarView;