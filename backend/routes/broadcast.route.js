import express from 'express';
import mongoose from 'mongoose';
import { protectRoute as authMiddleware } from '../middleware/auth.middleware.js';
import {
    getAllBroadcasts,
    getBroadcastRecipients,
    createBroadcast,
    deleteBroadcast,
    addContactToBroadcast,
    sendNow,
    getRecentBroadcasts,
    processScheduledBroadcasts,
    updateScheduledBroadcast,
    cancelScheduledBroadcast,
    createScheduledBroadcast,
    getScheduledBroadcasts,
    createAIBroadcast,
    matchContactsByTopics
} from '../controllers/broadcast.controller.js';
import { ScheduledBroadcast } from '../models/scheduledBroadcast.model.js';
import Broadcast from '../models/broadcast.model.js';
import WhatsAppContact from '../models/whatsappContact.model.js';
import RecentMessage from '../models/recentMessage.model.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
router.get('/recent', getRecentBroadcasts);

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

// ==================== BROADCAST ROUTES ====================
router.get('/', getAllBroadcasts); // Get all broadcasts
router.post('/', createBroadcast); // Create a new manual broadcast
router.post('/ai', createAIBroadcast); // New route for AI-generated broadcasts
router.post('/match-contacts', matchContactsByTopics); // New route for contact matching
router.delete('/:id', deleteBroadcast); // Delete a broadcast
router.get('/recipients', getBroadcastRecipients); // Get all broadcast recipients
router.get('/:id/recipients', getBroadcastRecipients); // Get recipients for a specific broadcast
router.post('/add-contact', addContactToBroadcast); // Add a contact to a broadcast
router.post('/send-now', sendNow); // Send a broadcast immediately

// ==================== WHATSAPP CONTACT ROUTES ====================
router.post('/add-whatsapp-contact', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { broadcastId, whatsappContactId } = req.body;

        // 1. Validation - Ensure both broadcastId and whatsappContactId are provided
        if (!broadcastId || !whatsappContactId) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Both broadcastId and whatsappContactId are required'
            });
        }

        // 2. Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(broadcastId)) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Invalid broadcast ID format'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(whatsappContactId)) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Invalid WhatsApp contact ID format'
            });
        }

        // 3. Check if documents exist
        const [broadcast, contact] = await Promise.all([
            Broadcast.findById(broadcastId).session(session),
            WhatsAppContact.findById(whatsappContactId).session(session)
        ]);

        // If broadcast not found
        if (!broadcast) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Broadcast not found'
            });
        }

        // If WhatsApp contact not found
        if (!contact) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'WhatsApp contact not found'
            });
        }

        // 4. Check for duplicate (make sure the contact isn't already in the broadcast)
        const exists = broadcast.whatsappContacts.some(id =>
            id.toString() === whatsappContactId.toString()
        );

        if (exists) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Contact already exists in this broadcast'
            });
        }

        // 5. Add contact using atomic operation
        broadcast.whatsappContacts.push(whatsappContactId);
        await broadcast.save({ session });

        await session.commitTransaction();

        // Send response back
        res.json({
            success: true,
            message: 'WhatsApp contact added successfully',
            data: broadcast
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        session.endSession();
    }
});

// ==================== SCHEDULED BROADCASTS ROUTES ====================
router.get('/scheduled', getScheduledBroadcasts); // Get all scheduled broadcasts
router.post('/schedule', createScheduledBroadcast); // Schedule a new broadcast
router.put('/scheduled/:id', updateScheduledBroadcast); // Update scheduled broadcast
router.delete('/scheduled/:id', cancelScheduledBroadcast); // Cancel scheduled broadcast
router.post('/process-scheduled', processScheduledBroadcasts); // Process all scheduled broadcasts

// ==================== MESSAGE HISTORY ENDPOINT ====================
router.get('/message-history', async (req, res) => {
    try {
        const messages = await RecentMessage.find()
            .sort({ sentAt: -1 })
            .populate('originalBroadcast', 'title')
            .lean();

        const formattedMessages = messages.map(message => ({
            id: message._id,
            title: message.title,
            channel: message.channel,
            status: message.status,
            sentAt: message.sentAt,
            successCount: message.recipients.filter(r => ['sent', 'delivered'].includes(r.status)).length,
            totalRecipients: message.recipients.length,
            recipientsPreview: message.recipients.slice(0, 3).map(r => ({
                name: r.name || 'Unknown',
                email: r.email || 'Unknown',
                status: r.status
            }))
        }));

        res.json(formattedMessages);
    } catch (error) {
        console.error('Error fetching message history:', error);
        res.status(500).json({ message: 'Failed to fetch message history' });
    }
});

// ==================== SCHEDULED BROADCASTS STATUS CHECK ====================
router.use('/scheduled/:id', async (req, res, next) => {
    try {
        const broadcast = await ScheduledBroadcast.findById(req.params.id);
        if (!broadcast) {
            return res.status(404).json({ message: 'Scheduled broadcast not found' });
        }
        if (broadcast.status === 'Sent') {
            return res.status(400).json({ message: 'Cannot modify already sent broadcasts' });
        }
        req.broadcast = broadcast;
        next();
    } catch (error) {
        console.error('Error checking scheduled broadcast status:', error);
        res.status(500).json({ message: 'Error verifying broadcast status' });
    }
});

export default router;