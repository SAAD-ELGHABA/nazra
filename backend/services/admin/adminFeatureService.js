const mongoose = require("mongoose");
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const Email = require("../../models/Email");
const ContactMessage = require("../../models/ContactMessage");
const Review = require("../../models/Review");
const Blog = require("../../models/Blog");
const User = require("../../models/User");
const ActivityLog = require("../../models/ActivityLog");
const AdminSetting = require("../../models/AdminSetting");
const AdminNotification = require("../../models/AdminNotification");
const AdminExport = require("../../models/AdminExport");
const SavedView = require("../../models/SavedView");
const { getCapabilitiesForRole } = require("../../middleware/requirePermission");
const {
  AdminQueryValidationError,
  parsePagination,
  parseSort,
  parseEnum,
  normalizeSearch,
  escapeRegex,
  buildAdminListMeta
} = require("../../utils/adminQuery");
const { parseOptionalDateRange } = require("../../utils/adminDateRange");

const CONTACT_STATUSES = new Set(["new", "read", "replied", "archived"]);
const REVIEW_STATUSES = new Set(["pending", "approved", "rejected"]);
const ACTIVITY_SEVERITIES = new Set(["info", "warning", "critical"]);
const EXPORT_TYPES = new Set(["orders", "customers", "subscribers", "products"]);
const EXPORT_PERMISSION_BY_TYPE = Object.freeze({
  orders: "orders.export",
  customers: "customers.read",
  subscribers: "subscribers.export",
  products: "products.read"
});
const SAVED_VIEW_PAGE_PERMISSIONS = Object.freeze({
  orders: "orders.read",
  products: "products.read",
  inventory: "inventory.read",
  customers: "customers.read",
  subscribers: "subscribers.read",
  contacts: "contacts.read",
  reviews: "reviews.read",
  activity: "activity.read",
  exports: "orders.export",
  settings: "settings.read"
});
const CONTACT_SORTS = new Set(["createdAt", "-createdAt", "updatedAt", "-updatedAt", "status", "-status"]);
const REVIEW_SORTS = new Set(["createdAt", "-createdAt", "rating", "-rating", "status", "-status"]);
const CUSTOMER_SORTS = new Set(["lastOrderAt", "-lastOrderAt", "orderCount", "-orderCount", "totalSpent", "-totalSpent", "email", "-email"]);
const INVENTORY_SORTS = new Set(["productName", "-productName", "stock", "-stock", "status", "-status"]);
const ACTIVITY_SORTS = new Set(["createdAt", "-createdAt", "action", "-action", "severity", "-severity"]);
const EXPORT_SORTS = new Set(["createdAt", "-createdAt", "type", "-type", "status", "-status"]);
const NOTIFICATION_SORTS = new Set(["createdAt", "-createdAt", "severity", "-severity"]);
const SAVED_VIEW_SORTS = new Set(["createdAt", "-createdAt", "name", "-name", "page", "-page"]);

const DEFAULT_SETTINGS = Object.freeze({
  store: {
    timezone: "Africa/Casablanca",
    currency: "MAD",
    lowStockThreshold: 5,
    contactRecipients: [],
    publicContactEmail: "",
    publicPhone: "",
    whatsappNumber: ""
  }
});

const serializeObjectId = (value) => value ? String(value) : null;

const getOrderTotalExpression = {
  $sum: {
    $map: {
      input: { $ifNull: ["$products", []] },
      as: "line",
      in: {
        $multiply: [
          { $toDouble: { $ifNull: ["$$line.unitPrice", 0] } },
          { $toDouble: { $ifNull: ["$$line.quantity", 0] } }
        ]
      }
    }
  }
};

const SENSITIVE_METADATA_KEYS = new Set([
  "password",
  "token",
  "authorization",
  "cookie",
  "email",
  "phone",
  "address",
  "adresse",
  "secret"
]);

