import express from 'express';
import mongoose from 'mongoose';
import Broadcast from '../models/broadcast.model.js';
import RecentMessage from '../models/recentMessage.model.js';
import { ScheduledBroadcast } from '../models/scheduledBroadcast.model.js';

const router = express.Router();

// Get all broadcasts with recipients
router.get('/', async (req, res) => {
    try {
        const { populate } = req.query;
        
        let query = Broadcast.find();
        
        if (populate === 'recipients') {
            query = query.populate('recipients');
        }
        
        const broadcasts = await query.sort({ createdAt: -1 });
        res.json(broadcasts);
    } catch (error) {
        console.error('Error fetching broadcasts:', error);
        res.status(500).json({ message: 'Error fetching broadcasts', error });
    }
});

// Get scheduled broadcasts
router.get('/scheduled', async (req, res) => {
    try {
        const scheduledBroadcasts = await ScheduledBroadcast.find()
            .populate('broadcast')
            .populate('recipients')
            .sort({ scheduledTime: 1 });
        
        res.json(scheduledBroadcasts);
    } catch (error) {
        console.error('Error fetching scheduled broadcasts:', error);
        res.status(500).json({ message: 'Error fetching scheduled broadcasts', error });
    }
});

// Get message history
router.get('/message-history', async (req, res) => {
    try {
        const messageHistory = await RecentMessage.find()
            .populate({
                path: 'originalBroadcast',
                populate: {
                    path: 'recipients'
                }
            })
            .sort({ sentAt: -1 });
        
        const formattedHistory = messageHistory.map(message => {
            // Get recipients from the populated broadcast
            const recipients = message.originalBroadcast?.recipients || [];
            
            return {
                _id: message._id,
                title: message.title,
                channel: message.channel,
                sentAt: message.sentAt,
                status: message.status,
                message: message.content,
                recipients: recipients.map(r => ({
                    _id: r._id,
                    name: r.firstName && r.lastName ? `${r.firstName} ${r.lastName}` : r.name || r.email || 'Unknown',
                    email: r.email,
                    firstName: r.firstName,
                    lastName: r.lastName
                }))
            };
        });
        
        res.json(formattedHistory);
    } catch (error) {
        console.error('Error fetching message history:', error);
        res.status(500).json({ message: 'Error fetching message history', error });
    }
});

// Get all recipients
router.get('/recipients', async (req, res) => {
    try {
        const broadcasts = await Broadcast.find().populate('recipients');
        const allRecipients = broadcasts.flatMap(broadcast => 
            broadcast.recipients.map(recipient => ({
                _id: recipient._id,
                name: recipient.firstName && recipient.lastName 
                    ? `${recipient.firstName} ${recipient.lastName}` 
                    : recipient.name || recipient.email || 'Unknown',
                email: recipient.email,
                firstName: recipient.firstName,
                lastName: recipient.lastName
            }))
        );
        
        // Remove duplicates based on _id
        const uniqueRecipients = allRecipients.filter((recipient, index, self) =>
            index === self.findIndex(r => r._id.toString() === recipient._id.toString())
        );
        
        res.json(uniqueRecipients);
    } catch (error) {
        console.error('Error fetching recipients:', error);
        res.status(500).json({ message: 'Error fetching recipients', error });
    }
});

// Get recipients for a specific broadcast
router.get('/:id/recipients', async (req, res) => {
    try {
        const broadcast = await Broadcast.findById(req.params.id).populate('recipients');
        
        if (!broadcast) {
            return res.status(404).json({ message: 'Broadcast not found' });
        }
        
        const formattedRecipients = broadcast.recipients.map(recipient => ({
            _id: recipient._id,
            name: recipient.firstName && recipient.lastName 
                ? `${recipient.firstName} ${recipient.lastName}` 
                : recipient.name || recipient.email || 'Unknown',
            email: recipient.email,
            firstName: recipient.firstName,
            lastName: recipient.lastName
        }));
        
        res.json(formattedRecipients);
    } catch (error) {
        console.error('Error fetching broadcast recipients:', error);
        res.status(500).json({ message: 'Error fetching broadcast recipients', error });
    }
});

