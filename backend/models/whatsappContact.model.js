import mongoose from 'mongoose';

const whatsappContactSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  company: { type: String, required: true },
  eventName: { type: String, required: true },
  eventDate: { type: Date, required: true }
}, {
  timestamps: true
});

export default mongoose.model('WhatsappContact', whatsappContactSchema);
