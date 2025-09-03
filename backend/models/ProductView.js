const mongoose = require("mongoose");

const productViewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  ipAddress: { type: String, required: true },
  date: { type: String, required: true }
}, { timestamps: true });

productViewSchema.index({ productId: 1, ipAddress: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("ProductView", productViewSchema);
