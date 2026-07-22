const test = require("node:test");
const assert = require("node:assert/strict");

const ContactMessage = require("../models/ContactMessage");
const { _test } = require("../controllers/contactController");

const validPayload = () => ({
  name: "  Amal   El Mansouri ",
  email: " AMAL@Example.com ",
  phone: "06 12 34 56 78",
  subject: "order",
  message: "  Bonjour, je souhaite obtenir des informations.  ",
  website: ""
});

test("normalizes a valid contact payload", () => {
  const result = _test.validateContactPayload(validPayload());
  assert.equal(result.isSpam, false);
  assert.deepEqual(result.contactData, {
    name: "Amal El Mansouri",
    email: "amal@example.com",
    phone: "+212612345678",
    subject: "order",
    message: "Bonjour, je souhaite obtenir des informations."
  });
});

test("accepts supported international phone numbers and optional phone", () => {
  const international = validPayload();
  international.phone = "+33 (0) 6 12 34 56 78";
  assert.equal(_test.validateContactPayload(international).contactData.phone, "+330612345678");

  const withoutPhone = validPayload();
  delete withoutPhone.phone;
  assert.equal(_test.validateContactPayload(withoutPhone).contactData.phone, null);
});

test("rejects unknown fields and returns field-addressable validation errors", () => {
  const payload = { ...validPayload(), admin: true };
  assert.throws(
    () => _test.validateContactPayload(payload),
    (error) => error.name === "ContactValidationError" && /Unknown field: admin/.test(error.errors.body)
  );
});

test("rejects invalid field values and unsupported subjects", () => {
  const payload = {
    name: "x",
    email: "not-an-email",
    phone: "123",
    subject: "refund",
    message: "short"
  };
  assert.throws(
    () => _test.validateContactPayload(payload),
    (error) => {
      assert.deepEqual(Object.keys(error.errors).sort(), ["email", "message", "name", "phone", "subject"]);
      return true;
    }
  );
});

test("recognizes a populated honeypot without processing customer fields", () => {
  const result = _test.validateContactPayload({ website: "https://spam.example" });
  assert.equal(result.isSpam, true);
  assert.equal(result.contactData, null);
});

test("contact model does not define IP address or user-agent fields", () => {
  assert.equal(ContactMessage.schema.path("ipAddress"), undefined);
  assert.equal(ContactMessage.schema.path("userAgent"), undefined);
  const document = new ContactMessage({
    name: "Amal El Mansouri",
    email: "amal@example.com",
    subject: "shipping",
    message: "Je souhaite suivre la livraison de ma commande."
  });
  assert.equal(document.validateSync(), undefined);
});

