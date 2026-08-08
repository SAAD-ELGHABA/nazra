const validator = require("validator");
const { CONTACT_SUBJECTS } = require("../models/ContactMessage");
const { submitContactMessage } = require("../services/contactService");
const { normalizePhone } = require("../utils/moroccanPhone");

const ALLOWED_FIELDS = new Set(["name", "email", "phone", "subject", "message", "website"]);
const SUBJECT_SET = new Set(CONTACT_SUBJECTS);
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const SUCCESS_RESPONSE = Object.freeze({
  success: true,
  message: "Your message has been received."
});

class ContactValidationError extends Error {
  constructor(errors) {
    super("Please correct the highlighted fields.");
    this.name = "ContactValidationError";
    this.errors = errors;
  }
}

const isPlainObject = (value) => Boolean(
  value
  && typeof value === "object"
  && !Array.isArray(value)
  && Object.getPrototypeOf(value) === Object.prototype
);

const normalizeSingleLine = (value) => value.normalize("NFKC").trim().replace(/\s+/g, " ");
const normalizeMessage = (value) => value.normalize("NFKC").replace(/\r\n?/g, "\n").trim();

const validateContactPayload = (body) => {
  if (!isPlainObject(body)) {
    throw new ContactValidationError({ body: "Request body must be a JSON object." });
  }

  const errors = {};
  const unknownFields = Object.keys(body).filter((key) => !ALLOWED_FIELDS.has(key));
  if (unknownFields.length) {
    errors.body = `Unknown field${unknownFields.length > 1 ? "s" : ""}: ${unknownFields.join(", ")}.`;
  }

  const website = typeof body.website === "string" ? normalizeSingleLine(body.website) : "";
  if (body.website !== undefined && typeof body.website !== "string") {
    errors.website = "Website must be a string.";
  }

  if (Object.keys(errors).length) throw new ContactValidationError(errors);
  if (website) return { isSpam: true, contactData: null };

  const name = typeof body.name === "string" ? normalizeSingleLine(body.name) : "";
  if (!name || name.length < 2 || name.length > 100 || CONTROL_CHARACTERS.test(name)) {
    errors.name = "Name must contain between 2 and 100 characters.";
  }

  const email = typeof body.email === "string" ? normalizeSingleLine(body.email).toLowerCase() : "";
  if (
    !email
    || email.length > 254
    || CONTROL_CHARACTERS.test(email)
    || !validator.isEmail(email, {
      allow_utf8_local_part: false,
      require_tld: true,
      ignore_max_length: false
    })
  ) {
    errors.email = "Please provide a valid email address.";
  }

  let phone = null;
  if (body.phone !== undefined && body.phone !== null && body.phone !== "") {
    if (typeof body.phone !== "string" || body.phone.length > 30 || CONTROL_CHARACTERS.test(body.phone)) {
      errors.phone = "Please provide a valid phone number.";
    } else {
      phone = normalizePhone(body.phone);
      if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
        errors.phone = "Please provide a valid Moroccan or international phone number.";
      }
    }
  }

  const subject = typeof body.subject === "string" ? normalizeSingleLine(body.subject).toLowerCase() : "";
  if (!SUBJECT_SET.has(subject)) {
    errors.subject = "Please select a valid subject.";
  }

  const message = typeof body.message === "string" ? normalizeMessage(body.message) : "";
  if (!message || message.length < 10 || message.length > 3000 || CONTROL_CHARACTERS.test(message)) {
    errors.message = "Message must contain between 10 and 3000 characters.";
  }

  if (Object.keys(errors).length) throw new ContactValidationError(errors);

  return {
    isSpam: false,
    contactData: { name, email, phone, subject, message }
  };
};

const createContactMessage = async (req, res) => {
  try {
    if (Object.keys(req.query || {}).length) {
      throw new ContactValidationError({ query: "Query parameters are not supported." });
    }
    const validated = validateContactPayload(req.body);
    if (validated.isSpam) return res.status(201).json(SUCCESS_RESPONSE);

    await submitContactMessage(validated.contactData);
    return res.status(201).json(SUCCESS_RESPONSE);
  } catch (error) {
    if (error instanceof ContactValidationError || error?.name === "ValidationError") {
      const errors = error instanceof ContactValidationError
        ? error.errors
        : { body: "Please check the submitted information." };
      return res.status(400).json({
        success: false,
        message: error instanceof ContactValidationError
          ? error.message
          : "Please check the submitted information.",
        errors
      });
    }

    console.error("Contact message submission failed");
    return res.status(500).json({
      success: false,
      message: "We could not send your message. Please try again later."
    });
  }
};

module.exports = {
  createContactMessage,
  _test: {
    ALLOWED_FIELDS,
    ContactValidationError,
    normalizePhone,
    validateContactPayload
  }
};
