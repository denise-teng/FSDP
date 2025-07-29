import React, { useState } from 'react'
import { useEventStore } from '../stores/useEventStore'
import { toast } from 'react-hot-toast'
import LocationPicker from './LocationPicker'

const EditEventForm = ({ event, onClose }) => {
  const { updateEvent } = useEventStore()

  const [formData, setFormData] = useState({
    name: event.name || '',
    date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
    description: event.description || '',
    type: event.type || '',
    location: event.location || '',
    startTime: event.startTime || '',
    endTime: event.endTime || '',
    isPermanent: event.isPermanent || false
  })

  const types = ['Broadcast', 'Consultation', 'Sales', 'Service', 'Policy-updates']

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validateForm = () => {
    if (formData.name.length > 50) {
      toast.error('Event name cannot exceed 50 characters')
      return false
    }

    const wordCount = formData.description.trim().split(/\s+/).length
    if (wordCount > 200) {
      toast.error('Description cannot exceed 200 words')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const updated = {
      name: formData.name,
      date: new Date(formData.date).toISOString(),
      description: formData.description,
      type: formData.type,
      location: formData.location?.trim() || '',
      startTime: formData.startTime || '',
      endTime: formData.endTime || '',
      isPermanent: formData.isPermanent
    }

    await updateEvent(event._id, updated)

    onClose()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl space-y-6 overflow-y-auto max-h-[90vh] border border-gray-200"
    >
      <h2 className="text-xl font-semibold text-blue-600">Edit Event</h2>

      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Event Name"
        required
      />

      <input
  type="date"
  name="date"
  value={formData.date}
  onChange={handleChange}
  className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
  required
/>


      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Description (max 200 words)"
        rows={4}
      />

      <select
        name="type"
        value={formData.type}
        onChange={handleChange}
        className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      >
        <option value="">Select Event Type</option>
        {types.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <input
        type="time"
        name="startTime"
        value={formData.startTime}
        onChange={handleChange}
        className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Start Time (optional)"
      />

      <input
        type="time"
        name="endTime"
        value={formData.endTime}
        onChange={handleChange}
        className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="End Time (optional)"
      />

      <label className="flex items-center space-x-2 text-gray-700">
        <input
          type="checkbox"
          name="isPermanent"
          checked={formData.isPermanent}
          onChange={handleChange}
          className="accent-blue-500"
        />
        <span>Is Permanent</span>
      </label>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
        <LocationPicker
          onLocationSelect={(coords) =>
            setFormData((prev) => ({
              ...prev,
              location: coords.name
            }))
          }
        />
      </div>

      <input
        name="location"
        value={formData.location}
        onChange={handleChange}
        className="w-full mt-2 px-4 py-2 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Location (optional)"
      />

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-lg shadow"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}

export default EditEventForm
