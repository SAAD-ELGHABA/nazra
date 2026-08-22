const mongoose = require("mongoose");

// Formats the library accepts. SVG is deliberately absent: Cloudinary serves it
// unmodified, and these URLs are delivered from a public CDN.
const MEDIA_FORMATS = ["jpg", "jpeg", "png", "webp", "avif", "gif"];

const mediaSchema = new mongoose.Schema(
  {
    // Full Cloudinary public id, including the "media-library/" prefix.
    publicId: { type: String, required: true, trim: true, maxlength: 500, unique: true },
    // secure_url as reported by Cloudinary. Never client-supplied, never updated.
    url: { type: String, required: true, trim: true, maxlength: 2048 },
    format: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 10,
      enum: MEDIA_FORMATS,
      index: true
    },
    bytes: { type: Number, required: true, min: 0 },
    width: { type: Number, default: 0, min: 0 },
    height: { type: Number, default: 0, min: 0 },
    // The upload public id is random, so this is the only human-readable handle.
    originalFilename: { type: String, trim: true, maxlength: 200, default: "" },
    alt: { type: String, trim: true, maxlength: 300, default: "" },
    // A DB-side label, not part of the Cloudinary path, so moving an asset
    // between folders never changes its URL. Root is the literal "/".
    folder: { type: String, required: true, trim: true, maxlength: 200, default: "/", index: true },
    tags: { type: [String], default: [] },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }
  },
  { timestamps: true }
);

mediaSchema.index({ folder: 1, createdAt: -1, _id: -1 });
mediaSchema.index({ tags: 1, createdAt: -1, _id: -1 });
mediaSchema.index({ createdAt: -1, _id: -1 });

module.exports = mongoose.model("Media", mediaSchema);
module.exports.MEDIA_FORMATS = MEDIA_FORMATS;
