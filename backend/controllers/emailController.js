const Email = require('../models/Email');

const storeEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const existing = await Email.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already subscribed" });
    }

    const newEmail = await Email.create({ email });

    res.status(201).json({
      success: true,
      message: "Email stored successfully",
      email: newEmail
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error while storing email",
      error: err.message
    });
  }
};

module.exports = {
  storeEmail
};
