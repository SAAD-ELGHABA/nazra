const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const ProductView = require("../models/ProductView");
const {
  CatalogValidationError,
  listProducts
} = require('../services/productCatalogService');
const {
  ProductDetailsValidationError,
  getProductDetailsBySlug,
  listProductReviews
} = require('../services/productDetailsService');

const HOMEPAGE_DEFAULT_LIMIT = 4;
const HOMEPAGE_MAX_LIMIT = 12;
const HOMEPAGE_CACHE_TTL_MS = 60 * 1000;
const HOMEPAGE_AGGREGATION_TIMEOUT_MS = 2 * 1000;
const SALES_STATUSES = ["processing", "shipped", "delivered"];
const PUBLIC_PRODUCT_CARD_FIELDS =
  '_id name slug original_price sale_price type category colors.name colors.value colors.images.url';
const homepageSelectionCache = new Map();

const getCachedHomepageSelection = (limit) => {
  const cached = homepageSelectionCache.get(limit);
  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    homepageSelectionCache.delete(limit);
    return null;
  }

  return cached.value;
};

const cacheHomepageSelection = (limit, value) => {
  homepageSelectionCache.set(limit, {
    value,
    expiresAt: Date.now() + HOMEPAGE_CACHE_TTL_MS
  });
};

const parseHomepageLimit = (value) => {
  if (value === undefined) return HOMEPAGE_DEFAULT_LIMIT;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed <= HOMEPAGE_MAX_LIMIT
    ? parsed
    : null;
};

class ProductPayloadValidationError extends Error {}

const PRODUCT_MUTABLE_FIELDS = new Set([
  'name', 'original_price', 'sale_price', 'type', 'category', 'gender',
  'collection', 'frameShape', 'compareAtPrice', 'uv400', 'polarized',
  'badges', 'stockStatus', 'inStock',
  'sortPriority', 'references', 'description', 'shortDescription',
  'specifications', 'colors'
]);

const requirePlainObject = (value, name) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ProductPayloadValidationError(`${name} must be an object`);
  }
  return value;
};

const parseBodyString = (value, name, maximum, { required = false } = {}) => {
  if (value === undefined) {
    if (required) throw new ProductPayloadValidationError(`${name} is required`);
    return undefined;
  }
  if (value === null && !required) return null;
  if (typeof value !== 'string') throw new ProductPayloadValidationError(`${name} must be a string`);
  const parsed = value.trim();
  if (required && !parsed) {
    throw new ProductPayloadValidationError(`${name} must contain between 1 and ${maximum} characters`);
  }
  if (!parsed) return null;
  if (parsed.length > maximum) {
    throw new ProductPayloadValidationError(`${name} must contain between 1 and ${maximum} characters`);
  }
  return parsed;
};

const isDuplicateSlugError = (error) => Boolean(
  error?.code === 11000 && (
    error?.keyPattern?.slug ||
    error?.keyValue?.slug ||
    String(error?.message || '').includes('slug_1')
  )
);

const parseBodyNumber = (value, name, { min = 0, max = Number.MAX_SAFE_INTEGER, integer = false, nullable = false } = {}) => {
  if (value === undefined) return undefined;
  if (value === null && nullable) return null;
  if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim())) {
    throw new ProductPayloadValidationError(`${name} must be a number`);
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max || (integer && !Number.isInteger(parsed))) {
    throw new ProductPayloadValidationError(`${name} must be ${integer ? 'an integer' : 'a number'} between ${min} and ${max}`);
  }
  return parsed;
};

const parseBodyBoolean = (value, name) => {
  if (value === undefined) return undefined;
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  throw new ProductPayloadValidationError(`${name} must be true or false`);
};

const parseDescription = (value) => {
  if (value === undefined) return undefined;
  const description = requirePlainObject(value, 'description');
  const unknown = Object.keys(description).filter((key) => !['en', 'fr', 'ar'].includes(key));
  if (unknown.length) throw new ProductPayloadValidationError(`Unsupported description field: ${unknown.join(', ')}`);
  return Object.fromEntries(
    ['en', 'fr', 'ar']
      .filter((language) => description[language] !== undefined)
      .map((language) => [language, parseBodyString(description[language], `description.${language}`, 3000) || ''])
  );
};

