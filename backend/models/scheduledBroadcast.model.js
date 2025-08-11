// models/scheduledBroadcast.model.js
import mongoose from 'mongoose';

const scheduledBroadcastSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Added title field
  broadcast: { type: mongoose.Schema.Types.ObjectId, ref: 'Broadcast', required: true },
  message: { type: String, required: true },
  scheduledTime: { type: Date, required: true },
  channel: { 
    type: String, 
    enum: ['email', 'sms', 'whatsapp'], 
    required: true,
    set: (val) => val.toLowerCase() // Automatically convert to lowercase
  },
  recipients: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Contact' 
  }],
  status: { 
    type: String, 
    enum: ['Scheduled', 'Processing', 'Sent', 'Failed', 'Cancelled'], 
    default: 'Scheduled' 
  },
  sentAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Added additional tracking fields
  recipientCount: { type: Number, default: 0 },
  successCount: { type: Number, default: 0 },
  failureCount: { type: Number, default: 0 }
}, { 
  timestamps: true,
  toJSON: { virtuals: true } 
});

// Virtual for formatted scheduled time
scheduledBroadcastSchema.virtual('formattedTime').get(function() {
  return this.scheduledTime.toLocaleString();
});

// Pre-save hook to update recipient count
scheduledBroadcastSchema.pre('save', function(next) {
  if (this.isModified('recipients')) {
    this.recipientCount = this.recipients?.length || 0;
    console.log(`Pre-save: Set recipientCount to ${this.recipientCount} for broadcast "${this.title}"`);
  }
  next();
});

export const ScheduledBroadcast = mongoose.model('ScheduledBroadcast', scheduledBroadcastSchema);