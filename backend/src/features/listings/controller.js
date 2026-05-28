import Listing from '../../models/Listing.js';

// ── Create listing ─────────────────────────────────────────────
export const createListing = async (req, res) => {
  try {
    const { title, description, price, category, condition, images } = req.body;

    if (!title || !description || !price || !category || !condition) {
      return res.status(400).json({
        success: false,
        message: 'title, description, price, category and condition are required',
      });
    }

    const listing = await Listing.create({
      title,
      description,
      price,
      category,
      condition,
      images: images || [],
      seller: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      listing,
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('createListing error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Get all listings (with filters) ───────────────────────────
export const getAllListings = async (req, res) => {
  try {
    const {
      category,
      condition,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 12,
      sort = 'newest',
    } = req.query;

    // Base filter — never show deleted or inactive listings
    const filter = { isActive: true, isDeleted: false, isSold: false };

    if (category)  filter.category  = category;
    if (condition) filter.condition = condition;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Sort options
    const sortOptions = {
      newest:     { createdAt: -1 },
      oldest:     { createdAt:  1 },
      price_asc:  { price:      1 },
      price_desc: { price:     -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate('seller', 'displayName avatar studentID')
        .sort(sortOptions[sort] || sortOptions.newest)
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
    console.error('getAllListings error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Get single listing ─────────────────────────────────────────
export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findOne({
      _id:       req.params.id,
      isDeleted: false,
    }).populate('seller', 'displayName avatar studentID email');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Increment views
    listing.views += 1;
    await listing.save();

    return res.status(200).json({ success: true, listing });

  } catch (error) {
    console.error('getListingById error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Update listing ─────────────────────────────────────────────
export const updateListing = async (req, res) => {
  try {
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

    // Only the seller can update their own listing
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own listings',
      });
    }

    const allowedFields = ['title', 'description', 'price', 'category', 'condition', 'images', 'isActive', 'isSold'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });

    await listing.save();

    return res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      listing,
    });

  } catch (error) {
    console.error('updateListing error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Delete listing (seller) ────────────────────────────────────
export const deleteListing = async (req, res) => {
  try {
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

    // Only the seller can delete their own listing
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own listings',
      });
    }

    // Soft delete
    listing.isDeleted  = true;
    listing.isActive   = false;
    listing.deletedAt  = new Date();
    await listing.save();

    return res.status(200).json({
      success: true,
      message: 'Listing deleted successfully',
    });

  } catch (error) {
    console.error('deleteListing error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Get my listings ────────────────────────────────────────────
export const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({
      seller:    req.user._id,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: listings.length,
      listings,
    });

  } catch (error) {
    console.error('getMyListings error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};