const safeMetadata = (metadata = {}) => {
  const output = {};
  Object.entries(metadata || {}).slice(0, 20).forEach(([key, value]) => {
    const normalizedKey = String(key).toLowerCase();
    if (SENSITIVE_METADATA_KEYS.has(normalizedKey)) {
      output[key] = "[redacted]";
      return;
    }
    if (["string", "number", "boolean"].includes(typeof value) || value === null) {
      output[key] = String(value).slice(0, 300);
    }
  });
  return output;
};

const capabilitiesForUser = (user) => new Set(getCapabilitiesForRole(user?.role));

const canExportType = (type, user) => {
  const required = EXPORT_PERMISSION_BY_TYPE[type];
  return Boolean(required && capabilitiesForUser(user).has(required));
};

const recordActivity = async ({
  req,
  action,
  targetType,
  targetId = "",
  severity = "info",
  metadata = {}
}) => {
  try {
    await ActivityLog.create({
      actor: req?.user?._id ?? null,
      actorName: req?.user?.name || "",
      actorRole: req?.user?.role || "",
      action,
      targetType,
      targetId: String(targetId || ""),
      severity,
      metadata: safeMetadata(metadata),
      requestId: req?.headers?.["x-request-id"] || ""
    });
  } catch {
    // Audit logging should not make the primary admin action fail.
  }
};

const listContacts = async (query) => {
  const { page, limit } = parsePagination(query);
  const sort = parseSort(query.sort, CONTACT_SORTS, "-createdAt");
  const q = normalizeSearch(query.q);
  const status = parseEnum(query.status, "status", CONTACT_STATUSES);
  const range = parseOptionalDateRange(query);
  const filter = {};
  if (status) filter.status = status;
  if (range) filter.createdAt = { $gte: range.from, $lt: range.to };
  if (q) {
    const safe = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: safe }, { email: safe }, { subject: safe }, { message: safe }];
  }
  const [data, total] = await Promise.all([
    ContactMessage.find(filter)
      .select("_id name email phone subject message status emailNotificationStatus createdAt updatedAt")
      .sort({ [sort.field]: sort.direction, _id: sort.direction })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ContactMessage.countDocuments(filter)
  ]);
  return {
    data,
    meta: buildAdminListMeta({ page, limit, total, sort: sort.value, filters: { ...(status ? { status } : {}) } })
  };
};

const updateContactStatus = async (id, status, req) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AdminQueryValidationError({ id: "Contact id is invalid." });
  }
  if (!CONTACT_STATUSES.has(status)) {
    throw new AdminQueryValidationError({ status: "status must be new, read, replied, or archived." });
  }
  const message = await ContactMessage.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).select("_id name email subject status updatedAt").lean();
  if (!message) return null;
  await recordActivity({
    req,
    action: "contact.status_updated",
    targetType: "contact",
    targetId: id,
    metadata: { status }
  });
  return message;
};

const listReviews = async (query) => {
  const { page, limit } = parsePagination(query);
  const sort = parseSort(query.sort, REVIEW_SORTS, "-createdAt");
  const q = normalizeSearch(query.q);
  const status = parseEnum(query.status, "status", REVIEW_STATUSES);
  const rating = query.rating ? Number(query.rating) : null;
  if (query.rating && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    throw new AdminQueryValidationError({ rating: "rating must be an integer between 1 and 5." });
  }
  const filter = {};
  if (status) filter.status = status;
  if (rating) filter.rating = rating;
  if (q) {
    const safe = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ displayName: safe }, { title: safe }, { comment: safe }];
  }
  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .select("_id product displayName rating title comment verifiedPurchase status createdAt updatedAt")
      .populate("product", "name slug")
      .sort({ [sort.field]: sort.direction, _id: sort.direction })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter)
  ]);
  return {
    data: reviews.map((review) => ({
      ...review,
      productName: review.product?.name || "Archived product",
      productSlug: review.product?.slug || ""
    })),
    meta: buildAdminListMeta({ page, limit, total, sort: sort.value, filters: { ...(status ? { status } : {}) } })
  };
};

