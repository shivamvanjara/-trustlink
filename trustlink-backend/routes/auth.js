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
    
    // Store OTP in MongoDB with 15-minute expiration
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Trigger email dispatch in background
    sendOTP(normalizedEmail, otp).then(() => {
      console.log(`✉️ OTP ${otp} delivered to ${normalizedEmail}`);
    }).catch((emailErr) => {
      console.error(`⚠️ Email dispatch notice for ${normalizedEmail}:`, emailErr.message);
    });

    console.log(`🔑 Verification Code generated for ${normalizedEmail}: ${otp}`);
    res.status(200).json({ 
      message: "Credentials Verified!", 
      userId: user._id, 
      otp: otp 
    });
  } catch (err) {
    console.error("Login Step 1 Error:", err);
    res.status(500).json({ message: "Error during Login: " + err.message });
  }
});

router.post('/login-step2', async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email ? email.trim().toLowerCase() : '';
  const cleanOtp = otp ? otp.toString().trim() : '';

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isOtpValid = user.otp && user.otp === cleanOtp;
    const isNotExpired = user.otpExpiresAt && new Date(user.otpExpiresAt) > new Date();

    if (isOtpValid && isNotExpired) {
      user.otp = null;
      user.otpExpiresAt = null;
      await user.save();
      res.status(200).json({ message: "Login Successful", user });
    } else {
      res.status(400).json({ message: "Invalid or Expired OTP. Please login again." });
    }
  } catch (err) {
    console.error("Login Step 2 Error:", err);
    res.status(500).json({ message: "Error verifying OTP" });
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
