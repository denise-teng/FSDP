import express from 'express';
import {getAllEvents, getNearEvents, getEventsByType, createEvent, toggleNearEvents, deleteEvent, updateEvent} from '../controllers/event.controller.js';
import {adminRoute, protectRoute } from '../middleware/auth.middleware.js';
import Event from '../models/event.model.js';
const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllEvents);
router.get("/near", getNearEvents);
router.get("/type/:type", getEventsByType);
router.patch("/:id", protectRoute, adminRoute, toggleNearEvents);
router.post("/", protectRoute, adminRoute, createEvent);
router.delete("/:id", protectRoute, adminRoute, deleteEvent);
router.put('/:id', updateEvent);
// Minimal, safe endpoint for availability (no admin middleware)
router.get("/availability", async (req, res) => {
  try {
    const events = await Event.find(
      {}, 
      "date startTime endTime type status" // only return fields needed
    ).lean();
    res.json(events);
  } catch (err) {
    console.error("Error fetching availability:", err);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

export default router