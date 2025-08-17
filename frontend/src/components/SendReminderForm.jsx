import React, { useState, useEffect, useMemo } from 'react'
import { Send, Calendar, Clock, MapPin, Info } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from '../lib/axios'

// ===== Helpers =====
const parseEventDate = (value) => {
  if (!value) return null
  if (typeof value === 'string') {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (m) {
      const [_, yy, mm, dd] = m
      return new Date(Number(yy), Number(mm) - 1, Number(dd))
    }
    return new Date(value)
  }
  return new Date(value)
}
const timeToMinutes = (timeStr) => {
  if (!timeStr) return null
  const [h, m] = String(timeStr).split(':').map(Number)
  return h * 60 + (m || 0)
}

const SendReminderForm = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [message, setMessage] = useState('')
  const [events, setEvents] = useState([])
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/auth/users')
        setUsers(res.data || [])
        setFilteredUsers(res.data || [])
      } catch (err) {
        console.error(err)
        toast.error('Failed to load users')
      }
    }
    fetchUsers()
  }, [])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('/events')
        setEvents(res.data || [])
      } catch (err) {
        console.error(err)
        toast.error('Failed to load events')
      }
    }
    fetchEvents()
  }, [])

  useEffect(() => {
    const searchLower = search.toLowerCase()
    setFilteredUsers(
      users.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchLower) ||
          u.email?.toLowerCase().includes(searchLower)
      )
    )
  }, [search, users])

  const consultationEvents = useMemo(() => {
    if (!events?.length) return []
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    return events
      .filter((ev) => {
        const d = parseEventDate(ev.date)
        return (
          d &&
          d >= startOfWeek &&
          d < endOfWeek &&
          ev.type?.toLowerCase() === 'consultation'
        )
      })
      .sort((a, b) => {
        const da = parseEventDate(a.date)
        const db = parseEventDate(b.date)
        if (!da || !db) return 0
        if (da.getTime() === db.getTime()) {
          return (timeToMinutes(a.startTime) ?? 9999) - (timeToMinutes(b.startTime) ?? 9999)
        }
        return da - db
      })
  }, [events])

  const handleSend = async () => {
    if (!selectedUser || !message) return toast.error('Please select a user and enter a message')
    try {
      await axios.post('/notifications', {
        userId: selectedUser._id,
        text: message,
        trigger: '/secret-calendar',
      })
      toast.success('Reminder sent!')
      setSelectedUser(null)
      setSearch('')
      setMessage('')
    } catch (err) {
      console.error(err)
      toast.error('Failed to send')
    }
  }

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen px-6 py-10">
      <div className="flex justify-between items-center mb-6 px-4">
        <h2 className="text-3xl font-bold text-blue-600">SEND REMINDER</h2>
      </div>

      {/* Consultation Events This Week */}
      <div className="bg-white mb-10 rounded-xl p-8 shadow-md border border-gray-200 w-full max-w-5xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Consultation Events This Week
        </h3>

        {consultationEvents.length > 0 ? (
  <div className="flex overflow-x-auto gap-4 pb-3 scrollbar-thin scrollbar-thumb-gray-300">
    {consultationEvents.map((ev) => {
      const d = parseEventDate(ev.date)
      const dateLabel = d
        ? d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
        : 'Unknown date'
      const timeLabel =
        ev.startTime && ev.endTime ? `${ev.startTime} – ${ev.endTime}` : ev.startTime || 'All day'
      const isOpen = expandedId === ev._id

      return (
        <div
          key={ev._id}
          className="min-w-[280px] max-w-xs flex-shrink-0 flex flex-col justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow transition"
        >
          <div className="mb-1">
            <h4 className="text-sm font-semibold text-gray-900 truncate">{ev.name}</h4>
          </div>

          <p className="text-xs text-gray-600 flex items-center">
            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
            {dateLabel}
          </p>
          <p className="text-xs text-gray-600 flex items-center">
            <Clock className="h-3 w-3 mr-1 text-gray-400" />
            {timeLabel}
          </p>
          {ev.location && (
            <p className="text-xs text-gray-600 flex items-center">
              <MapPin className="h-3 w-3 mr-1 text-gray-400" />
              {ev.location}
            </p>
          )}

          {ev.description && (
            <p className={`mt-2 text-xs text-gray-700 ${isOpen ? '' : 'line-clamp-2'}`}>
              {ev.description}
            </p>
          )}

          <div className="mt-3">
            <button
              onClick={() => setExpandedId(isOpen ? null : ev._id)}
              className="text-[12px] font-medium text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
            >
              <Info className="w-3.5 h-3.5" />
              {isOpen ? 'Hide details' : 'More details'}
            </button>
          </div>
        </div>
      )
    })}
  </div>
) : (
  <p className="text-sm text-gray-500 italic">No consultation events scheduled this week.</p>
)}

      </div>

      {/* Form Box */}
      <div className="bg-white text-gray-800 rounded-xl p-8 shadow-md border border-gray-200 w-full max-w-5xl mx-auto relative">
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Search user by name or email..."
            className="w-full bg-white border border-gray-300 text-sm text-gray-800 rounded px-4 py-3 placeholder-gray-400 shadow-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setSelectedUser(null)
            }}
          />
          {search && !selectedUser && (
            <div className="absolute z-50 bg-white border border-gray-200 rounded shadow mt-1 max-h-48 overflow-y-auto w-full">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedUser(user)
                      setSearch(user.name || user.email)
                    }}
                  >
                    {user.name || 'Unnamed'} – {user.email}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-400">No users found</div>
              )}
            </div>
          )}
        </div>

        <textarea
          placeholder="Enter reminder message"
          className="w-full bg-white border border-gray-300 text-sm text-gray-800 rounded px-4 py-3 placeholder-gray-400 mb-4 shadow-sm"
          value={message}
          onChange={(e) => setMessage(e.target.value)}  
          rows={6}
        />

        <div className="flex justify-end">
          <button
            onClick={handleSend}
            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-sm px-5 py-2.5 rounded flex items-center gap-2 font-medium"
          >
            <Send className="w-4 h-4" />
            Send Reminder
          </button>
        </div>
      </div>
    </div>
  )
}

export default SendReminderForm
