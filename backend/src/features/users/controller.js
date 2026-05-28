import User from '../../models/User.js';
import Listing from '../../models/Listing.js';

// ── Get user profile ───────────────────────────────────────────
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get their active listings
    const listings = await Listing.find({
      seller:    user._id,
      isActive:  true,
      isDeleted: false,
      isSold:    false,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      user,
      listings,
    });

  } catch (error) {
    console.error('getUserProfile error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Update own profile ─────────────────────────────────────────
export const updateMyProfile = async (req, res) => {
  try {
    const allowedFields = ['displayName', 'avatar'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });

  } catch (error) {
    console.error('updateMyProfile error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Change password ────────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'currentPassword and newPassword are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters',
      });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Pre-save hook will hash this automatically
    user.passwordHash  = newPassword;
    user.tokenVersion += 1; // invalidate all other sessions
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please log in again.',
    });

  } catch (error) {
    console.error('changePassword error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};