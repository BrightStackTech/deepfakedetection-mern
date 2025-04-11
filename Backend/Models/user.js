const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  googleId: { type: String },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { 
    type: String,
    required: function() {
      return !this.googleId;
    }
  },
  profilePicture: { type: String }, // new field for profile picture
  isVerified: { type: Boolean, default: false },
  media: [{
    url: { type: String, required: true },
    prediction: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
    timestamp: { type: Date, default: Date.now }
  }]
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // If password already appears hashed (bcrypt hashes usually start with "$2")
  if (this.password.startsWith("$2")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', UserSchema);