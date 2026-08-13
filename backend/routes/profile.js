import express from 'express';
import User from '../models/User.js';
import protect from '../middleware/auth.js';

const router = express.Router();

/* ── GET / ── */
router.get('/', protect, (req, res) => res.json(req.user));

/* ── PATCH /update ── */
router.patch('/update', protect, async (req, res) => {
  try {
    const { name, username, email, avatarStyle } = req.body;

    if (username && username !== req.user.username) {
      const taken = await User.findOne({ username });
      if (taken) return res.status(400).json({ message: 'Username already taken.' });
    }
    if (email && email.toLowerCase() !== req.user.email) {
      const taken = await User.findOne({ email: email.toLowerCase() });
      if (taken) return res.status(400).json({ message: 'Email already in use.' });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(name        !== undefined && { name }),
        ...(username    !== undefined && { username }),
        ...(email       !== undefined && { email: email.toLowerCase() }),
        ...(avatarStyle !== undefined && { avatarStyle }),
      },
      { new: true, runValidators: true }
    ).select('-password -resetCode -resetCodeExpiry');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── PATCH /change-password ── */
router.patch('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters.' });
    }
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
