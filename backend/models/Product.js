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
    unique: true,
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
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
  },
  references: {
    type: String,
    trim: true
  },
  description: {
    en: {
      type: String,
      trim: true,
      maxlength: [3000, 'English description cannot exceed 3000 characters'],
      default: ""
    },
    fr: {
      type: String,
      trim: true,
      maxlength: [3000, 'French description cannot exceed 3000 characters'],
      default: ""
    },
    ar: {
      type: String,
      trim: true,
      maxlength: [3000, 'Arabic description cannot exceed 3000 characters'],
      default: ""
    }
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
      strict: true,
      replacement: '-'
    });
  }
  next();
});

// Index for better query performance
productSchema.index({ name: 'text', 'description.en': 'text', 'description.fr': 'text', 'description.ar': 'text' });
productSchema.index({ type: 1, category: 1 });
productSchema.index({ createdBy: 1 });
productSchema.index({ slug: 1 });

module.exports = mongoose.model('Product', productSchema);
