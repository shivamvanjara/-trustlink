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
    
    // Store OTP in MongoDB with 30-minute expiration window
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    // Await email dispatch via Nodemailer
    try {
      await sendOTP(normalizedEmail, otp);
      console.log(`✉️ OTP ${otp} delivered via email to ${normalizedEmail}`);
    } catch (emailErr) {
      console.error(`⚠️ Email dispatch notice for ${normalizedEmail}:`, emailErr.message);
    }

    res.status(200).json({ 
      message: "Credentials Verified! Check your email for OTP.", 
      userId: user._id
    });
  } catch (err) {
    console.error("Login Step 1 Error:", err);
    res.status(500).json({ message: "Error sending OTP email: " + err.message });
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

    console.log(`🔍 Verifying OTP for ${normalizedEmail}. Input: "${cleanOtp}", DB Stored: "${user.otp}"`);

    const isOtpValid = user.otp && (user.otp.toString().trim() === cleanOtp);
    const isNotExpired = !user.otpExpiresAt || (new Date(user.otpExpiresAt).getTime() > Date.now());

    if (isOtpValid && isNotExpired) {
      user.otp = null;
      user.otpExpiresAt = null;
      await user.save();
      console.log(`✅ OTP Verified successfully for ${normalizedEmail}`);
      return res.status(200).json({ message: "Login Successful", user });
    } else {
      console.log(`❌ OTP Failed for ${normalizedEmail}. Valid: ${isOtpValid}, NotExpired: ${isNotExpired}`);
      return res.status(400).json({ message: "Invalid OTP code. Please check your email code and try again." });
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
