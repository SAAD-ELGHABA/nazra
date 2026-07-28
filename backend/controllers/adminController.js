const {
  AdminQueryValidationError,
  sendAdminValidationError
} = require("../utils/adminQuery");
const {
  AdminDateRangeValidationError,
  parseAdminDateRange,
  chooseGranularity,
  sendDateRangeValidationError
} = require("../utils/adminDateRange");
const { getCapabilitiesForRole } = require("../middleware/requirePermission");
const { buildDashboardSummary } = require("../services/admin/dashboardMetricsService");
const {
  listOrders,
  listProducts,
  listSubscribers,
  listBlogs,
  listVisitorAnalytics
} = require("../services/admin/adminListService");
const {
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
  listExports,
  getExportDownload,
  listNotifications,
  markNotificationRead,
  listSavedViews,
  createSavedView,
  adminSearch
} = require("../services/admin/adminFeatureService");

const internalError = (res) => res.status(500).json({
  success: false,
  code: "INTERNAL_ERROR",
  message: "Internal server error."
});

const handleList = (service) => async (req, res) => {
  try {
    const result = await service(req.query, req.user);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof AdminQueryValidationError) return sendAdminValidationError(res, error);
    if (error instanceof AdminDateRangeValidationError) return sendDateRangeValidationError(res, error);
    if (error?.statusCode === 403) {
      return res.status(403).json({
        success: false,
        code: "FORBIDDEN",
        message: "You do not have permission to perform this action."
      });
    }
    console.error("Admin list request failed");
    return internalError(res);
  }
};

const getDashboardSummary = async (req, res) => {
  try {
    const range = parseAdminDateRange(req.query);
    const granularity = chooseGranularity(range.durationMs, req.query.granularity);
    const data = await buildDashboardSummary(range, granularity, {
      capabilities: getCapabilitiesForRole(req.user?.role)
    });
    return res.status(200).json({
      success: true,
      data,
      meta: {
        generatedAt: new Date().toISOString(),
        currency: "MAD"
      }
    });
  } catch (error) {
    if (error instanceof AdminDateRangeValidationError) return sendDateRangeValidationError(res, error);
    console.error("Admin dashboard summary request failed");
    return internalError(res);
  }
};

const getVisitorAnalytics = async (req, res) => {
  try {
    const data = await listVisitorAnalytics(req.query);
    return res.status(200).json({
      success: true,
      data,
      meta: { generatedAt: new Date().toISOString() }
    });
  } catch (error) {
    if (error instanceof AdminQueryValidationError) return sendAdminValidationError(res, error);
    if (error instanceof AdminDateRangeValidationError) return sendDateRangeValidationError(res, error);
    console.error("Admin visitor analytics request failed");
    return internalError(res);
  }
};

const updateContact = async (req, res) => {
  try {
    const contact = await updateContactStatus(req.params.id, req.body?.status, req);
    if (!contact) {
      return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Contact message was not found." });
    }
    return res.status(200).json({ success: true, data: contact });
  } catch (error) {
    if (error instanceof AdminQueryValidationError) return sendAdminValidationError(res, error);
    console.error("Admin contact update failed");
    return internalError(res);
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await moderateReview(req.params.id, req.body?.status, req.body?.reason, req);
    if (!review) {
      return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Review was not found." });
    }
    return res.status(200).json({ success: true, data: review });
  } catch (error) {
    if (error instanceof AdminQueryValidationError) return sendAdminValidationError(res, error);
    console.error("Admin review update failed");
    return internalError(res);
  }
};

const getActionCenterSummary = async (_req, res) => {
  try {
    return res.status(200).json({ success: true, data: await getActionCenter(_req.user) });
  } catch {
    console.error("Admin action center request failed");
    return internalError(res);
  }
};

const getAdminSettings = async (_req, res) => {
  try {
    return res.status(200).json({ success: true, data: await getSettings() });
  } catch {
    console.error("Admin settings request failed");
    return internalError(res);
  }
};

const patchAdminSettings = async (req, res) => {
  try {
    return res.status(200).json({ success: true, data: await updateSettings(req.body, req) });
  } catch (error) {
    if (error instanceof AdminQueryValidationError) return sendAdminValidationError(res, error);
    console.error("Admin settings update failed");
    return internalError(res);
  }
};

const createAdminExport = async (req, res) => {
  try {
    const exportRecord = await createExport(req.body?.type, req.body?.filters, req);
    return res.status(201).json({
      success: true,
      data: {
        id: String(exportRecord._id),
        type: exportRecord.type,
        status: exportRecord.status,
        filename: exportRecord.filename,
        createdAt: exportRecord.createdAt
      }
    });
  } catch (error) {
    if (error instanceof AdminQueryValidationError) return sendAdminValidationError(res, error);
    if (error?.statusCode === 403) {
      return res.status(403).json({ success: false, code: "FORBIDDEN", message: "You do not have permission to create this export." });
    }
    console.error("Admin export creation failed");
    return internalError(res);
  }
};

const downloadAdminExport = async (req, res) => {
  try {
    const exportRecord = await getExportDownload(req.params.id, req.user);
    if (!exportRecord) {
      return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Export was not found." });
    }
    res.setHeader("Content-Type", exportRecord.mimeType || "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${exportRecord.filename}"`);
    return res.status(200).send(exportRecord.content || "");
  } catch (error) {
    if (error instanceof AdminQueryValidationError) return sendAdminValidationError(res, error);
    if (error?.statusCode === 403) {
      return res.status(403).json({ success: false, code: "FORBIDDEN", message: "You do not have permission to download this export." });
    }
    console.error("Admin export download failed");
    return internalError(res);
  }
};

const markNotification = async (req, res) => {
  try {
    const notification = await markNotificationRead(req.params.id, req);
    if (!notification) {
      return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Notification was not found." });
    }
    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    if (error instanceof AdminQueryValidationError) return sendAdminValidationError(res, error);
    console.error("Admin notification update failed");
    return internalError(res);
  }
};

const createView = async (req, res) => {
  try {
    const view = await createSavedView(req.body, req);
    return res.status(201).json({ success: true, data: view });
  } catch (error) {
    if (error instanceof AdminQueryValidationError) return sendAdminValidationError(res, error);
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, code: "DUPLICATE", message: "A saved view with this name already exists for this page." });
    }
    console.error("Admin saved view creation failed");
    return internalError(res);
  }
};

const searchAdmin = async (req, res) => {
  try {
    const capabilities = getCapabilitiesForRole(req.user?.role);
    return res.status(200).json({ success: true, data: await adminSearch(req.query, capabilities) });
  } catch (error) {
    if (error instanceof AdminQueryValidationError) return sendAdminValidationError(res, error);
    console.error("Admin search failed");
    return internalError(res);
  }
};

module.exports = {
  getDashboardSummary,
  getOrders: handleList(listOrders),
  getProducts: handleList(listProducts),
  getSubscribers: handleList(listSubscribers),
  getBlogs: handleList(listBlogs),
  getVisitorAnalytics,
  getContacts: handleList(listContacts),
  updateContact,
  getReviews: handleList(listReviews),
  updateReview,
  getCustomers: handleList(listCustomers),
  getInventory: handleList(listInventory),
  getActionCenterSummary,
  getActivityLogs: handleList(listActivityLogs),
  getAdminSettings,
  patchAdminSettings,
  createAdminExport,
  getExports: handleList(listExports),
  downloadAdminExport,
  getNotifications: handleList(listNotifications),
  markNotification,
  getSavedViews: handleList(listSavedViews),
  createView,
  searchAdmin
};
