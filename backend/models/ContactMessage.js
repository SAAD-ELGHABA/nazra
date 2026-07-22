const mongoose = require("mongoose");
const validator = require("validator");

const CONTACT_SUBJECTS = Object.freeze([
  "order",
  "shipping",
  "returns",
  "product",
  "payment",
  "partnership",
  "press",
  "other"
]);

const CONTACT_STATUSES = Object.freeze(["new", "read", "replied", "archived"]);
const NOTIFICATION_STATUSES = Object.freeze(["pending", "sent", "failed", "skipped"]);

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
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
          ignore_max_length: false
        }),
        message: "Email address is invalid"
      }
    },
    phone: {
      type: String,
      default: null,
      maxlength: 16
    },
    subject: {
      type: String,
      required: true,
      enum: CONTACT_SUBJECTS
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 3000
    },
    status: {
      type: String,
      enum: CONTACT_STATUSES,
      default: "new"
    },
    source: {
      type: String,
      enum: ["contact_page"],
      default: "contact_page",
      immutable: true
    },
    emailNotificationStatus: {
      type: String,
      enum: NOTIFICATION_STATUSES,
      default: "pending"
    },
    emailNotificationAttemptedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ subject: 1, createdAt: -1 });

const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);

module.exports = ContactMessage;
module.exports.CONTACT_SUBJECTS = CONTACT_SUBJECTS;
module.exports.CONTACT_STATUSES = CONTACT_STATUSES;

