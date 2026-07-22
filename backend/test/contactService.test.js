const test = require("node:test");
const assert = require("node:assert/strict");

const { submitContactMessage } = require("../services/contactService");
const { contactNotificationEmail } = require("../emails/contactNotificationEmail");

const contactData = {
  name: "Amal <script>alert(1)</script>",
  email: "amal@example.com",
  phone: "+212612345678",
  subject: "partnership",
  message: "Bonjour <img src=x onerror=alert(1)>, échangeons sur ce projet."
};

test("persists the inquiry before attempting email delivery", async () => {
  const events = [];
  const savedMessage = { _id: "message-id", ...contactData, createdAt: new Date("2026-07-22T10:00:00Z") };
  const ContactMessageModel = {
    async create(payload) {
      events.push("persist");
      assert.equal(payload.status, "new");
      assert.equal(payload.source, "contact_page");
      return savedMessage;
    },
    async updateOne(_query, update) {
      events.push(`status:${update.$set.emailNotificationStatus}`);
    }
  };
  const sendEmailFn = async (email) => {
    events.push("email");
    assert.equal(email.replyTo, contactData.email);
    assert.match(email.subject, /Partenariat/);
  };

  const result = await submitContactMessage(contactData, {
    ContactMessageModel,
    sendEmailFn,
    notificationRecipient: "contact@nazra.example"
  });

  assert.equal(result.notificationStatus, "sent");
  assert.deepEqual(events, ["persist", "email", "status:sent"]);
});

test("keeps a stored inquiry successful when email delivery fails", async () => {
  const updates = [];
  const logMessages = [];
  const originalConsoleError = console.error;
  const ContactMessageModel = {
    async create(payload) {
      return { _id: "message-id", ...payload, createdAt: new Date() };
    },
    async updateOne(_query, update) {
      updates.push(update.$set.emailNotificationStatus);
    }
  };

  let result;
  try {
    console.error = (...args) => logMessages.push(args.join(" "));
    result = await submitContactMessage(contactData, {
      ContactMessageModel,
      sendEmailFn: async () => { throw new Error("SMTP details that must not leak"); },
      notificationRecipient: "contact@nazra.example"
    });
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(result.notificationStatus, "failed");
  assert.deepEqual(updates, ["failed"]);
  assert.deepEqual(logMessages, ["Contact message stored but notification email delivery failed"]);
});

test("skips notification cleanly when no recipient is configured", async () => {
  let sent = false;
  let persisted;
  const ContactMessageModel = {
    async create(payload) {
      persisted = payload;
      return { _id: "message-id", ...payload };
    }
  };
  const result = await submitContactMessage(contactData, {
    ContactMessageModel,
    sendEmailFn: async () => { sent = true; },
    notificationRecipient: null
  });
  assert.equal(sent, false);
  assert.equal(persisted.emailNotificationStatus, "skipped");
  assert.equal(result.notificationStatus, "skipped");
});

test("escapes customer-controlled HTML in notification markup", () => {
  const email = contactNotificationEmail({ ...contactData, createdAt: new Date("2026-07-22T10:00:00Z") });
  assert.doesNotMatch(email.html, /<script>|<img/);
  assert.match(email.html, /&lt;script&gt;/);
  assert.match(email.html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(email.text, /<script>/);
});
