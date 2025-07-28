import mongoose from 'mongoose';

const consultationRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String },
  endTime: { type: String },
  location: { type: String },
  email: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'rejected'], default: 'pending' },
}, { timestamps: true });

const ConsultationRequest = mongoose.models.ConsultationRequest || mongoose.model('ConsultationRequest', consultationRequestSchema);
export default ConsultationRequest;
