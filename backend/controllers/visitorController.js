const Visitor = require("../models/View");
const { listVisitorAnalytics } = require("../services/admin/adminListService");
const {
  DEFAULT_TIMEZONE,
  DAY_MS,
  AdminDateRangeValidationError
} = require("../utils/adminDateRange");
const {
  AdminQueryValidationError
} = require("../utils/adminQuery");

const ToggleVisitor = async (req, res) => {
  try {
    const visitorId = typeof req.params.visitorId === "string"
      ? req.params.visitorId.trim()
      : "";
    if (!visitorId || visitorId.length > 200 || !/^[A-Za-z0-9._:-]+$/.test(visitorId)) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Invalid visitor identifier"
      });
    }
    const today = new Date().toISOString().slice(0, 10);

    const userAgent = String(req.get("user-agent") || req.body?.userAgent || "Unknown").slice(0, 1024);
    const referrer = String(req.get("referer") || req.body?.referrer || "direct").slice(0, 2048);

    await Visitor.findOneAndUpdate(
      { ipAddress: visitorId, date: today },
      {
        $setOnInsert: { ipAddress: visitorId, date: today },
        $set: {
          lastVisit: new Date(),
          referrer,
          userAgent,
        },
        $inc: { visitCount: 1 },
      },
      { upsert: true, new: true, setDefaultsOnInsert: false }
    );

    res.status(200).json({
      success: true,
      message: "Visit recorded successfully"
    });
  } catch (_err) {
    console.error("Visitor tracking failed");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const getVisitors = async (req, res) => {
  try {
    const now = new Date();
    const query = req.query.from || req.query.to
      ? req.query
      : {
          ...req.query,
          from: new Date(now.getTime() - 30 * DAY_MS).toISOString(),
          to: now.toISOString(),
          timezone: req.query.timezone || DEFAULT_TIMEZONE
        };
    const data = await listVisitorAnalytics(query);
    return res.status(200).json({
      success: true,
      status: "success",
      data,
      meta: {
        generatedAt: new Date().toISOString(),
        deprecated: true,
        replacement: "/api/admin/analytics/visitors"
      }
    });
  } catch (error) {
    if (error instanceof AdminDateRangeValidationError || error instanceof AdminQueryValidationError) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        status: "error",
        message: "The analytics query is invalid.",
        errors: error.errors
      });
    }
    console.error("Visitor list request failed");
    return res.status(500).json({
      success: false,
      status: "error",
      message: "Failed to fetch visitors"
    });
  }
};


module.exports = { ToggleVisitor , getVisitors};
