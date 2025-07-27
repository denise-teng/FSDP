import React, { useState, useEffect } from 'react'
import { Send } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'

const SendReminderForm = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/auth/users')
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
    const searchLower = search.toLowerCase()
    const filtered = users.filter((user) =>
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    )
    setFilteredUsers(filtered)
  }, [search, users])

  const handleSend = async () => {
    if (!selectedUser || !message) {
      return toast.error('Please select a user and enter a message')
    }

    try {
      await axios.post('/api/notifications', {
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
    <div className="bg-gray-900 text-white min-h-screen px-6 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-4">
        <h2 className="text-3xl font-bold text-emerald-400">SEND REMINDER</h2>
      </div>

      {/* Form Box */}
      <div className="bg-gray-800 text-white rounded-xl p-8 shadow border border-gray-700 w-full max-w-4xl mx-auto relative">
        {/* Search */}
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Search user by name or email..."
            className="w-full bg-gray-900 border border-gray-600 text-sm text-white rounded px-4 py-3 placeholder-gray-400"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setSelectedUser(null)
            }}
          />
          {search && !selectedUser && (
            <div className="absolute z-50 bg-gray-900 border border-gray-700 rounded shadow mt-1 max-h-48 overflow-y-auto w-full">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer"
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

        {/* Message */}
        <textarea
          placeholder="Enter reminder message"
          className="w-full bg-gray-900 border border-gray-600 text-sm text-white rounded px-4 py-3 placeholder-gray-400 mb-4"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
        />

        <div className="flex justify-end">
          <button
            onClick={handleSend}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-5 py-2.5 rounded flex items-center gap-2"
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
