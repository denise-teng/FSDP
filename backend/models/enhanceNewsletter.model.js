// models/NewsletterModel.js
import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },  // Original content
  enhancedContent: { type: String, required: false },  // Enhanced content
  createdAt: { type: Date, default: Date.now },
});

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

export default Newsletter;
