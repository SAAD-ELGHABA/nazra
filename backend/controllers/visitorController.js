const Visitor = require("../models/View");

const ToggleVisitor = async (req, res) => {
  try {
    const ip = req.params.visitorId; 
    const today = new Date().toISOString().slice(0, 10);

    const userAgent = req.get("user-agent") || req.body.userAgent || "Unknown";
    const referrer = req.get("referer") || req.body.referrer  || "direct";

    const visitor = await Visitor.findOneAndUpdate(
      { ipAddress: ip, date: today },
      {
        $setOnInsert: { ipAddress: ip, date: today },
        $set: {
          lastVisit: new Date(),
          referrer,
          userAgent,
        },
        $inc: { visitCount: 1 },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: "Visit recorded successfully",
      visitor,
    });
  } catch (err) {
    console.error("Error recording visit:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
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
