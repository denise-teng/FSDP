import mongoose from 'mongoose';

const EngagementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userType: { type: String, enum: ['customer', 'admin'], required: true },
  engagementType: { type: String, required: true }, // e.g. "click", "reply", "visit"

  // Optional: only for session-type tracking
  timeline: {
    start: { type: Date },
    end: { type: Date },
  },

  // Use Number instead of String for easier aggregation
  engagingTime: { type: Number }, // in seconds

  clicks: { type: Number, default: 0 },
  replies: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Engagement', EngagementSchema);
