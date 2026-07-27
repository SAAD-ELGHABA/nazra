const mongoose = require("mongoose");
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const ProductView = require("../../models/ProductView");
const Email = require("../../models/Email");
const Blog = require("../../models/Blog");
const Visitor = require("../../models/View");
const {
  AdminQueryValidationError,
  parsePagination,
  parseSort,
  parseEnum,
  normalizeSearch,
  escapeRegex,
  buildAdminListMeta
} = require("../../utils/adminQuery");
const {
  DAY_MS,
  MAX_RANGE_DAYS,
  parseOptionalDateRange,
  chooseGranularity
} = require("../../utils/adminDateRange");
const { _expressions } = require("./dashboardMetricsService");

const ORDER_STATUSES = new Set(["pending", "processing", "shipped", "delivered", "cancelled"]);
const ORDER_SORTS = new Set(["createdAt", "-createdAt", "total", "-total", "status", "-status"]);
const PRODUCT_STATUSES = new Set(["active", "archived"]);
const PRODUCT_STOCK_STATUSES = new Set(["in_stock", "low_stock", "out_of_stock"]);
const PRODUCT_SORTS = new Set(["createdAt", "-createdAt", "updatedAt", "-updatedAt", "name", "-name", "price", "-price"]);
const SUBSCRIBER_STATUSES = new Set(["active", "unsubscribed", "suppressed"]);
const SUBSCRIBER_SORTS = new Set(["createdAt", "-createdAt", "email", "-email", "status", "-status"]);
const BLOG_SORTS = new Set(["createdAt", "-createdAt", "updatedAt", "-updatedAt", "title", "-title"]);
const VISITOR_SORTS = new Set(["periodStart", "-periodStart"]);

const serializeObjectId = (value) => value ? String(value) : null;
const readOptionalFilter = (value, name, maximum = 100) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") {
    throw new AdminQueryValidationError({ [name]: `${name} must be a string.` });
  }
  const normalized = value.trim();
  if (!normalized || normalized.length > maximum) {
    throw new AdminQueryValidationError({ [name]: `${name} must contain between 1 and ${maximum} characters.` });
  }
  return normalized;
};

const listOrders = async (query) => {
  const { page, limit } = parsePagination(query);
  const sort = parseSort(query.sort, ORDER_SORTS, "-createdAt");
  const q = normalizeSearch(query.q);
  const status = parseEnum(query.status, "status", ORDER_STATUSES);
  const range = parseOptionalDateRange(query);
  const match = {};
  if (status) match.status = status;
  if (range) match.createdAt = { $gte: range.from, $lt: range.to };
  if (q) {
    const safe = new RegExp(escapeRegex(q), "i");
    const clauses = [
      { fullName: safe },
      { email: safe },
      { phone: safe },
      { "products.productName": safe },
      { "products.sku": safe }
    ];
    if (mongoose.isValidObjectId(q)) clauses.unshift({ _id: new mongoose.Types.ObjectId(q) });
    match.$or = clauses;
  }
  const sortField = sort.field === "total" ? "total" : sort.field;
  const [result] = await Order.aggregate([
    { $match: match },
    {
      $set: {
        total: _expressions.lineTotalExpression,
        itemCount: _expressions.unitCountExpression
      }
    },
    {
      $facet: {
        data: [
          { $sort: { [sortField]: sort.direction, _id: sort.direction } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              reference: { $toString: "$_id" },
              createdAt: 1,
              customerName: "$fullName",
              itemCount: 1,
              total: 1,
              currency: { $literal: "MAD" },
              status: 1
            }
          }
        ],
        count: [{ $count: "total" }]
      }
    }
  ]);
  const total = Number(result?.count?.[0]?.total || 0);
  return {
    data: result?.data || [],
    meta: buildAdminListMeta({
      page,
      limit,
      total,
      sort: sort.value,
      filters: {
        ...(q ? { q } : {}),
        ...(status ? { status } : {}),
        ...(range ? {
          from: range.from.toISOString(),
          to: range.to.toISOString(),
          timezone: range.timezone
        } : {})
      }
    })
  };
};

