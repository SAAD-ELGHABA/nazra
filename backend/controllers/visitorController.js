const Visitor = require("../models/View");

const ToggleVisitor = async (req, res) => {
  try {
    const ip =
      req?.body?.ip ||
      req?.headers["x-forwarded-for"]?.split(",")[0] ||
      req?.connection?.remoteAddress;

    const today = new Date().toISOString().slice(0, 10);

    await Visitor.findOneAndUpdate(
      { ipAddress: ip, date: today },
      { $setOnInsert: { ipAddress: ip, date: today } },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, message: "Visit recorded" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};

const getVisitors = async (req, res) => {
  try {
    const views = await Visitor.find();
    return res.status(200).json({
      status: "success",
      views: views
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch visitors",
      error: err.message
    });
  }
};


module.exports = { ToggleVisitor , getVisitors};
