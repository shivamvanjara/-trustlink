const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  seekerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['APPLIED', 'INTERVIEW_INVITED', 'TRIAL_STARTED', 'BOND_PENDING', 'HIRED', 'REJECTED', 'CANCELLED'],
    default: 'APPLIED'
  },
  trialEndDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
