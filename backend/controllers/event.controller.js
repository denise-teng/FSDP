import Product from '../models/product.model.js';
import { redis } from '../lib/redis.js';
import cloudinary from '../lib/cloudinary.js';
import Event from '../models/event.model.js';

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({});
    res.json(events);
  } catch (error) {
    console.log('Error in getAllEvents controller', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getNearEvents = async (req, res) => {
  try {
    let nearEvents = await redis.get('near_events');
    if (nearEvents) {
      return res.json(JSON.parse(nearEvents));
    }

    nearEvents = await Event.find({ isNear: true });

    if (!nearEvents) {
      return res.status(404).json({ message: 'No near events found' });
    }

    await redis.set('near_events', JSON.stringify(nearEvents));
    res.json(nearEvents);
  } catch (error) {
    console.log('Error in getNearEvents controller', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      date,
      type,
      location,
      startTime,
      endTime,
      isPermanent
    } = req.body;

    const event = await Event.create({
      name,
      description,
      date,
      type,
      location,
      startTime: startTime || null,
      endTime: endTime || null,
      isPermanent: !!isPermanent
    });

    res.status(201).json(event);
  } catch (error) {
    console.log('Error in createEvent controller', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      date,
      type,
      location,
      startTime,
      endTime,
      isPermanent
    } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (name !== undefined) event.name = name;
    if (description !== undefined) event.description = description;
    if (date !== undefined) event.date = date;
    if (type !== undefined) event.type = type;
    if (location !== undefined) event.location = location;
    if (startTime !== undefined) event.startTime = startTime;
    if (endTime !== undefined) event.endTime = endTime;
    if (isPermanent !== undefined) event.isPermanent = isPermanent;

    const updatedEvent = await event.save();
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.log('Error in updateEvent controller', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.log('Error in deleteEvent controller', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getEventsByType = async (req, res) => {
  const { type } = req.params;
  try {
    const events = await Event.find({ type });
    res.json({ events });
  } catch (error) {
    console.log('Error in getEventsByType controller', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const toggleNearEvents = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (event) {
      event.isNear = !event.isNear;
      const updatedEvent = await event.save();
      await updateNearEventsCache();
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    console.log('Error in toggleNearEvents controller', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

async function updateNearEventsCache() {
  try {
    const nearEvents = await Event.find({ isNear: true }).lean();
    await redis.set('near_events', JSON.stringify(nearEvents));
  } catch (error) {
    console.log('Error in updateNearEventsCache function:', error.message);
  }
}
