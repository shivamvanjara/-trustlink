const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Bond = require('../models/Bond');

// Mark Attendance
router.post('/mark', async (req, res) => {
  try {
    const { bondId, seekerId, providerId, status } = req.body;
    
    // Default to today
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);

    const record = new Attendance({
      bondId, seekerId, providerId, status, date: startOfToday
    });

    await record.save();

    // If marked PRESENT, deduct token logic could go here conceptually
    // Push Live Notification to Seeker
    req.io.to(seekerId.toString()).emit('ATTENDANCE_MARKED', record);

    res.status(201).json(record);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Attendance for today already logged." });
    }
    res.status(500).json({ message: err.message });
  }
});

// Get Attendance for Bond
router.get('/:bondId', async (req, res) => {
  try {
    const records = await Attendance.find({ bondId: req.params.bondId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
