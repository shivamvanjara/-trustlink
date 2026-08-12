const express = require('express');
const router = express.Router();
const User = require('../models/User');
const sendOTP = require('../mailer');

const otpStore = {};

router.post('/signup', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = new User({ email: normalizedEmail, password, role });
    await newUser.save();
    console.log(`👤 New ${role} Registered: ${normalizedEmail}`);
    res.status(201).json({ message: "Account Created! Please Login." });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server Error: Could not save user" });
  }
});

const handleDirectLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Account not found for this email" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    console.log(`✅ User ${normalizedEmail} successfully authenticated!`);
    return res.status(200).json({ message: "Login Successful", user });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Error during login: " + err.message });
  }
};

// Direct Instant Login Endpoints (No OTP)
router.post('/login', handleDirectLogin);
router.post('/login-step1', handleDirectLogin);
router.post('/login-step2', async (req, res) => {
  // Fallback for legacy step2 calls
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.status(200).json({ message: "Login Successful", user });
});

router.patch('/profile/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      { $set: { profile: req.body.profile } },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

module.exports = router;
