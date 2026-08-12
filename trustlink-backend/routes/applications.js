const express = require('express');
const router = express.Router();
const Application = require('../models/Application');

// Create Application
router.post('/', async (req, res) => {
  try {
    const { jobId, seekerId, providerId } = req.body;
    // Check if re-applying
    const exists = await Application.findOne({ jobId, seekerId });
    if (exists) return res.status(400).json({ message: "Already applied" });

    const app = new Application({ jobId, seekerId, providerId, status: 'APPLIED' });
    await app.save();
    
    // Notify Provider instantly
    req.io.to(providerId.toString()).emit('NEW_APPLICATION', app);

    res.status(201).json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update status (Interview -> Trial/Hire)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, trialDays } = req.body;
    let updateFields = { status };
    
    if (status === 'TRIAL_STARTED' && trialDays) {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + parseInt(trialDays));
      updateFields.trialEndDate = trialEndDate;
    }

    const updated = await Application.findByIdAndUpdate(
      req.params.id, 
      { $set: updateFields },
      { new: true }
    );

    // Notify Seeker instantly
    req.io.to(updated.seekerId.toString()).emit('APPLICATION_UPDATED', updated);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get applications for a provider's jobs
router.get('/provider/:providerId', async (req, res) => {
  try {
    const apps = await Application.find({ providerId: req.params.providerId })
      .populate('seekerId', 'profile email')
      .populate('jobId', 'title category city salary bondDurationMonths workersNeeded location');
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get applications for a seeker
router.get('/seeker/:seekerId', async (req, res) => {
  try {
    const apps = await Application.find({ seekerId: req.params.seekerId })
      .populate('providerId', 'profile.companyName email')
      .populate('jobId', 'title category city salary bondDurationMonths workersNeeded location');
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
