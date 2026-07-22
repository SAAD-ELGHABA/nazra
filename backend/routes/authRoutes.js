const express = require("express");
const connectDB = require("../lib/mongodb");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const authController = require("../controllers/authController");

const router = express.Router();
const AUTH_BODY_LIMIT = "8kb";
const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/users"];

const requireJson = (req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method) && !req.is("application/json")) {
    return res.status(415).json({ success: false, message: "Content-Type must be application/json." });
  }
  return next();
};

const rejectQuery = (req, res, next) => {
  if (Object.keys(req.query || {}).length) {
    return res.status(400).json({ success: false, message: "Query parameters are not supported." });
  }
  return next();
};

const ensureAuthDatabase = async (_req, res, next) => {
  try {
    await connectDB();
    return next();
  } catch (_error) {
    return res.status(503).json({ success: false, message: "Authentication service is temporarily unavailable." });
  }
};

router.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  res.set("Pragma", "no-cache");
  return next();
});
router.use(requireJson);
router.use(express.json({ limit: AUTH_BODY_LIMIT, strict: true }));

router.post("/login", rejectQuery, ensureAuthDatabase, authController.loginUser);
router.post("/forgot-password", rejectQuery, ensureAuthDatabase, authController.forgotPassword);
router.post("/reset-password", rejectQuery, ensureAuthDatabase, authController.resetPassword);
router.post(
  "/register",
  rejectQuery,
  ensureAuthDatabase,
  auth,
  requireRole("superadmin"),
  authController.registerUser
);
router.get(
  "/users",
  rejectQuery,
  ensureAuthDatabase,
  auth,
  requireRole("superadmin"),
  authController.listUsers
);

router.all(AUTH_PATHS, (_req, res) => res.status(405).json({ success: false, message: "Method not allowed." }));
router.use((_req, res) => res.status(404).json({ success: false, message: "Not found." }));
router.use((error, _req, res, _next) => {
  if (error?.type === "entity.too.large") {
    return res.status(413).json({ success: false, message: "Authentication request is too large." });
  }
  if (error instanceof SyntaxError || error?.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Request body must contain valid JSON." });
  }
  console.error("Authentication request parsing failed");
  return res.status(400).json({ success: false, message: "Invalid authentication request." });
});

router._test = { AUTH_BODY_LIMIT, requireJson, rejectQuery };

module.exports = router;
