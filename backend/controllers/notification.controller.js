import Notification from '../models/Notification.model.js';
import Event from '../models/event.model.js';
import User from '../models/user.model.js';

/* ---------------------- Helpers ---------------------- */
const startOfDay = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const endOfDay = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

const parseLocalDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    const ts = Date.parse(value);
    return Number.isNaN(ts) ? null : new Date(ts);
  }
  return null;
};

const belongsToUser = (evt, userId) => {
  const idEq = (x) => x && x.toString && x.toString() === userId;
  if (idEq(evt.userId)) return true;
  if (idEq(evt.ownerId)) return true;
  if (idEq(evt.assignedTo)) return true;
  if (idEq(evt.customerId)) return true;
  if (Array.isArray(evt.participants)) {
    return evt.participants.some(
      (p) => idEq(p) || idEq(p?._id) || idEq(p?.userId)
    );
  }
  return false;
};

const formatTime = (evt) => {
  const t = evt?.time || evt?.startTime || evt?.start || '';
  if (t instanceof Date) {
    return t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (typeof t !== 'string') return '';
  try {
    const str = t.trim();
    const hasAmPm = /am|pm/i.test(str);
    if (hasAmPm) {
      return str.replace(/am|pm/i, (m) => m.toUpperCase());
    }
    const [hh, mm] = str.split(':').map((n) => parseInt(n, 10));
    if (Number.isInteger(hh) && Number.isInteger(mm)) {
      const d = new Date();
      d.setHours(hh, mm, 0, 0);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return str;
  } catch {
    return '';
  }
};

/* ---------------------- Controllers ---------------------- */

// ✅ GET /api/notifications/:userId
export const getNotificationsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Auto-generate consultation reminders for today
    await createConsultationNotificationsForToday(userId);

    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(notifications);
  } catch (err) {
    console.error('Failed to get notifications:', err);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
};

// ✅ POST /api/notifications
export const createNotification = async (req, res) => {
  try {
    const { userId, text, trigger, eventId, kind } = req.body;

    const notification = await Notification.create({
      userId,
      text,
      trigger,
      eventId,
      kind,
    });

    res.status(201).json(notification);
  } catch (err) {
    console.error('Failed to create notification:', err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

// ✅ Auto-create consultation notifications for today
export const createConsultationNotificationsForToday = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  if (!Array.isArray(user.deletedEventIds)) user.deletedEventIds = [];

  const todayStart = startOfDay();
  const todayEnd = endOfDay();

  // Only look at consultation events that are approved
  const todaysEvents = await Event.find({
    type: /consultation/i,
    status: 'approved', // ✅ admin has accepted
    date: { $gte: todayStart, $lte: todayEnd }, // ✅ event today
  });

  for (const evt of todaysEvents) {
    // Match by userId or email
    const belongs =
      evt.userId?.toString() === userId.toString() ||
      evt.userEmail?.toLowerCase() === user.email?.toLowerCase();

    if (!belongs) continue;

    if (user.deletedEventIds.includes(evt._id.toString())) continue;

    // Check if already exists
    const already = await Notification.findOne({
      userId,
      eventId: evt._id,
      kind: 'consultation-today',
    });

    if (already) continue;

    const when = formatTime(evt);
    const name = evt.name || evt.title || 'Consultation';

    await Notification.create({
      userId,
      text: when
        ? `Reminder: You have a consultation today at ${when} — ${name}`
        : `Reminder: You have a consultation today — ${name}`,
      trigger: '/consultations',
      eventId: evt._id,
      kind: 'consultation-today',
    });
  }
};


// ✅ DELETE /api/notifications/:id
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notif = await Notification.findByIdAndDelete(id);
    if (!notif) return res.status(404).json({ error: 'Notification not found' });

    const user = await User.findById(notif.userId);
    if (user) {
      if (!Array.isArray(user.deletedEventIds)) user.deletedEventIds = [];

      let eventDoc = null;

      if (notif.eventId) {
        eventDoc = await Event.findById(notif.eventId);
      } else if (notif.text?.includes('consultation')) {
        const m = notif.text.match(/—\s(.+)$/);
        if (m?.[1]) eventDoc = await Event.findOne({ name: m[1] });
      } else if (notif.text?.startsWith('You have an event today:')) {
        const eventName = notif.text.replace('You have an event today: ', '');
        eventDoc = await Event.findOne({ name: eventName });
      }

      if (eventDoc) {
        const key = eventDoc._id.toString();
        if (!user.deletedEventIds.includes(key)) {
          user.deletedEventIds.push(key);
          await user.save();
        }
      }
    }

    res.status(200).json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('Failed to delete notification:', err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};