const moderateReview = async (id, status, reason, req) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AdminQueryValidationError({ id: "Review id is invalid." });
  }
  if (!REVIEW_STATUSES.has(status)) {
    throw new AdminQueryValidationError({ status: "status must be pending, approved, or rejected." });
  }
  const review = await Review.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).select("_id product displayName rating status updatedAt").lean();
  if (!review) return null;
  await recordActivity({
    req,
    action: "review.moderated",
    targetType: "review",
    targetId: id,
    metadata: { status, reason: String(reason || "").slice(0, 300) }
  });
  return review;
};

const listCustomers = async (query) => {
  const { page, limit } = parsePagination(query);
  const sort = parseSort(query.sort, CUSTOMER_SORTS, "-lastOrderAt");
  const q = normalizeSearch(query.q);
  const range = parseOptionalDateRange(query);
  const match = {};
  if (range) match.createdAt = { $gte: range.from, $lt: range.to };
  if (q) {
    const safe = new RegExp(escapeRegex(q), "i");
    match.$or = [{ fullName: safe }, { email: safe }, { phone: safe }];
  }
  const sortField = sort.field;
  const [result] = await Order.aggregate([
    { $match: match },
    { $set: { orderTotal: getOrderTotalExpression } },
    { $sort: { createdAt: 1, _id: 1 } },
    {
      $group: {
        _id: { $toLower: "$email" },
        name: { $last: "$fullName" },
        email: { $last: "$email" },
        phone: { $last: "$phone" },
        orderCount: { $sum: 1 },
        totalSpent: {
          $sum: {
            $cond: [{ $ne: ["$status", "cancelled"] }, "$orderTotal", 0]
          }
        },
        lastOrderAt: { $max: "$createdAt" },
        lastStatus: { $last: "$status" }
      }
    },
    {
      $facet: {
        data: [
          { $sort: { [sortField]: sort.direction, _id: sort.direction } },
          { $skip: (page - 1) * limit },
          { $limit: limit }
        ],
        count: [{ $count: "total" }]
      }
    }
  ]);
  const total = Number(result?.count?.[0]?.total || 0);
  return {
    data: result?.data || [],
    meta: buildAdminListMeta({ page, limit, total, sort: sort.value, filters: q ? { q } : {} })
  };
};

const flattenInventory = (product) => {
  const rows = [];
  for (const color of product.colors || []) {
    const lenses = (color.lensOptions || []).length ? color.lensOptions : [null];
    for (const lens of lenses) {
      const source = lens || color;
      const stock = source.stock;
      const tracked = stock !== null && stock !== undefined;
      const status = !tracked
        ? "untracked"
        : stock <= 0
          ? "out_of_stock"
          : stock <= 5
            ? "low_stock"
            : "in_stock";
      rows.push({
        id: `${product._id}:${color._id || color.name}:${lens?._id || "base"}`,
        productId: serializeObjectId(product._id),
        productName: product.name,
        productSlug: product.slug,
        color: color.name,
        lens: lens?.name || "Base",
        sku: source.sku || product.references || "",
        stock: tracked ? Number(stock) : null,
        tracked,
        active: source.active !== false && product.isActive !== false,
        status
      });
    }
  }
  return rows;
};

const listInventory = async (query) => {
  const { page, limit } = parsePagination(query);
  const sort = parseSort(query.sort, INVENTORY_SORTS, "productName");
  const q = normalizeSearch(query.q);
  const status = parseEnum(query.status, "status", new Set(["in_stock", "low_stock", "out_of_stock", "untracked"]));
  const filter = {};
  if (q) {
    const safe = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: safe }, { references: safe }, { "colors.sku": safe }, { "colors.lensOptions.sku": safe }];
  }
  const products = await Product.find(filter)
    .select("_id name slug references isActive colors")
    .sort({ name: 1, _id: 1 })
    .lean();
  let rows = products.flatMap(flattenInventory);
  if (status) rows = rows.filter((row) => row.status === status);
  rows.sort((a, b) => {
    const direction = sort.direction;
    const av = a[sort.field] ?? "";
    const bv = b[sort.field] ?? "";
    return String(av).localeCompare(String(bv), undefined, { numeric: true }) * direction;
  });
  const total = rows.length;
  return {
    data: rows.slice((page - 1) * limit, page * limit),
    meta: buildAdminListMeta({ page, limit, total, sort: sort.value, filters: { ...(status ? { status } : {}) } })
  };
};

