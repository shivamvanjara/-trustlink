const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  city: { type: String, required: true, default: 'Unspecified' },
  salary: { type: Number, required: true }, // Monthly Salary
  bondDurationMonths: { type: Number, required: true, default: 6 },
  requiredSkills: [{ type: String }],
  workersNeeded: { type: Number, required: true, default: 1 },
  workersHired: { type: Number, default: 0 },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' }
}, { timestamps: true });

// Geolocation indexing if we want geospatial queries later
// jobSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Job', jobSchema);
