const assert = require("node:assert/strict");
const test = require("node:test");
const {
  calculateLineTotal,
  calculateOrderDeliveryFee,
  calculateOrderSubtotal,
  calculateOrderTotal,
  serializeOrder
} = require("../utils/orderTotals");

test("order totals use saved unitPrice snapshots, not current catalog prices", () => {
  const order = {
    status: "processing",
    products: [
      { quantity: 2, unitPrice: 249, product: { sale_price: 9999 } },
      { quantity: 1, unitPrice: 199, product: null }
    ]
  };

  assert.equal(calculateLineTotal(order.products[0]), 498);
  assert.equal(calculateOrderTotal(order), 697);
});

test("serialized orders include totals, MAD currency, and allowed transitions", () => {
  const order = {
    _id: "order-id",
    status: "pending",
    products: [{ quantity: 3, unitPrice: 100 }]
  };
  const serialized = serializeOrder(order, {
    pending: new Set(["processing", "cancelled"])
  });

  assert.equal(serialized.subtotal, 300);
  assert.equal(serialized.deliveryFee, 0);
  assert.equal(serialized.total, 300);
  assert.equal(serialized.currency, "MAD");
  assert.deepEqual(serialized.allowedTransitions, ["processing", "cancelled"]);
});

test("the total the customer pays includes the delivery fee snapshot", () => {
  const order = {
    status: "pending",
    deliveryFee: 30,
    products: [{ quantity: 2, unitPrice: 129 }]
  };

  assert.equal(calculateOrderSubtotal(order), 258);
  assert.equal(calculateOrderDeliveryFee(order), 30);
  assert.equal(calculateOrderTotal(order), 288);

  const serialized = serializeOrder(order, {});
  assert.equal(serialized.subtotal, 258);
  assert.equal(serialized.deliveryFee, 30);
  assert.equal(serialized.total, 288);
});

test("orders predating the delivery fee report zero rather than NaN", () => {
  const legacyOrder = { status: "delivered", products: [{ quantity: 1, unitPrice: 199 }] };

  assert.equal(calculateOrderDeliveryFee(legacyOrder), 0);
  assert.equal(calculateOrderTotal(legacyOrder), 199);
  assert.equal(calculateOrderDeliveryFee({ ...legacyOrder, deliveryFee: "nonsense" }), 0);
  assert.equal(calculateOrderDeliveryFee({ ...legacyOrder, deliveryFee: -50 }), 0);
});

test("delivery is passed through to the courier, so it is not counted as revenue", () => {
  // The admin dashboard sums subtotals; if it ever switched to total, delivery
  // would silently inflate reported sales.
  const order = { status: "delivered", deliveryFee: 30, products: [{ quantity: 1, unitPrice: 129 }] };

  assert.equal(calculateOrderSubtotal(order), 129);
  assert.notEqual(calculateOrderSubtotal(order), calculateOrderTotal(order));
});