const summarizeStock = (product) => {
  let trackedStock = 0;
  let trackedVariants = 0;
  let untrackedVariants = 0;
  let outOfStockVariants = 0;
  let lowStockVariants = 0;
  for (const color of product.colors || []) {
    const activeLenses = (color.lensOptions || []).filter((lens) => lens.active !== false);
    const candidates = activeLenses.length ? activeLenses : [color];
    for (const variant of candidates) {
      if (variant.active === false) continue;
      if (variant.stock === null || variant.stock === undefined) {
        untrackedVariants += 1;
        continue;
      }
      const stock = Number(variant.stock);
      trackedVariants += 1;
      trackedStock += stock;
      if (stock === 0) outOfStockVariants += 1;
      else if (stock <= 5) lowStockVariants += 1;
    }
  }
  return {
    trackingState: trackedVariants === 0 ? "untracked" : (untrackedVariants ? "mixed" : "tracked"),
    trackedStock,
    trackedVariants,
    untrackedVariants,
    outOfStockVariants,
    lowStockVariants
  };
};

const listProducts = async (query, user) => {
  const { page, limit } = parsePagination(query);
  const sort = parseSort(query.sort, PRODUCT_SORTS, "-createdAt");
  const q = normalizeSearch(query.q);
  const status = parseEnum(query.status, "status", PRODUCT_STATUSES);
  const stockStatus = parseEnum(query.stockStatus, "stockStatus", PRODUCT_STOCK_STATUSES);
  const category = readOptionalFilter(query.category, "category");
  const collection = readOptionalFilter(query.collection, "collection");
  const type = readOptionalFilter(query.type, "type");
  const filter = {};
  if (status) filter.isActive = status === "active";
  if (stockStatus) filter.stockStatus = stockStatus;
  if (category) filter.category = category;
  if (collection) filter.collection = collection;
  if (type) filter.type = type;
  if (q) {
    const safe = new RegExp(escapeRegex(q), "i");
    filter.$or = [
      { name: safe },
      { slug: safe },
      { references: safe },
      { "colors.sku": safe },
      { "colors.lensOptions.sku": safe }
    ];
  }
  const productSortField = sort.field === "price" ? "sale_price" : sort.field;
  const [products, total] = await Promise.all([
    Product.find(filter)
      .select("_id name slug original_price sale_price compareAtPrice type category collection references colors isActive stockStatus inStock createdBy createdAt updatedAt")
      .sort({ [productSortField]: sort.direction, _id: sort.direction })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter)
  ]);
  const productIds = products.map((product) => product._id);
  const viewCounts = productIds.length ? await ProductView.aggregate([
    { $match: { productId: { $in: productIds } } },
    { $group: { _id: "$productId", views: { $sum: 1 } } }
  ]) : [];
  const views = new Map(viewCounts.map((row) => [String(row._id), row.views]));
  const canonicalRole = user?.role === "super-admin" ? "superadmin" : user?.role;
  const data = products.map((product) => {
    const canManage = canonicalRole === "superadmin"
      || String(product.createdBy) === String(user?._id || user?.id);
    const firstImage = (product.colors || [])
      .flatMap((color) => [
        ...(color.images || []),
        ...(color.lensOptions || []).flatMap((lens) => lens.images || [])
      ])
      .find((image) => image?.url)?.url || null;
    const skus = (product.colors || [])
      .flatMap((color) => [color.sku, ...(color.lensOptions || []).map((lens) => lens.sku)])
      .filter(Boolean);
    return {
      id: serializeObjectId(product._id),
      name: product.name,
      slug: product.slug,
      thumbnail: firstImage,
      sku: skus[0] || product.references || null,
      skuCount: skus.length,
      price: product.sale_price,
      comparePrice: product.compareAtPrice ?? product.original_price ?? null,
      variantCount: (product.colors || []).reduce(
        (count, color) => count + Math.max(1, (color.lensOptions || []).length),
        0
      ),
      stock: summarizeStock(product),
      availabilityStatus: product.stockStatus || (product.inStock === false ? "out_of_stock" : "in_stock"),
      status: product.isActive ? "active" : "archived",
      views: Number(views.get(String(product._id)) || 0),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      canEdit: canManage,
      canArchive: canManage && product.isActive
    };
  });
  return {
    data,
    meta: buildAdminListMeta({
      page,
      limit,
      total,
      sort: sort.value,
      filters: {
        ...(q ? { q } : {}),
        ...(status ? { status } : {}),
        ...(stockStatus ? { stockStatus } : {}),
        ...(category ? { category } : {}),
        ...(collection ? { collection } : {}),
        ...(type ? { type } : {})
      }
    })
  };
};

