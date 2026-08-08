const test = require('node:test');
const assert = require('node:assert/strict');

const { _test } = require('../controllers/orderController');
const Order = require('../models/Order');

const PRODUCT_ID = '64b000000000000000000001';
const COLOR_ID = '64b000000000000000000002';

const validBody = () => ({
  products: [{ product: PRODUCT_ID, quantity: 2, color: COLOR_ID }],
  customer: {
    fullName: ' Test Customer ',
    email: 'TEST@example.com',
    phone: '+212600000000',
    adresse: '12 rue des Lunettes',
    city: 'Casablanca'
  }
});

const activeProduct = (overrides = {}) => ({
  _id: PRODUCT_ID,
  sale_price: 349.5,
  stockStatus: 'in_stock',
  inStock: true,
  colors: [{ _id: COLOR_ID, name: 'Black', value: '#000000' }],
  ...overrides
});

test('normalizes valid order input before database access', () => {
  const result = _test.validateOrderRequest(validBody());
  assert.equal(result.products[0].quantity, 2);
  assert.equal(result.customer.fullName, 'Test Customer');
  assert.equal(result.customer.email, 'test@example.com');
  assert.equal(result.customer.city, 'Casablanca');
});

test('requires a city so the order can actually be delivered', () => {
  const body = validBody();
  delete body.customer.city;
  assert.throws(() => _test.validateOrderRequest(body), /customer\.city/);
  assert.throws(
    () => _test.validateOrderRequest({ ...validBody(), customer: { ...validBody().customer, city: '   ' } }),
    /customer\.city/
  );
});

test('canonicalizes Moroccan phone numbers and rejects unusable ones', () => {
  const withPhone = (phone) => ({ ...validBody(), customer: { ...validBody().customer, phone } });

  assert.equal(_test.validateOrderRequest(withPhone('0612345678')).customer.phone, '+212612345678');
  assert.equal(_test.validateOrderRequest(withPhone('06 12 34 56 78')).customer.phone, '+212612345678');
  assert.equal(_test.validateOrderRequest(withPhone('00212612345678')).customer.phone, '+212612345678');

  // A courier cannot deliver to any of these.
  ['a', '06123', '0412345678', '12345'].forEach((phone) => {
    assert.throws(() => _test.validateOrderRequest(withPhone(phone)), /customer\.phone/);
  });
});

test('accepts an order without an email but still rejects a malformed one', () => {
  const withEmail = (email) => {
    const body = validBody();
    if (email === undefined) delete body.customer.email;
    else body.customer.email = email;
    return body;
  };

  assert.equal(_test.validateOrderRequest(withEmail(undefined)).customer.email, null);
  assert.equal(_test.validateOrderRequest(withEmail('')).customer.email, null);
  assert.throws(() => _test.validateOrderRequest(withEmail('not-an-email')), /customer\.email/);
});

test('rejects empty carts, malformed ids and unbounded quantities', () => {
  const cases = [
    { ...validBody(), products: [] },
    { ...validBody(), products: [{ product: 'not-an-id', quantity: 1, color: 'Black' }] },
    { ...validBody(), products: [{ product: PRODUCT_ID, quantity: 0, color: 'Black' }] },
    { ...validBody(), products: [{ product: PRODUCT_ID, quantity: 1.5, color: 'Black' }] },
    { ...validBody(), products: [{ product: PRODUCT_ID, quantity: _test.MAX_ITEM_QUANTITY + 1, color: 'Black' }] }
  ];

  for (const body of cases) {
    assert.throws(() => _test.validateOrderRequest(body), _test.OrderInputValidationError);
  }
});

test('builds order items with the server price and canonical color name', () => {
  const requested = _test.validateOrderRequest(validBody()).products;
  const [item] = _test.buildValidatedOrderItems(requested, [activeProduct()]);

  assert.equal(String(item.product), PRODUCT_ID);
  assert.equal(item.unitPrice, 349.5);
  assert.equal(item.color, 'Black');
  assert.equal(item.quantity, 2);
});

