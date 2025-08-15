import mongoose from 'mongoose';

const keywordsSchema = new mongoose.Schema({
  keyword: {
    type: String,
    required: [true, 'Keyword is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  keywordId: {
    type: Number,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

const Keywords = mongoose.models.Keywords || mongoose.model('Keywords', keywordsSchema);
export default Keywords;
