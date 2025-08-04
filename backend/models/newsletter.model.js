import mongoose from 'mongoose';
const newsletterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 100
  },
  newsletterFilePath: {
    type: String,
    required: [true, 'Newsletter file path is required']
  },
  thumbnailPath: {
    type: String,
    required: false
  },
  tags: {
    type: [String],
    required: [true, 'Tags are required']
  },
  sendTo: {
    type: [String],
    required: [true, 'Send To is required']
  },
  audience: {
    type: [String],
    required: [true, 'Audience is required']
  },
  content: { type: [String], required: true },
  category: {
    type: String,
    enum: ['Financial Planning', 'Insurance', 'Estate Planning', 'Tax Relief'], // Example allowed categories
    required: [true, 'Category is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },

    status: {
  type: String,
  enum: ["draft", "published"],
  default: "published"
    },

    homepageSlot: {
    type: Number,
    enum: [0, 1, 2], // Only allow 3 slots
    default: null
    },

    sentAt: Date,
sentToCount: Number,
failedToCount: Number,
publishedAt: Date,
publishedBy: mongoose.Schema.Types.ObjectId
    
});

export default mongoose.models.Newsletter || mongoose.model('Newsletter', newsletterSchema);