test('accepts a color name or value only when it belongs to the product', () => {
  const byName = [{ product: PRODUCT_ID, quantity: 1, color: ' black ' }];
  const byValue = [{ product: PRODUCT_ID, quantity: 1, color: '#000000' }];

  assert.equal(_test.buildValidatedOrderItems(byName, [activeProduct()])[0].color, 'Black');
  assert.equal(_test.buildValidatedOrderItems(byValue, [activeProduct()])[0].color, 'Black');
  assert.throws(
    () => _test.buildValidatedOrderItems([{ product: PRODUCT_ID, quantity: 1, color: 'Blue' }], [activeProduct()]),
    /not a variant/
  );
});

test('rejects missing, inactive-query-excluded, or out-of-stock products before save', () => {
  const requested = _test.validateOrderRequest(validBody()).products;

  assert.throws(() => _test.buildValidatedOrderItems(requested, []), /unavailable/);
  assert.throws(
    () => _test.buildValidatedOrderItems(requested, [activeProduct({ stockStatus: 'out_of_stock' })]),
    /out of stock/
  );
  assert.throws(
    () => _test.buildValidatedOrderItems(requested, [activeProduct({ inStock: false })]),
    /out of stock/
  );
});

test('order schema requires a bounded quantity and server price snapshot', () => {
  const baseOrder = {
    fullName: 'Test Customer',
    email: 'test@example.com',
    phone: '+212600000000',
    adresse: '12 rue des Lunettes',
    city: 'Casablanca',
    products: [{ product: PRODUCT_ID, quantity: 1, color: 'Black', unitPrice: 349.5 }]
  };

  assert.equal(new Order(baseOrder).validateSync(), undefined);
  assert.match(
    new Order({ ...baseOrder, products: [{ product: PRODUCT_ID, quantity: 1, color: 'Black' }] })
      .validateSync().message,
    /unitPrice/
  );
  assert.match(
    new Order({ ...baseOrder, products: [{ product: PRODUCT_ID, quantity: 1.5, color: 'Black', unitPrice: 349.5 }] })
      .validateSync().message,
    /quantity/
  );
});

test('requires and validates a lens option when the selected color has lens combinations', () => {
  const LENS_ID = '64b000000000000000000003';
  const product = activeProduct({
    colors: [{
      _id: COLOR_ID,
      name: 'Black',
      value: '#000000',
      price: 299,
      stock: 8,
      active: true,
      lensOptions: [{
        _id: LENS_ID,
        name: 'Polarized',
        type: 'polarized',
        category: 3,
        price: 329,
        stock: 3,
        active: true,
        sku: 'ATLAS-BLK-POL'
      }]
    }]
  });
  const requested = _test.validateOrderRequest({
    ...validBody(),
    products: [{ product: PRODUCT_ID, quantity: 2, color: COLOR_ID, lensOption: LENS_ID }]
  }).products;
  const result = _test.buildValidatedOrderSelection(requested, [product]);

  assert.equal(result.orderItems[0].unitPrice, 329);
  assert.equal(String(result.orderItems[0].lensOptionId), LENS_ID);
  assert.equal(result.orderItems[0].lensType, 'polarized');
  assert.equal(result.orderItems[0].sku, 'ATLAS-BLK-POL');
  assert.equal(result.orderItems[0].inventorySource, 'lens');
  assert.equal(result.reservations[0].quantity, 2);
  assert.throws(
    () => _test.buildValidatedOrderItems([{ product: PRODUCT_ID, quantity: 1, color: COLOR_ID, lensOption: 'wrong' }], [product]),
    /lensOption is not available/
  );
  assert.throws(
    () => _test.buildValidatedOrderItems([{ product: PRODUCT_ID, quantity: 4, color: COLOR_ID, lensOption: LENS_ID }], [product]),
    /enough stock/
  );
  assert.throws(
    () => _test.buildValidatedOrderItems([{ product: PRODUCT_ID, quantity: 1, color: COLOR_ID, lensOption: null }], [product]),
    /lensOption is required/
  );
});

