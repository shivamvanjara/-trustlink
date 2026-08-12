const nodemailer = require('nodemailer');
require('dotenv').config();

// 1. Create optimized Transporter for Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use TLS
  pool: true,   // Keep sockets open for faster subsequent email dispatches
  maxConnections: 5,
  family: 4,    // Force IPv4 to prevent Windows IPv6 DNS lookup stalls
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // 16-character Google App Password
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000
});

// Optional diagnostic connection check on startup
transporter.verify((error) => {
  if (error) {
    console.warn("⚠️ Nodemailer Transporter Warning:", error.message);
  } else {
    console.log("✉️ Nodemailer Transporter Ready (smtp.gmail.com:465)");
  }
});

/**
 * Function to send OTP via Email
 * @param {string} email - Recipient's Gmail address
 * @param {string} otp - The 6-digit code to send
 */
const sendOTP = async (email, otp) => {
  if (!email || !otp) {
    throw new Error("Email and OTP are required to send a message.");
  }

  const mailOptions = {
    from: `"TrustLink Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Your TrustLink Verification Code: ' + otp,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0f172a; color: #f8fafc; border: 1px solid rgba(255,255,255,0.1); padding: 30px; border-radius: 16px; text-align: center;">
        <div style="display: inline-block; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.4); padding: 12px; border-radius: 12px; margin-bottom: 15px;">
          <h2 style="color: #818cf8; margin: 0; font-size: 24px;">TrustLink Protocol</h2>
        </div>
        <h3 style="color: #ffffff; margin-top: 10px; font-size: 20px;">Two-Factor Authentication Code</h3>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">Use the secure verification code below to authorize access to your TrustLink account:</p>
        
        <div style="background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2)); border: 1px dashed #6366f1; padding: 20px; border-radius: 12px; margin: 25px 0;">
          <span style="color: #38bdf8; letter-spacing: 10px; font-weight: 800; font-size: 36px; font-family: monospace;">${otp}</span>
        </div>

        <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
          This code is valid for <strong>1 hour</strong>. If you did not request this login attempt, please secure your account immediately.
        </p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendOTP;