import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    required: false,
  },
  type: {
    type: String,
    required: true,
  },
  isNear: {
    type: Boolean,
    default: false,
  },
  location: {
    type: String,
    default: null,
  },
  startTime: {
    type: String, // or Date if you prefer storing time in full ISO format
    default: null,
  },
  endTime: {
    type: String, // or Date
    default: null,
  },
  isPermanent: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

export default Event;
