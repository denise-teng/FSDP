import React, { useState } from 'react'
import { Send } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'

const SendReminderForm = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSend = async () => {
    if (!email || !message) {
      return toast.error('Fill in all fields')
    }

    try {
      // 🔍 Lookup user by email
      const userRes = await axios.get(`/api/auth/users/email/${encodeURIComponent(email)}`)

      const user = userRes.data
      if (!user || !user._id) throw new Error('User not found')

      // ✅ Send the notification using the found user ID
      await axios.post('/api/notifications', {
        userId: user._id,
        text: message,
        trigger: '/secret-calendar',
      })

      toast.success('Reminder sent!')
      setEmail('')
      setMessage('')
    } catch (err) {
      console.error(err)
      toast.error('Failed to send z')
    }
  }

  return (
    <div className="bg-gray-800 text-white rounded-xl p-4 shadow border border-gray-700 hover:shadow-md transition w-full">
      <div className="mb-2">
        <span className="font-semibold text-base">Send Manual Reminder</span>
      </div>

      <div className="space-y-4 mb-4">
        <input
          type="email"
          placeholder="Enter User Email"
          className="w-full bg-gray-900 border border-gray-600 text-sm text-white rounded px-4 py-2 placeholder-gray-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <textarea
          placeholder="Enter reminder message"
          className="w-full bg-gray-900 border border-gray-600 text-sm text-white rounded px-4 py-2 placeholder-gray-400"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSend}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Send Reminder
        </button>
      </div>
    </div>
  )
}

export default SendReminderForm
