import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import protect from '../middleware/auth.js';

const router = express.Router();
const isProd = process.env.NODE_ENV === 'production';

const COOKIE_NAME = 'watchr_token';

// Cookie options — httpOnly means JS cannot read it (XSS safe)
function cookieOptions(stayLoggedIn = true) {
  return {
    httpOnly: true,
    secure:   isProd,          // HTTPS only in production
    sameSite: isProd ? 'none' : 'lax',  // 'none' required for cross-origin cookies
    maxAge:   stayLoggedIn
      ? 30 * 24 * 60 * 60 * 1000   // 30 days
      :  1 * 24 * 60 * 60 * 1000,  // 1 day (still persists, just shorter)
  };
}

function makeToken(id, stayLoggedIn) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: stayLoggedIn ? '30d' : '1d',
  });
}

function userPayload(user) {
  return {
    _id:         user._id,
    username:    user.username,
    email:       user.email,
    name:        user.name          || '',
    avatarStyle: user.avatarStyle   || 'bottts',
  };
}

/* ── Register ─────────────────────────────────────────────── */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(400).json({
        message: exists.email === email ? 'Email already in use' : 'Username already taken',
      });
    }
    const user  = await User.create({ username, email, password });
    const token = makeToken(user._id, true); // always persist on register
    res.cookie(COOKIE_NAME, token, cookieOptions(true));
    res.status(201).json(userPayload(user));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

/* ── Login ────────────────────────────────────────────────── */
router.post('/login', async (req, res) => {
  try {
    const { identifier, password, stayLoggedIn = true } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/username and password are required.' });
    }

    const user = await User.findOne({
      $or: [
        { email:    identifier.toLowerCase() },
        { username: identifier               },
      ],
    });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = makeToken(user._id, stayLoggedIn);
    res.cookie(COOKIE_NAME, token, cookieOptions(stayLoggedIn));
    res.json(userPayload(user));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

/* ── Logout ───────────────────────────────────────────────── */
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
  res.json({ message: 'Logged out' });
});

/* ── Me ───────────────────────────────────────────────────── */
router.get('/me', protect, (req, res) => res.json(userPayload(req.user)));

/* ── Forgot password ──────────────────────────────────────── */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const user = await User.findOne({ email }).select('+resetCode +resetCodeExpiry');
    const GENERIC = 'If an account with that email exists, a reset code has been sent.';
    if (!user) return res.json({ message: GENERIC });

    const code   = String(Math.floor(100000 + Math.random() * 900000));
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    user.resetCode       = code;
    user.resetCodeExpiry = expiry;
    await user.save();

    console.log(`[watchr dev] Reset code for ${email}: ${code}`);
    res.json({ message: GENERIC, ...(process.env.NODE_ENV !== 'production' && { devCode: code }) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

/* ── Reset password ───────────────────────────────────────── */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, code, and new password are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    const user = await User.findOne({ email }).select('+resetCode +resetCodeExpiry');
    if (!user || user.resetCode !== code || !user.resetCodeExpiry || user.resetCodeExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset code.' });
    }
    user.password        = newPassword;
    user.resetCode       = undefined;
    user.resetCodeExpiry = undefined;
    await user.save();
    res.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
