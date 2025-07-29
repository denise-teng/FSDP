import mongoose from 'mongoose';

// Define the schema for contact history
const contactHistorySchema = new mongoose.Schema({
  // Contact information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\d\s\+-]+$/.test(v); // Validate phone number format
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // Validate email format
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  subject: {
    type: String,
    required: [true, 'Subject type is required'],
    enum: {
      values: [
        'General Inquiry',
        'Investment Strategy Discussion',
        'Retirement Planning Consultation',
        'Estate/Legacy Planning',
        'Insurance Policy Review',
        'Corporate Financial Seminar Inquiry',
        'Others'
      ],
      message: '{VALUE} is not a valid subject type'
    }
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  // Store both the sequential ID and MongoDB ID
  contactId: {
    type: Number,  // This matches your Contact model's sequential ID
    required: true
  },
  originalContactId: {
    type: mongoose.Schema.Types.ObjectId,  // MongoDB _id reference
    required: true,
    ref: 'Contact'
  },
  action: {
    type: String,
    enum: {
      values: ['deleted', 'recovered'], // Only 'deleted' and 'recovered' are allowed now
      message: '{VALUE} is not a valid action'
    },
    required: true,
    default: 'deleted'  // Default action is 'deleted'
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedAt: {
    type: Date,
    default: Date.now
  },
  restoredAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
contactHistorySchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Indexes
contactHistorySchema.index({ contactId: 1 });         // For sequential ID queries
contactHistorySchema.index({ originalContactId: 1 }); // For MongoDB ID queries
contactHistorySchema.index({ deletedAt: -1 });
contactHistorySchema.index({ action: 1 });

const ContactHistory = mongoose.model('ContactHistory', contactHistorySchema);

export default ContactHistory;
