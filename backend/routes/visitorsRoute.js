const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const visitorController = require("../controllers/visitorController");
const productViewController = require("../controllers/productViewController");

// tracking (toggle) a new visitor
router.post("/track-visit/:visitorId", visitorController.ToggleVisitor);

// get all visitors
router.get('/', auth, requirePermission("analytics.read"), visitorController.getVisitors);

// track view per product
router.post('/view-product',productViewController.trackProductView);

module.exports = router;
