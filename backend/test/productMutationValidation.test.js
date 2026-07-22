const test = require('node:test');
const assert = require('node:assert/strict');

const { _test } = require('../routes/products');

const validProduct = () => ({
  name: 'Atlas',
  original_price: 500,
  sale_price: 399,
  type: 'Round',
  category: 'Men',
  colors: [{
    name: 'Black',
    value: '#000000',
    images: [{ url: 'https://example.com/atlas.jpg', public_id: 'atlas-black' }]
  }]
});

test('normalizes empty optional product strings to null', () => {
  const payload = _test.normalizeProductPayload({
    ...validProduct(),
    gender: '   ',
    collection: '',
    frameShape: null,
    references: ' '
  });

  assert.equal(payload.gender, null);
  assert.equal(payload.collection, null);
  assert.equal(payload.frameShape, null);
  assert.equal(payload.references, null);
});

test('rejects public rating and review-count mutations', () => {
  assert.throws(
    () => _test.normalizeProductPayload({ ...validProduct(), ratingAverage: 5 }),
    /Unsupported product field/
  );
  assert.throws(
    () => _test.normalizeProductPayload({ reviewCount: 10 }, { partial: true }),
    /Unsupported product field/
  );
});

test('recognizes duplicate slug database errors for conflict responses', () => {
  assert.equal(_test.isDuplicateSlugError({ code: 11000, keyPattern: { slug: 1 } }), true);
  assert.equal(_test.isDuplicateSlugError({ code: 11000, keyValue: { slug: 'atlas' } }), true);
  assert.equal(_test.isDuplicateSlugError({ code: 11000, keyPattern: { name: 1 } }), false);
});

test('validates localized details, specifications and nested lens options', () => {
  const payload = _test.normalizeProductPayload({
    ...validProduct(),
    shortDescription: { fr: 'Inspirée par le désert.' },
    specifications: { frameMaterial: 'Acétate', lensWidth: 52, lensCategory: 3 },
    colors: [{
      ...validProduct().colors[0],
      sku: 'ATLAS-BLK',
      stock: 10,
      lensOptions: [{
        name: 'Polarized (Cat. 3)',
        type: 'polarized',
        category: 3,
        sku: 'ATLAS-BLK-POL',
        price: 429,
        stock: 4,
        active: true
      }]
    }]
  });

  assert.equal(payload.shortDescription.fr, 'Inspirée par le désert.');
  assert.equal(payload.specifications.lensWidth, 52);
  assert.equal(payload.colors[0].lensOptions[0].sku, 'ATLAS-BLK-POL');
  assert.equal(payload.colors[0].lensOptions[0].stock, 4);
});

test('rejects malformed nested product detail data', () => {
  assert.throws(
    () => _test.normalizeProductPayload({ ...validProduct(), specifications: { unknown: 'x' } }),
    /Unsupported specification field/
  );
  assert.throws(
    () => _test.normalizeProductPayload({
      ...validProduct(),
      colors: [{ ...validProduct().colors[0], lensOptions: [{ name: 'Polarized', type: 'polarized', stock: -1 }] }]
    }),
    /stock must be an integer/
  );
});
