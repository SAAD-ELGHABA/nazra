const Email = require('../models/Email');
const validator = require('validator');
const {
  AuthConfigurationError,
  consumeFixedWindow,
} = require("../services/passwordResetService");

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

    const ip = String(req.ip || req.socket?.remoteAddress || "unknown");
    const limits = [
      { scope: "newsletter-ip", identifier: ip, limit: 10, windowMs: 15 * 60 * 1000 },
      { scope: "newsletter-email", identifier: email, limit: 3, windowMs: 60 * 60 * 1000 },
    ];
    for (const limit of limits) {
      const result = await consumeFixedWindow(limit);
      if (!result.allowed) {
        res.set("Retry-After", String(result.retryAfter));
        return res.status(429).json({
          success: false,
          code: "RATE_LIMITED",
          message: "Too many subscription attempts. Please try again later.",
          retryAfterSeconds: result.retryAfter,
        });
      }
    }

    await Email.updateOne(
      { email },
      {
        $setOnInsert: {
          email,
          status: 'active',
          source: 'newsletter',
          consentAt: new Date()
        }
      },
      { upsert: true }
    );

    return res.status(200).json(SUBSCRIPTION_RESPONSE);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(200).json(SUBSCRIPTION_RESPONSE);
    }
    if (err instanceof AuthConfigurationError) {
      return res.status(503).json({
        success: false,
        message: "Subscription service is temporarily unavailable"
      });
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
    const subscribedEmails = await Email.find(
      {},
      "_id email status source consentAt unsubscribedAt createdAt updatedAt"
    ).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      emails: subscribedEmails,
      message: "success",
    });
  } catch (error) {
    console.error("Subscriber list request failed");
    res.status(500).json({
      success: false,
      message: "Server error while fetching subscribers"
    });
  }
}

module.exports = {
  storeEmail,
  getSubEmails
};
