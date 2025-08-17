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
    date: selectedDate,
    type: defaults.type || "",
    location: defaults.location || "",
    startTime: defaults.startTime || "",
    endTime: defaults.endTime || "",
    isPermanent: defaults.isPermanent || false,
  });


  const { createEvent, fetchAllEvents } = useEventStore();
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (selectedDate) {
      const localDate = new Date(selectedDate);
      localDate.setHours(0, 0, 0, 0);
      setNewEvent((prev) => ({
        ...prev,
        date: localDate,
      }));
    }
  }, [selectedDate]);

  const handleCreation = async (e) => {
    e.preventDefault();
    if (newEvent.startTime && newEvent.endTime && newEvent.startTime >= newEvent.endTime) {
      toast.error("Start time must be before end time");
      return;
    }

    try {
      const eventData = {
        ...newEvent,
        date: new Date(newEvent.date).toLocaleDateString("en-CA"),
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
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl space-y-6 overflow-y-auto max-h-[90vh] border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-blue-600">Create Event</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            placeholder="Name"
            value={newEvent.name}
            onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
            className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            maxLength={50}
            required
          />
          <small className="text-gray-400">{newEvent.name.length}/50 characters</small>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
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
            className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            
          />
          <small className="text-gray-400">
            {newEvent.description.trim().split(/\s+/).filter(Boolean).length}/200 words
          </small>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            name="type"
            value={newEvent.type}
            onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select event type</option>
            {types.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="time"
              value={newEvent.startTime}
              onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="time"
              value={newEvent.endTime}
              onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <label className="flex items-center space-x-2 text-gray-700">
          <input
            type="checkbox"
            checked={newEvent.isPermanent}
            onChange={(e) => setNewEvent({ ...newEvent, isPermanent: e.target.checked })}
          />
          <span>Set as Permanent Event</span>
        </label>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
          <LocationPicker
            onLocationSelect={(coords) => {
              setLocation(coords);
              setNewEvent((prev) => ({
                ...prev,
                location: coords.name,
              }));
            }}
          />
        </div>

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
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventForm;
