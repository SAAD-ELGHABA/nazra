const mongoose = require('mongoose');
const slugify = require('slugify');

const productImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2048
  },
  public_id: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  }
}, { _id: true });

const lensOptionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  type: { type: String, required: true, trim: true, maxlength: 50 },
  category: { type: Number, min: 0, max: 4, default: null },
  sku: { type: String, trim: true, maxlength: 100, default: null },
  price: { type: Number, min: 0, default: null },
  compareAtPrice: { type: Number, min: 0, default: null },
  stock: { type: Number, min: 0, validate: Number.isInteger, default: null },
  active: { type: Boolean, default: true },
  images: { type: [productImageSchema], default: [] }
});

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
  sku: { type: String, trim: true, maxlength: 100, default: null },
  price: { type: Number, min: 0, default: null },
  compareAtPrice: { type: Number, min: 0, default: null },
  stock: { type: Number, min: 0, validate: Number.isInteger, default: null },
  active: { type: Boolean, default: true },
  images: { type: [productImageSchema], default: [] },
  lensOptions: { type: [lensOptionSchema], default: [] }
});

const localizedTextSchema = {
  en: { type: String, trim: true, maxlength: 1000, default: '' },
  fr: { type: String, trim: true, maxlength: 1000, default: '' },
  ar: { type: String, trim: true, maxlength: 1000, default: '' }
};

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
  // Optional catalog attributes. Existing records continue to use category/type
  // as read-time fallbacks in the public listing service.
  gender: {
    type: String,
    trim: true,
    maxlength: [50, 'Gender cannot exceed 50 characters']
  },
  collection: {
    type: String,
    trim: true,
    maxlength: [100, 'Collection cannot exceed 100 characters']
  },
  frameShape: {
    type: String,
    trim: true,
    maxlength: [100, 'Frame shape cannot exceed 100 characters']
  },
  compareAtPrice: {
    type: Number,
    min: [0, 'Compare-at price cannot be negative'],
    default: null
  },
  uv400: {
    type: Boolean,
    default: false
  },
  polarized: {
    type: Boolean,
    default: false
  },
  badges: [{
    type: String,
    trim: true,
    maxlength: [50, 'Badge cannot exceed 50 characters']
  }],
  ratingAverage: {
    type: Number,
    min: [0, 'Rating average cannot be negative'],
    max: [5, 'Rating average cannot exceed 5'],
    default: 0
  },
  reviewCount: {
    type: Number,
    min: [0, 'Review count cannot be negative'],
    default: 0
  },
  stockStatus: {
    type: String,
    enum: ['in_stock', 'low_stock', 'out_of_stock']
  },
  inStock: {
    type: Boolean
  },
  sortPriority: {
    type: Number,
    default: 0
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
  shortDescription: localizedTextSchema,
  specifications: {
    frameMaterial: { type: String, trim: true, maxlength: 100, default: null },
    lensMaterial: { type: String, trim: true, maxlength: 100, default: null },
    lensCategory: { type: Number, min: 0, max: 4, default: null },
    frameWidth: { type: Number, min: 0, max: 500, default: null },
    lensWidth: { type: Number, min: 0, max: 200, default: null },
    bridgeWidth: { type: Number, min: 0, max: 100, default: null },
    templeLength: { type: Number, min: 0, max: 300, default: null },
    weight: { type: Number, min: 0, max: 1000, default: null },
    frameColor: { type: String, trim: true, maxlength: 100, default: null },
    lensColor: { type: String, trim: true, maxlength: 100, default: null }
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
  timestamps: true,
  // `collection` is an intentional product taxonomy field required by the API.
  suppressReservedKeysWarning: true
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

// Keep the two public stock representations deterministic. stockStatus is the
// more expressive source of truth when both values are supplied.
productSchema.pre('validate', function(next) {
  if (this.stockStatus) {
    this.inStock = this.stockStatus !== 'out_of_stock';
  } else if (typeof this.inStock === 'boolean') {
    this.stockStatus = this.inStock ? 'in_stock' : 'out_of_stock';
  }
  next();
});

// Index for better query performance
productSchema.index({ name: 'text', 'description.en': 'text', 'description.fr': 'text', 'description.ar': 'text' });
productSchema.index({ type: 1, category: 1 });
productSchema.index({ createdBy: 1 });
productSchema.index({ isActive: 1, gender: 1 });
productSchema.index({ isActive: 1, collection: 1 });
productSchema.index({ isActive: 1, frameShape: 1 });
productSchema.index({ isActive: 1, 'colors.name': 1 });
productSchema.index({ isActive: 1, 'colors.lensOptions.sku': 1 });
productSchema.index({ isActive: 1, category: 1, type: 1 });
productSchema.index({ isActive: 1, polarized: 1 });
productSchema.index({ isActive: 1, uv400: 1 });
productSchema.index({ isActive: 1, stockStatus: 1 });
productSchema.index({ isActive: 1, inStock: 1 });
productSchema.index({ isActive: 1, sale_price: 1, _id: 1 });
productSchema.index({ isActive: 1, createdAt: -1, _id: 1 });
productSchema.index({ isActive: 1, ratingAverage: -1, reviewCount: -1, _id: 1 });

module.exports = mongoose.model('Product', productSchema);
