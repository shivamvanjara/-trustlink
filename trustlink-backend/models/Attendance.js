const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  bondId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bond', required: true },
  seekerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['PRESENT', 'ABSENT', 'HALF_DAY'], required: true },
  loggedAt: { type: Date, default: Date.now }
});

// Ensure a provider can only log attendance once per day per bond
attendanceSchema.index({ bondId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
