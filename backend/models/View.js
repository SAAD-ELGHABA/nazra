const mongoose = require("mongoose");

const viewSchema = new mongoose.Schema({
  referrer: { type: String, default: "direct", maxlength: 2048 },
  userAgent: { type: String, maxlength: 1024 },
  // Legacy field name retained for compatibility. This stores the storefront's
  // pseudonymous first-party visitor identifier, not a network IP address.
  ipAddress: { type: String, required: true, maxlength: 200 },
  date: { type: String, required: true },
  visitCount: { type: Number, min: 1 },
  lastVisit: { type: Date, default: Date.now }
}, { timestamps: true });

viewSchema.index({ ipAddress: 1, date: 1 }, { unique: true });
viewSchema.index({ createdAt: 1 });

module.exports = mongoose.model("Visitor", viewSchema); 
