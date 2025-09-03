const ProductView = require("../models/ProductView");

const trackProductView = async (req, res) => {
  try {
    const { productId } = req.body;
    if(!productId){
      return res.status(500).json({ success: false});
    }
    const ip =
      req?.body?.ip ||
      req?.headers["x-forwarded-for"]?.split(",")[0] ||
      req?.connection?.remoteAddress;

    const today = new Date().toISOString().slice(0, 10);

    await ProductView.findOneAndUpdate(
      { productId, ipAddress: ip, date: today },
      { $setOnInsert: { productId, ipAddress: ip, date: today } },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, message: "Product view recorded" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};

module.exports = { trackProductView };
