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
    required: function() { return this.status === 'published'; },
    validate: {
      validator: function(v) {
        // Only validate if status is published
        return this.status !== 'published' || (v && v.trim() !== '');
      },
      message: 'Newsletter file path is required when published'
    }
  },
  thumbnailPath: {
    type: String
  },
  tags: {
    type: [String],
    required: [true, 'Tags are required']
  },
  // In your draft.model.js
  sendTo: {
    type: [String],
    default: ['Email'], // Set Email as default
    enum: ['Email'], // Remove other options if you want only Email
    required: true
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


newsletterSchema.pre('save', function(next) {
  console.log('[MONGOOSE] Saving newsletter:', {
    id: this._id,
    title: this.title,
    status: this.status,
    operation: this.isNew ? 'create' : 'update'
  });
  next();
});

// Add post-save hook for logging
newsletterSchema.post('save', function(doc) {
  console.log('[MONGOOSE] Newsletter saved:', {
    id: doc._id,
    title: doc.title,
    status: doc.status
  });
});

export default mongoose.models.Newsletter || mongoose.model('Newsletter', newsletterSchema);
