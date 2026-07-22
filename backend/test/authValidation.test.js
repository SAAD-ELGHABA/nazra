const test = require("node:test");
const assert = require("node:assert/strict");
const User = require("../models/User");
const PasswordResetChallenge = require("../models/PasswordResetChallenge");
const AuthRateLimit = require("../models/AuthRateLimit");
const { _test } = require("../controllers/authController");
const resetService = require("../services/passwordResetService");
const { passwordResetCodeEmail, _test: emailTemplateTest } = require("../emails/passwordResetCodeEmail");

test("normalizes auth email and accepts an eight-digit code as a string", () => {
  const parsed = _test.parseResetBody({
    email: " ADMIN@Example.com ",
    code: "00123456",
    password: "a secure passphrase",
    passwordConfirmation: "a secure passphrase"
  });
  assert.equal(parsed.email, "admin@example.com");
  assert.equal(parsed.code, "00123456");
});

test("rejects unknown reset fields and non-eight-digit codes", () => {
  assert.throws(
    () => _test.parseResetBody({
      email: "admin@example.com",
      code: "123456",
      password: "a secure passphrase",
      passwordConfirmation: "a secure passphrase",
      token: "unexpected"
    }),
    (error) => error instanceof _test.AuthValidationError && /Unknown field/.test(error.errors.body)
  );
  assert.throws(
    () => _test.parseResetBody({
      email: "admin@example.com",
      code: 12345678,
      password: "a secure passphrase",
      passwordConfirmation: "a secure passphrase"
    }),
    (error) => error instanceof _test.AuthValidationError && Boolean(error.errors.code)
  );
});

test("requires password confirmation to match exactly", () => {
  assert.throws(
    () => _test.parseResetBody({
      email: "admin@example.com",
      code: "12345678",
      password: "a secure passphrase",
      passwordConfirmation: "a different passphrase"
    }),
    (error) => error instanceof _test.AuthValidationError && Boolean(error.errors.passwordConfirmation)
  );
});

test("enforces password character and bcrypt byte boundaries", () => {
  assert.throws(() => _test.parseNewPassword("too-short"), _test.AuthValidationError);
  assert.equal(_test.parseNewPassword("abcdefghijkl"), "abcdefghijkl");
  assert.throws(() => _test.parseNewPassword("é".repeat(37)), _test.AuthValidationError);
  assert.throws(() => _test.parseNewPassword("😀".repeat(6)), _test.AuthValidationError);
  assert.equal(_test.parseNewPassword("😀".repeat(12)), "😀".repeat(12));
});

test("register parser allows only canonical administrator roles", () => {
  const parsed = _test.parseRegisterBody({
    name: "Site Admin",
    email: "site@example.com",
    password: "abcdefghijkl",
    role: "superadmin"
  });
  assert.equal(parsed.role, "superadmin");
  assert.throws(
    () => _test.parseRegisterBody({ ...parsed, role: "super-admin" }),
    _test.AuthValidationError
  );
});

test("reset codes and stored identifiers are HMAC-derived and fixed width", () => {
  const previousCodePepper = process.env.PASSWORD_RESET_CODE_PEPPER;
  const previousRatePepper = process.env.AUTH_RATE_LIMIT_PEPPER;
  process.env.PASSWORD_RESET_CODE_PEPPER = "c".repeat(32);
  process.env.AUTH_RATE_LIMIT_PEPPER = "r".repeat(32);
  try {
    for (let index = 0; index < 20; index += 1) {
      assert.match(resetService._test.generateResetCode(), /^\d{8}$/);
    }
    const challengeId = "507f1f77bcf86cd799439011";
    const code = "00123456";
    const codeHash = resetService._test.hashResetCode(challengeId, code);
    const rateHash = resetService._test.rateLimitKey("forgot-email", "admin@example.com", "1");
    assert.match(codeHash, /^[a-f0-9]{64}$/);
    assert.equal(codeHash.includes(code), false);
    assert.equal(rateHash.includes("admin@example.com"), false);
  } finally {
    if (previousCodePepper === undefined) delete process.env.PASSWORD_RESET_CODE_PEPPER;
    else process.env.PASSWORD_RESET_CODE_PEPPER = previousCodePepper;
    if (previousRatePepper === undefined) delete process.env.AUTH_RATE_LIMIT_PEPPER;
    else process.env.AUTH_RATE_LIMIT_PEPPER = previousRatePepper;
  }
});

test("auth schemas hide sensitive fields and declare reset TTL and active uniqueness", () => {
  assert.equal(User.schema.path("password").options.select, false);
  assert.equal(User.schema.path("authVersion").options.select, false);
  assert.deepEqual(User.schema.path("role").options.enum, ["admin", "superadmin"]);
  assert.equal(PasswordResetChallenge.schema.path("codeHash").options.select, false);
  assert.ok(PasswordResetChallenge.schema.indexes().some(([fields, options]) =>
    fields.expiresAt === 1 && options.expireAfterSeconds === 0));
  assert.ok(PasswordResetChallenge.schema.indexes().some(([fields, options]) =>
    fields.emailNormalized === 1 && options.unique === true && options.partialFilterExpression.active === true));
  assert.ok(AuthRateLimit.schema.indexes().some(([fields, options]) =>
    fields.expiresAt === 1 && options.expireAfterSeconds === 0));
});

test("password reset email HTML escapes user-controlled names", () => {
  const escaped = emailTemplateTest.escapeHtml('<img src=x onerror="bad">');
  assert.equal(escaped.includes("<img"), false);
  assert.match(escaped, /&lt;img/);
});

test("password reset email links to the reset page without sensitive URL parameters", () => {
  const email = passwordResetCodeEmail({
    name: "Administrator",
    code: "00123456",
    expiresInMinutes: 10,
    resetPageUrl: "https://nazra.store/reset-password"
  });
  assert.match(email.text, /https:\/\/nazra\.store\/reset-password/);
  assert.match(email.html, /href="https:\/\/nazra\.store\/reset-password"/);
  assert.equal(email.html.includes("?"), false);
});
