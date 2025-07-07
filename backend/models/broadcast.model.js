import mongoose from 'mongoose';

const BroadcastSchema = new mongoose.Schema({
  title: String,
  listName: String,
  channel: String,
  tags: [String],
  scheduledTime: Date
}, { timestamps: true }); // 👈 THIS IS REQUIRED


const Broadcast = mongoose.model('Broadcast', BroadcastSchema);

export default Broadcast;
