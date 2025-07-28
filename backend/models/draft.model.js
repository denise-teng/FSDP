import mongoose from 'mongoose';

// Draft Schema
const draftSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 100
  },
  content: {
    type: [String], // Array of paragraphs
    required: true,
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 0,
      message: 'At least one content paragraph is required'
    }
  },
  tags: {
    type: [String], // Unlimited tags
    default: []
  },
  sendTo: {
    type: [String], // Channels to send to (e.g., Email, SMS)
    default: []
  },
  audience: {
    type: [String], // Target audience (e.g., Young Adults, Students)
    default: []
  },
  category: {
    type: String,
    required: true,
    enum: ['Financial Planning', 'Insurance', 'Estate Planning', 'Tax Relief'],
    default: 'Financial Planning',
  },
  newsletterFilePath: {
    type: String,
    required: function() { return this.status === 'published'; },
    validate: {
      validator: (v) => v && v.trim() !== '',
      message: 'Newsletter file path is required when published.'
    }
  },
  thumbnailPath: {
    type: String,
    required: function() { return this.status === 'published'; },
    validate: {
      validator: (v) => v && v.trim() !== '',
      message: 'Thumbnail path is required when published.'
    }
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft"
  },
  type: {
    type: String,
    enum: ['newsletter', 'generated'],
    default: 'newsletter'
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

draftSchema.index({ deletedAt: 1 });
draftSchema.index({ title: 'text' }); 
const Draft = mongoose.model('Draft', draftSchema);

export default Draft;
