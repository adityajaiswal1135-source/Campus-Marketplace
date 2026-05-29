import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { env } from '../../config/env.js';

// ── Helpers ────────────────────────────────────────────────────

const generateToken = (user) => {
  return jwt.sign(
    {
      _id:          user._id,
      role:         user.role,
      tokenVersion: user.tokenVersion,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

const sendTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure:   true,
    sameSite: 'none',
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });
};

// ── Register ───────────────────────────────────────────────────

export const register = async (req, res) => {
  try {
    const { studentID, email, password, displayName } = req.body;

    // 1. Basic field check
    if (!studentID || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'studentID, email, and password are required',
      });
    }

    // 2. College domain check
    if (!email.endsWith(env.COLLEGE_EMAIL_DOMAIN)) {
      return res.status(400).json({
        success: false,
        message: `Only ${env.COLLEGE_EMAIL_DOMAIN} email addresses are allowed`,
      });
    }

    // 3. Check for duplicate email or studentID
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { studentID }],
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'studentID';
      return res.status(409).json({
        success: false,
        message: `An account with this ${field} already exists`,
      });
    }

    // 4. Password strength check
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    // 5. Create user — password is hashed by the pre-save hook in User.js
    const user = await User.create({
      studentID,
      email:        email.toLowerCase(),
      passwordHash: password,
      displayName:  displayName || email.split('@')[0],
    });

    // 6. Issue token and set cookie
    const token = generateToken({ _id: user._id, role: user.role, tokenVersion: 0 });
    sendTokenCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user,
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Login ──────────────────────────────────────────────────────

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Basic field check
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // 2. Find user — explicitly select passwordHash and tokenVersion
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+passwordHash +tokenVersion');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 3. Ban check — before doing any more work
    if (user.isBanned) {
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
          message: 'Your account has been suspended',
          reason:  user.banReason || 'Contact support for more information',
          ...(user.bannedUntil && { bannedUntil: user.bannedUntil }),
        });
      }
    }

    // 4. Password check
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 5. Issue token and set cookie
    const token = generateToken(user);
    sendTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user,
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Logout ─────────────────────────────────────────────────────

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure:   env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// ── Get current user ───────────────────────────────────────────

export const getMe = async (req, res) => {
  try {
    // Re-fetch to always return the freshest data
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // toJSON on the schema strips passwordHash,
    // tokenVersion, and __v automatically
    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};