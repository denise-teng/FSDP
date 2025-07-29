import mongoose from 'mongoose';

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
    enum: ['email', 'sms', 'whatsapp'], 
    required: true,
    set: (val) => val.toLowerCase() // Automatically convert the channel to lowercase
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  }],
  whatsappContacts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WhatsappContact',
    default: []
  }],
  tags: [{
    type: String
  }],
  scheduledTime: { 
    type: Date 
  }
}, { timestamps: true });

export default mongoose.model('Broadcast', BroadcastSchema);
