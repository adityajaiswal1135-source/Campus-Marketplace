import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

const userSchema = new mongoose.Schema(
  {
    studentID: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
      match: [/^\d{10}$/, 'Student ID must be exactly 10 digits'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (val) {
          return val.endsWith(env.COLLEGE_EMAIL_DOMAIN);
        },
        message: `Only college email addresses are allowed`,
      },
    },

    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },

    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: 'Role must be either user or admin',
      },
      default: 'user',
    },

    isBanned: {
      type: Boolean,
      default: false,
    },

    banReason: {
      type: String,
      default: null,
    },

    bannedAt: {
      type: Date,
      default: null,
    },

    bannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    bannedUntil: {
      type: Date,
      default: null,
    },

    tokenVersion: {
      type: Number,
      default: 0,
      select: false,
    },

    displayName: {
      type: String,
      trim: true,
      maxlength: [50, 'Display name cannot exceed 50 characters'],
    },

    avatar: {
      type: String,
      default: null,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────
userSchema.index({ isBanned: 1 });

// ── Hash password before saving ───────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ── Instance method: compare password ─────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// ── Instance method: check if ban has expired ─────────────────
userSchema.methods.isBanExpired = function () {
  if (!this.bannedUntil) return false;
  return new Date() > this.bannedUntil;
};

// ── Strip sensitive fields from JSON output ───────────────────
userSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.passwordHash;
    delete ret.tokenVersion;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('User', userSchema);