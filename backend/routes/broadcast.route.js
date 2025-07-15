import express from 'express';
import { getAllBroadcasts, createBroadcast, getScheduledBroadcasts, createScheduledBroadcast } from '../controllers/broadcast.controller.js';

const router = express.Router();

// Route for normal broadcasts
router.get('/', getAllBroadcasts);
router.post('/', createBroadcast);

// Route for scheduled broadcasts
router.get('/scheduled-broadcasts', getScheduledBroadcasts); // This will fetch all scheduled broadcasts
router.post('/scheduled-broadcasts', createScheduledBroadcast); // This will create a new scheduled broadcast

export default router;
