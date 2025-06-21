import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  category: {
    type: String,
    enum: ['Financial Planning', 'Insurance', 'Estate Planning', 'Personal Finance', 'Legal'],
    required: true,
  },
  thumbnail: {
    type: String, // URL from Cloudinary
    required: false,
  },
  isDraft: {
    type: Boolean,
    default: true,
  },
  scheduledDate: {
    type: Date, // For broadcasting later
    required: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

const Newsletter = mongoose.model('Newsletter', newsletterSchema);
export default Newsletter;
