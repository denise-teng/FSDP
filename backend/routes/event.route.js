import express from 'express';
import {getAllEvents, getNearEvents, getEventsByType, createEvent, toggleNearEvents, deleteEvent, updateEvent} from '../controllers/event.controller.js';
import {adminRoute, protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllEvents);
router.get("/near", getNearEvents);
router.get("/type/:type", getEventsByType);
router.patch("/:id", protectRoute, adminRoute, toggleNearEvents);
router.post("/", protectRoute, adminRoute, createEvent);
router.delete("/:id", protectRoute, adminRoute, deleteEvent);
router.put('/:id', updateEvent);
export default router