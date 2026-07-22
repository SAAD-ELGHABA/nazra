const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const User = require("../models/User");
const {
  requestPasswordReset,
  resetPassword,
  consumeFixedWindow,
  consumeCooldown,
  AuthConfigurationError,
  InvalidResetCodeError,
  ReusedPasswordError
} = require("../services/passwordResetService");
const { isEmailConfigured } = require("../utils/sendEmail");

const FORGOT_RESPONSE = "If an account exists for that email, a reset code has been sent.";
const RATE_LIMIT_RESPONSE = "Too many requests. Please try again later.";
const JWT_ISSUER = "nazra-api";
const JWT_AUDIENCE = "nazra-admin";
const FORGOT_MINIMUM_RESPONSE_MS = 750;
const FORGOT_RESPONSE_JITTER_MS = 250;

class AuthValidationError extends Error {
  constructor(errors) {
    super("Validation failed");
    this.errors = errors;
  }
}

const requirePlainObject = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AuthValidationError({ body: "Request body must be a JSON object." });
  }
};

const rejectUnknownFields = (body, allowed) => {
  const unknown = Object.keys(body).filter((key) => !allowed.includes(key));
  if (unknown.length) {
    throw new AuthValidationError({ body: `Unknown field: ${unknown[0]}` });
  }
};

const parseEmail = (value) => {
  if (typeof value !== "string") throw new AuthValidationError({ email: "Email is required." });
  const email = value.trim().toLowerCase();
  if (!email || email.length > 254 || !validator.isEmail(email)) {
    throw new AuthValidationError({ email: "Enter a valid email address." });
  }
  return email;
};

const parseNewPassword = (value, field = "password") => {
  if (typeof value !== "string") throw new AuthValidationError({ [field]: "Password is required." });
  if (Array.from(value).length < 12 || Buffer.byteLength(value, "utf8") > 72) {
    throw new AuthValidationError({
      [field]: "Password must be at least 12 characters and at most 72 UTF-8 bytes."
    });
  }
  return value;
};

const parseLoginBody = (body) => {
  requirePlainObject(body);
  rejectUnknownFields(body, ["email", "password"]);
  const email = parseEmail(body.email);
  if (typeof body.password !== "string" || !body.password || Buffer.byteLength(body.password, "utf8") > 256) {
    throw new AuthValidationError({ password: "Password is required." });
  }
  return { email, password: body.password };
};

const parseRegisterBody = (body) => {
  requirePlainObject(body);
  rejectUnknownFields(body, ["name", "email", "password", "role"]);
  if (typeof body.name !== "string" || body.name.trim().length < 2 || body.name.trim().length > 100) {
    throw new AuthValidationError({ name: "Name must contain between 2 and 100 characters." });
  }
  const role = body.role === undefined ? "admin" : body.role;
  if (!["admin", "superadmin"].includes(role)) {
    throw new AuthValidationError({ role: "Role must be admin or superadmin." });
  }
  return {
    name: body.name.trim(),
    email: parseEmail(body.email),
    password: parseNewPassword(body.password, "password"),
    role
  };
};

const parseForgotBody = (body) => {
  requirePlainObject(body);
  rejectUnknownFields(body, ["email"]);
  return { email: parseEmail(body.email) };
};

const parseResetBody = (body) => {
  requirePlainObject(body);
  rejectUnknownFields(body, ["email", "code", "password", "passwordConfirmation"]);
  if (typeof body.code !== "string" || !/^\d{8}$/.test(body.code)) {
    throw new AuthValidationError({ code: "Reset code must contain exactly 8 digits." });
  }
  const password = parseNewPassword(body.password, "password");
  if (typeof body.passwordConfirmation !== "string" || body.passwordConfirmation !== password) {
    throw new AuthValidationError({ passwordConfirmation: "Passwords do not match." });
  }
  return {
    email: parseEmail(body.email),
    code: body.code,
    password,
    passwordConfirmation: body.passwordConfirmation
  };
};

const getClientIdentifier = (req) => {
  return String(req.ip || req.socket?.remoteAddress || "unknown");
};

const waitForForgotResponseFloor = async (startedAt, targetDurationMs) => {
  const remaining = targetDurationMs - (Date.now() - startedAt);
  if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
};

const enforceLimits = async (res, limits) => {
  for (const limit of limits) {
    const result = await consumeFixedWindow(limit);
    if (!result.allowed) {
      res.set("Retry-After", String(result.retryAfter));
      res.status(429).json({
        success: false,
        message: RATE_LIMIT_RESPONSE,
        retryAfterSeconds: result.retryAfter
      });
      return false;
    }
  }
  return true;
};

const generateToken = (user) => {
  if (typeof process.env.JWT_SECRET !== "string" || process.env.JWT_SECRET.length < 32) {
    throw new AuthConfigurationError("JWT_SECRET is not configured securely");
  }
  const authVersion = Number(user.authVersion);
  if (!Number.isSafeInteger(authVersion) || authVersion < 0) {
    throw new AuthConfigurationError("User authentication version is invalid");
  }
  return jwt.sign(
    { userId: user._id.toString(), authVersion },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
      algorithm: "HS256",
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
    }
  );
};