const parseShortDescription = (value) => {
  if (value === undefined) return undefined;
  const description = requirePlainObject(value, 'shortDescription');
  const unknown = Object.keys(description).filter((key) => !['en', 'fr', 'ar'].includes(key));
  if (unknown.length) throw new ProductPayloadValidationError(`Unsupported shortDescription field: ${unknown.join(', ')}`);
  return Object.fromEntries(
    ['en', 'fr', 'ar']
      .filter((language) => description[language] !== undefined)
      .map((language) => [language, parseBodyString(description[language], `shortDescription.${language}`, 1000) || ''])
  );
};

const parseSpecifications = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const specifications = requirePlainObject(value, 'specifications');
  const textFields = ['frameMaterial', 'lensMaterial', 'frameColor', 'lensColor'];
  const numberFields = ['lensCategory', 'frameWidth', 'lensWidth', 'bridgeWidth', 'templeLength', 'weight'];
  const known = new Set([...textFields, ...numberFields]);
  const unknown = Object.keys(specifications).filter((key) => !known.has(key));
  if (unknown.length) throw new ProductPayloadValidationError(`Unsupported specification field: ${unknown.join(', ')}`);
  const parsed = {};
  textFields.forEach((field) => {
    const output = parseBodyString(specifications[field], `specifications.${field}`, 100);
    if (output !== undefined) parsed[field] = output;
  });
  numberFields.forEach((field) => {
    const maxima = { lensCategory: 4, frameWidth: 500, lensWidth: 200, bridgeWidth: 100, templeLength: 300, weight: 1000 };
    const output = parseBodyNumber(specifications[field], `specifications.${field}`, {
      min: 0,
      max: maxima[field],
      nullable: true
    });
    if (output !== undefined) parsed[field] = output;
  });
  return parsed;
};

const parseImages = (value, name, { required = false } = {}) => {
  if (value === undefined && !required) return [];
  if (!Array.isArray(value) || (required && !value.length) || value.length > 20) {
    throw new ProductPayloadValidationError(`${name} must contain ${required ? 'between 1 and' : 'at most'} 20 images`);
  }
  return value.map((rawImage, imageIndex) => {
    const image = requirePlainObject(rawImage, `${name}[${imageIndex}]`);
    return {
      ...(image._id !== undefined ? { _id: image._id } : {}),
      url: parseBodyString(image.url, `${name}[${imageIndex}].url`, 2048, { required: true }),
      public_id: parseBodyString(image.public_id, `${name}[${imageIndex}].public_id`, 500, { required: true })
    };
  });
};

const parseLensOptions = (value, colorIndex) => {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 20) {
    throw new ProductPayloadValidationError(`colors[${colorIndex}].lensOptions must be an array of at most 20 options`);
  }
  return value.map((rawLens, lensIndex) => {
    const name = `colors[${colorIndex}].lensOptions[${lensIndex}]`;
    const lens = requirePlainObject(rawLens, name);
    const allowed = new Set(['_id', 'name', 'type', 'category', 'sku', 'price', 'compareAtPrice', 'stock', 'active', 'images']);
    const unknown = Object.keys(lens).filter((key) => !allowed.has(key));
    if (unknown.length) throw new ProductPayloadValidationError(`Unsupported ${name} field: ${unknown.join(', ')}`);
    return {
      ...(lens._id !== undefined ? { _id: lens._id } : {}),
      name: parseBodyString(lens.name, `${name}.name`, 100, { required: true }),
      type: parseBodyString(lens.type, `${name}.type`, 50, { required: true }),
      category: parseBodyNumber(lens.category, `${name}.category`, { min: 0, max: 4, nullable: true }),
      sku: parseBodyString(lens.sku, `${name}.sku`, 100),
      price: parseBodyNumber(lens.price, `${name}.price`, { nullable: true }),
      compareAtPrice: parseBodyNumber(lens.compareAtPrice, `${name}.compareAtPrice`, { nullable: true }),
      stock: parseBodyNumber(lens.stock, `${name}.stock`, { integer: true, nullable: true }),
      active: lens.active === undefined ? true : parseBodyBoolean(lens.active, `${name}.active`),
      images: parseImages(lens.images, `${name}.images`)
    };
  });
};

