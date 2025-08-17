import ConsultationRequest from '../models/ConsultationRequest.model.js';
import Event from '../models/event.model.js';
import Notification from '../models/Notification.model.js';
import User from '../models/user.model.js';

// helper functions
function timeToMinutes(str) {
  if (!str) return 0;
  let s = String(str).trim();

  const ampm = /am|pm/i.test(s) ? s.match(/am|pm/i)[0].toLowerCase() : null;
  s = s.replace(/\s?(am|pm)/i, '');

  const parts = s.split(':').map(Number);
  let h = parts[0] ?? 0;
  let m = parts[1] ?? 0;

  if (ampm) {
    if (ampm === 'pm' && h < 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
  }
  return h * 60 + m;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

function normalizeEnd(start, end) {
  return end || start;
}

export const submitConsultationRequest = async (req, res) => {
  try {
    const {
      name,
      description,
      date,
      startTime,
      endTime,
      location,
      email,
      userId,
    } = req.body;

    if (!date || !startTime) {
      return res.status(400).json({ error: 'Date and start time are required' });
    }

    // normalize new request times
    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(normalizeEnd(startTime, endTime));

    // 🔑 normalize the date into a start-of-day and end-of-day range
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // fetch events on the same day (range, not equality)
    const sameDayEvents = await Event.find({
      date: { $gte: dayStart, $lte: dayEnd },
    });

    // check overlap
    const conflict = sameDayEvents.find(ev => {
      const evStart = timeToMinutes(ev.startTime);
      const evEnd = timeToMinutes(normalizeEnd(ev.startTime, ev.endTime));
      return overlaps(newStart, newEnd, evStart, evEnd);
    });

    if (conflict) {
      return res.status(409).json({
        error: `This consultation time is unavailable. Please choose another time.`,
      });
    }

    const request = await ConsultationRequest.create({
      name,
      description,
      date,
      startTime,
      endTime,
      location,
      email,
      userId,
      status: 'pending',
    });

    // notifications (same as before)...
    if (userId) {
      await Notification.create({
        userId,
        text: `Your consultation request has been submitted.`,
        trigger: '/consultation-status',
      });
    }
    const admins = await User.find({ role: 'admin' });
    await Promise.all(
      admins.map((admin) =>
        Notification.create({
          userId: admin._id,
          text: `New consultation request: "${name}" by ${email}`,
          trigger: '/admin/consultation-requests',
        })
      )
    );

    res.status(201).json({ message: 'Consultation request submitted' });
  } catch (err) {
    console.error('Submit request failed:', err);
    res.status(500).json({ error: 'Failed to submit consultation request' });
  }
};


// DELETE /api/consultations/consultation-request/:id
export const deleteConsultationRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await ConsultationRequest.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.status(200).json({ message: 'Consultation request deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete consultation request' });
  }
};

// PATCH /api/consultations/consultation-request/:id/approve
export const approveConsultationRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await ConsultationRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    // Create the calendar event based on the consultation request
    const event = await Event.create({
      name: request.name,
      description: request.description,
      date: request.date,
      startTime: request.startTime,
      endTime: request.endTime,
      location: request.location,
      type: 'Consultation',
      email: request.email,
      status: 'approved',
    });

    // Notify the user about approval
    if (request.userId) {
      await Notification.create({
        userId: request.userId,
        text: `Your consultation "${request.name}" has been approved!`,
        trigger: '/calendar',
        forAdmin: false,
      });
    }

    // Remove the request from pending
    await ConsultationRequest.findByIdAndDelete(id);

    res.status(200).json({ message: 'Consultation approved and event created', event });
  } catch (err) {
    console.error('Approval error:', err);
    res.status(500).json({ error: 'Failed to approve consultation request' });
  }
};

// GET /api/consultations/consultation-request/pending
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await ConsultationRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    console.error('Fetch pending error:', err);
    res.status(500).json({ error: 'Failed to fetch consultation requests' });
  }
};
