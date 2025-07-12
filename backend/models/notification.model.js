import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Optional if it's admin-wide
  forAdmin: { type: Boolean, default: false },
  text: { type: String, required: true },
  trigger: { type: String }, // optional detailed message
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Notification', notificationSchema);
