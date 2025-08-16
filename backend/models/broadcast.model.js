import mongoose from 'mongoose';
import { CHANNEL_ENUM, normalizeChannel } from '../utils/channelNormalizer.js';

const BroadcastSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  listName: { 
    type: String, 
    required: true 
  },
  channel: { 
    type: String, 
    enum: CHANNEL_ENUM, 
    required: true,
    set: (val) => normalizeChannel(val) // Automatically normalize channel values
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  }],
  tags: [{
    type: String
  }],
  scheduledTime: { 
    type: Date 
  }
}, { timestamps: true });

export default mongoose.model('Broadcast', BroadcastSchema);
