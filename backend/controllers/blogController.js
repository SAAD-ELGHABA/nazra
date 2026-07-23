const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const { deleteMultipleFromCloudinary } = require('../config/cloudinary');
const { sanitizeHtml, isSafeUrl } = require('../utils/sanitizeHtml');

const MAX_TITLE_LENGTH = 160;
const MAX_CONTENT_LENGTH = 50000;
const MAX_IMAGES = 20;
const BLOG_IMAGE_FOLDER_PREFIX = "blog-images/";
const SORT_VALUES = new Set(["asc", "desc"]);

class BlogValidationError extends Error {
  constructor(errors) {
    super("Validation failed");
    this.errors = errors;
  }
}

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const readString = (value, field, max, { required = false } = {}) => {
  if (value === undefined || value === null) {
    if (required) throw new BlogValidationError({ [field]: `${field} is required.` });
    return undefined;
  }
  if (typeof value !== "string") throw new BlogValidationError({ [field]: `${field} must be a string.` });
  const parsed = value.trim();
  if (required && !parsed) throw new BlogValidationError({ [field]: `${field} is required.` });
  if (parsed.length > max) throw new BlogValidationError({ [field]: `${field} is too long.` });
  return parsed;
};

const parseImages = (images) => {
  if (images === undefined) return [];
  if (!Array.isArray(images) || images.length > MAX_IMAGES) {
    throw new BlogValidationError({ images: `Images must be an array of at most ${MAX_IMAGES} items.` });
  }

  return images.map((image, index) => {
    if (!image || typeof image !== "object" || Array.isArray(image)) {
      throw new BlogValidationError({ images: `images[${index}] must be an object.` });
    }
    const url = readString(image.url, `images[${index}].url`, 2048, { required: true });
    const publicId = readString(image.public_id, `images[${index}].public_id`, 500, { required: true });
    if (!isSafeUrl(url)) {
      throw new BlogValidationError({ images: `images[${index}].url must be a safe image URL.` });
    }
    if (!publicId.startsWith(BLOG_IMAGE_FOLDER_PREFIX)) {
      throw new BlogValidationError({ images: `images[${index}].public_id must belong to the blog image folder.` });
    }
    return {
      ...(image._id ? { _id: image._id } : {}),
      url,
      public_id: publicId
    };
  });
};

const parseBlogPayload = (body, { partial = false } = {}) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new BlogValidationError({ body: "Request body must be a JSON object." });
  }
  const allowed = new Set(["title", "content", "images"]);
  const unknown = Object.keys(body).filter((key) => !allowed.has(key));
  if (unknown.length) throw new BlogValidationError({ body: `Unsupported field: ${unknown[0]}` });

  const payload = {};
  const title = readString(body.title, "title", MAX_TITLE_LENGTH, { required: !partial });
  const content = readString(body.content, "content", MAX_CONTENT_LENGTH, { required: !partial });
  if (title !== undefined) payload.title = title;
  if (content !== undefined) payload.content = sanitizeHtml(content);
  if (body.images !== undefined) payload.images = parseImages(body.images);

  if (!partial && payload.images === undefined) payload.images = [];
  return payload;
};

const parsePagination = (query) => {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 10 : Number(query.limit);
  const sort = query.sort === undefined ? "desc" : String(query.sort).trim().toLowerCase();
  const search = query.search === undefined ? "" : String(query.search).trim();

  if (!Number.isSafeInteger(page) || page < 1) throw new BlogValidationError({ page: "page must be a positive integer." });
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 50) throw new BlogValidationError({ limit: "limit must be between 1 and 50." });
  if (!SORT_VALUES.has(sort)) throw new BlogValidationError({ sort: "sort must be asc or desc." });
  if (search.length > 100) throw new BlogValidationError({ search: "search is too long." });

  return { page, limit, sort, search };
};

const validationResponse = (res, error) => res.status(400).json({
  success: false,
  code: "VALIDATION_ERROR",
  message: "The submitted data is invalid.",
  errors: error.errors
});

const sanitizeBlogForResponse = (blog) => {
  if (!blog) return blog;
  const plainBlog = typeof blog.toObject === "function" ? blog.toObject() : { ...blog };
  return {
    ...plainBlog,
    content: sanitizeHtml(plainBlog.content)
  };
};

