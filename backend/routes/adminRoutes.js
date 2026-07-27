const express = require("express");
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const adminController = require("../controllers/adminController");

const router = express.Router();

router.use(auth);
router.get(
  "/dashboard/summary",
  requirePermission("dashboard.view", "analytics.read"),
  adminController.getDashboardSummary
);
router.get("/orders", requirePermission("orders.read"), adminController.getOrders);
router.get("/products", requirePermission("products.read"), adminController.getProducts);
router.get("/subscribers", requirePermission("subscribers.read"), adminController.getSubscribers);
router.get("/blog", requirePermission("blog.manage"), adminController.getBlogs);
router.get("/analytics/visitors", requirePermission("analytics.read"), adminController.getVisitorAnalytics);

module.exports = router;