const listSubscribers = async (query) => {
  const { page, limit } = parsePagination(query);
  const sort = parseSort(query.sort, SUBSCRIBER_SORTS, "-createdAt");
  const q = normalizeSearch(query.q);
  const status = parseEnum(query.status, "status", SUBSCRIBER_STATUSES);
  const source = readOptionalFilter(query.source, "source");
  const filter = {};
  if (status) filter.status = status;
  if (source) filter.source = source;
  if (q) filter.email = { $regex: escapeRegex(q), $options: "i" };
  const [data, total] = await Promise.all([
    Email.find(filter)
      .select("_id email status source consentAt unsubscribedAt createdAt updatedAt")
      .sort({ [sort.field]: sort.direction, _id: sort.direction })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Email.countDocuments(filter)
  ]);
  return {
    data,
    meta: buildAdminListMeta({
      page,
      limit,
      total,
      sort: sort.value,
      filters: {
        ...(q ? { q } : {}),
        ...(status ? { status } : {}),
        ...(source ? { source } : {})
      }
    })
  };
};

const listBlogs = async (query) => {
  const { page, limit } = parsePagination(query);
  const sort = parseSort(query.sort, BLOG_SORTS, "-createdAt");
  const q = normalizeSearch(query.q);
  const filter = q ? { title: { $regex: escapeRegex(q), $options: "i" } } : {};
  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .select("_id title slug images.url createdAt updatedAt")
      .sort({ [sort.field]: sort.direction, _id: sort.direction })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Blog.countDocuments(filter)
  ]);
  const data = blogs.map((blog) => ({
    id: serializeObjectId(blog._id),
    title: blog.title,
    slug: blog.slug,
    thumbnail: blog.images?.[0]?.url || null,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt
  }));
  return {
    data,
    meta: buildAdminListMeta({
      page,
      limit,
      total,
      sort: sort.value,
      filters: q ? { q } : {}
    })
  };
};

const normalizeReferrer = (value) => {
  const referrer = String(value || "").trim();
  if (!referrer || referrer.toLowerCase() === "direct") return "Direct";
  let hostname;
  try {
    hostname = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "Other";
  }
  if (hostname.includes("google.")) return "Google";
  if (hostname === "facebook.com" || hostname.endsWith(".facebook.com")) return "Facebook";
  if (hostname === "instagram.com" || hostname.endsWith(".instagram.com")) return "Instagram";
  if (hostname === "tiktok.com" || hostname.endsWith(".tiktok.com")) return "TikTok";
  return "Other";
};

