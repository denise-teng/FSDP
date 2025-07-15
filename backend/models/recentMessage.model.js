// models/RecentMessage.js
import mongoose from 'mongoose';

// Define schema for RecentMessage
const recentMessageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    channel: {
        type: String,
        enum: ['Email', 'WhatsApp', 'SMS'], // You can add more channels if needed
        required: true,
    },
    tags: [String], // An array of tags
    sentAt: {
        type: Date,
        default: Date.now, // Automatically set the current time when the message is created
    },
});

// Create model based on the schema
const RecentMessage = mongoose.model('RecentMessage', recentMessageSchema);

export default RecentMessage;
