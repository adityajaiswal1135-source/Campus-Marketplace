import User from '../../models/User.js';
import Listing from '../../models/Listing.js';

// ── Get all users ──────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, isBanned, search } = req.query;

    const filter = {};
    if (isBanned !== undefined) filter.isBanned = isBanned === 'true';
    if (search) {
      filter.$or = [
        { email:       { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } },
        { studentID:   { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      users,
    });

  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Ban user ───────────────────────────────────────────────────
export const banUser = async (req, res) => {
  try {
    const { reason, bannedUntil } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'A ban reason is required',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot ban an admin account',
      });
    }

    if (user.isBanned) {
      return res.status(400).json({
        success: false,
        message: 'User is already banned',
      });
    }

    user.isBanned      = true;
    user.banReason     = reason;
    user.bannedAt      = new Date();
    user.bannedBy      = req.user._id;
    user.bannedUntil   = bannedUntil ? new Date(bannedUntil) : null;
    user.tokenVersion += 1;

    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${user.email} has been banned`,
      user,
    });

  } catch (error) {
    console.error('banUser error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Unban user ─────────────────────────────────────────────────
export const unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isBanned) {
      return res.status(400).json({
        success: false,
        message: 'User is not banned',
      });
    }

    user.isBanned      = false;
    user.banReason     = null;
    user.bannedAt      = null;
    user.bannedBy      = null;
    user.bannedUntil   = null;
    user.tokenVersion += 1;

    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${user.email} has been unbanned`,
      user,
    });

  } catch (error) {
    console.error('unbanUser error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Admin delete listing ───────────────────────────────────────
export const adminDeleteListing = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'A deletion reason is required',
      });
    }

    const listing = await Listing.findOne({
      _id:       req.params.id,
      isDeleted: false,
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    listing.isDeleted    = true;
    listing.isActive     = false;
    listing.deletedBy    = req.user._id;
    listing.deletedAt    = new Date();
    listing.deleteReason = reason;

    await listing.save();

    return res.status(200).json({
      success: true,
      message: 'Listing removed successfully',
    });

  } catch (error) {
    console.error('adminDeleteListing error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Get all listings (admin view) ──────────────────────────────
export const adminGetAllListings = async (req, res) => {
  try {
    const { page = 1, limit = 20, isDeleted = false } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = { isDeleted: isDeleted === 'true' };

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate('seller', 'displayName email studentID')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Listing.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      listings,
    });

  } catch (error) {
    console.error('adminGetAllListings error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};