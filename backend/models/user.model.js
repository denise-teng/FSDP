import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
name : {
    type: String,
    required: [true, 'name is required']
},
email:{
    type: String,
    required: [true, 'email is required'], 
    unique: true,
    lowercase: true,
    trim: true
},
password: {
    type: String,
    required: function () {
      // `this` refers to the document being created
      return !this.isGoogleAuth; 
    }
  },
 

  isGoogleAuth: {
    type: Boolean,
    default: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  
role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
}
}, {
    timestamps: true
}
);



//pre save hook to hash pass before saving database
userSchema.pre('save', async function(next) {
if(!this.isModified('password')) return next();

try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next()
} catch (error) {
next(error)
}

})

userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
}

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;