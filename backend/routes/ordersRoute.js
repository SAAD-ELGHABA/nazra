const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const orderController = require("../controllers/orderController");

const ORDER_RATE_WINDOW_MS = 60 * 1000;
const ORDER_RATE_MAX = 10;
const orderRateBuckets = new Map();

const orderCreationRateLimit = (req, res, next) => {
  const now = Date.now();
  const key = String(req.ip || req.socket?.remoteAddress || "unknown");
  let bucket = orderRateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) bucket = { count: 0, resetAt: now + ORDER_RATE_WINDOW_MS };
  bucket.count += 1;
  orderRateBuckets.set(key, bucket);

  const remaining = Math.max(0, ORDER_RATE_MAX - bucket.count);
  const resetSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  res.set("RateLimit-Limit", String(ORDER_RATE_MAX));
  res.set("RateLimit-Remaining", String(remaining));
  res.set("RateLimit-Reset", String(resetSeconds));
  if (bucket.count > ORDER_RATE_MAX) {
    res.set("Retry-After", String(resetSeconds));
    return res.status(429).json({ success: false, message: "Too many order attempts. Please try again shortly." });
  }

  if (orderRateBuckets.size > 1000) {
    for (const [bucketKey, value] of orderRateBuckets) {
      if (value.resetAt <= now) orderRateBuckets.delete(bucketKey);
    }
  }
  return next();
};

// Create new order
router.post("/create/", orderCreationRateLimit, orderController.createOrder);

// Get all orders
router.get("/", auth, orderController.getOrders);

// Get single order
router.get("/:id", auth, orderController.getOrderById);

// update order's status
router.post("/update-order-status/:orderId", auth, orderController.updateOrderStatus);

router._test = {
  ORDER_RATE_MAX,
  ORDER_RATE_WINDOW_MS,
  orderCreationRateLimit,
  orderRateBuckets
};

module.exports = router;
