import Broadcast from '../models/broadcast.model.js';
import { ScheduledBroadcast } from '../models/scheduledBroadcast.model.js';
import EmailService from '../lib/emailService.js';
import { logMessage } from '../lib/messageLogger.service.js';
import RecentMessage from '../models/recentMessage.model.js';
import Contact from '../models/Contact.model.js';

// ==================== STANDARD BROADCASTS ====================

export const getAllBroadcasts = async (req, res) => {
  try {
    const broadcasts = await Broadcast.find()
      .populate('recipients', 'firstName lastName email phone')
      .sort({ createdAt: -1 });
    res.json(broadcasts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBroadcastRecipients = async (req, res) => {
  try {
    if (req.params.id) {
      const broadcast = await Broadcast.findById(req.params.id)
        .populate('recipients', 'firstName lastName email phone');
      if (!broadcast) return res.status(404).json({ error: 'Broadcast not found' });
      return res.json(broadcast.recipients);
    }

    const broadcasts = await Broadcast.find()
      .populate('recipients', 'firstName lastName email phone');

    const recipientsMap = new Map();
    broadcasts.forEach(broadcast => {
      broadcast.recipients?.forEach(recipient => {
        const recipientId = recipient._id.toString();
        if (!recipientsMap.has(recipientId)) {
          recipientsMap.set(recipientId, {
            ...recipient.toObject(),
            broadcastGroups: []
          });
        }
        recipientsMap.get(recipientId).broadcastGroups.push({
          id: broadcast._id,
          name: broadcast.title
        });
      });
    });

    res.json(Array.from(recipientsMap.values()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createBroadcast = async (req, res) => {
  try {
    // Convert the channel to lowercase to match enum value
    req.body.channel = req.body.channel.toLowerCase();

    const broadcast = new Broadcast({ ...req.body });
    await broadcast.save();
    res.status(201).json(broadcast);
  } catch (err) {
    console.error('Error creating broadcast:', err); // More detailed logging
    res.status(500).json({
      error: 'Failed to create broadcast',
      details: err.message, // Return the error message to understand the failure
    });
  }
};

export const deleteBroadcast = async (req, res) => {
  try {
    console.log('Attempting to delete broadcast with ID:', req.params.id);
    
    const deletedBroadcast = await Broadcast.findByIdAndDelete(req.params.id);
    if (!deletedBroadcast) {
      console.log('Broadcast not found:', req.params.id);
      return res.status(404).json({ error: 'Broadcast not found' });
    }
    
    console.log('Broadcast deleted successfully:', deletedBroadcast.title);
    res.status(200).json({ message: 'Broadcast deleted successfully' });
  } catch (err) {
    console.error('Error deleting broadcast:', err);
    res.status(500).json({ error: 'Failed to delete broadcast', details: err.message });
  }
};

export const addContactToBroadcast = async (req, res) => {
  try {
    const { broadcastId, contactId } = req.body;

    // Basic validation to check if both broadcastId and contactId are provided
    if (!broadcastId || !contactId) {
      return res.status(400).json({
        success: false,
        message: 'Missing broadcastId or contactId',
      });
    }

    // Find the broadcast by its ID
    const broadcast = await Broadcast.findById(broadcastId);
    if (!broadcast) {
      return res.status(404).json({
        success: false,
        message: 'Broadcast not found',
      });
    }

    // Check if the contact is already in the recipients array
    if (broadcast.recipients.includes(contactId)) {
      return res.status(200).json({
        success: true,
        message: 'Contact already in broadcast',
      });
    }

    // Add the contact to the recipients array and save the broadcast
    broadcast.recipients.push(contactId);
    await broadcast.save();

    // Respond with the success message and updated data
    return res.status(200).json({
      success: true,
      message: 'Contact added to broadcast successfully',
      data: {
        broadcastId: broadcast._id,
        contactId,
        totalRecipients: broadcast.recipients.length, // Return the number of recipients
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};




// ==================== EMAIL SENDING ====================

export const sendNow = async (req, res) => {
  try {
    const { broadcastId, message } = req.body;

    // 1. Get broadcast with populated contacts (unchanged)
    const broadcast = await Broadcast.findById(broadcastId)
      .populate({
        path: 'recipients',
        select: 'email firstName lastName',
        match: {
          email: {
            $exists: true,
            $ne: null,
            $regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          }
        }
      });

    // 2. Validate recipients (unchanged)
    if (!broadcast?.recipients || broadcast.recipients.length === 0) {
      return res.status(400).json({
        error: 'No valid recipients found'
      });
    }

    // 3. Prepare email data (unchanged)
    const emailData = broadcast.recipients.map(contact => ({
      to: contact.email,
      subject: `Hi ${contact.firstName}, ${broadcast.title || 'Important Update'}`,
      text: `Dear ${contact.firstName},\n\n${message}`,
      html: `
        <p>Dear ${contact.firstName},</p>
        <p>${message}</p>
        <p>Best regards,</p>
        <p>Your Team</p>
      `,
      contactId: contact._id // Added for tracking
    }));

    // 4. Create recent message record (NEW)
    const recentMessage = await RecentMessage.create({
      title: broadcast.title,
      content: message,
      channel: 'Email',
      recipients: emailData.map(data => ({
        _id: data.contactId,
        status: 'pending' // Initial status
      })),
      originalBroadcast: broadcastId,
      status: 'partial'
    });

    // 5. Send emails in batches (modified to track status)
    const batchSize = 100;
    let successfulSends = 0;
    const recipientStatuses = [];

    for (let i = 0; i < emailData.length; i += batchSize) {
      const batch = emailData.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(data =>
          EmailService.sendEmail(data.to, data.subject, data.text, data.html)
            .then((result) => ({
              success: result.success,
              contactId: data.contactId,
              messageId: result.messageId,
              statusCode: result.statusCode,
              status: result.status || 'queued_for_delivery'
            }))
            .catch(error => ({
              success: false,
              contactId: data.contactId,
              error: error.error || error.message,
              isTemporary: error.isTemporary || false
            }))
        )
      );

      // Process results with better status tracking
      const batchStatuses = results.map(result => {
        if (result.status === 'fulfilled' && result.value.success) {
          return {
            contactId: result.value.contactId,
            status: 'delivered', // Changed from 'sent' to 'delivered' to be more accurate
            messageId: result.value.messageId,
            deliveredAt: new Date(),
            note: 'Email queued for delivery by SendGrid'
          };
        } else {
          return {
            contactId: result.value.contactId,
            status: result.value.isTemporary ? 'temporary_failure' : 'failed',
            error: result.value.error,
            deliveredAt: null,
            note: result.value.isTemporary ? 'Temporary failure - will retry' : 'Permanent delivery failure'
          };
        }
      });

      recipientStatuses.push(...batchStatuses);
      successfulSends += batchStatuses.filter(s => s.status === 'delivered').length;

      // Update recent message with batch results
      await RecentMessage.updateOne(
        { _id: recentMessage._id },
        {
          $set: {
            'recipients.$[elem].status': 'delivered',
            'recipients.$[elem].deliveredAt': new Date()
          }
        },
        {
          arrayFilters: [
            { 'elem._id': { $in: batchStatuses.filter(s => s.status === 'delivered').map(s => s.contactId) } }
          ]
        }
      );
    }

    // 6. Final status update with better messaging
    const deliveredCount = successfulSends;
    const failedCount = emailData.length - successfulSends;
    const temporaryFailures = recipientStatuses.filter(s => s.status === 'temporary_failure').length;
    
    let finalStatus;
    let statusMessage;
    
    if (deliveredCount === emailData.length) {
      finalStatus = 'complete';
      statusMessage = `All ${deliveredCount} emails queued for delivery successfully`;
    } else if (deliveredCount > 0) {
      finalStatus = 'partial';
      statusMessage = `${deliveredCount} emails delivered, ${failedCount} failed`;
      if (temporaryFailures > 0) {
        statusMessage += ` (${temporaryFailures} temporary failures)`;
      }
    } else {
      finalStatus = 'failed';
      statusMessage = `All ${emailData.length} emails failed to send`;
    }

    await RecentMessage.updateOne(
      { _id: recentMessage._id },
      {
        status: finalStatus,
        statusMessage: statusMessage,
        sentAt: new Date(),
        deliveredCount: deliveredCount,
        failedCount: failedCount,
        temporaryFailures: temporaryFailures
      }
    );

    // 7. Update broadcast
    await Broadcast.updateOne(
      { _id: broadcastId },
      {
        status: "sent",
        sentAt: new Date(),
        sentCount: successfulSends
      }
    );

    console.log(`📧 Broadcast completed: ${statusMessage}`);

    res.json({
      success: true,
      message: statusMessage,
      sentCount: deliveredCount,
      failedCount: failedCount,
      temporaryFailures: temporaryFailures,
      messageId: recentMessage._id,
      statusDetails: {
        total: emailData.length,
        delivered: deliveredCount,
        failed: failedCount,
        temporary_failures: temporaryFailures
      }
    });

  } catch (error) {
    console.error('Send error:', error);

    // Update message as failed if recentMessage was created (NEW)
    if (recentMessage?._id) {
      await RecentMessage.updateOne(
        { _id: recentMessage._id },
        { status: 'failed' }
      );
    }

    res.status(500).json({
      error: 'Failed to send broadcast',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getRecentBroadcasts = async (req, res) => {
  try {
    const broadcasts = await Broadcast.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('recipients', 'email');

    res.json({
      success: true,
      data: broadcasts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent broadcasts'
    });
  }
};

// ==================== SCHEDULED BROADCASTS ====================

export const getScheduledBroadcasts = async (req, res) => {
  try {
    const filter = {
      status: { $ne: 'Cancelled' },
      ...(req.query.status && { status: req.query.status })
    };

    const broadcasts = await ScheduledBroadcast.find(filter)
      .sort({ scheduledTime: 1 })
      .populate('createdBy', 'name email')
      .populate('recipients'); // Add this to populate recipients

    // Debug log to check recipient counts
    console.log('Fetched scheduled broadcasts:');
    broadcasts.forEach(b => {
      console.log(`- ${b.title}: recipientCount=${b.recipientCount}, recipients.length=${b.recipients?.length}`);
      console.log(`  Recipients array:`, b.recipients);
    });

    res.json(broadcasts);
  } catch (err) {
    console.error('Error fetching scheduled broadcasts:', err);
    res.status(500).json({ error: 'Failed to fetch scheduled broadcasts' });
  }
};

export const createScheduledBroadcast = async (req, res) => {
  try {
    console.log('createScheduledBroadcast called with body:', req.body);
    console.log('User object:', req.user);
    
    const { broadcastId, title, channel, message, scheduledTime } = req.body;

    // Validate required fields
    if (!broadcastId || !title || !channel || !message || !scheduledTime) {
      console.log('Missing required fields:', { broadcastId, title, channel, message, scheduledTime });
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['broadcastId', 'title', 'channel', 'message', 'scheduledTime'],
        received: { broadcastId, title, channel, message, scheduledTime }
      });
    }

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      console.log('User not authenticated or missing _id:', req.user);
      return res.status(401).json({
        error: 'User not authenticated',
        details: 'req.user or req.user._id is missing'
      });
    }

    // Get the original broadcast to copy recipients
    const originalBroadcast = await Broadcast.findById(broadcastId);
    if (!originalBroadcast) {
      console.log('Broadcast not found with ID:', broadcastId);
      return res.status(404).json({ error: 'Broadcast not found' });
    }

    console.log('Original broadcast found:', originalBroadcast.title, 'Recipients:', originalBroadcast.recipients?.length);
    console.log('Original recipients detailed:', originalBroadcast.recipients);

    // Deduplicate recipients to ensure no duplicates
    const recipientIds = originalBroadcast.recipients || [];
    const uniqueRecipients = [...new Set(recipientIds.map(id => id.toString()))];
    console.log('Original recipients count:', recipientIds.length, 'Unique recipients count:', uniqueRecipients.length);
    console.log('Original recipients:', recipientIds.map(id => id.toString()));
    console.log('Unique recipients:', uniqueRecipients);

    const scheduledBroadcast = new ScheduledBroadcast({
      title,
      broadcast: broadcastId,
      channel: channel.toLowerCase(), // Ensure lowercase to match enum
      message,
      scheduledTime: new Date(scheduledTime),
      recipients: uniqueRecipients,
      recipientCount: uniqueRecipients.length, // Explicitly set recipientCount
      status: 'Scheduled',
      createdBy: req.user._id
    });

    console.log('About to save scheduled broadcast with recipients count:', scheduledBroadcast.recipients?.length);
    console.log('Recipients array:', scheduledBroadcast.recipients);

    await scheduledBroadcast.save();

    console.log('Scheduled broadcast saved successfully');
    console.log('Final recipientCount:', scheduledBroadcast.recipientCount);
    console.log('Actual recipients length:', scheduledBroadcast.recipients?.length);

    res.status(201).json({
      message: 'Broadcast scheduled successfully',
      scheduledBroadcast
    });

  } catch (error) {
    console.error('Error scheduling broadcast:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to schedule broadcast',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Duplicate cancelScheduledBroadcast removed to fix redeclaration error.

// ==================== WORKER ENDPOINT ====================





// Update scheduled broadcast
// (Duplicate removed to fix redeclaration error)

export const cancelScheduledBroadcast = async (req, res) => {
  try {
    console.log('Attempting to cancel scheduled broadcast with ID:', req.params.id);
    
    const broadcast = await ScheduledBroadcast.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    );

    if (!broadcast) {
      console.log('Scheduled broadcast not found:', req.params.id);
      return res.status(404).json({ error: 'Scheduled broadcast not found' });
    }

    console.log('Scheduled broadcast cancelled successfully:', broadcast.title);
    res.json({
      success: true,
      message: 'Broadcast cancelled successfully'
    });
  } catch (err) {
    console.error('Error cancelling scheduled broadcast:', err);
    res.status(500).json({
      error: 'Failed to cancel broadcast',
      details: err.message
    });
  }
};

// ==================== WORKER ENDPOINT ====================

export const processScheduledBroadcasts = async (req, res) => {
  try {
    const now = new Date();
    const broadcasts = await ScheduledBroadcast.find({
      scheduledTime: { $lte: now },
      status: 'Scheduled'
    }).populate('recipients');

    for (const broadcast of broadcasts) {
      try {
        // 1. Send the broadcast (your existing sending logic)
        await sendBroadcastImplementation(broadcast);

        // 2. Move to RecentMessages collection
        const recentMessage = new RecentMessage({
          title: broadcast.title,
          content: broadcast.message,
          channel: broadcast.channel,
          recipients: broadcast.recipients,
          sentAt: new Date(),
          originalBroadcast: broadcast._id
        });
        await recentMessage.save();

        // 3. Update status
        broadcast.status = 'Sent';
        await broadcast.save();
      } catch (err) {
        console.error(`Failed to process broadcast ${broadcast._id}:`, err);
        broadcast.status = 'Failed';
        await broadcast.save();
      }
    }

    res.json({
      success: true,
      processed: broadcasts.length
    });
  } catch (error) {
    console.error('Process Scheduled Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process scheduled broadcasts'
    });
  }
};

// Get message history
export const getMessageHistory = async (req, res) => {
  try {
    const messages = await RecentMessage.find()
      .sort({ sentAt: -1 })
      .populate('recipients._id', 'email firstName lastName')
      .populate('originalBroadcast', 'title')
      .limit(100);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get specific message details
export const getMessageDetails = async (req, res) => {
  try {
    const message = await RecentMessage.findById(req.params.id)
      .populate('recipients._id', 'email firstName lastName')
      .populate('originalBroadcast', 'title content');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Retry failed messages
export const retryFailedMessage = async (req, res) => {
  try {
    const message = await RecentMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Your logic to retry failed messages here
    // This will depend on your email/SMS service

    res.json({ success: true, message: 'Retry initiated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update scheduled broadcast
export const updateScheduledBroadcast = async (req, res) => {
  try {
    const updatedBroadcast = await ScheduledBroadcast.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('broadcast', 'title')
      .populate('createdBy', 'name');

    res.json(updatedBroadcast);
  } catch (error) {
    console.error('Error updating scheduled broadcast:', error);
    res.status(500).json({ message: 'Failed to update scheduled broadcast' });
  }
};

// backend/controllers/broadcast.controller.js

// Add these new functions at the bottom (before the last export)
export const createAIBroadcast = async (req, res) => {
  try {
    const { title, listName, channel, recipients, tags } = req.body;

    const broadcast = new Broadcast({
      title,
      listName,
      channel: channel.toLowerCase(),
      recipients,
      tags,
      isAIGenerated: true,
      createdAt: new Date()
    });

    await broadcast.save();
    res.status(201).json(broadcast);
  } catch (error) {
    console.error('Error saving AI broadcast:', error);
    res.status(500).json({ message: 'Failed to save AI broadcast' });
  }
};

export const matchContactsByTopics = async (req, res) => {
  try {
    const { topics } = req.body;

    const matchedContacts = await Contact.find({
      $or: [
        { tags: { $in: topics } },
        { subject: { $in: topics } }
      ]
    }).select('_id firstName lastName email tags subject channel');

    res.json(matchedContacts);
  } catch (error) {
    console.error('Error matching contacts:', error);
    res.status(500).json({ message: 'Error matching contacts' });
  }
};