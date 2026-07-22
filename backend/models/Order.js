const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      maxlength: 254,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    adresse: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          max: 100,
          validate: Number.isInteger,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        color: {
          type: String, 
          required: false,
          trim: true,
          maxlength: 100,
        },
        colorVariantId: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
        },
        lensOptionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
        },
        lensType: {
          type: String,
          trim: true,
          maxlength: 50,
        },
        lensCategory: {
          type: Number,
          min: 0,
          max: 4,
        },
        sku: {
          type: String,
          trim: true,
          maxlength: 100,
        },
        inventorySource: {
          type: String,
          enum: ["none", "color", "lens"],
          default: "none",
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    idempotencyKeyHash: {
      type: String,
      select: false,
      maxlength: 64,
    },
    inventoryRestoredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_document, returned) => {
        delete returned.idempotencyKeyHash;
        return returned;
      }
    }
  }
);

orderSchema.path("products").validate(
  (products) => Array.isArray(products) && products.length > 0 && products.length <= 50,
  "Order must contain between 1 and 50 products"
);

orderSchema.index({ status: 1, "products.product": 1 });
orderSchema.index({ idempotencyKeyHash: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Order", orderSchema);
