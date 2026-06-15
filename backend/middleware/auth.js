import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default async function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const { id } = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    req.user = await User.findById(id).select('-password');
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
