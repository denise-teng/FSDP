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
    toast.success('Event updated')
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-3 max-h-[75vh] overflow-y-auto pr-2">
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        className="w-full bg-gray-700 text-white px-3 py-2 rounded"
        placeholder="Event Name"
        required
      />

      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        className="w-full bg-gray-700 text-white px-3 py-2 rounded"
        required
      />

      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        className="w-full bg-gray-700 text-white px-3 py-2 rounded"
        placeholder="Description (max 200 words)"
        rows={4}
      />

      <select
        name="type"
        value={formData.type}
        onChange={handleChange}
        className="w-full bg-gray-700 text-white px-3 py-2 rounded"
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
        className="w-full bg-gray-700 text-white px-3 py-2 rounded"
        placeholder="Start Time (optional)"
      />

      <input
        type="time"
        name="endTime"
        value={formData.endTime}
        onChange={handleChange}
        className="w-full bg-gray-700 text-white px-3 py-2 rounded"
        placeholder="End Time (optional)"
      />

      <label className="flex items-center space-x-2 text-white">
        <input
          type="checkbox"
          name="isPermanent"
          checked={formData.isPermanent}
          onChange={handleChange}
        />
        <span>Is Permanent</span>
      </label>

      <LocationPicker
        onLocationSelect={(coords) =>
          setFormData((prev) => ({
            ...prev,
            location: coords.name
          }))
        }
      />

      <input
        name="location"
        value={formData.location}
        onChange={handleChange}
        className="w-full bg-gray-700 text-white px-3 py-2 rounded"
        placeholder="Location (optional)"
      />

      <div className="flex gap-2">
        <button type="submit" className="bg-green-600 px-4 py-2 rounded">Save</button>
        <button onClick={onClose} type="button" className="bg-gray-500 px-4 py-2 rounded">Cancel</button>
      </div>
    </form>
  )
}

export default EditEventForm
