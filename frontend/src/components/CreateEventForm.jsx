import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useEventStore } from "../stores/useEventStore";
import LocationPicker from "./LocationPicker";

const types = ["Broadcast", "Consultation", "Sales", "Service", "Policy-updates"];

const CreateEventForm = ({ selectedDate, onClose }) => {
  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    date: selectedDate,
    type: "",
    location: "",
    startTime: "",
    endTime: "",
    isPermanent: false,
  });

  const { createEvent, fetchAllEvents } = useEventStore();
  const [location, setLocation] = useState(null);

  // Update form date when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const localDate = new Date(selectedDate);
      // Ensure that we reset the time to midnight and store it as a local date
      localDate.setHours(0, 0, 0, 0); // Set time to midnight

      setNewEvent((prev) => ({
        ...prev,
        date: localDate, // Now save the date as a local date (without time)
      }));
    }
  }, [selectedDate]);

  const handleCreation = async (e) => {
    e.preventDefault();

    // ✅ Time validation
    if (newEvent.startTime && newEvent.endTime && newEvent.startTime >= newEvent.endTime) {
      toast.error("Start time must be before end time");
      return;
    }

    try {
      // Format the date into a local string (ignore timezone issues)
      const eventData = {
        ...newEvent,
        date: new Date(newEvent.date).toLocaleDateString("en-CA"), // This gives 'YYYY-MM-DD' format, ignoring time
      };

      await createEvent(eventData);
      await fetchAllEvents();
      toast.success(`Event added on ${new Date(newEvent.date).toLocaleDateString()}`);
      setNewEvent({
        name: "",
        description: "",
        date: "",
        type: "",
        location: "",
        startTime: "",
        endTime: "",
        isPermanent: false,
      });
      onClose();
    } catch (error) {
      console.error("Error creating an event:", error);
      toast.error("Failed to create event");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form
        onSubmit={handleCreation}
        className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-3xl space-y-4 overflow-y-auto max-h-[90vh]"
      >
        <input
          type="text"
          placeholder="Name"
          value={newEvent.name}
          onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
          className="w-full px-3 py-2 rounded text-black"
          maxLength={50}
          required
        />
        <small className="text-gray-400">{newEvent.name.length}/50 characters</small>

        <textarea
          placeholder="Description"
          value={newEvent.description}
          onChange={(e) => {
            const wordLimit = 200;
            const words = e.target.value.split(/\s+/);
            if (words.length <= wordLimit) {
              setNewEvent({ ...newEvent, description: e.target.value });
            }
          }}
          className="w-full px-3 py-2 rounded text-black"
          required
        />
        <small className="text-gray-400">
          {newEvent.description.trim().split(/\s+/).filter(Boolean).length}/200 words
        </small>

        <select
          name="type"
          value={newEvent.type}
          onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
          required
        >
          <option value="">Select event type</option>
          {types.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        {/* ✅ Start Time */}
        <input
          type="time"
          value={newEvent.startTime}
          onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
          className="w-full px-3 py-2 rounded text-black"
        />

        {/* ✅ End Time */}
        <input
          type="time"
          value={newEvent.endTime}
          onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
          className="w-full px-3 py-2 rounded text-black"
        />

        {/* ✅ Is Permanent */}
        <label className="flex items-center space-x-2 text-white">
          <input
            type="checkbox"
            checked={newEvent.isPermanent}
            onChange={(e) => setNewEvent({ ...newEvent, isPermanent: e.target.checked })}
          />
          <span>Set as Permanent Event</span>
        </label>

        {/* Location Picker */}
        <LocationPicker
          onLocationSelect={(coords) => {
            setLocation(coords);
            setNewEvent((prev) => ({
              ...prev,
              location: coords.name,
            }));
          }}
        />

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-white"
          >
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventForm;
