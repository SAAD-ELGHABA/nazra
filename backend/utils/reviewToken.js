const crypto = require("node:crypto");

/**
 * Signed, stateless invitations to review a delivered order.
 *
 * Customers are guests — cash on delivery means there is no account to log
 * into — so proof of purchase cannot come from a session. It comes from this
 * token instead: it is issued only when an order is marked delivered, and it
 * names the exact order it was issued for.
 *
 * Stateless by design. There is no challenge document to expire or clean up;
 * the signature and the embedded expiry carry everything. Single-use is
 * enforced where it actually matters — the unique (order, product) index on
 * Review — so a re-used link can never produce a second review for the same
 * item.
 */

class ReviewTokenError extends Error {}

/** Long enough for a customer to get round to it, short enough to lapse. */
const REVIEW_TOKEN_TTL_MS = 60 * 24 * 60 * 60 * 1000;

const requiredSecret = () => {
  // Falls back to JWT_SECRET so the feature works on existing deployments
  // without a new variable, while allowing an independent one to be set.
  const value = process.env.REVIEW_TOKEN_PEPPER || process.env.JWT_SECRET;
  if (typeof value !== "string" || value.length < 32) {
    throw new ReviewTokenError("REVIEW_TOKEN_PEPPER is not configured securely");
  }
  return value;
};

const base64UrlEncode = (input) => Buffer.from(input, "utf8").toString("base64url");
const base64UrlDecode = (input) => Buffer.from(input, "base64url").toString("utf8");

const sign = (payload) => crypto
  .createHmac("sha256", requiredSecret())
  .update(payload)
  .digest("base64url");

/**
 * `<payload>.<signature>` where payload is base64url JSON of the order id and
 * expiry. The order id is not a secret — the signature is what makes the token
 * unforgeable.
 */
const createReviewToken = (orderId, { now = Date.now(), ttlMs = REVIEW_TOKEN_TTL_MS } = {}) => {
  const id = String(orderId || "");
  if (!/^[a-f\d]{24}$/i.test(id)) throw new ReviewTokenError("A valid order id is required");

  const payload = base64UrlEncode(JSON.stringify({ o: id, e: now + ttlMs }));
  return `${payload}.${sign(payload)}`;
};

/**
 * Returns the order id, or throws. Signature is compared in constant time so
 * the check cannot be used as an oracle for guessing valid tokens.
 */
const verifyReviewToken = (token, { now = Date.now() } = {}) => {
  if (typeof token !== "string" || token.length > 512) {
    throw new ReviewTokenError("Invalid review link");
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) throw new ReviewTokenError("Invalid review link");

  const expected = sign(payload);
  const provided = Buffer.from(signature);
  const computed = Buffer.from(expected);
  if (provided.length !== computed.length || !crypto.timingSafeEqual(provided, computed)) {
    throw new ReviewTokenError("Invalid review link");
  }

  let decoded;
  try {
    decoded = JSON.parse(base64UrlDecode(payload));
  } catch {
    throw new ReviewTokenError("Invalid review link");
  }

  if (!decoded || !/^[a-f\d]{24}$/i.test(String(decoded.o || ""))) {
    throw new ReviewTokenError("Invalid review link");
  }
  if (!Number.isFinite(decoded.e) || decoded.e <= now) {
    throw new ReviewTokenError("This review link has expired");
  }

  return String(decoded.o);
};

module.exports = {
  REVIEW_TOKEN_TTL_MS,
  ReviewTokenError,
  createReviewToken,
  verifyReviewToken,
};
