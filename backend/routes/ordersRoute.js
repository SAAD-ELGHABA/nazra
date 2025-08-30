const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const orderController = require("../controllers/orderController");

// Create new order
router.post("/create/", orderController.createOrder);

// Get all orders
router.get("/", auth, orderController.getOrders);

// Get single order
router.get("/:id", auth, orderController.getOrderById);

// update order's status
router.post("/update-order-status/:orderId", auth, orderController.updateOrderStatus);

module.exports = router;