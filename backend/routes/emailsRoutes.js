const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailController");

// store new email
router.post("/create", emailController.storeEmail);


module.exports = router;