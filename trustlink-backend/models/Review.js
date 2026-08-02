const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  punctuality: { type: Number, required: true, min: 1, max: 5 },
  quality: { type: Number, required: true, min: 1, max: 5 },
  communication: { type: Number, required: true, min: 1, max: 5 },
  reliability: { type: Number, required: true, min: 1, max: 5 },
  overall: { type: Number, required: true, min: 1, max: 5 },
  
  comments: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
