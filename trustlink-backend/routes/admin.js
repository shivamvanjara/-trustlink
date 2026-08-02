const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Bond = require('../models/Bond');
const Job = require('../models/Job');
const Application = require('../models/Application');

// 1. GET PLATFORM OVERVIEW & PROFIT/LOSS (P&L) FINANCIAL METRICS
router.get('/metrics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSeekers = await User.countDocuments({ role: 'seeker' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalJobs = await Job.countDocuments();
    const totalBonds = await Bond.countDocuments();
    const activeBonds = await Bond.countDocuments({ status: 'ACTIVE' });
    const breachedBondsCount = await Bond.countDocuments({ status: { $in: ['BREACHED', 'DISPUTED'] } });

    // Calculate Financial P&L Ledger
    const allBonds = await Bond.find();
    let grossEscrowVolume = 0;
    let totalProtocolFees = 0;
    let totalBreachRefunds = 0;
    let totalSeekerPayouts = 0;
    let totalProviderPayouts = 0;

    allBonds.forEach(b => {
      const bondVolume = (b.providerEscrowContribution || 0) + (b.seekerInitialToken || 0);
      grossEscrowVolume += bondVolume;

      // 5% Protocol Commission Fee on processed bonds
      if (b.status === 'COMPLETED' || b.status === 'ADMIN_RESOLVED' || b.status === 'MUTUALLY_CANCELLED') {
        const fee = b.protocolFeeCollected || Math.round(bondVolume * 0.05);
        totalProtocolFees += fee;
      }

      if (b.status === 'BREACHED' || b.status === 'DISPUTED') {
        totalBreachRefunds += (b.slashedPenaltyAmount || 0);
      }

      totalSeekerPayouts += (b.seekerPayout || 0);
      totalProviderPayouts += (b.providerPayout || 0);
    });

    const netProfit = totalProtocolFees + (totalBreachRefunds * 0.2); // Protocol retains 20% penalty fee on breaches

    res.json({
      metrics: {
        totalUsers,
        totalSeekers,
        totalProviders,
        totalJobs,
        totalBonds,
        activeBonds,
        breachedBondsCount
      },
      pnl: {
        grossEscrowVolume,
        totalProtocolFees,
        totalBreachRefunds,
        totalSeekerPayouts,
        totalProviderPayouts,
        operatingExpenses: Math.round(totalProtocolFees * 0.15), // Estimated server/gateway ops
        netProfit: Math.max(0, netProfit)
      }
    });
  } catch (err) {
    console.error("Admin Metrics Error:", err);
    res.status(500).json({ message: "Failed to compute admin metrics" });
  }
});

// 2. GET ALL BONDS WITH POPULATED DETAILS FOR DECORUM DESK
router.get('/bonds', async (req, res) => {
  try {
    const bonds = await Bond.find()
      .populate('seekerId', 'email profile trustScore')
      .populate('providerId', 'email profile trustScore')
      .populate('applicationId')
      .sort({ updatedAt: -1 });
    res.json(bonds);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bonds" });
  }
});

// 3. ADMIN DECORUM & BREACH RESOLUTION ACTION
router.post('/bonds/resolve-breach', async (req, res) => {
  const { bondId, action, resolutionNotes, penaltyAmount, trustScorePenalty } = req.body;
  
  try {
    const bond = await Bond.findById(bondId);
    if (!bond) return res.status(404).json({ message: "Bond record not found" });

    const totalEscrow = bond.providerEscrowContribution + bond.seekerInitialToken;
    let seekerPayout = 0;
    let providerPayout = 0;
    let penalty = Number(penaltyAmount) || Math.round(totalEscrow * 0.3);

    if (action === 'PENALIZE_SEEKER') {
      // Seeker breached contract -> Provider gets escrow back + penalty slashed from Seeker
      providerPayout = totalEscrow;
      seekerPayout = 0;
      bond.slashedPenaltyAmount = penalty;

      // Lower Seeker's trust score for breach
      if (bond.seekerId) {
        await User.findByIdAndUpdate(bond.seekerId, { 
          $inc: { trustScore: -(trustScorePenalty || 15) } 
        });
      }
    } else if (action === 'PENALIZE_PROVIDER') {
      // Provider breached contract / wrongful termination -> Seeker gets escrow + penalty compensation
      seekerPayout = totalEscrow + penalty;
      providerPayout = 0;
      bond.slashedPenaltyAmount = penalty;

      // Lower Provider's trust score
      if (bond.providerId) {
        await User.findByIdAndUpdate(bond.providerId, { 
          $inc: { trustScore: -(trustScorePenalty || 15) } 
        });
      }
    } else {
      // Mutual Settle -> 50/50 Split
      seekerPayout = Math.round(totalEscrow * 0.5);
      providerPayout = Math.round(totalEscrow * 0.5);
    }

    bond.seekerPayout = seekerPayout;
    bond.providerPayout = providerPayout;
    bond.protocolFeeCollected = Math.round(totalEscrow * 0.05);
    bond.status = 'ADMIN_RESOLVED';
    bond.adminResolution = resolutionNotes || `Resolved by Organization Protocol Admin (${action})`;
    await bond.save();

    console.log(`⚖️ Admin resolved bond ${bondId}: ${action}`);
    res.json({ message: "Decorum Breach Resolved Successfully!", bond });
  } catch (err) {
    console.error("Resolve Breach Error:", err);
    res.status(500).json({ message: "Failed to resolve breach" });
  }
});

// 4. GET ALL USERS FOR DIRECTORY
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// 5. UPDATE TRUST SCORE OR USER STATUS
router.patch('/users/:id/trust-score', async (req, res) => {
  const { trustScore } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { $set: { trustScore: Number(trustScore) } }, 
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to update trust score" });
  }
});

module.exports = router;
