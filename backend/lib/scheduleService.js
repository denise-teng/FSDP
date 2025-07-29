import ScheduledBroadcast from '../models/scheduledBroadcast.model.js';
import EmailService from './emailService.js';
import { isBefore, subMinutes } from 'date-fns';

class ScheduleService {
    // Create a new scheduled broadcast
    async createScheduledBroadcast(data) {
        const broadcast = new ScheduledBroadcast({
            ...data,
            status: 'Pending'
        });
        
        await broadcast.save();
        return broadcast;
    }

    // Process pending broadcasts (run by worker)
    async processPendingBroadcasts() {
        const now = new Date();
        const broadcasts = await ScheduledBroadcast.find({
            scheduledTime: { $lte: now },
            status: 'Pending'
        }).populate('recipients');

        const results = [];
        
        for (const broadcast of broadcasts) {
            try {
                broadcast.status = 'Processing';
                await broadcast.save();

                const recipientEmails = broadcast.recipients.map(r => r.email);
                
                let result;
                if (isBefore(broadcast.scheduledTime, subMinutes(now, 5))) {
                    // If scheduled time is more than 5 minutes past, send immediately
                    result = await EmailService.sendBatchEmail(
                        recipientEmails,
                        broadcast.title,
                        broadcast.message
                    );
                } else {
                    // Otherwise use SendGrid's scheduling
                    result = await EmailService.scheduleEmail(
                        recipientEmails,
                        broadcast.title,
                        broadcast.message,
                        broadcast.scheduledTime
                    );
                }

                broadcast.status = 'Sent';
                broadcast.lastAttempt = new Date();
                await broadcast.save();

                results.push({
                    broadcastId: broadcast._id,
                    status: 'success',
                    ...result
                });
            } catch (error) {
                broadcast.sendAttempts += 1;
                broadcast.lastAttempt = new Date();
                broadcast.status = broadcast.sendAttempts >= 3 ? 'Failed' : 'Pending';
                await broadcast.save();

                results.push({
                    broadcastId: broadcast._id,
                    status: 'error',
                    error: error.message
                });
            }
        }

        return {
            processed: broadcasts.length,
            results
        };
    }

    // Get upcoming broadcasts
    async getUpcomingBroadcasts() {
        return ScheduledBroadcast.find({
            scheduledTime: { $gte: new Date() },
            status: 'Pending'
        }).sort({ scheduledTime: 1 });
    }

    // Cancel a scheduled broadcast
    async cancelBroadcast(broadcastId) {
        return ScheduledBroadcast.findByIdAndUpdate(
            broadcastId,
            { status: 'Cancelled' },
            { new: true }
        );
    }
}

export default new ScheduleService();