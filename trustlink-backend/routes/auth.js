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

  try {
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = new User({ email, password, role });
    await newUser.save();
    console.log(`👤 New ${role} Registered: ${email}`);
    res.status(201).json({ message: "Account Created! Please Login." });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server Error: Could not save user" });
  }
});

router.post('/login-step1', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(), 
      password: password, 
      role: role 
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid Email, Password, or Role" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;

    await sendOTP(email, otp);
    console.log(`🔑 OTP ${otp} sent to ${email}`);
    res.status(200).json({ message: "Credentials Correct! OTP Sent.", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: "Error during Login" });
  }
});

router.post('/login-step2', async (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] === otp) {
    delete otpStore[email];
    const user = await User.findOne({ email: email.toLowerCase() });
    res.status(200).json({ message: "Login Successful", user });
  } else {
    res.status(400).json({ message: "Invalid OTP" });
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