const validationResponse = (res, error) => res.status(400).json({
  success: false,
  message: "Validation failed",
  errors: error.errors
});

const loginUser = async (req, res) => {
  let payload;
  try {
    payload = parseLoginBody(req.body);
  } catch (error) {
    if (error instanceof AuthValidationError) return validationResponse(res, error);
    throw error;
  }

  try {
    const ip = getClientIdentifier(req);
    if (!await enforceLimits(res, [
      { scope: "login-email", identifier: payload.email, limit: 10, windowMs: 15 * 60 * 1000 },
      { scope: "login-ip", identifier: ip, limit: 30, windowMs: 15 * 60 * 1000 }
    ])) return;

    const user = await User.findOne({
      email: { $regex: `^${payload.email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" }
    }).select("+password +authVersion");
    if (!user || !await user.matchPassword(payload.password)) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user)
    });
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return res.status(500).json({ success: false, message: "Server configuration error" });
    }
    console.error("Login request failed");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const registerUser = async (req, res) => {
  let payload;
  try {
    payload = parseRegisterBody(req.body);
  } catch (error) {
    if (error instanceof AuthValidationError) return validationResponse(res, error);
    throw error;
  }

  try {
    const existing = await User.findOne({
      email: { $regex: `^${payload.email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" }
    }).select("_id");
    if (existing) return res.status(409).json({ success: false, message: "User already exists" });

    const user = await User.create(payload);
    return res.status(201).json({
      success: true,
      message: "Administrator created successfully.",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }
    console.error("Registration request failed");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  let payload;
  try {
    payload = parseForgotBody(req.body);
  } catch (error) {
    if (error instanceof AuthValidationError) return validationResponse(res, error);
    throw error;
  }

  if (!isEmailConfigured()) {
    return res.status(503).json({ success: false, message: "Password reset service is temporarily unavailable." });
  }

  const startedAt = Date.now();
  const targetDurationMs = FORGOT_MINIMUM_RESPONSE_MS + crypto.randomInt(0, FORGOT_RESPONSE_JITTER_MS + 1);
  const genericAcceptedResponse = async () => {
    await waitForForgotResponseFloor(startedAt, targetDurationMs);
    return res.status(202).json({ success: true, message: FORGOT_RESPONSE });
  };

  try {
    const ip = getClientIdentifier(req);
    if (!await enforceLimits(res, [
      { scope: "forgot-ip", identifier: ip, limit: 5, windowMs: 15 * 60 * 1000 }
    ])) return;

    const emailLimit = await consumeFixedWindow({
      scope: "forgot-email",
      identifier: payload.email,
      limit: 3,
      windowMs: 60 * 60 * 1000
    });
    if (!emailLimit.allowed) return genericAcceptedResponse();

    const cooldown = await consumeCooldown({
      scope: "forgot-email-cooldown",
      identifier: payload.email,
      cooldownMs: 60 * 1000
    });
    if (!cooldown.allowed) return genericAcceptedResponse();

    await requestPasswordReset(payload);
    return genericAcceptedResponse();
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return res.status(503).json({ success: false, message: "Password reset service is temporarily unavailable." });
    }
    console.error("Password reset request failed");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const resetPasswordHandler = async (req, res) => {
  let payload;
  try {
    payload = parseResetBody(req.body);
  } catch (error) {
    if (error instanceof AuthValidationError) return validationResponse(res, error);
    throw error;
  }

  try {
    const ip = getClientIdentifier(req);
    if (!await enforceLimits(res, [
      { scope: "reset-email", identifier: payload.email, limit: 10, windowMs: 15 * 60 * 1000 },
      { scope: "reset-ip", identifier: ip, limit: 20, windowMs: 15 * 60 * 1000 }
    ])) return;

    await resetPassword(payload);
    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Please sign in again."
    });
  } catch (error) {
    if (error instanceof InvalidResetCodeError) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset code." });
    }
    if (error instanceof ReusedPasswordError) {
      return res.status(400).json({ success: false, message: "New password must be different from the current password." });
    }
    if (error instanceof AuthConfigurationError) {
      return res.status(503).json({ success: false, message: "Password reset service is temporarily unavailable." });
    }
    console.error("Password reset failed");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const listUsers = async (_req, res) => {
  try {
    const users = await User.find().select("_id name email role").lean();
    return res.status(200).json({ success: true, users });
  } catch (_error) {
    console.error("Administrator list request failed");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword: resetPasswordHandler,
  listUsers,
  _test: {
    AuthValidationError,
    parseEmail,
    parseNewPassword,
    parseLoginBody,
    parseRegisterBody,
    parseForgotBody,
    parseResetBody,
    getClientIdentifier,
    generateToken,
    waitForForgotResponseFloor,
    JWT_ISSUER,
    JWT_AUDIENCE,
    FORGOT_MINIMUM_RESPONSE_MS,
    FORGOT_RESPONSE_JITTER_MS
  }
};
