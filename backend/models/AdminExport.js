const mongoose = require("mongoose");

const adminExportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["orders", "customers", "subscribers", "products"],
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["ready", "failed"],
      default: "ready",
      index: true
    },
    filename: { type: String, required: true, trim: true, maxlength: 220 },
    mimeType: { type: String, default: "text/csv", trim: true, maxlength: 120 },
    filters: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }
  },
  { timestamps: true }
);

adminExportSchema.index({ createdAt: -1, _id: -1 });

module.exports = mongoose.model("AdminExport", adminExportSchema);
