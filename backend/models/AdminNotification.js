const mongoose = require("mongoose");

const adminNotificationSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true, maxlength: 80, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    href: { type: String, trim: true, maxlength: 300, default: "" },
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "info",
      index: true
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

adminNotificationSchema.index({ createdAt: -1, _id: -1 });

module.exports = mongoose.model("AdminNotification", adminNotificationSchema);
