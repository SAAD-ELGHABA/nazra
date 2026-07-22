const mongoose = require("mongoose");
const validator = require("validator");

const emailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      validate: {
        validator: (value) => validator.isEmail(value, {
          allow_utf8_local_part: false,
          require_tld: true,
          ignore_max_length: false,
        }),
        message: "Please provide a valid email address",
      },
    },
  },
  { timestamps: true }
);

emailSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("Email", emailSchema);
