const Product = require('../models/Product');
const Review = require('../models/Review');

const DETAILS_PRODUCT_FIELDS = [
  '_id', 'name', 'slug', 'original_price', 'sale_price', 'compareAtPrice',
  'type', 'category', 'gender', 'collection', 'frameShape', 'references',
  'description', 'shortDescription', 'specifications', 'uv400', 'polarized',
  'badges', 'stockStatus', 'inStock', 'colors', 'createdAt', 'updatedAt'
].join(' ');
const RELATED_PRODUCT_FIELDS = [
  '_id', 'name', 'slug', 'original_price', 'sale_price', 'compareAtPrice',
  'type', 'category', 'gender', 'collection', 'frameShape', 'uv400',
  'polarized', 'badges', 'stockStatus', 'inStock', 'colors', 'createdAt'
].join(' ');
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DEFAULT_REVIEW_LIMIT = 6;
const MAX_REVIEW_LIMIT = 20;
const MAX_REVIEW_PAGE = 1000;

class ProductDetailsValidationError extends Error {}

const asObject = (value) => value?.toObject ? value.toObject() : value;
const finiteNumber = (value) => (
  value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))
    ? Number(value)
    : null
);
const idString = (value) => value === null || value === undefined ? null : String(value);
const cleanText = (value) => typeof value === 'string' ? value.trim() : '';

const sanitizeSlug = (value) => {
  if (typeof value !== 'string') throw new ProductDetailsValidationError('Invalid product slug');
  const slug = value.trim().toLowerCase();
  if (!slug || slug.length > 160 || !SLUG_PATTERN.test(slug)) {
    throw new ProductDetailsValidationError('Invalid product slug');
  }
  return slug;
};

const localizedText = (value, { fallback = '' } = {}) => {
  if (typeof value === 'string') {
    const text = cleanText(value);
    return { en: text, fr: text, ar: text };
  }
  const source = value && typeof value === 'object' ? value : {};
  const preferred = cleanText(source.fr) || cleanText(source.en) || cleanText(source.ar) || fallback;
  return {
    en: cleanText(source.en) || preferred,
    fr: cleanText(source.fr) || preferred,
    ar: cleanText(source.ar) || preferred
  };
};

const publicImage = (rawImage) => {
  const image = asObject(rawImage) || {};
  const url = cleanText(image.url);
  if (!url) return null;
  return { id: idString(image._id), url, alt: cleanText(image.alt) || null };
};

const getBasePrices = (product) => {
  const current = finiteNumber(product.sale_price);
  const legacyCompare = finiteNumber(product.original_price);
  const explicitCompare = finiteNumber(product.compareAtPrice);
  const compareAt = explicitCompare !== null && explicitCompare > current
    ? explicitCompare
    : (legacyCompare !== null && legacyCompare > current ? legacyCompare : null);
  return { current, compareAt };
};

const discountPercentage = (current, compareAt) => (
  current !== null && compareAt !== null && compareAt > current
    ? Math.round(((compareAt - current) / compareAt) * 100)
    : 0
);

const normalizedStockStatus = (stock, active, product) => {
  if (active === false || (stock !== null && stock <= 0)) return 'out_of_stock';
  if (stock !== null && stock <= 5) return 'low_stock';
  if (stock !== null) return 'in_stock';
  if (product.stockStatus) return product.stockStatus;
  return product.inStock === false ? 'out_of_stock' : 'in_stock';
};

