// EditEventForm.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useEventStore } from "../stores/useEventStore";
import LocationPicker from "./LocationPicker";

const types = ["Broadcast", "Consultation", "Sales", "Service", "Policy-updates"];

const EditEventForm = ({ event, onClose }) => {
  const { updateEvent, fetchAllEvents } = useEventStore();

  const [formData, setFormData] = useState({
    name: event.name || "",
    description: event.description || "",
    date: event.date ? new Date(event.date).toISOString().split("T")[0] : "",
    type: event.type || "",
    location: event.location || "",
    startTime: event.startTime || "",
    endTime: event.endTime || "",
    isPermanent: event.isPermanent || false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateEvent(event._id, formData);
      await fetchAllEvents();

      onClose();
    } catch (err) {
      console.error("Error updating event:", err);
      toast.error("Failed to update event");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 flex items-center justify-center z-50"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={onClose}
      />

      {/* Popup modal */}
      <div
        className="relative bg-white rounded-xl shadow-lg w-full max-w-4xl mx-4 flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        <h2 className="text-xl font-semibold p-6 border-b">Edit Event</h2>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
          id="edit-event-form"
        >
          {/* Event Name & Type */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Event Name*"
              className="p-2 border rounded w-full"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
            <select
              className="p-2 border rounded w-full"
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              required
            >
              <option value="">Select event type</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Description (optional) */}
          <textarea
            placeholder="Description"
            className="p-2 border rounded w-full"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
          />

          {/* Date (optional) */}
          <input
            type="date"
            className="p-2 border rounded w-full"
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
          />

          {/* Time fields (optional) */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="time"
              className="p-2 border rounded w-full"
              value={formData.startTime}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startTime: e.target.value }))
              }
            />
            <input
              type="time"
              className="p-2 border rounded w-full"
              value={formData.endTime}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, endTime: e.target.value }))
              }
            />
          </div>

          {/* Permanent checkbox */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isPermanent}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isPermanent: e.target.checked,
                }))
              }
            />
            <span>Set as Permanent Event</span>
          </label>

          {/* Location picker (optional) */}
          <div className="h-[350px]">
            <LocationPicker
              onLocationSelect={(loc) =>
                setFormData((prev) => ({ ...prev, location: loc.name }))
              }
              defaultValue={formData.location}
            />
          </div>
        </form>

        {/* Buttons at bottom */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-event-form"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default EditEventForm;