const getActionCenter = async (user) => {
  const capabilities = capabilitiesForUser(user);
  const [pendingOrders, processingOrders, contacts, pendingReviews, lowStockProducts, missingImagesProducts] = await Promise.all([
    capabilities.has("orders.read") ? Order.countDocuments({ status: "pending" }) : 0,
    capabilities.has("orders.read") ? Order.countDocuments({ status: "processing", createdAt: { $lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } }) : 0,
    capabilities.has("contacts.read") ? ContactMessage.countDocuments({ status: "new" }) : 0,
    capabilities.has("reviews.read") ? Review.countDocuments({ status: "pending" }) : 0,
    capabilities.has("inventory.read") ? Product.countDocuments({ isActive: true, stockStatus: { $in: ["low_stock", "out_of_stock"] } }) : 0,
    capabilities.has("products.read") ? Product.countDocuments({ isActive: true, $or: [{ colors: { $size: 0 } }, { "colors.images.0": { $exists: false } }] }) : 0
  ]);
  return [
    { key: "pending-orders", severity: pendingOrders ? "warning" : "info", title: "Pending orders", count: pendingOrders, href: "/admins/dashboard/orders?status=pending" },
    { key: "stuck-orders", severity: processingOrders ? "critical" : "info", title: "Processing orders older than 2 days", count: processingOrders, href: "/admins/dashboard/orders?status=processing" },
    { key: "new-contacts", severity: contacts ? "warning" : "info", title: "New contact messages", count: contacts, href: "/admins/dashboard/contacts?status=new" },
    { key: "pending-reviews", severity: pendingReviews ? "warning" : "info", title: "Reviews waiting for moderation", count: pendingReviews, href: "/admins/dashboard/reviews?status=pending" },
    { key: "stock-alerts", severity: lowStockProducts ? "critical" : "info", title: "Products with stock alerts", count: lowStockProducts, href: "/admins/dashboard/inventory?status=low_stock" },
    { key: "missing-images", severity: missingImagesProducts ? "warning" : "info", title: "Products missing images", count: missingImagesProducts, href: "/admins/dashboard/products" }
  ].filter((item) => item.count > 0);
};

const listActivityLogs = async (query) => {
  const { page, limit } = parsePagination(query);
  const sort = parseSort(query.sort, ACTIVITY_SORTS, "-createdAt");
  const q = normalizeSearch(query.q);
  const severity = parseEnum(query.severity, "severity", ACTIVITY_SEVERITIES);
  const filter = {};
  if (severity) filter.severity = severity;
  if (q) {
    const safe = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ action: safe }, { targetType: safe }, { actorName: safe }, { targetId: safe }];
  }
  const [data, total] = await Promise.all([
    ActivityLog.find(filter)
      .select("_id actorName actorRole action targetType targetId severity createdAt")
      .sort({ [sort.field]: sort.direction, _id: sort.direction })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ActivityLog.countDocuments(filter)
  ]);
  return { data, meta: buildAdminListMeta({ page, limit, total, sort: sort.value, filters: { ...(severity ? { severity } : {}) } }) };
};

const getSettings = async () => {
  const storeSetting = await AdminSetting.findOne({ key: "store" }).lean();
  return { store: { ...DEFAULT_SETTINGS.store, ...(storeSetting?.value || {}) } };
};

