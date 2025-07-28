import ConsultationRequest from '../models/ConsultationRequest.model.js';
import Event from '../models/event.model.js';
import Notification from '../models/Notification.model.js';
import User from '../models/user.model.js';

// POST /api/consultations/consultation-request
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

    // Create the consultation request
    const request = await ConsultationRequest.create({
      name,
      description,
      date,
      startTime,
      endTime,
      location,
      email,
      userId,
      status: 'pending', // This is critical for filtering
    });

    // Notify the requesting user
    if (userId) {
      await Notification.create({
        userId,
        text: `✅ Your consultation request has been submitted.`,
        trigger: '/consultation-status',
      });
    }

    // Notify all admins about the new request
    const admins = await User.find({ role: 'admin' });
    await Promise.all(
      admins.map((admin) =>
        Notification.create({
          userId: admin._id,
          text: `📬 New consultation request: "${name}" by ${email}`,
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
    text: `✅ Your consultation "${request.name}" has been approved!`,
    trigger: '/calendar',
    forAdmin: false, // ✅ ADD THIS LINE
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
