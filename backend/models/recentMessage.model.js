import mongoose from 'mongoose';

const recentMessageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  channel: {
    type: String,
    enum: ['Email', 'SMS', 'WhatsApp'],
    required: true
  },
  recipients: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipient',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'pending'
    },
    error: {
      type: String,
      select: false // Hide by default
    },
    deliveredAt: Date
  }],
  sentAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    enum: ['partial', 'complete', 'failed'],
    default: 'partial'
  },
  originalBroadcast: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Broadcast'
  },
  scheduledSource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScheduledBroadcast'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { 
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes
recentMessageSchema.index({ originalBroadcast: 1 });
recentMessageSchema.index({ scheduledSource: 1 });
recentMessageSchema.index({ status: 1 });

// Virtuals
recentMessageSchema.virtual('recipientCount').get(function() {
  return this.recipients.length;
});

recentMessageSchema.virtual('successCount').get(function() {
  return this.recipients.filter(r => r.status === 'sent' || r.status === 'delivered').length;
});

// Pre-save hook
recentMessageSchema.pre('save', function(next) {
  if (this.isModified('recipients')) {
    const statuses = this.recipients.map(r => r.status);
    if (statuses.every(s => s === 'sent' || s === 'delivered')) {
      this.status = 'complete';
    } else if (statuses.some(s => s === 'sent' || s === 'delivered')) {
      this.status = 'partial';
    } else {
      this.status = 'failed';
    }
  }
  next();
});

// Static methods
recentMessageSchema.statics.findByScheduledBroadcast = function(scheduledId) {
  return this.find({ scheduledSource: scheduledId });
};

const RecentMessage = mongoose.model('RecentMessage', recentMessageSchema);

export default RecentMessage;