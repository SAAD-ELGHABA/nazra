const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const ProductView = require("../models/ProductView");

const HOMEPAGE_DEFAULT_LIMIT = 4;
const HOMEPAGE_MAX_LIMIT = 12;
const PRODUCT_LIST_MAX_LIMIT = 100;
const SALES_STATUSES = ["processing", "shipped", "delivered"];
const PUBLIC_PRODUCT_EXCLUSIONS = { createdBy: 0, __v: 0 };

const parseHomepageLimit = (value) => {
  if (value === undefined) return HOMEPAGE_DEFAULT_LIMIT;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed <= HOMEPAGE_MAX_LIMIT
    ? parsed
    : null;
};

const parseOptionalListLimit = (value) => {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed <= PRODUCT_LIST_MAX_LIMIT
    ? parsed
    : null;
};

const parseOptionalQueryString = (value, maxLength) => {
  if (value === undefined) return { value: undefined };
  if (typeof value !== "string") return { error: true };

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return { error: true };

  return { value: trimmed };
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Create a new product
router.post('/create', auth, async (req, res) => {
  try {
    const {
      name,
      original_price,
      sale_price,
      type,
      category,
      references,
      description,
      colors
    } = req.body;

    // Validate required fields
    if (!name || !original_price || !sale_price || !type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate colors array
    if (!colors || !Array.isArray(colors) || colors.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one color variant'
      });
    }

    // Validate each color has images
    for (const color of colors) {
      if (!color.images || color.images.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Please provide at least one image for color: ${color.name}`
        });
      }
    }

    // Create new product
    const product = new Product({
      name,
      original_price: parseFloat(original_price),
      sale_price: parseFloat(sale_price),
      type,
      category,
      references,
      description,
      colors,
      createdBy: req.user.id
    });

    // Save product to database
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product',
      error: error.message
    });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const type = parseOptionalQueryString(req.query.type, 100);
    const category = parseOptionalQueryString(req.query.category, 100);
    const search = parseOptionalQueryString(req.query.search, 100);
    const limit = parseOptionalListLimit(req.query.limit);

    if (type.error || category.error || search.error || limit === null) {
      return res.status(400).json({
        success: false,
        message: `type, category and search must be non-empty strings of at most 100 characters; limit must be an integer between 1 and ${PRODUCT_LIST_MAX_LIMIT}`
      });
    }

    const filter = { isActive: true };
    if (type.value) {
      filter.type = new RegExp(`^${escapeRegExp(type.value)}$`, 'i');
    }
    if (category.value) {
      filter.category = new RegExp(`^${escapeRegExp(category.value)}$`, 'i');
    }
    if (search.value) {
      filter.$text = { $search: search.value };
    }

    const query = Product.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    if (limit !== undefined) query.limit(limit);

    const products = await query;

    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
      error: error.message
    });
  }
});

// Homepage selection: verified sales ranking when enough data exists, otherwise recent products.
router.get('/homepage-selection', async (req, res) => {
  const limit = parseHomepageLimit(req.query.limit);

  if (limit === null) {
    return res.status(400).json({
      success: false,
      message: `limit must be an integer between 1 and ${HOMEPAGE_MAX_LIMIT}`
    });
  }

  try {
    const rankedProducts = await Order.aggregate([
      { $match: { status: { $in: SALES_STATUSES } } },
      { $unwind: '$products' },
      {
        $match: {
          'products.product': { $type: 'objectId' },
          'products.quantity': { $gt: 0 }
        }
      },
      {
        $group: {
          _id: '$products.product',
          salesQuantity: { $sum: '$products.quantity' }
        }
      },
      { $sort: { salesQuantity: -1, _id: 1 } },
      {
        $lookup: {
          from: Product.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      { $match: { 'product.isActive': true } },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$product', { salesQuantity: '$salesQuantity' }]
          }
        }
      },
      { $project: PUBLIC_PRODUCT_EXCLUSIONS },
      { $limit: limit }
    ]);

    const hasCompleteSalesRanking = rankedProducts.length === limit;
    const products = hasCompleteSalesRanking
      ? rankedProducts
      : await Product.find({ isActive: true })
          .select('-createdBy -__v')
          .sort({ createdAt: -1, _id: 1 })
          .limit(limit)
          .lean();

    return res.status(200).json({
      success: true,
      products,
      meta: {
        source: hasCompleteSalesRanking ? 'sales' : 'recent',
        requestedLimit: limit,
        count: products.length,
        qualifyingOrderStatuses: SALES_STATUSES
      }
    });
  } catch (error) {
    console.error('Error fetching homepage product selection:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching homepage product selection'
    });
  }
});

// Get products shortcut (3 most recent active products)
router.get("/products-shortcut", async (req, res) => {
    try {
    const products = await Product.find({ isActive: true })
      .limit(4)
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error fetching products shortcut:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products shortcut',
      error: error.message
    });
  }
});


// Admin route to get all products
router.get("/admin/all", auth, async (req, res) => {
  try {
    const products = await Product.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    const productsWithViews = await Promise.all(
      products.map(async (product) => {
        const viewsCount = await ProductView.countDocuments({ productId: product._id });
        return { ...product.toObject(), views: viewsCount };
      })
    );

    res.status(200).json({
      success: true,
      products: productsWithViews
    });
  } catch (error) {
    console.error("Error fetching all products:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching all products",
      error: error.message
    });
  }
});



// Get single product by slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug ,isActive:true})
      .populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
      error: error.message
    });
  }
});




// Update product
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product
    if (product.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // Update product fields
    const updates = req.body;
    Object.keys(updates).forEach(key => {
      product[key] = updates[key];
    });

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product',
      error: error.message
    });
  }
});

// Delete product (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product
    if (product.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product',
      error: error.message
    });
  }
});

module.exports = router;
