import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  subject: {
  type: String,
  required: [true, 'Subject type is required'],
  enum: [
    'General Inquiry',
    'Investment Strategy Discussion',
    'Retirement Planning Consultation',
    'Estate/Legacy Planning',
    'Insurance Policy Review',
    'Corporate Financial Seminar Inquiry',
    'Others'
  ]
},

  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  contactId: {
    type: Number,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);
export default Contact;