const normalizeBrowser = (userAgent) => {
  const ua = String(userAgent || "");
  if (/Edg\//i.test(ua)) return "Edge";
  if (/Firefox\//i.test(ua)) return "Firefox";
  if (/Chrome\//i.test(ua) && !/(OPR|Edg)\//i.test(ua)) return "Chrome";
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return "Safari";
  return "Other";
};

const normalizeDevice = (userAgent) => {
  const ua = String(userAgent || "");
  if (/iPad|Tablet|PlayBook/i.test(ua)) return "Tablet";
  if (/Mobile|Android|iPhone|IEMobile/i.test(ua)) return "Mobile";
  if (/Windows|Macintosh|Linux|X11/i.test(ua)) return "Desktop";
  return "Other";
};

const listVisitorAnalytics = async (query) => {
  const range = parseOptionalDateRange(query);
  if (!range) {
    throw new AdminQueryValidationError({ range: "from and to are required for visitor analytics." });
  }
  if (range.to - range.from > MAX_RANGE_DAYS * DAY_MS) {
    throw new AdminQueryValidationError({
      range: `Visitor analytics range must not exceed ${MAX_RANGE_DAYS} days.`
    });
  }
  const granularity = chooseGranularity(range.to - range.from, query.granularity);
  const pageViews = { $ifNull: ["$visitCount", 1] };
  const referrer = { $toLower: { $ifNull: ["$referrer", "direct"] } };
  const userAgent = { $ifNull: ["$userAgent", ""] };
  const [result] = await Visitor.aggregate([
    { $match: { createdAt: { $gte: range.from, $lt: range.to } } },
    {
      $facet: {
        totals: [{
          $group: {
            _id: "$ipAddress",
            pageViews: { $sum: pageViews }
          }
        }, {
          $group: {
            _id: null,
            uniqueVisitors: { $sum: { $cond: [{ $ne: ["$_id", null] }, 1, 0] } },
            pageViews: { $sum: "$pageViews" }
          }
        }],
        series: [
          {
            $group: {
              _id: {
                periodStart: {
                  $dateTrunc: {
                    date: "$createdAt",
                    unit: granularity,
                    timezone: range.timezone,
                    ...(granularity === "week" ? { startOfWeek: "monday" } : {})
                  }
                },
                visitorId: "$ipAddress"
              },
              pageViews: { $sum: pageViews }
            }
          },
          {
            $group: {
              _id: "$_id.periodStart",
              pageViews: { $sum: "$pageViews" },
              uniqueVisitors: { $sum: { $cond: [{ $ne: ["$_id.visitorId", null] }, 1, 0] } }
            }
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              periodStart: "$_id",
              pageViews: 1,
              uniqueVisitors: 1
            }
          }
        ],
        referrers: [
          {
            $project: {
              count: pageViews,
              label: {
                $switch: {
                  branches: [
                    { case: { $or: [{ $eq: [referrer, ""] }, { $eq: [referrer, "direct"] }] }, then: "Direct" },
                    { case: { $regexMatch: { input: referrer, regex: /(^|[/.])google\./ } }, then: "Google" },
                    { case: { $regexMatch: { input: referrer, regex: /(^|[/.])facebook\.com/ } }, then: "Facebook" },
                    { case: { $regexMatch: { input: referrer, regex: /(^|[/.])instagram\.com/ } }, then: "Instagram" },
                    { case: { $regexMatch: { input: referrer, regex: /(^|[/.])tiktok\.com/ } }, then: "TikTok" }
                  ],
                  default: "Other"
                }
              }
            }
          },
          { $group: { _id: "$label", count: { $sum: "$count" } } },
          { $sort: { count: -1, _id: 1 } },
          { $project: { _id: 0, label: "$_id", count: 1 } }
        ],
        browsers: [
          {
            $project: {
              count: pageViews,
              label: {
                $switch: {
                  branches: [
                    { case: { $regexMatch: { input: userAgent, regex: /Edg\//i } }, then: "Edge" },
                    { case: { $regexMatch: { input: userAgent, regex: /Firefox\//i } }, then: "Firefox" },
                    { case: { $regexMatch: { input: userAgent, regex: /Chrome\//i } }, then: "Chrome" },
                    { case: { $regexMatch: { input: userAgent, regex: /Safari\//i } }, then: "Safari" }
                  ],
                  default: "Other"
                }
              }
            }
          },
          { $group: { _id: "$label", count: { $sum: "$count" } } },
          { $sort: { count: -1, _id: 1 } },
          { $project: { _id: 0, label: "$_id", count: 1 } }
        ],
        devices: [
          {
            $project: {
              count: pageViews,
              label: {
                $switch: {
                  branches: [
                    { case: { $regexMatch: { input: userAgent, regex: /iPad|Tablet|PlayBook/i } }, then: "Tablet" },
                    { case: { $regexMatch: { input: userAgent, regex: /Mobile|Android|iPhone|IEMobile/i } }, then: "Mobile" },
                    { case: { $regexMatch: { input: userAgent, regex: /Windows|Macintosh|Linux|X11/i } }, then: "Desktop" }
                  ],
                  default: "Other"
                }
              }
            }
          },
          { $group: { _id: "$label", count: { $sum: "$count" } } },
          { $sort: { count: -1, _id: 1 } },
          { $project: { _id: 0, label: "$_id", count: 1 } }
        ]
      }
    }
  ]);
  const totals = result?.totals?.[0];
  return {
    range: {
      from: range.from.toISOString(),
      to: range.to.toISOString(),
      timezone: range.timezone,
      granularity
    },
    uniqueVisitors: Number(totals?.uniqueVisitors || 0),
    pageViews: Number(totals?.pageViews || 0),
    series: result?.series || [],
    referrers: result?.referrers || [],
    browsers: result?.browsers || [],
    devices: result?.devices || []
  };
};

module.exports = {
  ORDER_STATUSES,
  ORDER_SORTS,
  PRODUCT_STATUSES,
  PRODUCT_SORTS,
  SUBSCRIBER_SORTS,
  BLOG_SORTS,
  VISITOR_SORTS,
  listOrders,
  summarizeStock,
  listProducts,
  listSubscribers,
  listBlogs,
  normalizeReferrer,
  normalizeBrowser,
  normalizeDevice,
  listVisitorAnalytics
};
