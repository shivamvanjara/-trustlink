const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');

// Submit a Review
router.post('/', async (req, res) => {
  try {
    const { applicationId, reviewerId, targetId, metrics, comments } = req.body;
    
    // Guard against duplicate reviews natively
    const existing = await Review.findOne({ applicationId, reviewerId });
    if (existing) return res.status(400).json({ message: "Review already submitted." });

    const newReview = new Review({
      applicationId,
      reviewerId,
      targetId,
      ...metrics,
      comments
    });
    
    await newReview.save();

    // Gamified Math: Average stars -> Bonus Points
    const targetUser = await User.findById(targetId);
    if (targetUser) {
      const averageStars = (metrics.punctuality + metrics.quality + metrics.communication + metrics.reliability + metrics.overall) / 5;
      const reward = Math.round(averageStars * 1.5); 
      
      let newScore = (targetUser.trustScore || 50) + reward;
      if (newScore > 100) newScore = 100;
      targetUser.trustScore = newScore;
      await targetUser.save();
    }

    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check if a specific review was already filed
router.get('/check/:applicationId/:reviewerId', async (req, res) => {
  try {
    const existing = await Review.findOne({ 
      applicationId: req.params.applicationId, 
      reviewerId: req.params.reviewerId 
    });
    res.json({ filed: !!existing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
