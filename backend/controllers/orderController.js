// controllers/orderController.js
  const Order = require("../models/Order");
  const { sendEmail } = require("../utils/sendEmail");
  const { userOrderEmail } = require("../emails/userOrderEmail");
  const { adminOrderEmail } = require("../emails/adminOrderEmail");

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { products, customer } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No products provided",
      });
    }

    const order = new Order({
      products: products.map(p => ({
        product: p.product,
        quantity: p.quantity,
        color: p.color
      })),
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      adresse: customer.adresse,
    });

    await order.save();

    await sendEmail(customer.email, "Your Order Confirmation", userOrderEmail(order, customer));
    await sendEmail("admin@yourstore.com", "New Order Received", adminOrderEmail(order, customer));

    res.status(201).json({
      success: true,
      message: "Order created successfully and emails sent",
      order,
    });

  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("products.product");
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("products.product");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
