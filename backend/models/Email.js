const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true, // not 'require'
    },
  },
  { timestamps: true }
);

emailSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("Email", emailSchema);
