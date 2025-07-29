// routes/recentBroadcast.route.js
import express from 'express';
import RecentMessage from '../models/recentMessage.model.js'; // Import the RecentMessage model

const router = express.Router();

// Route to get a single message by ID
router.get('/:id', async (req, res) => {
    try {
        const message = await RecentMessage.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.json(message);
    } catch (error) {
        console.error('Error fetching message:', error);
        res.status(500).json({ error: 'Error fetching message' });
    }
});

// Route to delete a message by ID
router.delete('/:id', async (req, res) => {
    try {
        const message = await RecentMessage.findByIdAndDelete(req.params.id);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Error deleting message' });
    }
});

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
    const { title, message, content, channel, tags } = req.body;
    const newRecentMessage = new RecentMessage({
        title,
        content: message || content, // Use message or content field
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