const create = async (req, res) => {
  try {
    const payload = parseBlogPayload(req.body);
    const savedBlog = await Blog.create(payload);

    return res.status(201).json({
      success: true,
      message: "Blog created successfully.",
      blog: savedBlog
    });
  } catch (error) {
    if (error instanceof BlogValidationError) return validationResponse(res, error);
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, code: "CONFLICT", message: "A blog with this slug already exists." });
    }
    console.error("Blog creation failed");
    return res.status(500).json({ success: false, code: "INTERNAL_ERROR", message: "Internal server error." });
  }
};

const getBlogBySlug = async (req, res) => {
  try {
    const slug = readString(req.params.slug, "slug", 200, { required: true });
    const blog = await Blog.findOne({ slug }).lean();
    if (!blog) return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Blog not found." });
    return res.status(200).json({ success: true, blog: sanitizeBlogForResponse(blog) });
  } catch (error) {
    if (error instanceof BlogValidationError) return validationResponse(res, error);
    console.error("Blog detail request failed");
    return res.status(500).json({ success: false, code: "INTERNAL_ERROR", message: "Internal server error." });
  }
};

const getAdminBlogById = async (req, res) => {
  if (!isObjectId(req.params.id)) {
    return res.status(400).json({ success: false, code: "VALIDATION_ERROR", message: "Invalid blog id." });
  }
  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (!blog) return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Blog not found." });
    return res.status(200).json({ success: true, blog: sanitizeBlogForResponse(blog) });
  } catch (_error) {
    console.error("Admin blog detail request failed");
    return res.status(500).json({ success: false, code: "INTERNAL_ERROR", message: "Internal server error." });
  }
};

const getBlogs = async (req, res) => {
  try {
    const { page, limit, sort, search } = parsePagination(req.query);
    const query = search ? { title: { $regex: escapeRegex(search), $options: "i" } } : {};

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ createdAt: sort === "asc" ? 1 : -1, _id: sort === "asc" ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Blog.countDocuments(query)
    ]);

    const sanitizedBlogs = blogs.map(sanitizeBlogForResponse);

    return res.status(200).json({
      success: true,
      data: sanitizedBlogs,
      blogs: sanitizedBlogs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    });
  } catch (error) {
    if (error instanceof BlogValidationError) return validationResponse(res, error);
    console.error("Blog list request failed");
    return res.status(500).json({ success: false, code: "INTERNAL_ERROR", message: "Internal server error." });
  }
};

const update = async (req, res) => {
  if (!isObjectId(req.params.id)) {
    return res.status(400).json({ success: false, code: "VALIDATION_ERROR", message: "Invalid blog id." });
  }

  try {
    const payload = parseBlogPayload(req.body, { partial: true });
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Blog not found." });

    Object.assign(blog, payload);
    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully.",
      blog,
    });
  } catch (error) {
    if (error instanceof BlogValidationError) return validationResponse(res, error);
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, code: "CONFLICT", message: "A blog with this slug already exists." });
    }
    console.error("Blog update failed");
    return res.status(500).json({ success: false, code: "INTERNAL_ERROR", message: "Internal server error." });
  }
};

const deleteBlog = async (req, res) => {
  if (!isObjectId(req.params.id)) {
    return res.status(400).json({ success: false, code: "VALIDATION_ERROR", message: "Invalid blog id." });
  }

  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Blog not found." });

    const publicIds = (blog.images || [])
      .map((image) => image.public_id)
      .filter((publicId) => publicId?.startsWith(BLOG_IMAGE_FOLDER_PREFIX));
    let mediaCleanupSucceeded = true;
    if (publicIds.length) {
      try {
        await deleteMultipleFromCloudinary(publicIds);
      } catch (_error) {
        mediaCleanupSucceeded = false;
        console.error("Blog media cleanup failed");
      }
    }

    await Blog.findByIdAndDelete(blog._id);

    return res.status(200).json({
      success: true,
      message: mediaCleanupSucceeded
        ? "Blog deleted successfully."
        : "Blog deleted successfully. Some media cleanup may need retry.",
      mediaCleanupSucceeded
    });
  } catch (_error) {
    console.error("Blog deletion failed");
    return res.status(500).json({ success: false, code: "INTERNAL_ERROR", message: "Internal server error." });
  }
};

module.exports = {
  create,
  getBlog: getBlogBySlug,
  getBlogBySlug,
  getAdminBlogById,
  getBlogs,
  update,
  deleteBlog,
  _test: {
    BlogValidationError,
    parseBlogPayload,
    parseImages,
    parsePagination,
    BLOG_IMAGE_FOLDER_PREFIX,
    sanitizeBlogForResponse
  }
};
