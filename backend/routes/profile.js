import express from 'express';
import User from '../models/User.js';
import protect from '../middleware/auth.js';

const router = express.Router();

/* ── GET /profile — current user ──────────────────────────── */
router.get('/', protect, (req, res) => res.json(req.user));

/* ── PATCH /profile/update — name, username, email, avatar ── */
router.patch('/update', protect, async (req, res) => {
  try {
    const { name, username, email, avatarVariant } = req.body;

    // Check uniqueness only if values have changed
    if (username && username !== req.user.username) {
      const taken = await User.findOne({ username });
      if (taken) return res.status(400).json({ message: 'Username already taken.' });
    }
    if (email && email !== req.user.email) {
      const taken = await User.findOne({ email: email.toLowerCase() });
      if (taken) return res.status(400).json({ message: 'Email already in use.' });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(name          !== undefined && { name }),
        ...(username      !== undefined && { username }),
        ...(email         !== undefined && { email: email.toLowerCase() }),
        ...(avatarVariant !== undefined && { avatarVariant }),
      },
      { new: true, runValidators: true }
    ).select('-password -resetCode -resetCodeExpiry');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── PATCH /profile/change-password ─────────────────────── */
router.patch('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters.' });
    }

    // Re-fetch with password field
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    user.password = newPassword; // pre-save hook hashes it
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
