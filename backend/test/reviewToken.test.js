const assert = require("node:assert/strict");
const test = require("node:test");

process.env.REVIEW_TOKEN_PEPPER = process.env.REVIEW_TOKEN_PEPPER
  || "test-review-token-pepper-at-least-32-characters";

const {
  REVIEW_TOKEN_TTL_MS,
  ReviewTokenError,
  createReviewToken,
  verifyReviewToken
} = require("../utils/reviewToken");
const { toDisplayName } = require("../services/reviewSubmissionService");

const ORDER_ID = "64b000000000000000000001";

test("a freshly issued token verifies back to its order", () => {
  assert.equal(verifyReviewToken(createReviewToken(ORDER_ID)), ORDER_ID);
});

test("refuses to issue a token for anything that is not an order id", () => {
  ["", "not-an-id", "64b00000000000000000000", null, undefined].forEach((value) => {
    assert.throws(() => createReviewToken(value), ReviewTokenError);
  });
});

test("a tampered payload does not verify", () => {
  const token = createReviewToken(ORDER_ID);
  const [payload, signature] = token.split(".");

  // Re-point the token at a different order, keeping the original signature.
  const forgedPayload = Buffer.from(
    JSON.stringify({ o: "64b000000000000000000999", e: Date.now() + REVIEW_TOKEN_TTL_MS }),
    "utf8"
  ).toString("base64url");

  assert.throws(() => verifyReviewToken(`${forgedPayload}.${signature}`), /Invalid review link/);
  assert.throws(() => verifyReviewToken(`${payload}.${signature}x`), /Invalid review link/);
  assert.throws(() => verifyReviewToken(payload), /Invalid review link/);
});

test("a token signed with a different secret does not verify", () => {
  const original = process.env.REVIEW_TOKEN_PEPPER;
  const token = createReviewToken(ORDER_ID);
  process.env.REVIEW_TOKEN_PEPPER = "a-completely-different-pepper-of-sufficient-length";
  try {
    assert.throws(() => verifyReviewToken(token), /Invalid review link/);
  } finally {
    process.env.REVIEW_TOKEN_PEPPER = original;
  }
});

test("an expired token is rejected", () => {
  const token = createReviewToken(ORDER_ID, { now: Date.now() - REVIEW_TOKEN_TTL_MS - 1000 });
  assert.throws(() => verifyReviewToken(token), /expired/);
});

test("garbage input is rejected without throwing anything unexpected", () => {
  ["", "...", "a.b", null, undefined, 12345, "x".repeat(600)].forEach((value) => {
    assert.throws(() => verifyReviewToken(value), ReviewTokenError);
  });
});

test("only a first name and an initial are published", () => {
  assert.equal(toDisplayName("Yassine El Amrani"), "Yassine A.");
  assert.equal(toDisplayName("  Salma   Rachidi "), "Salma R.");
  assert.equal(toDisplayName("Mehdi"), "Mehdi");
  assert.equal(toDisplayName(""), "Client");
  assert.equal(toDisplayName(null), "Client");
});
