const express = require("express");
const router = express.Router();
const connectDB = require("../lib/mongodb");
const {
  ReviewValidationError,
  getReviewInvitation,
  submitReview
} = require("../services/reviewSubmissionService");
const { ReviewTokenError } = require("../utils/reviewToken");

/**
 * Public review submission, authorised by a signed invitation token.
 *
 * Mounted before the broad body parsers with its own strict limit, matching
 * the contact and auth routers: a review is a few hundred bytes.
 */
const REVIEW_BODY_LIMIT = "8kb";

// Submissions are cheap to make and expensive to moderate, so the window is
// tighter than the order limiter. Process-local, like the order limiter — on
// serverless each instance keeps its own counter, which is a floor not a
// ceiling. The unique (order, product) index is the real backstop.
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const hits = new Map();

const rateLimit = (req, res, next) => {
  const now = Date.now();
  const key = req.ip || "unknown";
  const entry = hits.get(key);

  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    res.set("Retry-After", String(retryAfter));
    return res.status(429).json({ success: false, message: "Too many requests. Please try again shortly." });
  } else {
    entry.count += 1;
  }

  // Bounded so a flood of unique addresses cannot grow the map without limit.
  if (hits.size > 1000) {
    for (const [entryKey, value] of hits) {
      if (value.resetAt <= now) hits.delete(entryKey);
    }
  }
  next();
};

const respondToError = (res, error, fallback) => {
  if (error instanceof ReviewValidationError || error instanceof ReviewTokenError) {
    return res.status(400).json({ success: false, message: error.message });
  }
  console.error(fallback, error);
  return res.status(500).json({ success: false, message: "Server error while processing the review" });
};

const readToken = (value) => (typeof value === "string" ? value.trim() : "");

/**
 * This router is mounted before the global database middleware (so it can keep
 * its own strict body parser), so it connects for itself — same pattern as the
 * contact and auth routers.
 */
const ensureDatabase = async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Review route database connection failed:", error);
    res.status(503).json({ success: false, message: "Service temporarily unavailable" });
  }
};

/** What the review page needs to render: which products are reviewable. */
router.get("/invitation", rateLimit, ensureDatabase, async (req, res) => {
  const token = readToken(req.query.token);
  if (!token) return res.status(400).json({ success: false, message: "A review link is required" });

  try {
    const invitation = await getReviewInvitation(token);
    return res.status(200).json({ success: true, ...invitation });
  } catch (error) {
    return respondToError(res, error, "Error loading review invitation:");
  }
});

router.post("/", rateLimit, ensureDatabase, express.json({ limit: REVIEW_BODY_LIMIT, strict: true }), async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ success: false, message: "Request body must be an object" });
  }

  const allowed = new Set(["token", "productId", "rating", "title", "comment"]);
  const unknown = Object.keys(body).filter((key) => !allowed.has(key));
  if (unknown.length) {
    return res.status(400).json({ success: false, message: `Unsupported field: ${unknown.join(", ")}` });
  }

  try {
    const result = await submitReview({
      token: readToken(body.token),
      productId: body.productId,
      rating: body.rating,
      title: body.title,
      comment: body.comment
    });
    // 201 with pending status: the review exists but is not public until an
    // admin approves it, and the page says so.
    return res.status(201).json({ success: true, ...result });
  } catch (error) {
    return respondToError(res, error, "Error submitting review:");
  }
});

router._test = { rateLimit };

module.exports = router;
