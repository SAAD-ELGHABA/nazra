const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },
    actorName: { type: String, trim: true, maxlength: 150, default: "" },
    actorRole: { type: String, trim: true, maxlength: 50, default: "" },
    action: { type: String, required: true, trim: true, maxlength: 120, index: true },
    targetType: { type: String, required: true, trim: true, maxlength: 80, index: true },
    targetId: { type: String, trim: true, maxlength: 150, default: "" },
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "info",
      index: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    requestId: { type: String, trim: true, maxlength: 120, default: "" }
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1, _id: -1 });
activityLogSchema.index({ targetType: 1, createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
