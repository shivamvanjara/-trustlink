const mongoose = require('mongoose');

const bondSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  seekerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Salary and Bond duration explicitly stored
  monthlySalary: { type: Number, required: true },
  bondDurationMonths: { type: Number, required: true },

  // Financial Escrow Logic
  seekerInitialToken: { type: Number, required: true }, 
  providerEscrowContribution: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },

  // Track how much debt the seeker has paid off via monthly deductions
  deductedSoFar: { type: Number, default: 0 },
  seekerTokenPaid: { type: Boolean, default: false },
  
  // Rule Definitions
  trustGuaranteePenalty: { type: Number, required: true }, // Resign penalty (1.8x)
  mutualCancelSettlement: { type: Number, required: true }, // Mutual (0.8x)
  
  status: { 
    type: String, 
    enum: [
      'PENDING_SEEKER_PAYMENT', 
      'ACTIVE', 
      'COMPLETED', 
      'MUTUAL_CANCEL_REQ_PROVIDER',
      'MUTUAL_CANCEL_REQ_SEEKER',
      'MUTUALLY_CANCELLED', 
      'BREACHED'
    ],
    default: 'PENDING_SEEKER_PAYMENT'
  },
  
  // Razorpay tracking
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },

  // Final settlement amounts (set when bond is resolved)
  seekerPayout: { type: Number, default: 0 },   // What the worker receives
  providerPayout: { type: Number, default: 0 }  // What the company receives
}, { timestamps: true });

module.exports = mongoose.model('Bond', bondSchema);
