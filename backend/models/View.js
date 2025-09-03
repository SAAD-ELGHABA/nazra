const mongoose = require("mongoose");

const viewSchema = new mongoose.Schema({
  ipAddress: { type: String, required: true },
  date: { type: String, required: true }
}, { timestamps: true });

viewSchema.index({ ipAddress: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Visitor", viewSchema); 