const normalizeProductColors = (rawProduct) => {
  const product = asObject(rawProduct) || {};
  const basePrices = getBasePrices(product);
  return (Array.isArray(product.colors) ? product.colors : []).filter((rawColor) => rawColor?.active !== false).map((rawColor) => {
    const color = asObject(rawColor) || {};
    const colorId = idString(color._id);
    const colorStock = finiteNumber(color.stock);
    const colorActive = color.active !== false;
    const colorPrice = finiteNumber(color.price) ?? basePrices.current;
    const colorCompareAt = finiteNumber(color.compareAtPrice) ?? basePrices.compareAt;
    const colorImages = (Array.isArray(color.images) ? color.images : []).map(publicImage).filter(Boolean);
    const rawLensOptions = Array.isArray(color.lensOptions) ? color.lensOptions : [];
    const lensOptions = rawLensOptions.filter((rawLens) => rawLens?.active !== false).map((rawLens) => {
      const lens = asObject(rawLens) || {};
      const stock = finiteNumber(lens.stock);
      const active = colorActive && lens.active !== false;
      const price = finiteNumber(lens.price) ?? colorPrice;
      const compareAt = finiteNumber(lens.compareAtPrice) ?? colorCompareAt;
      const images = (Array.isArray(lens.images) ? lens.images : []).map(publicImage).filter(Boolean);
      const stockStatus = normalizedStockStatus(stock ?? colorStock, active, product);
      return {
        id: idString(lens._id),
        _id: idString(lens._id),
        name: cleanText(lens.name),
        type: cleanText(lens.type),
        category: finiteNumber(lens.category),
        price,
        compareAtPrice: compareAt,
        discountPercentage: discountPercentage(price, compareAt),
        stockStatus,
        available: stockStatus !== 'out_of_stock',
        active,
        images: images.length ? images : colorImages
      };
    });
    const stockStatus = normalizedStockStatus(colorStock, colorActive, product);
    return {
      id: colorId,
      _id: colorId,
      name: cleanText(color.name),
      value: cleanText(color.value),
      price: colorPrice,
      compareAtPrice: colorCompareAt,
      discountPercentage: discountPercentage(colorPrice, colorCompareAt),
      stockStatus,
      available: stockStatus !== 'out_of_stock',
      active: colorActive,
      images: colorImages,
      lensOptions,
      hasConfiguredLensOptions: rawLensOptions.length > 0
    };
  }).filter((color) => !color.hasConfiguredLensOptions || color.lensOptions.length > 0)
    .map(({ hasConfiguredLensOptions, ...color }) => color);
};

const flattenVariants = (colors) => colors.flatMap((color) => {
  if (!color.lensOptions.length) {
    return [{
      id: color.id,
      colorId: color.id,
      colorName: color.name,
      colorValue: color.value,
      lensOptionId: null,
      lensType: null,
      lensCategory: null,
      price: color.price,
      compareAtPrice: color.compareAtPrice,
      discountPercentage: color.discountPercentage,
      stockStatus: color.stockStatus,
      available: color.available,
      images: color.images
    }];
  }
  return color.lensOptions.map((lens) => ({
    id: `${color.id}:${lens.id}`,
    colorId: color.id,
    colorName: color.name,
    colorValue: color.value,
    lensOptionId: lens.id,
    lensName: lens.name,
    lensType: lens.type,
    lensCategory: lens.category,
    price: lens.price,
    compareAtPrice: lens.compareAtPrice,
    discountPercentage: lens.discountPercentage,
    stockStatus: lens.stockStatus,
    available: lens.available,
    images: lens.images
  }));
});

const normalizeSpecifications = (value) => {
  const source = asObject(value) || {};
  const textKeys = ['frameMaterial', 'lensMaterial', 'frameColor', 'lensColor'];
  const numberKeys = ['lensCategory', 'frameWidth', 'lensWidth', 'bridgeWidth', 'templeLength', 'weight'];
  return {
    ...Object.fromEntries(textKeys.map((key) => [key, cleanText(source[key]) || null])),
    ...Object.fromEntries(numberKeys.map((key) => [key, finiteNumber(source[key])]))
  };
};

