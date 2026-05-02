const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { pool } = require('../database');
const router = express.Router();

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Check if email service is configured
function isEmailConfigured() {
  return process.env.SMTP_USER && process.env.SMTP_PASS;
}

// Send OTP email
async function sendOTPEmail(email, otp, name, type = 'verification') {
  if (!isEmailConfigured()) {
    console.log(`[MOCK EMAIL] OTP for ${email}: ${otp}`);
    return true;
  }

  const subject = type === 'verification'
    ? 'UniSync - Email Verification Code'
    : 'UniSync - Login Verification Code';

  const html = type === 'verification'
    ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff;">
        <h2 style="color: #2563eb;">UniSync - Verify Your Email</h2>
        <p>Hi <strong>${name || 'there'}</strong>,</p>
        <p>Thank you for signing up for UniSync! Use the code below to verify your email address:</p>
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; margin: 0;">${otp}</p>
        </div>
        <p style="color: #6b7280; font-size: 12px;">This code expires in 10 minutes. If you didn't sign up for UniSync, please ignore this email.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="font-size: 12px; color: #6b7280;">UniSync - Find Your University Duo</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff;">
        <h2 style="color: #2563eb;">UniSync - Login Verification</h2>
        <p>Hi <strong>${name || 'there'}</strong>,</p>
        <p>Use the code below to complete your login:</p>
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; margin: 0;">${otp}</p>
        </div>
        <p style="color: #6b7280; font-size: 12px;">This code expires in 10 minutes. If you didn't request this login, please secure your account.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="font-size: 12px; color: #6b7280;">UniSync - Find Your University Duo</p>
      </div>
    `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'UniSync <noreply@unisync.com>',
      to: email,
      subject,
      html,
    });
    console.log(`[EMAIL OTP SENT] to ${email}: ${otp}`);
    return true;
  } catch (err) {
    console.error('[EMAIL OTP FAILED]', err.message);
    return false;
  }
}

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, rollNo, sapId, university, department, course, shift, section, semester, image, reason, qualities } = req.body;

  if (!name || !email || !password || !university || !department || !course || !reason || !image) {
    return res.status(400).json({ error: 'All required fields must be filled.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, rollNo, sapId, university, department, course, shift, section, semester, image, reason, qualities, approvalStatus)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'pending') RETURNING id`,
      [name, email, hashedPassword, rollNo || null, sapId || null, university, department, course, shift || null, section || null, semester || null, image, reason, qualities || null]
    );
    res.status(201).json({ message: 'User registered. Please verify your email.', userId: result.rows[0].id });
  } catch (err) {
    if (err.code === '23505') {
      const detail = (err.detail || '').toLowerCase();
      if (detail.includes('rollno')) {
        return res.status(400).json({ error: 'Roll number already exists.' });
      }
      if (detail.includes('sapid')) {
        return res.status(400).json({ error: 'SAP ID already exists.' });
      }
      return res.status(400).json({ error: 'Email already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Send OTP for email verification
router.post('/send-otp', async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  try {
    await pool.query(`DELETE FROM otp_codes WHERE email = $1`, [email]);
    await pool.query(`INSERT INTO otp_codes (email, code, expiresAt) VALUES ($1, $2, $3)`, [email, otp, expiresAt]);
    await sendOTPEmail(email, otp, name, 'verification');
    console.log(`[OTP GENERATED] ${email}: ${otp}`);
    res.json({ message: 'OTP sent to your email.', mockOtp: otp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP for email verification
router.post('/verify-otp', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email and OTP required.' });

  try {
    const { rows } = await pool.query(`SELECT * FROM otp_codes WHERE email = $1 ORDER BY createdAt DESC LIMIT 1`, [email]);
    const row = rows[0];
    if (!row) return res.status(400).json({ error: 'OTP not found. Please request a new one.' });
    if (new Date(row.expiresat) < new Date()) return res.status(400).json({ error: 'OTP expired.' });
    if (row.code !== code) return res.status(400).json({ error: 'Invalid OTP.' });

    await pool.query(`UPDATE users SET isVerified = 1 WHERE email = $1`, [email]);
    await pool.query(`DELETE FROM otp_codes WHERE email = $1`, [email]);
    res.json({ message: 'Email verified successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login Step 1: Send OTP
router.post('/login-request', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

  try {
    const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = rows[0];
    if (!user) return res.status(400).json({ error: 'Invalid credentials.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials.' });
    if (!user.isverified) return res.status(400).json({ error: 'Please verify your email first.' });
    if (user.approvalstatus === 'rejected') {
      return res.status(403).json({
        error: 'Your account has been rejected.',
        rejectionReason: user.rejectionreason,
        approvalStatus: 'rejected',
      });
    }
    if (user.approvalstatus === 'pending') {
      return res.status(403).json({
        error: 'Your account is pending admin approval. Please wait for approval.',
        approvalStatus: 'pending',
      });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await pool.query(`DELETE FROM otp_codes WHERE email = $1`, [email]);
    await pool.query(`INSERT INTO otp_codes (email, code, expiresAt) VALUES ($1, $2, $3)`, [email, otp, expiresAt]);
    await sendOTPEmail(email, otp, user.name, 'login');

    console.log(`[OTP GENERATED] ${email}: ${otp}`);

    res.json({ message: 'OTP sent to your email.', requiresOtp: true, mockOtp: otp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login Step 2: Verify OTP and return token
router.post('/verify-login-otp', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email and OTP required.' });

  try {
    const { rows: otpRows } = await pool.query(`SELECT * FROM otp_codes WHERE email = $1 ORDER BY createdAt DESC LIMIT 1`, [email]);
    const row = otpRows[0];
    if (!row) return res.status(400).json({ error: 'OTP not found. Please request a new one.' });
    if (new Date(row.expiresat) < new Date()) return res.status(400).json({ error: 'OTP expired.' });
    if (row.code !== code) return res.status(400).json({ error: 'Invalid OTP.' });

    const { rows: userRows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = userRows[0];
    if (!user) return res.status(400).json({ error: 'User not found.' });

    await pool.query(`DELETE FROM otp_codes WHERE email = $1`, [email]);

    const token = jwt.sign(
      { userId: user.id, isAdmin: user.isadmin === 1 },
      process.env.JWT_SECRET || 'unisync-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        rollNo: user.rollno,
        sapId: user.sapid,
        university: user.university,
        department: user.department,
        course: user.course,
        shift: user.shift,
        section: user.section,
        semester: user.semester,
        image: user.image,
        reason: user.reason,
        qualities: user.qualities,
        isAdmin: user.isadmin === 1,
        approvalStatus: user.approvalstatus,
        rejectionReason: user.rejectionreason,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Skip verification (for demo/development only)
router.post('/skip-verify', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  try {
    const result = await pool.query(`UPDATE users SET isVerified = 1 WHERE email = $1`, [email]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found.' });
    res.json({ message: 'Email verified (demo mode).' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'unisync-secret-key');
    const { rows } = await pool.query(
      `SELECT id, name, email, rollNo, sapId, university, department, course, shift, section, semester, image, reason, qualities, isAdmin, approvalStatus, rejectionReason FROM users WHERE id = $1`,
      [decoded.userId]
    );
    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: { ...user, isAdmin: user.isadmin === 1 } });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
