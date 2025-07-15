import mongoose from 'mongoose';

const potentialClientSchema = new mongoose.Schema({
  contactId: {
    type: Number,
    required: true,
    unique: true, // Ensures only one copy of each contact
  },
  firstName: String,
  lastName: String,
  phone: String,
  email: String,
  subject: String,
  message: String,
  reason: String
}, {
  timestamps: true
});

const PotentialClient = mongoose.model('PotentialClient', potentialClientSchema);
export default PotentialClient;
