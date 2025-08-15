import { ScheduledBroadcast } from '../models/scheduledBroadcast.model.js';
import EmailService from './emailService.js';
import { sendScheduledBroadcastEmail } from './sendEmail.js';
import { logMessage } from './messageLogger.service.js';

const processScheduledBroadcasts = async () => {
    try {
        const now = new Date();
        console.log(`[${now.toISOString()}] Processing scheduled broadcasts`);

        // Find broadcasts ready to send
        const broadcasts = await ScheduledBroadcast.find({
            scheduledTime: { $lte: now },
            status: 'Scheduled'
        })
        .populate({
            path: 'broadcast',
            populate: {
                path: 'recipients',
                select: 'email firstName lastName'
            }
        })
        .populate('createdBy', 'name email');

        if (broadcasts.length === 0) {
            console.log('No scheduled broadcasts to process');
            return;
        }

        for (const scheduled of broadcasts) {
            const processingResult = {
                broadcastId: scheduled._id,
                title: scheduled.broadcast.title,
                scheduledTime: scheduled.scheduledTime,
                recipientCount: scheduled.broadcast.recipients.length
            };

            try {
                // Mark as processing
                await ScheduledBroadcast.updateOne(
                    { _id: scheduled._id },
                    { status: 'Processing' }
                );
                console.log(`Processing broadcast ${scheduled._id}`);

                // Process recipients in batches
                const batchSize = 100;
                const recipients = scheduled.broadcast.recipients;
                const allResults = [];

                for (let i = 0; i < recipients.length; i += batchSize) {
                    const batch = recipients.slice(i, i + batchSize);
                    console.log(`Processing batch ${i/batchSize + 1} of ${Math.ceil(recipients.length/batchSize)}`);

                    const batchResults = await Promise.allSettled(
                        batch.map(recipient => {
                            return sendScheduledBroadcastEmail({
                                to: recipient.email,
                                subject: scheduled.broadcast.title || 'Important Update',
                                message: scheduled.broadcast.content || scheduled.message,
                                firstName: recipient.firstName
                            })
                                .then(() => ({ 
                                    success: true, 
                                    recipientId: recipient._id,
                                    recipient
                                }))
                                .catch(error => {
                                    console.error(`Failed to send to ${recipient.email}:`, error.message);
                                    return {
                                        success: false,
                                        recipientId: recipient._id,
                                        recipient,
                                        error: error.message
                                    };
                                });
                        })
                    );

                    const formattedResults = batchResults.map(result => result.value);
                    allResults.push(...formattedResults);
                }

                // Log the message with all results
                const recentMessage = await logMessage(
                    scheduled.broadcast,
                    scheduled.broadcast.content || scheduled.message,
                    allResults,
                    scheduled._id // Pass scheduled broadcast ID
                );
                console.log(`Message logged with ID: ${recentMessage._id}`);

                // Count successful sends
                const successfulSends = allResults.filter(r => r.success).length;
                console.log(`Successfully sent to ${successfulSends}/${recipients.length} recipients`);

                // Update scheduled broadcast status
                const finalStatus = successfulSends === recipients.length ? 'Sent' :
                                  successfulSends > 0 ? 'Partially Sent' : 'Failed';

                await ScheduledBroadcast.updateOne(
                    { _id: scheduled._id },
                    {
                        status: finalStatus,
                        sentAt: new Date(),
                        recentMessage: recentMessage._id,
                        $inc: { __v: 1 }
                    }
                );

                processingResult.status = finalStatus;
                processingResult.sentCount = successfulSends;
                processingResult.failedCount = recipients.length - successfulSends;

                console.log('Broadcast processed successfully:', processingResult);

            } catch (error) {
                console.error(`Failed to process broadcast ${scheduled._id}:`, error);
                
                await ScheduledBroadcast.updateOne(
                    { _id: scheduled._id },
                    {
                        status: 'Failed',
                        error: error.message
                    }
                );

                processingResult.status = 'Failed';
                processingResult.error = error.message;
                console.error('Broadcast processing failed:', processingResult);
            }
        }

    } catch (error) {
        console.error('Process Scheduled Error:', error);
    }
};

// Run every minute
const interval = setInterval(processScheduledBroadcasts, 60 * 1000);

// Initial run with delay to let server start
setTimeout(processScheduledBroadcasts, 5000);

export default processScheduledBroadcasts;