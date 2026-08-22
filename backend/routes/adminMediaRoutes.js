const express = require("express");
const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const adminMediaController = require("../controllers/adminMediaController");

const router = express.Router();

router.use(auth);

// /folders and /tags must be declared before /:id, otherwise Express matches
// them as an identifier param and the request fails validation instead.
router.get("/folders", requirePermission("media.manage"), adminMediaController.getMediaFolders);
router.patch("/folders", requirePermission("media.manage"), adminMediaController.patchMediaFolders);
router.get("/tags", requirePermission("media.manage"), adminMediaController.getMediaTags);
router.post("/bulk-delete", requirePermission("media.manage"), adminMediaController.bulkRemoveMedia);

router.get("/", requirePermission("media.manage"), adminMediaController.getMedia);
router.post("/", requirePermission("media.manage"), adminMediaController.createMedia);
router.patch("/:id", requirePermission("media.manage"), adminMediaController.patchMedia);
router.delete("/:id", requirePermission("media.manage"), adminMediaController.removeMedia);

module.exports = router;
