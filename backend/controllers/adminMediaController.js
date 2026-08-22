const {
  AdminQueryValidationError,
  sendAdminValidationError
} = require("../utils/adminQuery");
const {
  listMedia,
  listMediaFolders,
  listMediaTags,
  registerMedia,
  updateMedia,
  deleteMedia,
  bulkDeleteMedia,
  renameMediaFolder,
  MediaAssetNotFoundError
} = require("../services/admin/mediaLibraryService");

const internalError = (res) => res.status(500).json({
  success: false,
  code: "INTERNAL_ERROR",
  message: "Internal server error."
});

const notFound = (res, message) => res.status(404).json({
  success: false,
  code: "NOT_FOUND",
  message
});

// The Cloudinary SDK reports missing credentials as a generic error, which would
// otherwise surface as a 500 and read like a bug in this service.
const isCloudinaryConfigurationError = (error) => (
  /must supply (api_key|api_secret|cloud_name)/i.test(error?.message || "")
);

const handleError = (res, error, action) => {
  if (error instanceof AdminQueryValidationError) return sendAdminValidationError(res, error);
  if (error instanceof MediaAssetNotFoundError) return notFound(res, error.message);
  if (error?.code === 11000) {
    return res.status(409).json({
      success: false,
      code: "DUPLICATE",
      message: "This asset is already in the media library."
    });
  }
  if (isCloudinaryConfigurationError(error)) {
    return res.status(503).json({
      success: false,
      code: "SERVICE_UNAVAILABLE",
      message: "The media service is temporarily unavailable."
    });
  }
  console.error(`Admin media ${action} failed`);
  return internalError(res);
};

const handle = (action, run) => async (req, res) => {
  try {
    return await run(req, res);
  } catch (error) {
    return handleError(res, error, action);
  }
};

const getMedia = handle("list", async (req, res) => {
  const result = await listMedia(req.query);
  return res.status(200).json({ success: true, ...result });
});

const getMediaFolders = handle("folder list", async (_req, res) => {
  const result = await listMediaFolders();
  return res.status(200).json({ success: true, ...result });
});

const getMediaTags = handle("tag list", async (_req, res) => {
  const result = await listMediaTags();
  return res.status(200).json({ success: true, ...result });
});

const createMedia = handle("create", async (req, res) => {
  const result = await registerMedia(req.body, req);
  return res.status(201).json({ success: true, ...result });
});

const patchMedia = handle("update", async (req, res) => {
  const result = await updateMedia(req.params.id, req.body, req);
  if (!result) return notFound(res, "That asset no longer exists.");
  return res.status(200).json({ success: true, ...result });
});

const removeMedia = handle("delete", async (req, res) => {
  const result = await deleteMedia(req.params.id, req);
  if (!result) return notFound(res, "That asset no longer exists.");
  return res.status(200).json({
    success: true,
    message: result.mediaCleanupSucceeded
      ? "Asset deleted."
      : "Asset removed from the library, but it could not be deleted from Cloudinary.",
    mediaCleanupSucceeded: result.mediaCleanupSucceeded
  });
});

const bulkRemoveMedia = handle("bulk delete", async (req, res) => {
  const result = await bulkDeleteMedia(req.body, req);
  return res.status(200).json({ success: true, ...result });
});

const patchMediaFolders = handle("folder rename", async (req, res) => {
  const result = await renameMediaFolder(req.body, req);
  return res.status(200).json({ success: true, ...result });
});

module.exports = {
  getMedia,
  getMediaFolders,
  getMediaTags,
  createMedia,
  patchMedia,
  removeMedia,
  bulkRemoveMedia,
  patchMediaFolders,
  _test: { handleError, isCloudinaryConfigurationError }
};
