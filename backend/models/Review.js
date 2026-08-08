const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  // Optional: `User` holds admin accounts, and reviewers are guests. Proof of
  // purchase comes from `order` instead, which is what a signed review
  // invitation names. Kept for reviews written by a signed-in team member.
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  displayName: { type: String, required: true, trim: true, maxlength: 80 },
  rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
  title: { type: String, trim: true, maxlength: 120, default: '' },
  comment: { type: String, required: true, trim: true, minlength: 2, maxlength: 2000 },
  verifiedPurchase: { type: Boolean, default: true, immutable: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

reviewSchema.index({ product: 1, status: 1, createdAt: -1, _id: -1 });
// One review per product per order. This is what makes a review invitation
// effectively single-use: replaying the link cannot create a second review.
// Previously keyed on `user`, which guests never have.
reviewSchema.index({ order: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
