// CalendarView.jsx
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useEventStore } from '../stores/useEventStore';
import CreateEventForm from './CreateEventForm';
import EventCard from './EventCard';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Local YYYY-MM-DD from Date object
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Parse event.date robustly (avoids UTC shift with plain "YYYY-MM-DD")
const parseEventDate = (value) => {
  if (!value) return null;
  if (typeof value === 'string') {
    // If it's already YYYY-MM-DD, construct local date
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const [_, yy, mm, dd] = m;
      return new Date(Number(yy), Number(mm) - 1, Number(dd));
    }
    // Fallback: let Date parse ISO
    return new Date(value);
  }
  return new Date(value);
};

const CalendarView = ({ mode = 'admin', onDateSelect, adminEvents = [] }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState(mode === 'admin' ? '' : 'Consultation');
  const [searchName, setSearchName] = useState('');
  const { events, fetchAllEvents, updateEvent } = useEventStore();

  useEffect(() => {
    fetchAllEvents(true);
  }, [fetchAllEvents]);

  // Always compute a locally-filtered list for the visible month
  const monthEvents = useMemo(() => {
    if (!events?.length) return [];
    return events.filter((ev) => {
      const d = parseEventDate(ev.date);
      return d && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [events, currentMonth, currentYear]);

  

  const handleApprove = async (eventId) => {
    await updateEvent(eventId, { status: 'approved' });
    fetchAllEvents();
  };

  const handleReject = async (eventId) => {
    await updateEvent(eventId, { status: 'rejected' });
    fetchAllEvents();
  };

const getEventColorsForDay = (day) => {


  const dayEvents = monthEvents.filter((event) => {
    const d = parseEventDate(event.date);
    if (!d) return false;

    const matchesType = filterType ? event.type === filterType : true;
    const matchesSearch = searchName
      ? event.name.toLowerCase().includes(searchName.toLowerCase().trim())
      : true;

    return (
      d.getDate() === day &&
      matchesType &&
      matchesSearch &&
      (mode === 'admin' || event.status === 'approved')
    );
  });

  const eventColors = {
    Broadcast: 'bg-blue-500',
    Consultation: 'bg-green-500',
    Sales: 'bg-yellow-500',
    Service: 'bg-purple-500',
    'Policy-updates': 'bg-red-500',
    AdminBlock: 'bg-gray-600',
  };

  const colors = dayEvents.slice(0, 3).map(
    (event) => eventColors[event.type] || 'bg-gray-500'
  );

  return { colors, totalEvents: dayEvents.length };
};


  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

const selectedEvents = useMemo(() => {
  if (!selectedDate || !events) return [];
  const selectedYmd = ymd(selectedDate);

  return events.filter((ev) => {
    const d = parseEventDate(ev.date);
    if (!d) return false;

    const evYmd = ymd(d);

    // --- FILTER + SEARCH ---
    const matchesType = filterType ? ev.type === filterType : true;
    const matchesSearch = searchName
      ? ev.name?.toLowerCase().includes(searchName.toLowerCase())
      : true;

    if (mode === 'admin') {
      return evYmd === selectedYmd && matchesType && matchesSearch;
    }

    return (
      evYmd === selectedYmd &&
      ev.type === 'Consultation' &&
      ev.status === 'approved' &&
      matchesType &&
      matchesSearch
    );
  });
}, [selectedDate, events, mode, filterType, searchName]);



  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = Array.from({ length: firstDayOfWeek + daysInMonth }, (_, i) => {
    const day = i - firstDayOfWeek + 1;
    if (i < firstDayOfWeek) return <div key={`empty-${i}`}></div>;

    const { colors } = getEventColorsForDay(day);
    const isSelected =
      selectedDate &&
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear;

    return (
      <div
        key={day}
        onClick={() => {
          const newDate = new Date(currentYear, currentMonth, day);
          setSelectedDate(newDate);
          onDateSelect?.(newDate); // keep user booking page synced
        }}
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

      <div className="flex items-center justify-between mb-4 text-gray-700 font-medium">
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full px-4 py-1 text-sm"
          onClick={handlePrevMonth}
        >
          Prev
        </button>
        <h2>
          {new Date(currentYear, currentMonth).toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full px-4 py-1 text-sm"
          onClick={handleNextMonth}
        >
          Next
        </button>
      </div>

          <div className="flex items-center justify-between mb-4 gap-4">
  {/* Search by name */}
  <input
    type="text"
    placeholder="Search events by name..."
    value={searchName}
    onChange={(e) => setSearchName(e.target.value)}
    className="flex-1 px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-400"
  />

  {/* Filter by type */}
  <select
    value={filterType}
    onChange={(e) => setFilterType(e.target.value)}
    className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-400"
  >
    <option value="">All Types</option>
    <option value="Broadcast">Broadcast</option>
    <option value="Consultation">Consultation</option>
    <option value="Sales">Sales</option>
    <option value="Service">Service</option>
    <option value="Policy-updates">Policy Updates</option>
    <option value="AdminBlock">Admin Block</option>
  </select>
</div>


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

      {/* Admin Add Event */}
      {selectedDate && mode === 'admin' && (
        <div className="text-gray-800 mt-6 text-center">
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-1 rounded text-sm font-medium"
          >
            Add Event
          </button>
        </div>
      )}

      {/* Selected Day Events */}
      {selectedDate && selectedEvents.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Events on {selectedDate.toDateString()}
          </h3>
          <div className="space-y-3">
            {selectedEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                mode={mode}
                onApprove={() => handleApprove(event._id)}
                onReject={() => handleReject(event._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Event Form */}
      {showForm && (  
        <CreateEventForm
          selectedDate={selectedDate}
          onClose={() => setShowForm(false)}
          mode={mode}
        />
      )}
    </motion.div>
  );
};

export default CalendarView;
