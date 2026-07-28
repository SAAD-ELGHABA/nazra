const mongoose = require("mongoose");

const savedViewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    page: { type: String, required: true, trim: true, maxlength: 120, index: true },
    filters: { type: mongoose.Schema.Types.Mixed, default: {} },
    sort: { type: String, trim: true, maxlength: 80, default: "" },
    visibility: {
      type: String,
      enum: ["private", "team"],
      default: "private",
      index: true
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }
  },
  { timestamps: true }
);

savedViewSchema.index({ owner: 1, page: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("SavedView", savedViewSchema);