test('validates and hashes optional idempotency keys without storing raw values', () => {
  assert.equal(_test.parseIdempotencyKey(undefined), null);
  const first = _test.parseIdempotencyKey('checkout_1234567890abcdef');
  const second = _test.parseIdempotencyKey('checkout_1234567890abcdef');
  assert.equal(first, second);
  assert.equal(first.length, 64);
  assert.notEqual(first, 'checkout_1234567890abcdef');
  assert.throws(() => _test.parseIdempotencyKey('short'), /16 to 128/);
  assert.throws(() => _test.parseIdempotencyKey('invalid key with spaces'), /URL-safe/);
});

test('enforces the order status transition graph', () => {
  assert.equal(_test.STATUS_TRANSITIONS.pending.has('processing'), true);
  assert.equal(_test.STATUS_TRANSITIONS.pending.has('cancelled'), true);
  assert.equal(_test.STATUS_TRANSITIONS.processing.has('shipped'), true);
  assert.equal(_test.STATUS_TRANSITIONS.shipped.has('cancelled'), false);
  assert.equal(_test.STATUS_TRANSITIONS.delivered.size, 0);
  assert.equal(_test.STATUS_TRANSITIONS.cancelled.size, 0);
});

test('restores each reserved inventory source using its exact variant path', async () => {
  const calls = [];
  const ProductModel = { updateOne: async (...args) => { calls.push(args); return { modifiedCount: 1 }; } };
  await _test.restoreOrderInventory({ products: [
    { product: PRODUCT_ID, quantity: 2, colorVariantId: COLOR_ID, lensOptionId: '64b000000000000000000003', inventorySource: 'lens' },
    { product: PRODUCT_ID, quantity: 1, colorVariantId: COLOR_ID, inventorySource: 'color' },
    { product: PRODUCT_ID, quantity: 3, colorVariantId: COLOR_ID, inventorySource: 'none' }
  ] }, { ProductModel, session: 'test-session' });

  assert.equal(calls.length, 2);
  assert.equal(calls[0][1].$inc['colors.$[color].lensOptions.$[lens].stock'], 2);
  assert.equal(calls[1][1].$inc['colors.$[color].stock'], 1);
  assert.equal(calls[0][2].session, 'test-session');
});

test('inventory reservation uses a conditional atomic decrement', async () => {
  const LENS_ID = '64b000000000000000000003';
  const calls = [];
  const ProductModel = {
    updateOne: async (...args) => {
      calls.push(args);
      return { modifiedCount: 1 };
    }
  };
  await _test.reserveInventory([{
    productId: PRODUCT_ID,
    colorVariantId: COLOR_ID,
    lensOptionId: LENS_ID,
    quantity: 2,
    index: 0
  }], ProductModel);

  assert.equal(calls.length, 1);
  assert.equal(calls[0][0].colors.$elemMatch.lensOptions.$elemMatch.stock.$gte, 2);
  assert.equal(calls[0][1].$inc['colors.$[color].lensOptions.$[lens].stock'], -2);
});

test('failed reservation compensates inventory already reserved', async () => {
  let call = 0;
  const updates = [];
  const ProductModel = {
    updateOne: async (...args) => {
      updates.push(args[1]);
      call += 1;
      return { modifiedCount: call === 2 ? 0 : 1 };
    }
  };
  const reservations = [
    { productId: PRODUCT_ID, colorVariantId: COLOR_ID, lensOptionId: null, quantity: 1, index: 0 },
    { productId: PRODUCT_ID, colorVariantId: '64b000000000000000000009', lensOptionId: null, quantity: 1, index: 1 }
  ];

  await assert.rejects(() => _test.reserveInventory(reservations, ProductModel), /no longer has enough stock/);
  assert.equal(updates.length, 3);
  assert.equal(updates[2].$inc['colors.$[color].stock'], 1);
});
