import { ScheduledBroadcast } from '../models/scheduledBroadcast.model.js';
import { sendScheduledBroadcastEmail } from './sendEmail.js';
import { logMessage } from './messageLogger.service.js';

const processScheduledBroadcasts = async () => {
  try {
    const now = new Date();
    console.log(`[${now.toISOString()}] Processing scheduled broadcasts`);

    // Env check
    console.log('🔑 Environment check:');
    console.log('- SENDGRID_API_KEY available:', !!process.env.SENDGRID_API_KEY);
    console.log(
      '- SENDGRID_API_KEY format:',
      process.env.SENDGRID_API_KEY?.startsWith('SG.') ? 'Valid' : 'Invalid'
    );
    console.log('- NODE_ENV:', process.env.NODE_ENV);

    // Find broadcasts ready to send
    console.log('🔍 Searching for scheduled broadcasts...');
    console.log('Current time:', now.toISOString());

    const broadcasts = await ScheduledBroadcast.find({
      scheduledTime: { $lte: now },
      status: 'Scheduled',
    })
      .populate({
        path: 'broadcast',
        populate: {
          path: 'recipients',
          select: 'email firstName lastName',
        },
      })
      .populate('createdBy', 'name email');

    console.log(`📊 Found ${broadcasts.length} broadcasts ready to send`);

    if (broadcasts.length > 0) {
      broadcasts.forEach((broadcast, index) => {
        console.log(`📋 Broadcast ${index + 1}:`, {
          id: broadcast._id,
          title: broadcast.broadcast?.title,
          scheduledTime: broadcast.scheduledTime,
          status: broadcast.status,
          recipientCount: broadcast.broadcast?.recipients?.length || 0,
        });
      });
    }

    if (broadcasts.length === 0) {
      console.log('No scheduled broadcasts to process');
      return;
    }

    for (const scheduled of broadcasts) {
      const processingResult = {
        broadcastId: scheduled._id,
        title: scheduled.broadcast.title,
        scheduledTime: scheduled.scheduledTime,
        recipientCount: scheduled.broadcast.recipients.length,
      };

      console.log('🚀 Starting to process scheduled broadcast:', processingResult);
      console.log('📧 Broadcast content:', {
        title: scheduled.broadcast.title,
        content: (scheduled.broadcast.content || '').substring(0, 100) + '...',
        recipientCount: scheduled.broadcast.recipients.length,
      });

      try {
        // Mark as processing
        await ScheduledBroadcast.updateOne(
          { _id: scheduled._id },
          { status: 'Processing' }
        );
        console.log(`⚙️ Processing broadcast ${scheduled._id}`);

        const batchSize = 100;
        const recipients = scheduled.broadcast.recipients;
        const allResults = [];

        for (let i = 0; i < recipients.length; i += batchSize) {
          const batch = recipients.slice(i, i + batchSize);
          console.log(
            `📦 Processing batch ${i / batchSize + 1} of ${Math.ceil(
              recipients.length / batchSize
            )}`
          );

          const batchResults = await Promise.allSettled(
            batch.map((recipient) => {
              console.log(`📧 Attempting to send to: ${recipient.email}`);
              console.log('📋 Data being sent:', {
                to: recipient.email,
                subject: scheduled.broadcast.title || 'Important Update',
                firstName: recipient.firstName,
                messageLength: (scheduled.broadcast.content || scheduled.message)?.length,
              });

              return sendScheduledBroadcastEmail({
                to: recipient.email,
                subject: scheduled.broadcast.title || 'Important Update',
                message: scheduled.broadcast.content || scheduled.message,
                firstName: recipient.firstName,
                from: 'densie.t2910@gmail.com', // verified sender
              })
                .then(() => {
                  console.log(`✅ SUCCESS sending to ${recipient.email}`);
                  return {
                    success: true,
                    recipientId: recipient._id,
                    recipient,
                  };
                })
                .catch((error) => {
                  console.error(`🚨 ERROR sending to ${recipient.email}:`, {
                    message: error.message,
                    code: error.code,
                    stack: error.stack,
                    response: error.response
                      ? {
                          status: error.response.status,
                          body: error.response.body,
                        }
                      : null,
                  });
                  return {
                    success: false,
                    recipientId: recipient._id,
                    recipient,
                    error: error.message,
                  };
                });
            })
          );

          const formattedResults = batchResults.map((r) =>
            r.status === 'fulfilled' ? r.value : r.reason
          );
          allResults.push(...formattedResults);
        }

        // Log the message with results
        const recentMessage = await logMessage(
          scheduled.broadcast,
          scheduled.broadcast.content || scheduled.message,
          allResults,
          scheduled._id
        );
        console.log(`📝 Message logged with ID: ${recentMessage._id}`);

        const successfulSends = allResults.filter((r) => r.success).length;
        console.log(
          `📊 Successfully sent to ${successfulSends}/${recipients.length} recipients`
        );

        const finalStatus =
          successfulSends === recipients.length
            ? 'Sent'
            : successfulSends > 0
            ? 'Partially Sent'
            : 'Failed';

        await ScheduledBroadcast.updateOne(
          { _id: scheduled._id },
          {
            status: finalStatus,
            sentAt: new Date(),
            recentMessage: recentMessage._id,
            $inc: { __v: 1 },
          }
        );

        processingResult.status = finalStatus;
        processingResult.sentCount = successfulSends;
        processingResult.failedCount = recipients.length - successfulSends;

        console.log('✅ Broadcast processed successfully:', processingResult);
      } catch (error) {
        console.error(`🚨 BROADCAST PROCESSING ERROR for ${scheduled._id}:`, {
          message: error.message,
          stack: error.stack,
        });

        await ScheduledBroadcast.updateOne(
          { _id: scheduled._id },
          {
            status: 'Failed',
            error: error.message,
          }
        );

        processingResult.status = 'Failed';
        processingResult.error = error.message;
        console.error('❌ Broadcast processing failed:', processingResult);
      }
    }
  } catch (error) {
    console.error('Process Scheduled Error:', error);
  }
};

// Run every minute
console.log('🕒 Schedule worker initialized - will check every 60 seconds');
setInterval(() => {
  console.log('⏰ Schedule worker tick - checking for broadcasts...');
  processScheduledBroadcasts();
}, 60 * 1000);

// Initial run after 5s delay
console.log('⏳ Schedule worker starting in 5 seconds...');
setTimeout(() => {
  console.log('🚀 Schedule worker initial run starting now');
  processScheduledBroadcasts();
}, 5000);

export default processScheduledBroadcasts;
