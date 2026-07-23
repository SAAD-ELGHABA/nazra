const assert = require("node:assert/strict");
const test = require("node:test");
const {
  calculateLineTotal,
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
  assert.equal(serialized.total, 300);
  assert.equal(serialized.currency, "MAD");
  assert.deepEqual(serialized.allowedTransitions, ["processing", "cancelled"]);
});