// Create a new broadcast
router.post('/', async (req, res) => {
    try {
        const broadcast = new Broadcast(req.body);
        await broadcast.save();
        res.status(201).json(broadcast);
    } catch (error) {
        console.error('Error creating broadcast:', error);
        res.status(500).json({ message: 'Error creating broadcast', error });
    }
});

// Send broadcast now
router.post('/send-now', async (req, res) => {
    try {
        const { broadcastId, title, channel, message } = req.body;
        
        const broadcast = await Broadcast.findById(broadcastId).populate('recipients');
        
        if (!broadcast) {
            return res.status(404).json({ message: 'Broadcast not found' });
        }
        
        // Create recent message entry
        const recentMessage = new RecentMessage({
            title: title || broadcast.title,
            content: message,
            channel: channel || broadcast.channel,
            recipients: broadcast.recipients.map(r => ({
                _id: r._id,
                status: 'sent'
            })),
            sentAt: new Date(),
            status: 'complete',
            originalBroadcast: broadcast._id
        });
        
        await recentMessage.save();
        
        res.json({ message: 'Broadcast sent successfully', data: recentMessage });
    } catch (error) {
        console.error('Error sending broadcast:', error);
        res.status(500).json({ message: 'Error sending broadcast', error });
    }
});

// Schedule a broadcast
router.post('/schedule', async (req, res) => {
    try {
        const { broadcastId, title, channel, message, scheduledTime } = req.body;
        
        const broadcast = await Broadcast.findById(broadcastId).populate('recipients');
        
        if (!broadcast) {
            return res.status(404).json({ message: 'Broadcast not found' });
        }
        
        // Create scheduled broadcast entry
        const scheduledBroadcast = new ScheduledBroadcast({
            title: title || broadcast.title,
            broadcast: broadcast._id,
            channel: channel || broadcast.channel,
            message: message,
            recipients: broadcast.recipients.map(r => r._id),
            scheduledTime: new Date(scheduledTime),
            status: 'Scheduled',
            createdBy: req.user?.id || broadcast.createdBy || new mongoose.Types.ObjectId() // Use authenticated user or fallback
        });
        
        await scheduledBroadcast.save();
        
        res.json({ message: 'Broadcast scheduled successfully', data: scheduledBroadcast });
    } catch (error) {
        console.error('Error scheduling broadcast:', error);
        res.status(500).json({ message: 'Error scheduling broadcast', error });
    }
});

// Delete a broadcast
router.delete('/:id', async (req, res) => {
    try {
        const broadcast = await Broadcast.findByIdAndDelete(req.params.id);
        
        if (!broadcast) {
            return res.status(404).json({ message: 'Broadcast not found' });
        }
        
        res.json({ message: 'Broadcast deleted successfully' });
    } catch (error) {
        console.error('Error deleting broadcast:', error);
        res.status(500).json({ message: 'Error deleting broadcast', error });
    }
});