const normalizeProductCard = (rawProduct) => {
  const product = asObject(rawProduct) || {};
  const prices = getBasePrices(product);
  const colors = normalizeProductColors(product);
  return {
    id: idString(product._id),
    _id: idString(product._id),
    name: cleanText(product.name),
    slug: cleanText(product.slug),
    original_price: finiteNumber(product.original_price),
    sale_price: prices.current,
    compareAtPrice: prices.compareAt,
    discountPercentage: discountPercentage(prices.current, prices.compareAt),
    type: cleanText(product.type) || null,
    category: cleanText(product.category) || null,
    gender: cleanText(product.gender) || cleanText(product.category) || null,
    collection: cleanText(product.collection) || null,
    frameShape: cleanText(product.frameShape) || cleanText(product.type) || null,
    uv400: product.uv400 === true,
    polarized: product.polarized === true,
    badges: Array.isArray(product.badges) ? product.badges.map(cleanText).filter(Boolean) : [],
    stockStatus: product.stockStatus || (product.inStock === false ? 'out_of_stock' : 'in_stock'),
    inStock: product.stockStatus !== 'out_of_stock' && product.inStock !== false,
    colors
  };
};

const normalizeProductDetails = (rawProduct, rating, relatedProducts = []) => {
  const product = asObject(rawProduct) || {};
  const card = normalizeProductCard(product);
  const description = localizedText(product.description);
  const fallbackShort = (description.fr || description.en || description.ar).slice(0, 240);
  const shortDescription = localizedText(product.shortDescription, { fallback: fallbackShort });
  const variants = flattenVariants(card.colors);
  const images = [...new Map(
    card.colors.flatMap((color) => color.images).map((item) => [item.url, item])
  ).values()];
  const availableVariants = variants.filter((variant) => variant.available);

  return {
    ...card,
    shortDescription,
    description,
    references: cleanText(product.references) || null,
    currency: 'MAD',
    prices: {
      current: card.sale_price,
      compareAt: card.compareAtPrice,
      currency: 'MAD',
      discountPercentage: card.discountPercentage
    },
    features: { uv400: card.uv400, polarized: card.polarized },
    images,
    variants,
    rating: {
      average: Number(rating?.average || 0),
      count: Number(rating?.count || 0)
    },
    ratingAverage: Number(rating?.average || 0),
    reviewCount: Number(rating?.count || 0),
    specifications: normalizeSpecifications(product.specifications),
    stock: {
      status: availableVariants.length ? 'in_stock' : 'out_of_stock',
      available: availableVariants.length > 0,
      availableVariantCount: availableVariants.length
    },
    seo: {
      title: cleanText(product.name),
      description: shortDescription.fr || shortDescription.en || shortDescription.ar,
      image: images[0]?.url || null
    },
    relatedProducts
  };
};

