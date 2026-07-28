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
router.get("/action-center", requirePermission("dashboard.view"), adminController.getActionCenterSummary);
router.get("/inventory", requirePermission("inventory.read"), adminController.getInventory);
router.get("/customers", requirePermission("customers.read"), adminController.getCustomers);
router.get("/contacts", requirePermission("contacts.read"), adminController.getContacts);
router.patch("/contacts/:id/status", requirePermission("contacts.manage"), adminController.updateContact);
router.get("/reviews", requirePermission("reviews.read"), adminController.getReviews);
router.patch("/reviews/:id/moderation", requirePermission("reviews.manage"), adminController.updateReview);
router.get("/activity-logs", requirePermission("activity.read"), adminController.getActivityLogs);
router.get("/settings", requirePermission("settings.read"), adminController.getAdminSettings);
router.patch("/settings", requirePermission("settings.manage"), adminController.patchAdminSettings);
router.get("/exports", requirePermission("dashboard.view"), adminController.getExports);
router.post("/exports", requirePermission("dashboard.view"), adminController.createAdminExport);
router.get("/exports/:id/download", requirePermission("dashboard.view"), adminController.downloadAdminExport);
router.get("/notifications", requirePermission("dashboard.view"), adminController.getNotifications);
router.patch("/notifications/:id/read", requirePermission("dashboard.view"), adminController.markNotification);
router.get("/saved-views", requirePermission("dashboard.view"), adminController.getSavedViews);
router.post("/saved-views", requirePermission("dashboard.view"), adminController.createView);
router.get("/search", requirePermission("dashboard.view"), adminController.searchAdmin);

module.exports = router;