const updateSettings = async (payload, req) => {
  const store = payload?.store;
  if (!store || typeof store !== "object" || Array.isArray(store)) {
    throw new AdminQueryValidationError({ store: "store settings are required." });
  }
  const lowStockThreshold = Number(store.lowStockThreshold ?? DEFAULT_SETTINGS.store.lowStockThreshold);
  if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0 || lowStockThreshold > 1000) {
    throw new AdminQueryValidationError({ lowStockThreshold: "lowStockThreshold must be between 0 and 1000." });
  }
  const allowedStoreKeys = new Set(Object.keys(DEFAULT_SETTINGS.store));
  const unknownKeys = Object.keys(store).filter((key) => !allowedStoreKeys.has(key));
  if (unknownKeys.length) {
    throw new AdminQueryValidationError({ store: `Unknown setting keys: ${unknownKeys.join(", ")}.` });
  }
  if (store.currency && store.currency !== "MAD") {
    throw new AdminQueryValidationError({ currency: "Only MAD is currently supported." });
  }
  if (store.timezone) {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: store.timezone }).format(new Date());
    } catch {
      throw new AdminQueryValidationError({ timezone: "timezone must be a valid IANA timezone." });
    }
  }
  const value = {
    ...DEFAULT_SETTINGS.store,
    ...store,
    lowStockThreshold,
    contactRecipients: Array.isArray(store.contactRecipients)
      ? store.contactRecipients.map((entry) => String(entry).trim()).filter(Boolean).slice(0, 10)
      : []
  };
  await AdminSetting.findOneAndUpdate(
    { key: "store" },
    { value, updatedBy: req.user._id },
    { upsert: true, new: true, runValidators: true }
  );
  await recordActivity({ req, action: "settings.updated", targetType: "settings", targetId: "store", metadata: { keys: Object.keys(value) } });
  return { store: value };
};