const getReviewSummary = async (productId) => {
  const [summary] = await Review.aggregate([
    { $match: { product: productId, status: 'approved' } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
    { $project: { _id: 0, average: { $round: ['$average', 1] }, count: 1 } }
  ]);
  return summary || { average: 0, count: 0 };
};

const getRelatedProducts = async (product, limit = 4) => {
  const criteria = [
    ['collection', product.collection],
    ['frameShape', product.frameShape],
    ['category', product.category],
    ['type', product.type],
    ['gender', product.gender]
  ].filter(([, value]) => cleanText(value));
  const query = { _id: { $ne: product._id }, isActive: true };
  if (criteria.length) query.$or = criteria.map(([key, value]) => ({ [key]: value }));

  const candidates = await Product.find(query)
    .select(RELATED_PRODUCT_FIELDS)
    .sort({ sortPriority: -1, createdAt: -1, _id: 1 })
    .limit(40)
    .lean();
  const basePrice = finiteNumber(product.sale_price) || 0;
  const weighted = candidates.map((candidate) => ({
    candidate,
    score: (cleanText(candidate.collection) && candidate.collection === product.collection ? 16 : 0)
      + ((candidate.frameShape || candidate.type) === (product.frameShape || product.type) ? 8 : 0)
      + ((candidate.gender || candidate.category) === (product.gender || product.category) ? 4 : 0)
      + (candidate.category === product.category ? 2 : 0),
    priceDistance: Math.abs((finiteNumber(candidate.sale_price) || 0) - basePrice)
  }));
  weighted.sort((a, b) => b.score - a.score || a.priceDistance - b.priceDistance || String(a.candidate._id).localeCompare(String(b.candidate._id)));
  const selected = weighted.slice(0, limit).map(({ candidate }) => candidate);
  if (!selected.length) return [];
  const summaries = await Review.aggregate([
    { $match: { product: { $in: selected.map((candidate) => candidate._id) }, status: 'approved' } },
    { $group: { _id: '$product', average: { $avg: '$rating' }, count: { $sum: 1 } } },
    { $project: { average: { $round: ['$average', 1] }, count: 1 } }
  ]);
  const summaryByProduct = new Map(summaries.map((summary) => [String(summary._id), summary]));
  return selected.map((candidate) => {
    const card = normalizeProductCard(candidate);
    const rating = summaryByProduct.get(String(candidate._id)) || { average: 0, count: 0 };
    return {
      ...card,
      rating: { average: Number(rating.average || 0), count: Number(rating.count || 0) },
      ratingAverage: Number(rating.average || 0),
      reviewCount: Number(rating.count || 0)
    };
  });
};

const getProductDetailsBySlug = async (rawSlug) => {
  const slug = sanitizeSlug(rawSlug);
  const product = await Product.findOne({ slug, isActive: true }).select(DETAILS_PRODUCT_FIELDS).lean();
  if (!product) return null;
  const [rating, relatedProducts] = await Promise.all([
    getReviewSummary(product._id),
    getRelatedProducts(product, 4)
  ]);
  return normalizeProductDetails(product, rating, relatedProducts);
};

const parseReviewsQuery = (query = {}) => {
  const unknown = Object.keys(query).filter((key) => !['page', 'limit'].includes(key));
  if (unknown.length) throw new ProductDetailsValidationError(`Unsupported reviews parameter: ${unknown.join(', ')}`);
  const parseInteger = (value, name, fallback, max) => {
    if (value === undefined) return fallback;
    if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
      throw new ProductDetailsValidationError(`${name} must be an integer between 1 and ${max}`);
    }
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number > max) {
      throw new ProductDetailsValidationError(`${name} must be an integer between 1 and ${max}`);
    }
    return number;
  };
  return {
    page: parseInteger(query.page, 'page', 1, MAX_REVIEW_PAGE),
    limit: parseInteger(query.limit, 'limit', DEFAULT_REVIEW_LIMIT, MAX_REVIEW_LIMIT)
  };
};

const listProductReviews = async (rawSlug, query) => {
  const slug = sanitizeSlug(rawSlug);
  const options = parseReviewsQuery(query);
  const product = await Product.findOne({ slug, isActive: true }).select('_id').lean();
  if (!product) return null;
  const filter = { product: product._id, status: 'approved' };
  const [reviews, total, summary] = await Promise.all([
    Review.find(filter)
      .select('_id displayName rating title comment verifiedPurchase createdAt')
      .sort({ createdAt: -1, _id: -1 })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .lean(),
    Review.countDocuments(filter),
    getReviewSummary(product._id)
  ]);
  const totalPages = total ? Math.ceil(total / options.limit) : 0;
  return {
    reviews: reviews.map((review) => ({
      id: idString(review._id),
      displayName: review.displayName,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      verifiedPurchase: review.verifiedPurchase === true,
      createdAt: review.createdAt
    })),
    rating: summary,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages,
      hasPreviousPage: totalPages > 0 && options.page > 1,
      hasNextPage: options.page < totalPages,
      outOfRange: totalPages > 0 && options.page > totalPages
    }
  };
};

module.exports = {
  ProductDetailsValidationError,
  getProductDetailsBySlug,
  listProductReviews,
  normalizeProductColors,
  normalizeProductDetails,
  parseReviewsQuery,
  sanitizeSlug
};
