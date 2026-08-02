const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// Create a Job
router.post('/', async (req, res) => {
  try {
    const newJob = new Job(req.body);
    await newJob.save();
    res.status(201).json(newJob);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get All Open Jobs (Seeker) - City filtered, skill is optional highlight only
router.get('/nearby', async (req, res) => {
  try {
    const { seekerId, city, skill } = req.query;
    let filter = { status: 'OPEN' };

    // City filter: exact start-anchored, case-insensitive match
    if (city && city.trim()) {
      filter.city = { $regex: `^${city.trim()}$`, $options: 'i' };
    } else if (seekerId) {
      const User = require('../models/User');
      const seeker = await User.findById(seekerId).select('profile.city');
      if (seeker?.profile?.city?.trim()) {
        filter.city = { $regex: `^${seeker.profile.city.trim()}$`, $options: 'i' };
      }
    }

    // Skill filter: ONLY when explicitly passed from the filter UI
    // We do NOT auto-filter by seeker profile skills to avoid hiding valid jobs
    // (old jobs in DB may have non-standard skill labels)
    if (skill && skill.trim()) {
      filter.requiredSkills = { $in: [skill.trim()] };
    }

    const jobs = await Job.find(filter).populate('providerId', 'profile.companyName email');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get My Jobs (Provider)
router.get('/me/:providerId', async (req, res) => {
  try {
    const jobs = await Job.find({ providerId: req.params.providerId });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
