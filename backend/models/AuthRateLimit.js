const mongoose = require("mongoose");

const authRateLimitSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  scope: { type: String, required: true },
  count: { type: Number, default: 0, min: 0 },
  windowEndsAt: { type: Date, default: null },
  nextAllowedAt: { type: Date, default: null },
  expiresAt: { type: Date, required: true }
}, { versionKey: false });

authRateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("AuthRateLimit", authRateLimitSchema);
