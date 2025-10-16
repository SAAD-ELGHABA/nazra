const Blog = require('../models/Blog');
const slugify = require('slugify');

const create = async (req, res) => {
  try {
    const { title, content, images } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    const newBlog = new Blog({
      title,
      content,
      images: images || []
    });

    const savedBlog = await newBlog.save();

    res.status(201).json({
      message: "Blog created successfully.",
      blog: savedBlog
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getBlog = async (req, res) => {
  try {
    const { slug } = req.params;

    if (slug) {
      const blog = await Blog.find({"slug":slug});

      if (!blog) {
        return res.status(404).json({ message: "Blog not found." });
      }

      return res.status(200).json(blog);
    }

    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);

  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", sort = "desc" } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const query = search
      ? { title: { $regex: search, $options: "i" } }
      : {};

    const blogs = await Blog.find(query)
      .sort({ createdAt: sort === "asc" ? 1 : -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      blogs
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const update = async (req, res) => {
  try {
    const blogId = req.params.id;
    const { title, content, images } = req.body;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (title) blog.title = title;
    if (content) blog.content = content;
    if (images) blog.images = images;
    await blog.save();

    res.status(200).json({
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.error("Update Blog Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.images && blog.images.length > 0) {
      for (const img of blog.images) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
    }

    await Blog.findByIdAndDelete(blogId);

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Delete Blog Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
module.exports = { create,getBlog ,getBlogs,update,deleteBlog};
