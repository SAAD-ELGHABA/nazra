
const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth');
const blogController = require("../controllers/blogController");

router.post("/create",auth,blogController.create);
router.get("/get-blog/:id",blogController.getBlog);
router.get("/",blogController.getBlogs);
router.post("/update/:id",auth,blogController.update);
router.post("/delete/:id",auth,blogController.deleteBlog);

module.exports = router;
