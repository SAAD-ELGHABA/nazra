const test = require('node:test');
const assert = require('node:assert/strict');

const {
  ProductDetailsValidationError,
  normalizeProductDetails,
  parseReviewsQuery,
  sanitizeSlug
} = require('../services/productDetailsService');

const PRODUCT_ID = '64b000000000000000000001';
const COLOR_ID = '64b000000000000000000002';
const LENS_ID = '64b000000000000000000003';

const detailedProduct = () => ({
  _id: PRODUCT_ID,
  name: 'Atlas',
  slug: 'atlas',
  sale_price: 249,
  original_price: 349,
  type: 'Square',
  category: 'Men',
  description: { fr: 'Une monture premium.' },
  shortDescription: { fr: 'Inspirée par le désert.' },
  uv400: true,
  polarized: true,
  createdBy: 'private-user',
  colors: [{
    _id: COLOR_ID,
    name: 'Noir Mat',
    value: '#000000',
    stock: 8,
    images: [{ _id: '64b000000000000000000004', url: 'https://example.com/atlas.jpg', public_id: 'private-cloudinary-id' }],
    lensOptions: [{
      _id: LENS_ID,
      name: 'Polarized (Cat. 3)',
      type: 'polarized',
      category: 3,
      price: 279,
      stock: 2,
      active: true
    }]
  }]
});

test('normalizes a product detail into sanitized exact variants', () => {
  const result = normalizeProductDetails(detailedProduct(), { average: 4.8, count: 12 }, []);

  assert.equal(result.id, PRODUCT_ID);
  assert.equal(result.prices.current, 249);
  assert.equal(result.prices.compareAt, 349);
  assert.equal(result.prices.discountPercentage, 29);
  assert.equal(result.shortDescription.en, 'Inspirée par le désert.');
  assert.equal(result.rating.average, 4.8);
  assert.equal(result.variants.length, 1);
  assert.equal(result.variants[0].id, `${COLOR_ID}:${LENS_ID}`);
  assert.equal(result.variants[0].price, 279);
  assert.equal(result.variants[0].stockStatus, 'low_stock');
  assert.equal('stock' in result.variants[0], false);
  assert.equal('sku' in result.variants[0], false);
  assert.equal(result.images[0].url, 'https://example.com/atlas.jpg');
  assert.equal('public_id' in result.images[0], false);
  assert.equal('createdBy' in result, false);
});

test('normalizes legacy colors without lens options into purchasable variants', () => {
  const product = detailedProduct();
  delete product.shortDescription;
  product.colors[0].stock = null;
  delete product.colors[0].lensOptions;
  product.inStock = true;

  const result = normalizeProductDetails(product, null, []);
  assert.equal(result.variants.length, 1);
  assert.equal(result.variants[0].id, COLOR_ID);
  assert.equal(result.variants[0].lensOptionId, null);
  assert.equal(result.variants[0].price, 249);
  assert.equal(result.variants[0].available, true);
  assert.equal(result.rating.count, 0);
  assert.match(result.shortDescription.fr, /monture premium/);
});

test('strictly validates slugs and review pagination', () => {
  assert.equal(sanitizeSlug('atlas'), 'atlas');
  assert.throws(() => sanitizeSlug('../atlas'), ProductDetailsValidationError);
  assert.deepEqual(parseReviewsQuery({}), { page: 1, limit: 6 });
  assert.deepEqual(parseReviewsQuery({ page: '2', limit: '10' }), { page: 2, limit: 10 });
  assert.throws(() => parseReviewsQuery({ limit: '21' }), /between 1 and 20/);
  assert.throws(() => parseReviewsQuery({ page: '1001' }), /between 1 and 1000/);
  assert.throws(() => parseReviewsQuery({ status: 'approved' }), /Unsupported reviews parameter/);
});

test('removes inactive colors and lens options from the public contract', () => {
  const product = detailedProduct();
  product.colors.push({
    _id: '64b000000000000000000009',
    name: 'Hidden',
    value: '#fff',
    active: false,
    stock: 20,
    sku: 'SECRET-SKU',
    images: [{ url: 'https://example.com/hidden.jpg', public_id: 'private' }]
  });
  product.colors[0].lensOptions.push({
    _id: '64b000000000000000000008',
    name: 'Hidden lens',
    type: 'hidden',
    active: false,
    stock: 20,
    sku: 'SECRET-LENS'
  });

  const result = normalizeProductDetails(product, null, []);
  assert.equal(result.colors.length, 1);
  assert.equal(result.colors[0].lensOptions.length, 1);
  assert.equal(JSON.stringify(result).includes('SECRET'), false);
  assert.equal(JSON.stringify(result).includes('Hidden'), false);
});
