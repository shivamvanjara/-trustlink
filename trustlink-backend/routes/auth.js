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
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Account not found for this email" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Atomically save OTP to MongoDB
    await User.updateOne(
      { _id: user._id }, 
      { $set: { otp: otp, otpExpiresAt: expiresAt } }
    );

    console.log(`🔑 Generated 6-digit OTP [${otp}] for ${normalizedEmail}`);

    // Await email delivery directly to guarantee first OTP is delivered before returning 200 OK
    try {
      await sendOTP(normalizedEmail, otp);
      console.log(`✉️ SUCCESS: First OTP ${otp} dispatched and confirmed sent to ${normalizedEmail}`);
    } catch (emailErr) {
      console.error(`❌ Gmail SMTP Dispatch error for ${normalizedEmail}:`, emailErr.message);
      return res.status(500).json({ 
        message: "Failed to dispatch verification email: " + emailErr.message + ". Please try resending." 
      });
    }

    res.status(200).json({ 
      message: "Credentials Verified! 6-digit OTP code has been sent to your email address.", 
      userId: user._id
    });
  } catch (err) {
    console.error("Login Step 1 Error:", err);
    res.status(500).json({ message: "Error during login: " + err.message });
  }
});

router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User account not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await User.updateOne(
      { _id: user._id }, 
      { $set: { otp: otp, otpExpiresAt: expiresAt } }
    );

    console.log(`🔄 Generated fresh OTP [${otp}] for ${normalizedEmail}`);

    try {
      await sendOTP(normalizedEmail, otp);
      console.log(`✉️ SUCCESS: Resent OTP ${otp} dispatched to ${normalizedEmail}`);
    } catch (emailErr) {
      console.error(`❌ Resend OTP Email error for ${normalizedEmail}:`, emailErr.message);
      return res.status(500).json({ message: "Failed to resend email: " + emailErr.message });
    }

    return res.status(200).json({ message: "A new 6-digit OTP code has been sent to your email!" });
  } catch (err) {
    console.error("Resend OTP Error:", err);
    return res.status(500).json({ message: "Failed to resend OTP code" });
  }
});

router.post('/login-step2', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP code are required" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const cleanOtp = otp.toString().trim();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User account not found" });
    }

    // Strictly validate generated OTP in database (Master code 123456 removed for high security)
    const isDbOtpValid = user.otp && (user.otp.toString().trim() === cleanOtp);
    const isNotExpired = user.otpExpiresAt && (new Date(user.otpExpiresAt).getTime() > Date.now());

    if (isDbOtpValid && isNotExpired) {
      await User.updateOne(
        { _id: user._id }, 
        { $set: { otp: null, otpExpiresAt: null } }
      );

      console.log(`✅ User ${normalizedEmail} successfully authenticated!`);
      return res.status(200).json({ message: "Login Successful", user });
    } else {
      return res.status(400).json({ message: "Incorrect or expired verification code. Please check your email or click Resend." });
    }
  } catch (err) {
    console.error("Login Step 2 Error:", err);
    return res.status(500).json({ message: "Error verifying OTP" });
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
