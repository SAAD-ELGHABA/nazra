
const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth');
const requirePermission = require('../middleware/requirePermission');
const blogController = require("../controllers/blogController");

router.post("/create", auth, requirePermission("blog.manage"), blogController.create);
router.get("/get-blog/:slug", blogController.getBlog);
router.get("/admin/:id", auth, requirePermission("blog.manage"), blogController.getAdminBlogById);
router.get("/",blogController.getBlogs);
router.post("/update/:id", auth, requirePermission("blog.manage"), blogController.update);
router.delete("/delete/:id", auth, requirePermission("blog.manage"), blogController.deleteBlog);
router.post("/delete/:id", auth, requirePermission("blog.manage"), blogController.deleteBlog);

module.exports = router;
