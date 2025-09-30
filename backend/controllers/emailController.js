const Email = require('../models/Email');
const Order = require('../models/Order');

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


const getSubEmails = async (req,res)=>{
  try {
    const subscribedEmails = await Email.find({},"email createdAt updatedAt");
    const orderEmails = await Order.find({}, "email createdAt updatedAt phone");
    const formattedOrderEmails = orderEmails.map((o) => ({
      email: o.email,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      phone:o.phone
    }));

    const allEmails = [...subscribedEmails, ...formattedOrderEmails];

    const uniqueEmailMap = new Map();
    allEmails.forEach((item) => {
      if (!uniqueEmailMap.has(item.email)) {
        uniqueEmailMap.set(item.email, item);
      }
    });

    const uniqueEmails = Array.from(uniqueEmailMap.values());

    return res.status(200).json({
      emails: uniqueEmails,
      message: "success",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while storing email",
      error: error.message
    });
  }
}

module.exports = {
  storeEmail,
  getSubEmails
};