const csvCell = (value) => {
  const text = String(value ?? "");
  const neutralized = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${neutralized.replace(/"/g, '""')}"`;
};

const buildExportContent = async (type) => {
  if (!EXPORT_TYPES.has(type)) {
    throw new AdminQueryValidationError({ type: "type must be orders, customers, subscribers, or products." });
  }
  let headers = [];
  let rows = [];
  if (type === "orders") {
    headers = ["Order ID", "Customer", "Email", "Phone", "Status", "Created At"];
    rows = await Order.find({}).sort({ createdAt: -1 }).limit(1000).lean();
    rows = rows.map((order) => [order._id, order.fullName, order.email, order.phone, order.status, order.createdAt?.toISOString?.() || ""]);
  } else if (type === "subscribers") {
    headers = ["Email", "Status", "Source", "Consent At", "Unsubscribed At"];
    rows = await Email.find({}).sort({ createdAt: -1 }).limit(1000).lean();
    rows = rows.map((subscriber) => [subscriber.email, subscriber.status, subscriber.source, subscriber.consentAt || subscriber.createdAt, subscriber.unsubscribedAt || ""]);
  } else if (type === "products") {
    headers = ["Product", "Slug", "Status", "Stock Status", "Price"];
    rows = await Product.find({}).sort({ createdAt: -1 }).limit(1000).lean();
    rows = rows.map((product) => [product.name, product.slug, product.isActive ? "active" : "archived", product.stockStatus || "", product.sale_price]);
  } else {
    headers = ["Email", "Name", "Phone", "Order Count", "Total Spent"];
    const customers = await listCustomers({ page: "1", limit: "1000" });
    rows = customers.data.map((customer) => [customer.email, customer.name, customer.phone, customer.orderCount, customer.totalSpent]);
  }
  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
};

const createExport = async (type, filters, req) => {
  if (!EXPORT_TYPES.has(type)) {
    throw new AdminQueryValidationError({ type: "type must be orders, customers, subscribers, or products." });
  }
  if (!canExportType(type, req.user)) {
    const error = new Error("Export permission denied.");
    error.statusCode = 403;
    throw error;
  }
  if (filters && Object.keys(filters).length > 0) {
    throw new AdminQueryValidationError({ filters: "Filtered exports are not available yet. Create an unfiltered export or implement filter application first." });
  }
  const filename = `${type}_${new Date().toISOString().slice(0, 10)}.csv`;
  const exportRecord = await AdminExport.create({
    type,
    status: "ready",
    filename,
    filters: filters || {},
    createdBy: req.user._id
  });
  await recordActivity({ req, action: "export.created", targetType: "export", targetId: exportRecord._id, severity: "warning", metadata: { type } });
  return exportRecord.toObject();
};

const listExports = async (query, user) => {
  const { page, limit } = parsePagination(query);
  const sort = parseSort(query.sort, EXPORT_SORTS, "-createdAt");
  const type = parseEnum(query.type, "type", EXPORT_TYPES);
  if (type && !canExportType(type, user)) {
    const error = new Error("Export permission denied.");
    error.statusCode = 403;
    throw error;
  }
  const allowedTypes = Array.from(EXPORT_TYPES).filter((entry) => canExportType(entry, user));
  const filter = type ? { type } : { type: { $in: allowedTypes } };
  const [exportsList, total] = await Promise.all([
    AdminExport.find(filter).select("_id type status filename mimeType filters createdBy createdAt updatedAt").sort({ [sort.field]: sort.direction, _id: sort.direction }).skip((page - 1) * limit).limit(limit).lean(),
    AdminExport.countDocuments(filter)
  ]);
  return { data: exportsList, meta: buildAdminListMeta({ page, limit, total, sort: sort.value, filters: { ...(type ? { type } : {}) } }) };
};

const getExportDownload = async (id, user) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AdminQueryValidationError({ id: "Export id is invalid." });
  }
  const exportRecord = await AdminExport.findById(id).lean();
  if (!exportRecord) return null;
  if (!canExportType(exportRecord.type, user)) {
    const error = new Error("Export permission denied.");
    error.statusCode = 403;
    throw error;
  }
  return {
    ...exportRecord,
    content: await buildExportContent(exportRecord.type)
  };
};

const listNotifications = async (query, user) => {
  const { page, limit } = parsePagination(query);
  const sort = parseSort(query.sort, NOTIFICATION_SORTS, "-createdAt");
  const unreadOnly = query.unread === "true";
  const filter = unreadOnly ? { readBy: { $ne: user._id } } : {};
  const [data, total] = await Promise.all([
    AdminNotification.find(filter).select("_id type title description href severity readBy createdAt").sort({ [sort.field]: sort.direction, _id: sort.direction }).skip((page - 1) * limit).limit(limit).lean(),
    AdminNotification.countDocuments(filter)
  ]);
  return {
    data: data.map((item) => ({ ...item, read: (item.readBy || []).some((id) => String(id) === String(user._id)), readBy: undefined })),
    meta: buildAdminListMeta({ page, limit, total, sort: sort.value, filters: unreadOnly ? { unread: true } : {} })
  };
};

const markNotificationRead = async (id, req) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AdminQueryValidationError({ id: "Notification id is invalid." });
  }
  return AdminNotification.findByIdAndUpdate(
    id,
    { $addToSet: { readBy: req.user._id } },
    { new: true }
  ).select("_id type title description href severity createdAt").lean();
};

const listSavedViews = async (query, user) => {
  const { page, limit } = parsePagination(query);
  const sort = parseSort(query.sort, SAVED_VIEW_SORTS, "name");
  const pageFilter = query.pageName ? String(query.pageName).trim().slice(0, 120) : "";
  const filter = {
    $or: [{ owner: user._id }, { visibility: "team" }],
    ...(pageFilter ? { page: pageFilter } : {})
  };
  const [data, total] = await Promise.all([
    SavedView.find(filter).select("_id name page filters sort visibility owner createdAt updatedAt").sort({ [sort.field]: sort.direction, _id: sort.direction }).skip((page - 1) * limit).limit(limit).lean(),
    SavedView.countDocuments(filter)
  ]);
  return { data, meta: buildAdminListMeta({ page, limit, total, sort: sort.value, filters: pageFilter ? { pageName: pageFilter } : {} }) };
};

const createSavedView = async (payload, req) => {
  const name = String(payload?.name || "").trim();
  const page = String(payload?.page || "").trim();
  if (name.length < 2 || name.length > 100) {
    throw new AdminQueryValidationError({ name: "name must contain between 2 and 100 characters." });
  }
  if (page.length < 2 || page.length > 120) {
    throw new AdminQueryValidationError({ page: "page is required." });
  }
  const requiredCapability = SAVED_VIEW_PAGE_PERMISSIONS[page];
  if (!requiredCapability || !capabilitiesForUser(req.user).has(requiredCapability)) {
    throw new AdminQueryValidationError({ page: "page is not available for saved views." });
  }
  if (payload.visibility === "team") {
    throw new AdminQueryValidationError({ visibility: "Team saved views are not available until filter sharing rules are finalized." });
  }
  const filters = payload.filters && typeof payload.filters === "object" && !Array.isArray(payload.filters)
    ? Object.fromEntries(
        Object.entries(payload.filters)
          .filter(([key, value]) => !["q", "search", "email", "phone", "name", "orderId"].includes(String(key)))
          .slice(0, 12)
          .map(([key, value]) => [String(key).slice(0, 50), String(value).slice(0, 100)])
      )
    : {};
  return SavedView.create({
    name,
    page,
    filters,
    sort: String(payload.sort || "").slice(0, 80),
    visibility: "private",
    owner: req.user._id
  });
};

const adminSearch = async (query, userCapabilities = []) => {
  const q = normalizeSearch(query.q, { maximum: 80 });
  if (!q) return [];
  const safe = new RegExp(escapeRegex(q), "i");
  const capabilities = new Set(userCapabilities);
  const tasks = [];
  if (capabilities.has("orders.read")) {
    tasks.push(Order.find({ $or: [{ fullName: safe }, { email: safe }, { phone: safe }] }).select("_id fullName email status createdAt").limit(5).lean().then((rows) => rows.map((row) => ({ type: "order", label: row.fullName, description: row.email, href: `/admins/dashboard/orders`, status: row.status }))));
  }
  if (capabilities.has("products.read")) {
    tasks.push(Product.find({ $or: [{ name: safe }, { slug: safe }, { references: safe }] }).select("_id name slug stockStatus").limit(5).lean().then((rows) => rows.map((row) => ({ type: "product", label: row.name, description: row.slug, href: `/admins/dashboard/products`, status: row.stockStatus }))));
  }
  if (capabilities.has("customers.read")) {
    tasks.push(Promise.resolve([]));
  }
  if (capabilities.has("subscribers.read")) {
    tasks.push(Email.find({ email: safe }).select("_id email status").limit(5).lean().then((rows) => rows.map((row) => ({ type: "subscriber", label: row.email, description: "Subscriber", href: "/admins/dashboard/subscribers", status: row.status }))));
  }
  if (capabilities.has("blog.manage")) {
    tasks.push(Blog.find({ title: safe }).select("_id title slug").limit(5).lean().then((rows) => rows.map((row) => ({ type: "blog", label: row.title, description: row.slug, href: "/admins/dashboard/blogs" }))));
  }
  if (capabilities.has("admins.manage")) {
    tasks.push(User.find({ $or: [{ name: safe }, { email: safe }] }).select("_id name email role").limit(5).lean().then((rows) => rows.map((row) => ({ type: "admin", label: row.name, description: row.email, href: "/admins/dashboard/admins", status: row.role }))));
  }
  const groups = await Promise.all(tasks);
  return groups.flat();
};

module.exports = {
  recordActivity,
  listContacts,
  updateContactStatus,
  listReviews,
  moderateReview,
  listCustomers,
  listInventory,
  getActionCenter,
  listActivityLogs,
  getSettings,
  updateSettings,
  createExport,
  buildExportContent,
  canExportType,
  listExports,
  getExportDownload,
  listNotifications,
  markNotificationRead,
  listSavedViews,
  createSavedView,
  adminSearch
};
