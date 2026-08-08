const mongoose = require("mongoose");
const { isValidInternationalPhone } = require("../utils/moroccanPhone");

const orderSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    // Optional: cash on delivery is settled by phone, and requiring an address
    // the customer may not have is pure friction on a mobile COD checkout.
    email: {
      type: String,
      required: false,
      default: null,
      trim: true,
      maxlength: 254,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      // Stored canonicalised to E.164 by the controller; the validator is the
      // backstop for anything written outside that path.
      validate: {
        validator: (value) => isValidInternationalPhone(value),
        message: "phone must be a valid Moroccan or international number",
      },
    },
    adresse: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    // Drives the courier zone. Required for fulfilment even though the flat
    // delivery fee does not vary by city.
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
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
        currency: {
          type: String,
          enum: ["MAD"],
          default: "MAD",
        },
        productName: {
          type: String,
          trim: true,
          maxlength: 150,
        },
        productSlug: {
          type: String,
          trim: true,
          maxlength: 200,
        },
        imageUrl: {
          type: String,
          trim: true,
          maxlength: 2048,
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
    // Short human-readable reference. Customers were previously read a raw
    // 24-character ObjectId over the phone, which is unusable.
    orderNumber: {
      type: String,
      trim: true,
      maxlength: 20,
      default: null,
    },
    // Whether the confirmation and admin notification actually went out. An
    // order whose admin notification failed is one nobody knows to fulfil, so
    // it has to be visible rather than only logged.
    emailStatus: {
      customer: {
        type: String,
        enum: ["sent", "failed", "skipped"],
        default: "skipped",
      },
      admin: {
        type: String,
        enum: ["sent", "failed", "skipped"],
        default: "skipped",
      },
    },
    // Snapshot of what this customer was actually charged for delivery.
    // Persisted so changing the fee later never rewrites past orders.
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
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
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ email: 1, createdAt: -1 });
// Sparse: orders placed before order numbers existed have none.
orderSchema.index({ orderNumber: 1 }, { unique: true, sparse: true });
// Phone is the primary way a COD customer is identified on a support call.
orderSchema.index({ phone: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
