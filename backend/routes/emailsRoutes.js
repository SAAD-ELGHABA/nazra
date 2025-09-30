const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailController");
const auth = require('../middleware/auth');

router.post("/create", emailController.storeEmail);
router.get("/get-emails",auth,emailController.getSubEmails);

module.exports = router;