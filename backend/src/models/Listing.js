import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'books',
          'electronics',
          'clothing',
          'furniture',
          'sports',
          'stationery',
          'other',
        ],
        message: 'Invalid category',
      },
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: 'Maximum 5 images allowed',
      },
    },

    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: {
        values: ['new', 'like-new', 'good', 'fair', 'poor'],
        message: 'Invalid condition',
      },
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isSold: {
      type: Boolean,
      default: false,
    },

    // Admin can remove inappropriate listings
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deleteReason: {
      type: String,
      default: null,
    },

    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────
listingSchema.index({ seller: 1 });
listingSchema.index({ category: 1 });
listingSchema.index({ isActive: 1, isDeleted: 1 });
listingSchema.index({ title: 'text', description: 'text' }); // text search

export default mongoose.model('Listing', listingSchema);