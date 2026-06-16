import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username:      { type: String, required: true, unique: true, trim: true, minlength: 3 },
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:      { type: String, required: true, minlength: 6 },
  name:          { type: String, trim: true, default: '' },
  avatarVariant: {
    type: String,
    enum: ['beam', 'marble', 'pixel', 'sunset', 'ring', 'bauhaus'],
    default: 'beam',
  },
  resetCode:       { type: String, select: false },
  resetCodeExpiry: { type: Date,   select: false },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('User', userSchema);
