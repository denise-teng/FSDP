import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useUserStore } from '../stores/useUserStore';
import { useEventStore } from '../stores/useEventStore';
import EditEventForm from './EditEventForm';

const EventCard = ({ event }) => {
  const { user } = useUserStore();
  const { addEvent, deleteEvent } = useEventStore();
  const [editing, setEditing] = useState(false);

  const eventTypeColors = {
    Broadcast: 'bg-blue-500',
    Consultation: 'bg-green-500',
    Sales: 'bg-yellow-500',
    Service: 'bg-purple-500',
    'Policy-updates': 'bg-red-500',
  };

  const eventColor = eventTypeColors[event.type] || 'bg-gray-400';

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

  const formattedDate = () => {
    const eventDate = new Date(event.date);
    return event.isPermanent
      ? eventDate.toLocaleDateString('en-MY', { day: 'numeric', month: 'long' })
      : eventDate.toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <>
      {/* ✅ Light Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <EditEventForm event={event} onClose={() => setEditing(false)} />
          </div>
        </div>
      )}

      {/* ✅ Light Event Card */}
      <div className="mt-4 px-5 pb-5 border border-gray-200 rounded-md bg-white text-gray-800 shadow-sm">
        <h5 className="text-lg font-semibold tracking-tight mb-1">Name: {event.name}</h5>
        <p className="text-sm mb-1 text-gray-600">Date: {formattedDate()}</p>

        {event.startTime && (
          <p className="text-sm text-gray-600">
            Time: {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
          </p>
        )}

        <p className="text-sm mb-1 text-gray-700">Description: {event.description}</p>

        <p className="text-sm mb-1 text-gray-600 flex items-center">
          Type: {event.type}
          <span className={`${eventColor} w-3 h-3 rounded-full ml-2`} />
        </p>

        {event.location && (
          <p className="text-sm text-gray-500 mb-1">Location: {event.location}</p>
        )}

        {event.isPermanent && (
          <p className="text-xs text-emerald-600 font-semibold uppercase">Permanent Event</p>
        )}

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleDelete}
            className="bg-red-100 text-red-700 hover:bg-red-200 px-4 py-1 rounded text-sm font-medium"
          >
            Delete
          </button>
          <button
            onClick={handleUpdate}
            className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-1 rounded text-sm font-medium"
          >
            Edit
          </button>
        </div>
      </div>
    </>
  );
};

export default EventCard;
