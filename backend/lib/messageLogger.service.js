// services/messageLogger.service.js
import RecentMessage from '../models/recentMessage.model.js';

export const logMessage = async (broadcast, content, results, scheduledBroadcastId = null) => {
  try {
    const recipientStatuses = results.map(result => ({
      _id: result.recipientId,
      email: result.recipient.email,
      firstName: result.recipient.firstName,
      lastName: result.recipient.lastName,
      status: result.success ? 'sent' : 'failed',
      error: result.error || undefined,
      deliveredAt: result.success ? new Date() : undefined,
      updatedAt: new Date()
    }));

    const allSuccess = results.every(result => result.success);
    const anySuccess = results.some(result => result.success);

    const status = allSuccess ? 'complete' : 
                 anySuccess ? 'partial' : 'failed';

    const messageData = {
      title: broadcast.title,
      content,
      channel: broadcast.channel,
      recipients: recipientStatuses,
      originalBroadcast: broadcast._id,
      status,
      sentAt: new Date()
    };

    // Add scheduled source if available
    if (scheduledBroadcastId) {
      messageData.scheduledSource = scheduledBroadcastId;
      messageData.scheduled = true;
    }

    console.log('Creating RecentMessage record:', {
      title: messageData.title,
      recipientCount: messageData.recipients.length,
      status: messageData.status
    });

    const recentMessage = await RecentMessage.create(messageData);
    console.log(`RecentMessage created with ID: ${recentMessage._id}`);

    return recentMessage;

  } catch (error) {
    console.error('Error logging message:', error);
    throw error;
  }
};