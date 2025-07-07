import mongoose from 'mongoose';

const scheduledBroadcastSchema = new mongoose.Schema({
    title: { type: String, required: true },
    listName: { type: String, required: true },
    channel: { type: String, required: true, enum: ['Email', 'WhatsApp', 'SMS'] },
    tags: { type: [String] },
    scheduledTime: { type: Date, required: true }, // When it should be sent
    status: { type: String, enum: ['Pending', 'Sent'], default: 'Pending' },
    recipients: { type: Number, required: true }, // e.g. the number of recipients
    syncCalendar: { type: Boolean, default: false },
}, { timestamps: true });

const ScheduledBroadcast = mongoose.model('ScheduledBroadcast', scheduledBroadcastSchema);

export default ScheduledBroadcast;
