// CalendarView.jsx
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useEventStore } from '../stores/useEventStore';
import CreateEventForm from './CreateEventForm';
import EventCard from './EventCard';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Local YYYY-MM-DD from Date object
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Parse event.date robustly (avoids UTC shift with plain "YYYY-MM-DD")
const parseEventDate = (value) => {
  if (!value) return null;
  if (typeof value === 'string') {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const [_, yy, mm, dd] = m;
      return new Date(Number(yy), Number(mm) - 1, Number(dd));
    }
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

  // Month-scope events
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
        ? event.name?.toLowerCase().includes(searchName.toLowerCase().trim())
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
          onDateSelect?.(newDate);
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
      className="space-y-6 max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ===== Header Card (matches your Contact Management card) ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-indigo-50 shadow-md">
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow">
                  <CalendarIcon className="h-5 w-5" />
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5b4ae2]">
                  {mode === 'admin' ? 'Contact Management · Calendar' : 'Book Consultation'}
                </h1>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Manage events, send reminders, and review consultations.
              </p>
            </div>

            {/* badge like your header icon */}
            <div className="shrink-0">
              <div className="relative">
                <div className="h-12 w-12 rounded-2xl grid place-items-center bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-400 ring-4 ring-white" />
              </div>
            </div>
          </div>

          {/* Controls row (styled pills) */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Month nav */}
            <div className="flex items-center gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:border-indigo-300"
                onClick={handlePrevMonth}
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <div className="rounded-full bg-indigo-50/70 px-4 py-2 text-sm font-semibold text-indigo-700 border border-indigo-100">
                {new Date(currentYear, currentMonth).toLocaleString('default', {
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:border-indigo-300"
                onClick={handleNextMonth}
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1" />

            {/* Search pill */}
            <div className="relative w-full sm:w-auto sm:min-w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name…"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full rounded-full border border-indigo-100 bg-white pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            {/* Filter pill */}
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none rounded-full border border-indigo-100 bg-white pl-9 pr-8 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">All Types</option>
                <option value="Broadcast">Broadcast</option>
                <option value="Consultation">Consultation</option>
                <option value="Sales">Sales</option>
                <option value="Service">Service</option>
                <option value="Policy-updates">Policy Updates</option>
                <option value="AdminBlock">Admin Block</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">▾</span>
            </div>
          </div>
        </div>

        {/* ===== DO NOT CHANGE: your original grid markup stays as-is ===== */}
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
      </div>

      {/* Admin Add Event */}
      {selectedDate && mode === 'admin' && (
        <div className="text-center">
          <button
            onClick={() => setShowForm(true)}
            className="rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 py-2 text-sm font-semibold text-white shadow hover:shadow-md"
          >
            + Add Event
          </button>
        </div>
      )}

      {/* Selected Day Events */}
      {selectedDate && selectedEvents.length > 0 && (
        <div className="rounded-3xl border border-indigo-50 bg-white p-5 sm:p-6 shadow">
          <h3 className="text-lg font-semibold text-[#5b4ae2] mb-3">
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
