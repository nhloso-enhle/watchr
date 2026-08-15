import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import protect from '../middleware/auth.js';

const router = express.Router();

function makeToken(id, stay) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: stay ? '30d' : '1d' });
}

function payload(user, token) {
  return {
    _id:         user._id,
    username:    user.username,
    email:       user.email,
    name:        user.name        || '',
    avatarStyle: user.avatarStyle || 'bottts',
    ...(token && { token }),
  };
}

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ message: exists.email === email ? 'Email already in use' : 'Username already taken' });
    const user  = await User.create({ username, email, password });
    const token = makeToken(user._id, true);
    res.status(201).json(payload(user, token));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, password, stayLoggedIn = true } = req.body;
    if (!identifier || !password) return res.status(400).json({ message: 'Email/username and password are required.' });
    const user = await User.findOne({ $or: [{ email: identifier.toLowerCase() }, { username: identifier }] });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
    const token = makeToken(user._id, stayLoggedIn);
    res.json(payload(user, token));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Kept for client to call on logout — nothing to do server-side with JWT
router.post('/logout', (req, res) => res.json({ message: 'Logged out' }));

router.get('/me', protect, (req, res) => res.json(payload(req.user)));

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    const user = await User.findOne({ email }).select('+resetCode +resetCodeExpiry');
    const GENERIC = 'If an account with that email exists, a reset code has been sent.';
    if (!user) return res.json({ message: GENERIC });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    user.resetCode = code; user.resetCodeExpiry = new Date(Date.now() + 15*60*1000);
    await user.save();
    console.log(`[watchr dev] Reset code for ${email}: ${code}`);
    res.json({ message: GENERIC, ...(process.env.NODE_ENV !== 'production' && { devCode: code }) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ message: 'Email, code, and new password are required.' });
    if (newPassword.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    const user = await User.findOne({ email }).select('+resetCode +resetCodeExpiry');
    if (!user || user.resetCode !== code || !user.resetCodeExpiry || user.resetCodeExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset code.' });
    }
    user.password = newPassword; user.resetCode = undefined; user.resetCodeExpiry = undefined;
    await user.save();
    res.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