const parseColors = (value) => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || !value.length || value.length > 50) {
    throw new ProductPayloadValidationError('colors must contain between 1 and 50 variants');
  }
  return value.map((rawColor, colorIndex) => {
    const color = requirePlainObject(rawColor, `colors[${colorIndex}]`);
    const allowed = new Set(['_id', 'name', 'value', 'sku', 'price', 'compareAtPrice', 'stock', 'active', 'images', 'lensOptions']);
    const unknown = Object.keys(color).filter((key) => !allowed.has(key));
    if (unknown.length) throw new ProductPayloadValidationError(`Unsupported colors[${colorIndex}] field: ${unknown.join(', ')}`);
    return {
      ...(color._id !== undefined ? { _id: color._id } : {}),
      name: parseBodyString(color.name, `colors[${colorIndex}].name`, 100, { required: true }),
      value: parseBodyString(color.value, `colors[${colorIndex}].value`, 100, { required: true }),
      sku: parseBodyString(color.sku, `colors[${colorIndex}].sku`, 100),
      price: parseBodyNumber(color.price, `colors[${colorIndex}].price`, { nullable: true }),
      compareAtPrice: parseBodyNumber(color.compareAtPrice, `colors[${colorIndex}].compareAtPrice`, { nullable: true }),
      stock: parseBodyNumber(color.stock, `colors[${colorIndex}].stock`, { integer: true, nullable: true }),
      active: color.active === undefined ? true : parseBodyBoolean(color.active, `colors[${colorIndex}].active`),
      images: parseImages(color.images, `colors[${colorIndex}].images`, { required: true }),
      lensOptions: parseLensOptions(color.lensOptions, colorIndex)
    };
  });
};

const normalizeProductPayload = (body, { partial = false } = {}) => {
  requirePlainObject(body, 'request body');
  const unknown = Object.keys(body).filter((key) => !PRODUCT_MUTABLE_FIELDS.has(key));
  if (unknown.length) throw new ProductPayloadValidationError(`Unsupported product field: ${unknown.join(', ')}`);
  if (partial && !Object.keys(body).length) throw new ProductPayloadValidationError('At least one product field is required');

  const payload = {};
  const add = (key, value) => { if (value !== undefined) payload[key] = value; };
  add('name', parseBodyString(body.name, 'name', 100, { required: !partial }));
  add('original_price', parseBodyNumber(body.original_price, 'original_price'));
  add('sale_price', parseBodyNumber(body.sale_price, 'sale_price'));
  add('type', parseBodyString(body.type, 'type', 100, { required: !partial }));
  add('category', parseBodyString(body.category, 'category', 100, { required: !partial }));
  add('gender', parseBodyString(body.gender, 'gender', 50));
  add('collection', parseBodyString(body.collection, 'collection', 100));
  add('frameShape', parseBodyString(body.frameShape, 'frameShape', 100));
  add('compareAtPrice', parseBodyNumber(body.compareAtPrice, 'compareAtPrice', { nullable: true }));
  add('uv400', parseBodyBoolean(body.uv400, 'uv400'));
  add('polarized', parseBodyBoolean(body.polarized, 'polarized'));
  if (body.badges !== undefined) {
    if (!Array.isArray(body.badges) || body.badges.length > 20) throw new ProductPayloadValidationError('badges must be an array of at most 20 values');
    payload.badges = body.badges.map((badge, index) => parseBodyString(badge, `badges[${index}]`, 50, { required: true }));
  }
  if (body.stockStatus !== undefined) {
    if (!['in_stock', 'low_stock', 'out_of_stock'].includes(body.stockStatus)) {
      throw new ProductPayloadValidationError('stockStatus must be in_stock, low_stock or out_of_stock');
    }
    payload.stockStatus = body.stockStatus;
  }
  add('inStock', parseBodyBoolean(body.inStock, 'inStock'));
  add('sortPriority', parseBodyNumber(body.sortPriority, 'sortPriority', { min: -100000, max: 100000, integer: true }));
  add('references', parseBodyString(body.references, 'references', 500));
  add('description', parseDescription(body.description));
  add('shortDescription', parseShortDescription(body.shortDescription));
  add('specifications', parseSpecifications(body.specifications));
  add('colors', parseColors(body.colors));

  if (!partial) {
    if (payload.original_price === undefined) throw new ProductPayloadValidationError('original_price is required');
    if (payload.sale_price === undefined) throw new ProductPayloadValidationError('sale_price is required');
    if (payload.colors === undefined) throw new ProductPayloadValidationError('colors is required');
  }
  if (payload.stockStatus !== undefined) payload.inStock = payload.stockStatus !== 'out_of_stock';
  else if (payload.inStock !== undefined) payload.stockStatus = payload.inStock ? 'in_stock' : 'out_of_stock';
  return payload;
};

