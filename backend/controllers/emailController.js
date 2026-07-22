const Email = require('../models/Email');
const Order = require('../models/Order');
const validator = require('validator');

const MAX_EMAIL_LENGTH = 254;
const SUBSCRIPTION_RESPONSE = {
  success: true,
  message: 'Subscription request received'
};

const storeEmail = async (req, res) => {
  try {
    const email = typeof req.body?.email === 'string'
      ? req.body.email.trim().toLowerCase()
      : '';

    if (
      !email ||
      email.length > MAX_EMAIL_LENGTH ||
      !validator.isEmail(email, {
        allow_utf8_local_part: false,
        require_tld: true,
        ignore_max_length: false
      })
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    await Email.updateOne(
      { email },
      { $setOnInsert: { email } },
      { upsert: true }
    );

    return res.status(200).json(SUBSCRIPTION_RESPONSE);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(200).json(SUBSCRIPTION_RESPONSE);
    }

    console.error('Newsletter subscription persistence failed');
    return res.status(500).json({
      success: false,
      message: 'Unable to process subscription request'
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
