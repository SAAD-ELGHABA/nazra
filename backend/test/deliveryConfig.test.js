const assert = require("node:assert/strict");
const test = require("node:test");
const { calculateDeliveryFee } = require("../config/delivery");

const withEnv = (values, run) => {
  const previous = {};
  Object.entries(values).forEach(([key, value]) => {
    previous[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  });
  try {
    run();
  } finally {
    Object.entries(previous).forEach(([key, value]) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  }
};

test("delivery is free when no fee is configured", () => {
  withEnv({ DELIVERY_FEE_MAD: undefined, DELIVERY_FREE_THRESHOLD_MAD: undefined }, () => {
    assert.equal(calculateDeliveryFee(258), 0);
  });
});

test("a configured flat fee applies to any non-empty order", () => {
  withEnv({ DELIVERY_FEE_MAD: "30", DELIVERY_FREE_THRESHOLD_MAD: undefined }, () => {
    assert.equal(calculateDeliveryFee(258), 30);
    assert.equal(calculateDeliveryFee(1), 30);
  });
});

test("an empty order is never charged for delivery", () => {
  withEnv({ DELIVERY_FEE_MAD: "30" }, () => {
    assert.equal(calculateDeliveryFee(0), 0);
    assert.equal(calculateDeliveryFee(-10), 0);
    assert.equal(calculateDeliveryFee("nonsense"), 0);
  });
});

test("the free-delivery threshold waives the fee at or above the limit", () => {
  withEnv({ DELIVERY_FEE_MAD: "30", DELIVERY_FREE_THRESHOLD_MAD: "500" }, () => {
    assert.equal(calculateDeliveryFee(499.99), 30);
    assert.equal(calculateDeliveryFee(500), 0);
    assert.equal(calculateDeliveryFee(600), 0);
  });
});

test("a malformed fee falls back to free rather than inventing a charge", () => {
  withEnv({ DELIVERY_FEE_MAD: "not-a-number" }, () => {
    assert.equal(calculateDeliveryFee(258), 0);
  });
  withEnv({ DELIVERY_FEE_MAD: "-30" }, () => {
    assert.equal(calculateDeliveryFee(258), 0);
  });
});
