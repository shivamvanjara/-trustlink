const nodemailer = require('nodemailer');
require('dotenv').config();

// 1. Create the Transporter
// This uses your Gmail credentials from the .env file
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // Reminder: Must be a 16-character App Password
  }
});

/**
 * Function to send OTP via Email
 * @param {string} email - Recipient's Gmail address
 * @param {string} otp - The 6-digit code to send
 */
const sendOTP = async (email, otp) => {
  // Basic validation
  if (!email || !otp) {
    throw new Error("Email and OTP are required to send a message.");
  }

  const mailOptions = {
    from: `"TrustLink" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your TrustLink Login Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; text-align: center;">
        <h2 style="color: #2563eb;">TrustLink Verification</h2>
        <p style="color: #555;">Hello! Use the secure code below to complete your login:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #10b981; letter-spacing: 8px; margin: 0; font-size: 32px;">${otp}</h1>
        </div>
        <p style="font-size: 12px; color: #999;">This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `
  };

  // This returns a "Promise" that server.js will 'await'
  return transporter.sendMail(mailOptions);
};

// IMPORTANT: We export the function directly.
// In server.js, import it using: const sendOTP = require('./mailer');
module.exports = sendOTP;