import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useUserStore } from '../stores/useUserStore';
import { useEventStore } from '../stores/useEventStore';
import EditEventForm from './EditEventForm';

const EventCard = ({ event }) => {
  const { user } = useUserStore();
  const { addEvent, deleteEvent } = useEventStore();
  const [editing, setEditing] = useState(false);

  // Mapping event types to colors
  const eventTypeColors = {
    Broadcast: 'bg-blue-500',
    Consultation: 'bg-green-500',
    Sales: 'bg-yellow-500',
    Service: 'bg-purple-500',
    'Policy-updates': 'bg-red-500',
  };

  // Get the color for this event type
  const eventColor = eventTypeColors[event.type] || 'bg-gray-500';

  const handleAddEvent = () => {
    if (!user) {
      toast.error('Please login to add Events', { id: 'login' });
      return;
    }
    addEvent(event);
  };

  const handleDelete = async () => {
    const toastId = toast.loading('Deleting event...');

    try {
      await deleteEvent(event._id);
      toast.success('Event deleted successfully!', { id: toastId });
    } catch (error) {
      toast.error('Failed to delete event', { id: toastId });
    }
  };

  const handleUpdate = () => {
    setEditing(true);
  };

  // Format date without year for permanent events
  const formattedDate = () => {
    const eventDate = new Date(event.date);
    if (event.isPermanent) {
      // Only show the day and month for permanent events
      return eventDate.toLocaleDateString('en-MY', { day: 'numeric', month: 'long' });
    } else {
      // Show full date for non-permanent events
      return eventDate.toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };

  return (
    <>
      {/* ✅ Popup modal for editing */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <EditEventForm event={event} onClose={() => setEditing(false)} />
          </div>
        </div>
      )}

      <div className="mt-4 px-5 pb-5 border border-gray-700 rounded-md bg-gray-800 text-white">
        <h5 className="text-xl font-semibold tracking-tight mb-1">Name: {event.name}</h5>
        <p className="text-sm mb-1 text-gray-300">Date: {formattedDate()}</p>

        {event.startTime && (
          <p className="text-sm text-gray-300">
            Time: {event.startTime}{' '}
            {event.endTime ? `– ${event.endTime}` : ''}
          </p>
        )}

        <p className="text-sm mb-1 text-gray-300">Description: {event.description}</p>

        {/* Type and Color Indicator */}
        <p className="text-sm mb-1 text-gray-300 flex items-center">
          Type: {event.type}
          <span
            className={`${eventColor} w-3 h-3 rounded-full ml-2`} // Small color indicator next to the event type
          ></span>
        </p>

        {event.location && (
          <p className="text-sm text-gray-400 mb-1">Location: {event.location}</p>
        )}

        {event.isPermanent && (
          <p className="text-xs text-emerald-400 font-bold uppercase">Permanent Event</p>
        )}

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-800 px-4 py-2 rounded"
          >
            Delete
          </button>
          <button
            onClick={handleUpdate}
            className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded"
          >
            Edit
          </button>
        </div>
      </div>
    </>
  );
};

export default EventCard;
