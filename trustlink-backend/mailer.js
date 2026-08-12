const nodemailer = require('nodemailer');
const dns = require('dns');
require('dotenv').config();

// Enforce IPv4 priority for DNS lookups to prevent IPv6 ENETUNREACH errors
try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {
  // Ignore
}

// Create robust Gmail service transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 25000
});

// Diagnostic check on startup
transporter.verify((error) => {
  if (error) {
    console.warn("⚠️ Gmail Transporter Warning:", error.message);
  } else {
    console.log("⚡ Gmail SMTP Transporter Ready");
  }
});

/**
 * Function to send OTP via Email
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit verification code
 */
const sendOTP = async (email, otp) => {
  if (!email || !otp) {
    throw new Error("Email and OTP are required for verification.");
  }

  const mailOptions = {
    from: `"TrustLink Protocol" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🔐 ${otp} is your TrustLink Security Code`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0f172a; color: #f8fafc; border: 1px solid rgba(255,255,255,0.12); padding: 32px; border-radius: 20px; text-align: center;">
        <div style="display: inline-block; background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2)); border: 1px solid rgba(99,102,241,0.4); padding: 14px 24px; border-radius: 14px; margin-bottom: 20px;">
          <h2 style="color: #818cf8; margin: 0; font-size: 22px; letter-spacing: -0.02em;">TrustLink Security</h2>
        </div>
        <h3 style="color: #ffffff; margin-top: 10px; font-size: 20px; font-weight: 700;">Login Verification Code</h3>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.5; margin-bottom: 25px;">Enter the 6-digit code below to authenticate your TrustLink session:</p>
        
        <div style="background: rgba(99,102,241,0.08); border: 2px dashed #6366f1; padding: 22px; border-radius: 16px; margin: 20px 0;">
          <span style="color: #38bdf8; letter-spacing: 12px; font-weight: 800; font-size: 38px; font-family: 'Courier New', monospace;">${otp}</span>
        </div>

        <p style="font-size: 12px; color: #64748b; margin-top: 25px; line-height: 1.4;">
          This verification code expires in <strong>1 hour</strong>. If you did not initiate this login request, please ignore this email.
        </p>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✉️ SUCCESS: OTP [${otp}] delivered to ${email} (MessageId: ${info.messageId})`);
  return info;
};

module.exports = sendOTP;