// Create a new product
router.post('/create', auth, async (req, res) => {
  try {
    const payload = normalizeProductPayload(req.body);
    const product = new Product({
      ...payload,
      createdBy: req.user.id
    });

    // Save product to database
    await product.save();
    homepageSelectionCache.clear();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    if (isDuplicateSlugError(error)) {
      return res.status(409).json({ success: false, message: 'A product with this slug already exists' });
    }
    if (error instanceof ProductPayloadValidationError || error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product'
    });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const response = await listProducts(req.query);
    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof CatalogValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    console.error('Error fetching products:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
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

  const cachedSelection = getCachedHomepageSelection(limit);
  if (cachedSelection) {
    return res.status(200).json(cachedSelection);
  }

  try {
    let rankedProducts = [];

    try {
      rankedProducts = await Order.aggregate([
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
          $project: {
            _id: '$product._id',
            name: '$product.name',
            slug: '$product.slug',
            original_price: '$product.original_price',
            sale_price: '$product.sale_price',
            type: '$product.type',
            category: '$product.category',
            colors: {
              $map: {
                input: '$product.colors',
                as: 'color',
                in: {
                  name: '$$color.name',
                  value: '$$color.value',
                  images: {
                    $map: {
                      input: '$$color.images',
                      as: 'image',
                      in: { url: '$$image.url' }
                    }
                  }
                }
              }
            }
          }
        },
        { $limit: limit }
      ]).option({ maxTimeMS: HOMEPAGE_AGGREGATION_TIMEOUT_MS });
    } catch (aggregationError) {
      console.warn('Homepage sales aggregation unavailable; using recent products');
    }

    const hasCompleteSalesRanking = rankedProducts.length === limit;
    const products = hasCompleteSalesRanking
      ? rankedProducts
      : await Product.find({ isActive: true })
          .select(PUBLIC_PRODUCT_CARD_FIELDS)
          .sort({ createdAt: -1, _id: 1 })
          .limit(limit)
          .lean();

    const responseBody = {
      success: true,
      products,
      meta: {
        source: hasCompleteSalesRanking ? 'sales' : 'recent',
        requestedLimit: limit,
        count: products.length
      }
    };

    cacheHomepageSelection(limit, responseBody);
    return res.status(200).json(responseBody);
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
      .select(PUBLIC_PRODUCT_CARD_FIELDS)
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
      message: 'Server error while fetching products shortcut'
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
      message: "Server error while fetching all products"
    });
  }
});



// Paginated, approved reviews. Review writes remain disabled until orders can
// prove authenticated ownership instead of relying on guest contact details.
router.get('/:slug/reviews', async (req, res) => {
  try {
    const result = await listProductReviews(req.params.slug, req.query);
    if (!result) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ProductDetailsValidationError) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Error fetching product reviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching product reviews'
    });
  }
});

// Sanitized Product Details payload with real review summary and dynamic
// related products. The legacy `product` wrapper is retained.
router.get('/:slug', async (req, res) => {
  try {
    const product = await getProductDetailsBySlug(req.params.slug);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.status(200).json({ success: true, product });
  } catch (error) {
    if (error instanceof ProductDetailsValidationError) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Error fetching product:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching product' });
  }
});




// Update product
router.put('/:id', auth, async (req, res) => {
  try {
    if (!Product.db.base.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }
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

    const updates = normalizeProductPayload(req.body, { partial: true });
    Object.keys(updates).forEach(key => {
      product[key] = updates[key];
    });

    await product.save();
    homepageSelectionCache.clear();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    if (isDuplicateSlugError(error)) {
      return res.status(409).json({ success: false, message: 'A product with this slug already exists' });
    }
    if (error instanceof ProductPayloadValidationError || error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product'
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
    homepageSelectionCache.clear();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product'
    });
  }
});

router._test = {
  ProductPayloadValidationError,
  isDuplicateSlugError,
  normalizeProductPayload
};

module.exports = router;
