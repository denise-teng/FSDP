// backend/routes/scheduledBroadcast.route.js
import express from 'express';
import { ScheduledBroadcast } from '../models/scheduledBroadcast.model.js'; // Import the model

const router = express.Router();

// Route to schedule a new broadcast (Immediate or Future)
router.post('/schedule', async (req, res) => {
    const { title, listName, channel, tags, scheduledTime } = req.body;

    const scheduledBroadcast = new ScheduledBroadcast({
        title,
        listName,
        channel,
        tags,
        scheduledTime: new Date(scheduledTime), // Set the scheduled time
        status: 'Pending', // Default status is "Pending"
    });

    try {
        await scheduledBroadcast.save(); // Save to DB
        res.status(201).json(scheduledBroadcast); // Send response back to frontend
    } catch (error) {
        console.error('Error scheduling broadcast:', error);
        res.status(500).json({ error: 'Failed to schedule broadcast' });
    }
});

// Route to fetch all scheduled broadcasts
router.get('/', async (req, res) => {
    try {
        const broadcasts = await ScheduledBroadcast.find().sort({ createdAt: -1 });
        res.status(200).json(broadcasts); // Return all scheduled broadcasts
    } catch (error) {
        console.error('Error fetching broadcasts:', error);
        res.status(500).json({ error: 'Failed to fetch broadcasts' });
    }
});

export default router;
