const crypto = require("node:crypto");
const express = require("express");
const connectDB = require("../lib/mongodb");
const contactController = require("../controllers/contactController");

const router = express.Router();
const CONTACT_BODY_LIMIT = "16kb";
const CONTACT_RATE_WINDOW_MS = 15 * 60 * 1000;
const CONTACT_RATE_MAX = 5;
const CONTACT_COOLDOWN_MS = 10 * 1000;
const RATE_KEY_SECRET = crypto.randomBytes(32);
const rateBuckets = new Map();

const clientKey = (req) => crypto
  .createHmac("sha256", RATE_KEY_SECRET)
  .update(String(req.ip || req.socket?.remoteAddress || "unknown"))
  .digest("hex");

const contactRateLimit = (req, res, next) => {
  const now = Date.now();
  const key = clientKey(req);
  let bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + CONTACT_RATE_WINDOW_MS, lastAttemptAt: 0 };
  }

  const cooldownRemaining = CONTACT_COOLDOWN_MS - (now - bucket.lastAttemptAt);
  if (bucket.lastAttemptAt && cooldownRemaining > 0) {
    const retryAfter = Math.max(1, Math.ceil(cooldownRemaining / 1000));
    res.set("Retry-After", String(retryAfter));
    return res.status(429).json({
      success: false,
      message: "Please wait briefly before sending another message."
    });
  }

  bucket.count += 1;
  bucket.lastAttemptAt = now;
  rateBuckets.set(key, bucket);

  const remaining = Math.max(0, CONTACT_RATE_MAX - bucket.count);
  const resetSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  res.set("RateLimit-Limit", String(CONTACT_RATE_MAX));
  res.set("RateLimit-Remaining", String(remaining));
  res.set("RateLimit-Reset", String(resetSeconds));

  if (bucket.count > CONTACT_RATE_MAX) {
    res.set("Retry-After", String(resetSeconds));
    return res.status(429).json({
      success: false,
      message: "Too many contact attempts. Please try again later."
    });
  }

  if (rateBuckets.size > 1000) {
    for (const [bucketKey, value] of rateBuckets) {
      if (value.resetAt <= now) rateBuckets.delete(bucketKey);
    }
  }
  return next();
};

const ensureContactDatabase = async (_req, res, next) => {
  try {
    await connectDB();
    return next();
  } catch (_error) {
    return res.status(503).json({
      success: false,
      message: "Contact service is temporarily unavailable."
    });
  }
};

router.use(express.json({ limit: CONTACT_BODY_LIMIT, strict: true }));
router.post("/", contactRateLimit, ensureContactDatabase, contactController.createContactMessage);
router.all("/", (_req, res) => res.status(405).json({
  success: false,
  message: "Method not allowed."
}));
router.use((_req, res) => res.status(404).json({ success: false, message: "Not found." }));
router.use((error, _req, res, _next) => {
  if (error?.type === "entity.too.large") {
    return res.status(413).json({ success: false, message: "Contact request is too large." });
  }
  if (error instanceof SyntaxError || error?.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Request body must contain valid JSON." });
  }
  console.error("Contact route request parsing failed");
  return res.status(400).json({ success: false, message: "Invalid contact request." });
});

router._test = {
  CONTACT_RATE_MAX,
  CONTACT_RATE_WINDOW_MS,
  CONTACT_COOLDOWN_MS,
  contactRateLimit,
  rateBuckets
};

module.exports = router;
