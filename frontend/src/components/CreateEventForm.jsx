// CreateEventForm.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useEventStore } from "../stores/useEventStore";
import LocationPicker from "./LocationPicker";

const types = ["Broadcast", "Consultation", "Sales", "Service", "Policy-updates"];

const CreateEventForm = ({ selectedDate, onClose, defaults = {} }) => {
  const [newEvent, setNewEvent] = useState({
    name: defaults.title || "",
    description: defaults.description || "",
    date: defaults.date || "",
    type: defaults.type || "",
    location: defaults.location || "",
    startTime: defaults.startTime || "",
    endTime: defaults.endTime || "",
    isPermanent: defaults.isPermanent || false,
  });

  const { createEvent, fetchAllEvents } = useEventStore();

  useEffect(() => {
    if (selectedDate) {
      const localDate = new Date(selectedDate);
      localDate.setHours(0, 0, 0, 0);

      // ✅ Fix: store as YYYY-MM-DD (not ISO UTC)
      const ymd = [
        localDate.getFullYear(),
        String(localDate.getMonth() + 1).padStart(2, "0"),
        String(localDate.getDate()).padStart(2, "0"),
      ].join("-");

      setNewEvent((prev) => ({
        ...prev,
        date: ymd,
      }));
    }
  }, [selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: newEvent.name.trim(),
      description: newEvent.description?.trim() || "",
      date: newEvent.date, // ✅ keep YYYY-MM-DD
      type: newEvent.type,
      location: typeof newEvent.location === "string" ? newEvent.location : "",
      startTime: newEvent.startTime || "",
      endTime: newEvent.endTime || "",
      isPermanent: newEvent.isPermanent || false,
    };

    console.log("📦 Submitting event payload:", payload);

    try {
      await createEvent(payload);
      await fetchAllEvents();
      toast.success("Event created successfully");
      onClose();
    } catch (err) {
      console.error("❌ Error creating event:", err);
      toast.error("Failed to create event");
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
        <h2 className="text-xl font-semibold p-6 border-b">Create Event</h2>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
          id="create-event-form"
        >
          {/* Event Name & Type */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Event Name*"
              className="p-2 border rounded w-full"
              value={newEvent.name}
              onChange={(e) =>
                setNewEvent({ ...newEvent, name: e.target.value })
              }
              required
            />
            <select
              className="p-2 border rounded w-full"
              value={newEvent.type}
              onChange={(e) =>
                setNewEvent({ ...newEvent, type: e.target.value })
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
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent({ ...newEvent, description: e.target.value })
            }
          />

          {/* Date */}
          <input
            type="date"
            className="p-2 border rounded w-full"
            value={newEvent.date || ""}
            onChange={(e) =>
              setNewEvent((prev) => ({
                ...prev,
                date: e.target.value, // ✅ keep YYYY-MM-DD
              }))
            }
          />

          {/* Time fields */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="time"
              className="p-2 border rounded w-full"
              value={newEvent.startTime}
              onChange={(e) =>
                setNewEvent({ ...newEvent, startTime: e.target.value })
              }
            />
            <input
              type="time"
              className="p-2 border rounded w-full"
              value={newEvent.endTime}
              onChange={(e) =>
                setNewEvent({ ...newEvent, endTime: e.target.value })
              }
            />
          </div>

          {/* Permanent checkbox */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newEvent.isPermanent}
              onChange={(e) =>
                setNewEvent({ ...newEvent, isPermanent: e.target.checked })
              }
            />
            <span>Set as Permanent Event</span>
          </label>

          {/* Location picker */}
          <div className="h-[350px]">
            <LocationPicker
              onLocationSelect={(loc) =>
                setNewEvent((prev) => ({ ...prev, location: loc.name }))
              }
              defaultValue={defaults.location}
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
            Close
          </button>
          <button
            type="submit"
            form="create-event-form"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateEventForm;
