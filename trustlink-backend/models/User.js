const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['seeker', 'provider', 'admin'] },
  
  // Profile expansions
  profile: {
    fullName: { type: String },
    phone: { type: String },
    city: { type: String, default: '' },
    
    // For Seekers
    skills: [{ type: String }],
    experienceYears: { type: Number, default: 0 },
    
    // For Providers & Admin Organizations
    companyName: { type: String },
    companyAddress: { type: String },
    orgRole: { type: String, default: 'Protocol Administrator' }
  },
  trustScore: { type: Number, default: 50 },
  otp: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
