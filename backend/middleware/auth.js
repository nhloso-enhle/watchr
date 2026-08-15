import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default async function protect(req, res, next) {
  // Read from Bearer header only — no cookies
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = header.split(' ')[1];
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id).select('-password -resetCode -resetCodeExpiry');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired session' });
  }
}
