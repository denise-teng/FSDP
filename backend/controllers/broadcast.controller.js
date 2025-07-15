import Broadcast from '../models/broadcast.model.js';
import ScheduledBroadcast from '../models/scheduledBroadcast.model.js'; // Import the new model

// Get all broadcasts (normal ones)
export const getAllBroadcasts = async (req, res) => {
  try {
    const broadcasts = await Broadcast.find().sort({ createdAt: -1 });
    res.json(broadcasts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch broadcasts' });
  }
};

// Create a new broadcast (normal one)
export const createBroadcast = async (req, res) => {
  try {
    const broadcast = new Broadcast({ ...req.body });
    await broadcast.save();
    res.status(201).json(broadcast);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create broadcast', details: err.message });
  }
};

// Fetch scheduled broadcasts
export const getScheduledBroadcasts = async (req, res) => {
  try {
    const scheduledBroadcasts = await ScheduledBroadcast.find().sort({ scheduledTime: 1 }); // Sort by scheduled time
    res.json(scheduledBroadcasts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scheduled broadcasts' });
  }
};

// Create a new scheduled broadcast
export const createScheduledBroadcast = async (req, res) => {
  try {
    const scheduledBroadcast = new ScheduledBroadcast({
      ...req.body,
      scheduledTime: new Date(req.body.scheduledTime), // Ensure correct format
    });
    await scheduledBroadcast.save();
    res.status(201).json(scheduledBroadcast);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create scheduled broadcast', details: err.message });
  }
};
