import express from 'express';
import mongoose from 'mongoose';
import Broadcast from '../models/broadcast.model.js';
import RecentMessage from '../models/recentMessage.model.js';
import { ScheduledBroadcast } from '../models/scheduledBroadcast.model.js';
import Contact from '../models/Contact.model.js';
import { sendBulkBroadcastEmails } from '../lib/sendEmail.js';
import { normalizeChannel } from '../utils/channelNormalizer.js';

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
                firstName: recipient.firstName,
                lastName: recipient.lastName,
                email: recipient.email,
                phone: recipient.phone,
                broadcastGroup: broadcast.title,
                broadcastId: broadcast._id,
                listName: broadcast.listName
            }))
        );
        
        // Remove duplicates based on _id but keep broadcast group info
        const seenIds = new Set();
        const uniqueRecipients = [];
        
        allRecipients.forEach(recipient => {
            const key = recipient._id.toString();
            if (!seenIds.has(key)) {
                seenIds.add(key);
                uniqueRecipients.push(recipient);
            } else {
                // Find existing recipient and add additional broadcast groups
                const existing = uniqueRecipients.find(r => r._id.toString() === key);
                if (existing && existing.broadcastGroup !== recipient.broadcastGroup) {
                    existing.broadcastGroup = existing.broadcastGroup + ', ' + recipient.broadcastGroup;
                }
            }
        });
        
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
            firstName: recipient.firstName,
            lastName: recipient.lastName,
            email: recipient.email,
            phone: recipient.phone,
            channel: broadcast.channel // Add the broadcast's channel
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

// Match contacts based on topics for AI broadcast generation
router.post('/match-contacts', async (req, res) => {
    try {
        const { topics } = req.body;
        
        if (!topics || !Array.isArray(topics) || topics.length === 0) {
            return res.json([]);
        }
        
        // Create a case-insensitive regex pattern for each topic
        const topicPatterns = topics.map(topic => new RegExp(topic, 'i'));
        
        // Find contacts that match any of the topics in their subject or message
        const matchedContacts = await Contact.find({
            $or: [
                { subject: { $in: topicPatterns } },
                { message: { $regex: new RegExp(topics.join('|'), 'i') } }
            ]
        }).select('firstName lastName email phone subject');
        
        // Limit to reasonable number and format response
        const formattedContacts = matchedContacts.slice(0, 50).map(contact => ({
            _id: contact._id,
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            phone: contact.phone,
            subject: contact.subject
        }));
        
        res.json(formattedContacts);
    } catch (error) {
        console.error('Error matching contacts:', error);
        res.status(500).json({ message: 'Error matching contacts', error });
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

        if (!broadcast.recipients || broadcast.recipients.length === 0) {
            return res.status(400).json({ message: 'No recipients found for this broadcast' });
        }

        let emailResults = [];
        
        // Only send emails if channel is email
        if (channel === 'email' || broadcast.channel === 'email') {
            console.log(`Sending emails to ${broadcast.recipients.length} recipients...`);
            emailResults = await sendBulkBroadcastEmails({
                recipients: broadcast.recipients,
                subject: title || broadcast.title,
                message
            });
        }

        // Create recent message entry with actual send results
        const recentMessage = new RecentMessage({
            title: title || broadcast.title,
            content: message,
            channel: channel || broadcast.channel,
            recipients: emailResults.length > 0 
                ? emailResults.map(result => ({
                    _id: result.recipient,
                    status: result.status,
                    error: result.error,
                    deliveredAt: result.sentAt
                }))
                : broadcast.recipients.map(r => ({
                    _id: r._id,
                    status: 'sent'
                })),
            sentAt: new Date(),
            status: emailResults.length > 0 
                ? (emailResults.every(r => r.status === 'sent') ? 'complete' : 'partial')
                : 'complete',
            originalBroadcast: broadcast._id
        });
        
        await recentMessage.save();
        
        const successCount = emailResults.filter(r => r.status === 'sent').length;
        const failureCount = emailResults.filter(r => r.status === 'failed').length;
        
        res.json({ 
            message: 'Broadcast processed successfully', 
            data: recentMessage,
            stats: {
                total: broadcast.recipients.length,
                sent: successCount,
                failed: failureCount
            }
        });
    } catch (error) {
        console.error('Error sending broadcast:', error);
        res.status(500).json({ message: 'Error sending broadcast', error: error.message });
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
                const recentMessage = new RecentMessage({
                    title: scheduledBroadcast.title,
                    content: scheduledBroadcast.message,
                    channel: normalizeChannel(scheduledBroadcast.channel),
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

// Add contact to broadcast list
router.post('/add-contact', async (req, res) => {
    try {
        const { broadcastId, contactId } = req.body;
        
        if (!broadcastId || !contactId) {
            return res.status(400).json({ message: 'broadcastId and contactId are required' });
        }

        const broadcast = await Broadcast.findById(broadcastId);
        if (!broadcast) {
            return res.status(404).json({ message: 'Broadcast not found' });
        }

        const contact = await Contact.findById(contactId);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        // Check if contact is already in the broadcast recipients
        if (broadcast.recipients.includes(contactId)) {
            return res.status(400).json({ message: 'Contact already exists in this broadcast list' });
        }

        // Add contact to broadcast recipients
        broadcast.recipients.push(contactId);
        await broadcast.save();

        res.json({ 
            message: 'Contact added to broadcast list successfully',
            broadcast: await Broadcast.findById(broadcastId).populate('recipients')
        });
    } catch (error) {
        console.error('Error adding contact to broadcast:', error);
        res.status(500).json({ message: 'Error adding contact to broadcast', error });
    }
});

export default router;
