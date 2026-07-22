const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 254 },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "superadmin"], default: "admin" },
    authVersion: { type: Number, default: 0, min: 0, select: false }
  },
//   { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const configuredRounds = Number(process.env.BCRYPT_ROUNDS || 12);
  if (!Number.isInteger(configuredRounds) || configuredRounds < 10 || configuredRounds > 14) {
    throw new Error("BCRYPT_ROUNDS must be an integer between 10 and 14");
  }

  if (!this.isNew) {
    this.authVersion = Number.isSafeInteger(this.authVersion) ? this.authVersion + 1 : 1;
  }
  this.password = await bcrypt.hash(this.password, configuredRounds);
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
