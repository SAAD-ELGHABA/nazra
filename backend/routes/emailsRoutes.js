const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailController");
const auth = require('../middleware/auth');
const requirePermission = require("../middleware/requirePermission");

router.post("/create", emailController.storeEmail);
router.get("/get-emails", auth, requirePermission("subscribers.read"), emailController.getSubEmails);

module.exports = router;
