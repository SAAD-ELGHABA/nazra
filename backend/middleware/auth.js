const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

const TOKEN_PATTERN = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/;
const JWT_ISSUER = "nazra-api";
const JWT_AUDIENCE = "nazra-admin";

const auth = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const match = typeof authHeader === "string" && authHeader.length <= 4096
    ? authHeader.match(TOKEN_PATTERN)
    : null;
  if (!match) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  if (typeof process.env.JWT_SECRET !== "string" || process.env.JWT_SECRET.length < 32) {
    return res.status(500).json({ success: false, message: "Server configuration error" });
  }

  try {
    const decoded = jwt.verify(match[1], process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
    });
    if (!decoded.userId || !mongoose.isValidObjectId(decoded.userId)) {
      return res.status(401).json({ success: false, message: "Authentication failed" });
    }

    const user = await User.findById(decoded.userId)
      .select("_id name email role +authVersion");
    const tokenVersion = decoded.authVersion;
    if (!user || !Number.isSafeInteger(tokenVersion) || tokenVersion < 0 || tokenVersion !== Number(user.authVersion || 0)) {
      return res.status(401).json({ success: false, message: "Authentication failed" });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

module.exports = auth;
module.exports._test = { TOKEN_PATTERN, JWT_ISSUER, JWT_AUDIENCE };
