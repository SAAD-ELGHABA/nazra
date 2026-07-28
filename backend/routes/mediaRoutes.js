const express = require("express");
const connectDB = require("../lib/mongodb");
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const mediaController = require("../controllers/mediaController");
const {
  getPurposeConfiguration,
  parseUploadPurpose,
  MediaUploadValidationError
} = require("../services/mediaUploadService");

const router = express.Router();
const MEDIA_BODY_LIMIT = "2kb";
const MEDIA_PATHS = ["/upload-signature"];

const requireJson = (req, res, next) => {
  if (req.method === "POST" && !req.is("application/json")) {
    return res.status(415).json({
      success: false,
      message: "Content-Type must be application/json."
    });
  }
  return next();
};

const rejectQuery = (req, res, next) => {
  if (Object.keys(req.query || {}).length) {
    return res.status(400).json({
      success: false,
      message: "Query parameters are not supported."
    });
  }
  return next();
};

const ensureMediaDatabase = async (_req, res, next) => {
  try {
    await connectDB();
    return next();
  } catch (_error) {
    return res.status(503).json({
      success: false,
      message: "Authentication service is temporarily unavailable."
    });
  }
};

const validateUploadRequest = (req, res, next) => {
  try {
    req.mediaUploadPurpose = parseUploadPurpose(req.body);
    return next();
  } catch (error) {
    if (error instanceof MediaUploadValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    return next(error);
  }
};

const requirePurposePermission = (req, res, next) => {
  const { permission } = getPurposeConfiguration(req.mediaUploadPurpose);
  return requirePermission(permission)(req, res, next);
};

router.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  res.set("Pragma", "no-cache");
  return next();
});
router.use(requireJson);
router.use(express.json({ limit: MEDIA_BODY_LIMIT, strict: true }));

router.post(
  "/upload-signature",
  rejectQuery,
  ensureMediaDatabase,
  auth,
  validateUploadRequest,
  requirePurposePermission,
  mediaController.createUploadSignature
);

router.all(MEDIA_PATHS, (_req, res) => res.status(405).json({
  success: false,
  message: "Method not allowed."
}));
router.use((_req, res) => res.status(404).json({
  success: false,
  message: "Not found."
}));
router.use((error, _req, res, _next) => {
  if (error?.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Media upload request is too large."
    });
  }
  if (error instanceof SyntaxError || error?.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Request body must contain valid JSON."
    });
  }
  console.error("Media upload request parsing failed");
  return res.status(400).json({
    success: false,
    message: "Invalid media upload request."
  });
});

router._test = {
  MEDIA_BODY_LIMIT,
  rejectQuery,
  requireJson,
  requirePurposePermission,
  validateUploadRequest
};

module.exports = router;