// Delete a scheduled broadcast
router.delete('/scheduled/:id', async (req, res) => {
    try {
        console.log(`=== DELETING SCHEDULED BROADCAST ===`);
        console.log(`ID to delete: ${req.params.id}`);
        
        // First check if it exists
        const existingBroadcast = await ScheduledBroadcast.findById(req.params.id);
        console.log(`Found broadcast:`, existingBroadcast ? `Yes - ${existingBroadcast.title}` : 'No');
        
        const scheduledBroadcast = await ScheduledBroadcast.findByIdAndDelete(req.params.id);
        
        if (!scheduledBroadcast) {
            console.log(`❌ Scheduled broadcast not found with ID: ${req.params.id}`);
            return res.status(404).json({ message: 'Scheduled broadcast not found' });
        }
        
        console.log(`✅ Successfully deleted scheduled broadcast: ${scheduledBroadcast.title}`);
        res.json({ message: 'Scheduled broadcast deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting scheduled broadcast:', error);
        res.status(500).json({ message: 'Error deleting scheduled broadcast', error });
    }
});

// Delete a message from history
router.delete('/message-history/:id', async (req, res) => {
    try {
        const message = await RecentMessage.findByIdAndDelete(req.params.id);
        
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Error deleting message', error });
    }
});

// Process scheduled broadcasts (manual trigger for now)
router.post('/process-scheduled', async (req, res) => {
    try {
        console.log('=== PROCESSING SCHEDULED BROADCASTS ===');
        
        // Find scheduled broadcasts that are due
        const now = new Date();
        console.log('Current time:', now);
        
        // First, let's see ALL scheduled broadcasts
        const allScheduled = await ScheduledBroadcast.find().populate('broadcast').populate('recipients');
        console.log('All scheduled broadcasts found:', allScheduled.length);
        allScheduled.forEach((sb, idx) => {
            console.log(`${idx + 1}. ${sb.title} - Status: ${sb.status} - Scheduled: ${sb.scheduledTime} - Due: ${sb.scheduledTime <= now}`);
        });
        
        // Now find the ones that are due
        const dueScheduledBroadcasts = await ScheduledBroadcast.find({
            status: 'Scheduled',
            scheduledTime: { $lte: now }
        }).populate('broadcast').populate('recipients');
        
        console.log('Due scheduled broadcasts found:', dueScheduledBroadcasts.length);

        let processedCount = 0;
        let failedCount = 0;

        for (const scheduledBroadcast of dueScheduledBroadcasts) {
            try {
                console.log(`Processing: ${scheduledBroadcast.title}`);
                
                // Update status to Processing
                scheduledBroadcast.status = 'Processing';
                await scheduledBroadcast.save();

                // Create recent message entry for tracking
                // Convert channel to match RecentMessage enum format
                const channelMapping = {
                    'email': 'Email',
                    'sms': 'SMS', 
                    'whatsapp': 'WhatsApp'
                };
                
                const recentMessage = new RecentMessage({
                    title: scheduledBroadcast.title,
                    content: scheduledBroadcast.message,
                    channel: channelMapping[scheduledBroadcast.channel] || scheduledBroadcast.channel,
                    recipients: scheduledBroadcast.recipients.map(r => ({
                        _id: r._id,
                        status: 'sent'
                    })),
                    sentAt: new Date(),
                    status: 'complete',
                    originalBroadcast: scheduledBroadcast.broadcast,
                    scheduledSource: scheduledBroadcast._id
                });

                await recentMessage.save();

                // Update scheduled broadcast status to Sent
                scheduledBroadcast.status = 'Sent';
                scheduledBroadcast.sentAt = new Date();
                await scheduledBroadcast.save();

                console.log(`✅ Successfully processed: ${scheduledBroadcast.title}`);
                processedCount++;
            } catch (error) {
                console.error(`❌ Error processing scheduled broadcast ${scheduledBroadcast._id}:`, error);
                
                // Update status to Failed
                scheduledBroadcast.status = 'Failed';
                await scheduledBroadcast.save();
                
                failedCount++;
            }
        }

        console.log('=== PROCESSING COMPLETE ===');
        console.log(`Processed: ${processedCount}, Failed: ${failedCount}, Total: ${dueScheduledBroadcasts.length}`);

        res.json({ 
            message: 'Scheduled broadcasts processed', 
            processed: processedCount,
            failed: failedCount,
            total: dueScheduledBroadcasts.length,
            debug: {
                currentTime: now,
                allScheduledCount: allScheduled.length,
                dueCount: dueScheduledBroadcasts.length
            }
        });
    } catch (error) {
        console.error('Error processing scheduled broadcasts:', error);
        res.status(500).json({ message: 'Error processing scheduled broadcasts', error });
    }
});

export default router;
