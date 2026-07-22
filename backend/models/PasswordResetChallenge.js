const mongoose = require("mongoose");

const passwordResetChallengeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  emailNormalized: { type: String, required: true, lowercase: true, trim: true },
  codeHash: { type: String, required: true, select: false },
  expiresAt: { type: Date, required: true },
  failedAttempts: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true },
  sentAt: { type: Date, default: null },
  consumedAt: { type: Date, default: null },
  invalidatedAt: { type: Date, default: null }
}, { timestamps: true });

passwordResetChallengeSchema.index(
  { emailNormalized: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);
passwordResetChallengeSchema.index({ user: 1, active: 1 });
passwordResetChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("PasswordResetChallenge", passwordResetChallengeSchema);
