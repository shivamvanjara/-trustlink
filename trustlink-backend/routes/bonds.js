const express = require('express');
const router = express.Router();
const Bond = require('../models/Bond');
const Application = require('../models/Application');
const Razorpay = require('razorpay');
const { addMonths } = require('date-fns');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Razorpay Connectivity Healthcheck
router.get('/health', (req, res) => {
  const isDummy = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('dummy');
  if (isDummy) return res.json({ connected: true, mode: 'dummy' });
  if (!process.env.RAZORPAY_KEY_SECRET) return res.status(500).json({ connected: false, message: 'Missing live keys' });
  return res.json({ connected: true, mode: 'live' });
});

// Expose public key to frontend securely
router.get('/config', (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// Razorpay Automated Escrow Payout Webhook Endpoint
router.post('/webhook', (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'trustlink_secret';
  console.log('⚡ Razorpay Webhook Event Received:', req.body.event);
  
  if (req.body.event === 'payment.captured' || req.body.event === 'payout.processed') {
    console.log('✅ Automated Escrow Settlement Confirmed by Razorpay Vault');
  }

  res.status(200).json({ status: 'ok', message: 'Webhook Processed' });
});

// Generate a Bond (Transitions App to HIRED)
router.post('/generate', async (req, res) => {
  try {
    const { applicationId, seekerId, providerId, monthlySalary, bondDurationMonths } = req.body;

    // Calculates financial metrics based on new monthly architecture
    const halfSalaryToken = monthlySalary * 0.5;

    // 1.8x Resign Penalty
    const penalty = halfSalaryToken * 1.8;
    // 0.8x Mutual Cancel Settlement
    const mutualCancel = halfSalaryToken * 0.8;

    // Escrow Token Logic: Seeker and Provider both pay their respective Half-Salary tokens
    const seekerInitialToken = halfSalaryToken;
    const providerEscrowContribution = halfSalaryToken; // Covered by provider

    const startDate = new Date();
    const endDate = addMonths(startDate, parseInt(bondDurationMonths));

    const newBond = new Bond({
      applicationId,
      seekerId,
      providerId,
      monthlySalary,
      bondDurationMonths,
      seekerInitialToken,
      providerEscrowContribution,
      deductedSoFar: 0,
      trustGuaranteePenalty: penalty,
      mutualCancelSettlement: mutualCancel,
      status: 'PENDING_SEEKER_PAYMENT',
      startDate,
      endDate
    });

    await newBond.save();

    // Transition Application to BOND_PENDING
    const updatedApp = await Application.findByIdAndUpdate(applicationId, { status: 'BOND_PENDING' }, { new: true });

    req.io.to(seekerId.toString()).emit('APPLICATION_UPDATED', updatedApp);

    res.status(201).json(newBond);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Resolve a Bond (Cancel / Resign / Complete / Mutual Handshake)
router.post('/resolve', async (req, res) => {
  try {
    const { applicationId, resolutionType } = req.body;

    const bond = await Bond.findOne({ applicationId });
    if (!bond) return res.status(404).json({ message: "Bond not found for this application" });

    // ─── Handshake states (no payout yet, just state transition) ───
    if (resolutionType === 'REQUEST_MUTUAL_PROVIDER') {
      bond.status = 'MUTUAL_CANCEL_REQ_PROVIDER';
      await bond.save();
      req.io.to(bond.seekerId.toString()).emit('BOND_UPDATED', bond);
      req.io.to(bond.providerId.toString()).emit('BOND_UPDATED', bond);
      return res.json({ message: "Mutual cancel requested by Provider. Waiting for Worker approval.", bond });
    }

    if (resolutionType === 'REQUEST_MUTUAL_SEEKER') {
      bond.status = 'MUTUAL_CANCEL_REQ_SEEKER';
      await bond.save();
      req.io.to(bond.seekerId.toString()).emit('BOND_UPDATED', bond);
      req.io.to(bond.providerId.toString()).emit('BOND_UPDATED', bond);
      return res.json({ message: "Mutual cancel requested by Worker. Waiting for Provider approval.", bond });
    }

    // ─── Terminal resolutions with payout ───
    let newBondStatus, seekerPayout, providerPayout, toastMsg;
    const totalPool = bond.seekerInitialToken + bond.providerEscrowContribution;

    if (resolutionType === 'COMPLETE') {
      // Bond completed successfully
      // Rule: 1.8x at worker
      newBondStatus = 'COMPLETED';
      seekerPayout = Math.round(bond.seekerInitialToken * 1.8);
      providerPayout = Math.round(totalPool - seekerPayout); // Remainder
      if (providerPayout < 0) providerPayout = 0;
      toastMsg = `🏆 Bond Complete! Worker: ₹${seekerPayout} | Company: ₹${providerPayout}`;

    } else if (resolutionType === 'RESIGN') {
      // Worker resigned / breached bond
      // Rule: 1.8x at company
      newBondStatus = 'BREACHED';
      providerPayout = Math.round(bond.providerEscrowContribution * 1.8);
      seekerPayout = Math.round(totalPool - providerPayout); // Remainder
      if (seekerPayout < 0) seekerPayout = 0;
      toastMsg = `💔 Bond Breached! Company: ₹${providerPayout} | Worker: ₹${seekerPayout}`;

    } else if (resolutionType === 'APPROVE_MUTUAL') {
      // Both agreed to cancel
      // Rule: 0.8x to both
      newBondStatus = 'MUTUALLY_CANCELLED';
      seekerPayout = Math.round(bond.seekerInitialToken * 0.8);
      providerPayout = Math.round(bond.providerEscrowContribution * 0.8);
      toastMsg = `🤝 Mutual Cancel! Both received 0.8x refund. Worker: ₹${seekerPayout} | Company: ₹${providerPayout}`;

    } else {
      return res.status(400).json({ message: `Unknown resolution type: ${resolutionType}` });
    }

    // Update bond and application in parallel
    bond.status = newBondStatus;
    bond.seekerPayout = seekerPayout;
    bond.providerPayout = providerPayout;
    const targetAppStatus = newBondStatus === 'COMPLETED' ? 'COMPLETED' : 'CANCELLED';
    const [updatedBond, updatedApp] = await Promise.all([
      bond.save(),
      Application.findByIdAndUpdate(applicationId, { status: targetAppStatus }, { new: true })
    ]);

    // Emit to both parties
    const payload = {
      applicationId,
      status: newBondStatus,
      seekerPayout,
      providerPayout,
      message: toastMsg
    };
    req.io.to(updatedBond.seekerId.toString()).emit('BOND_RESOLVED', payload);
    req.io.to(updatedBond.providerId.toString()).emit('BOND_RESOLVED', payload);

    res.json({ message: toastMsg, bond: updatedBond, seekerPayout, providerPayout });
  } catch (err) {
    console.error("Bond resolve error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Process Seeker Escrow Token Payment
router.post('/seeker-pay', async (req, res) => {
  try {
    const { bondId, razorpayPaymentId } = req.body;
    const bond = await Bond.findByIdAndUpdate(bondId, { 
      seekerTokenPaid: true,
      status: 'ACTIVE',
      razorpayPaymentId 
    }, { new: true });
    
    if (!bond) return res.status(404).json({ message: "Bond not found" });

    // Advance Application explicitly
    const updatedApp = await Application.findByIdAndUpdate(bond.applicationId, { status: 'HIRED' }, { new: true });

    // Find and Auto Cancel all other pending applications securely
    const otherApps = await Application.find({ 
      seekerId: bond.seekerId, 
      _id: { $ne: bond.applicationId }, 
      status: { $in: ['APPLIED', 'INTERVIEW_INVITED', 'TRIAL_STARTED', 'BOND_PENDING'] } 
    });

    await Application.updateMany(
      { _id: { $in: otherApps.map(a => a._id) } },
      { $set: { status: 'CANCELLED' } }
    );

    // Notify each affected provider of auto-cancellation
    otherApps.forEach(app => {
      req.io.to(app.providerId.toString()).emit('APPLICATION_UPDATED', { ...app.toObject(), status: 'CANCELLED' });
    });

    req.io.to(bond.providerId.toString()).emit('BOND_UPDATED', bond);
    req.io.to(bond.seekerId.toString()).emit('APPLICATION_UPDATED', updatedApp);
    
    res.json({ message: "Seeker Escrow Token Paid", bond });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Renew Bond (Extend Duration + Reward Trust Score)
router.post('/renew', async (req, res) => {
  try {
    const { bondId, extraMonths } = req.body;

    const bond = await Bond.findById(bondId);
    if (!bond) return res.status(404).json({ message: "Bond not found" });

    // Extend Duration precisely
    const months = parseInt(extraMonths || 1);
    bond.bondDurationMonths += months;
    bond.endDate = addMonths(new Date(bond.endDate), months);
    await bond.save();

    // Reward the Seeker using Gamified Math: Reward = Base * (1 + Multiplier)
    const User = require('../models/User');
    const seeker = await User.findById(bond.seekerId);
    if (seeker) {
      const baseReward = 10;
      const renewalMultiplier = 0.5;
      const reward = Math.floor(baseReward * (1 + renewalMultiplier)); // e.g., 15

      let newScore = (seeker.trustScore || 50) + reward;
      if (newScore > 100) newScore = 100; // Cap
      seeker.trustScore = newScore;
      await seeker.save();

      req.io.to(bond.seekerId.toString()).emit('BOND_RENEWED', { bond, newScore });
    }

    res.json({ message: "Bond Renewed Successfully & Trust Gamified!", bond });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Razorpay Order for Bond settlement
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = "INR", bondId } = req.body;

    // Return mock order safely if dummy keys are detected
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('dummy') || razorpayInstance.key_id.includes('dummy') || process.env.RAZORPAY_KEY_ID === 'rzp_test_mock_key') {
      return res.json({
        id: `order_mock_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency
      });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit
      currency,
      receipt: `receipt_bond_${bondId}`
    };

    const order = await razorpayInstance.orders.create(options);
    if (!order) return res.status(500).send("Some error occured generating Razorpay Order");

    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Fetch all Active or Historical Bonds for a specific User (Seeker or Provider)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const bonds = await Bond.find({
      $or: [{ seekerId: userId }, { providerId: userId }]
    }).populate('applicationId').populate('seekerId', 'profile email').populate('providerId', 'profile.companyName');

    res.json(bonds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
