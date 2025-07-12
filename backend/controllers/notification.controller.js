import Notification from '../models/Notification.model.js';
import Event from '../models/event.model.js';
import User from '../models/user.model.js';

// ✅ GET /api/notifications/:userId
export const getNotificationsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Auto-generate for today's events (only if needed)
    await createEventNotificationsForToday(userId);

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    console.error('Failed to get notifications:', err);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
};

// ✅ POST /api/notifications
export const createNotification = async (req, res) => {
  try {
    const { userId, text, trigger } = req.body;

    const notification = await Notification.create({
      userId,
      text,
      trigger,
    });

    res.status(201).json(notification);
  } catch (err) {
    console.error('Failed to create notification:', err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

// ✅ Auto-create only today's event notifications
export const createEventNotificationsForToday = async (userId) => {
  const user = await User.findById(userId);
  if (!user || user.role !== 'admin') return;

  // Ensure deletedEventIds exists
  if (!Array.isArray(user.deletedEventIds)) {
    user.deletedEventIds = [];
  }

  const events = await Event.find();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const event of events) {
    const eventDate = new Date(event.date);
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

    const isToday = eventDay.getTime() === today.getTime();

    if (!isToday) continue;

    if (user.deletedEventIds.includes(event._id.toString())) {
      console.log(`⏭️ Skipping ${event.name} — user deleted`);
      continue;
    }

    const exists = await Notification.findOne({
      userId,
      text: `You have an event today: ${event.name}`,
      createdAt: {
        $gte: today,
        $lte: new Date(today.getTime() + 86400000 - 1),
      },
    });

    if (!exists) {
      await Notification.create({
        userId,
        text: `You have an event today: ${event.name}`,
        trigger: '/secret-calendar',
      });
      console.log(`Created notification for: ${event.name}`);
    } else {
      console.log(`ℹAlready notified for: ${event.name}`);
    }
  }
};

// ✅ DELETE /api/notifications/:id
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notif = await Notification.findByIdAndDelete(id);
    if (!notif) return res.status(404).json({ error: 'Notification not found' });

    if (notif.text?.includes('You have an event today:')) {
      const user = await User.findById(notif.userId);
      const eventName = notif.text.replace('You have an event today: ', '');
      const event = await Event.findOne({ name: eventName });

      if (user && event) {
        if (!Array.isArray(user.deletedEventIds)) {
          user.deletedEventIds = [];
        }

        const eventIdStr = event._id.toString();
        if (!user.deletedEventIds.includes(eventIdStr)) {
          user.deletedEventIds.push(eventIdStr);
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
