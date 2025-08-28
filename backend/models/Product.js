const mongoose = require('mongoose');
const slugify = require('slugify');

const colorVariantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    }
  }]
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true, // Prevent duplicates
    lowercase: true,
    trim: true
  },
  original_price: {
    type: Number,
    required: [true, 'Original price is required'],
    min: [0, 'Price cannot be negative']
  },
  sale_price: {
    type: Number,
    required: [true, 'Sale price is required'],
    min: [0, 'Price cannot be negative']
  },
  type: {
    type: String,
    required: [true, 'Product type is required'],
    enum: ['Aviator', 'Wayfarer', 'Round', 'Cat-Eye', 'Sport', 'Oversized']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Men', 'Women', 'Optical']
  },
  references: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  colors: [colorVariantSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Auto-generate slug before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true, // remove special chars
      replacement: '-' // replace spaces with dash
    });
  }
  next();
});

// Index for better query performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ type: 1, category: 1 });
productSchema.index({ createdBy: 1 });
productSchema.index({ slug: 1 });

module.exports = mongoose.model('Product', productSchema);
