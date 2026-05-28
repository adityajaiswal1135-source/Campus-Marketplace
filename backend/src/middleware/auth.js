import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';

export const verifyToken = async (req, res, next) => {
  try {
    // Read from cookie first, Authorization header as fallback
    const token =
      req.cookies?.token ||
      req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify signature and expiry
    const payload = jwt.verify(token, env.JWT_SECRET);

    // Fetch fresh user data on every request
    const user = await User.findById(payload._id)
      .select('+tokenVersion');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
    }

    // ── Token version check ──────────────────────────────────
    // If admin banned this user, tokenVersion was incremented,
    // making all previously issued JWTs instantly invalid
    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }

    // ── Ban check ────────────────────────────────────────────
    if (user.isBanned) {
      // Auto-lift if it was a timed ban that has now expired
      if (user.isBanExpired()) {
        user.isBanned     = false;
        user.banReason    = null;
        user.bannedAt     = null;
        user.bannedBy     = null;
        user.bannedUntil  = null;
        user.tokenVersion += 1;
        await user.save();
      } else {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended.',
          reason:  user.banReason || 'Contact support for more information.',
          ...(user.bannedUntil && { bannedUntil: user.bannedUntil }),
        });
      }
    }

    // Attach clean user object to request
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please log in again.',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }
    console.error('verifyToken error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};