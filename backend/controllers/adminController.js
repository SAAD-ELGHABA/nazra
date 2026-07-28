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

module.exports = {
  getDashboardSummary,
  getOrders: handleList(listOrders),
  getProducts: handleList(listProducts),
  getSubscribers: handleList(listSubscribers),
  getBlogs: handleList(listBlogs),
  getVisitorAnalytics
};
