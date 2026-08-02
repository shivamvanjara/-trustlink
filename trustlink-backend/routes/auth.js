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

router.post('/login-step1', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await User.findOne({ 
      email: normalizedEmail, 
      password: password, 
      role: role 
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid Email, Password, or Role" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[normalizedEmail] = otp;

    try {
      await sendOTP(normalizedEmail, otp);
      console.log(`🔑 OTP ${otp} sent to email: ${normalizedEmail}`);
    } catch (emailErr) {
      console.error(`⚠️ Email sending failed for ${normalizedEmail}:`, emailErr.message);
      console.log(`🔑 [FALLBACK LOG] Use OTP: ${otp} for email ${normalizedEmail}`);
    }

    res.status(200).json({ message: "Credentials Correct! Check OTP.", userId: user._id });
  } catch (err) {
    console.error("Login Step 1 Error:", err);
    res.status(500).json({ message: "Error during Login: " + err.message });
  }
});

router.post('/login-step2', async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email ? email.trim().toLowerCase() : '';

  if (otpStore[normalizedEmail] && otpStore[normalizedEmail] === otp.trim()) {
    delete otpStore[normalizedEmail];
    const user = await User.findOne({ email: normalizedEmail });
    res.status(200).json({ message: "Login Successful", user });
  } else {
    res.status(400).json({ message: "Invalid or Expired OTP" });
  }
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
