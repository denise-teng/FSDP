// routes/recentBroadcast.route.js
import express from 'express';
import RecentMessage from '../models/recentMessage.model.js'; // Import the RecentMessage model

const router = express.Router();

// Route to get recent broadcasts
router.get('/', async (req, res) => {
    try {
        // Get the latest 5 recent broadcasts
        const recentMessages = await RecentMessage.find().sort({ sentAt: -1 }).limit(5);
        res.json(recentMessages);
    } catch (error) {
        console.error('Error fetching recent broadcasts:', error);
        res.status(500).json({ error: 'Error fetching recent broadcasts' });
    }
});

// Route to post a new recent broadcast (message)
router.post('/', async (req, res) => {
    const { title, message, channel, tags } = req.body;
    const newRecentMessage = new RecentMessage({
        title,
        message,
        channel,
        tags
    });

    try {
        await newRecentMessage.save();
        res.status(201).json(newRecentMessage);
    } catch (err) {
        console.error('Error saving recent message:', err);
        res.status(500).json({ error: 'Failed to save recent message' });
    }
});

export default router;
