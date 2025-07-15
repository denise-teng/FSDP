import mongoose from 'mongoose';

const quickMessageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('QuickMessage', quickMessageSchema);
