const crypto = require("node:crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const PasswordResetChallenge = require("../models/PasswordResetChallenge");
const AuthRateLimit = require("../models/AuthRateLimit");
const { sendEmail } = require("../utils/sendEmail");
const { passwordResetCodeEmail } = require("../emails/passwordResetCodeEmail");

const RESET_CODE_DIGITS = 8;
const RESET_CODE_TTL_MS = 10 * 60 * 1000;
const RESET_CODE_MAX_ATTEMPTS = 5;

class AuthConfigurationError extends Error {}
class InvalidResetCodeError extends Error {}
class ReusedPasswordError extends Error {}

const requiredSecret = (name) => {
  const value = process.env[name];
  if (typeof value !== "string" || value.length < 32) {
    throw new AuthConfigurationError(`${name} is not configured securely`);
  }
  return value;
};

const hmac = (secretName, context) => crypto
  .createHmac("sha256", requiredSecret(secretName))
  .update(context)
  .digest("hex");

const generateResetCode = () => crypto
  .randomInt(0, 10 ** RESET_CODE_DIGITS)
  .toString()
  .padStart(RESET_CODE_DIGITS, "0");

const hashResetCode = (challengeId, code) => hmac(
  "PASSWORD_RESET_CODE_PEPPER",
  `password-reset-code:${challengeId.toString()}:${code}`
);

const getResetPageUrl = () => {
  const configuredUrl = String(process.env.FRONTEND_URL || "").trim().replace(/\/+$/, "");
  let parsed;
  try {
    parsed = new URL(configuredUrl);
  } catch (_error) {
    throw new AuthConfigurationError("FRONTEND_URL is not configured securely");
  }
  if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw new AuthConfigurationError("FRONTEND_URL is not configured securely");
  }
  return `${parsed.toString().replace(/\/+$/, "")}/reset-password`;
};

const rateLimitKey = (scope, identifier, windowStart = "persistent") => hmac(
  "AUTH_RATE_LIMIT_PEPPER",
  `auth-rate-limit:${scope}:${windowStart}:${identifier}`
);

const consumeFixedWindow = async ({ scope, identifier, limit, windowMs, now = new Date() }) => {
  const nowMs = now.getTime();
  const windowStart = Math.floor(nowMs / windowMs) * windowMs;
  const windowEndsAt = new Date(windowStart + windowMs);
  const id = rateLimitKey(scope, identifier, String(windowStart));
  const update = {
    $inc: { count: 1 },
    $setOnInsert: {
      scope,
      windowEndsAt,
      expiresAt: new Date(windowEndsAt.getTime() + windowMs)
    }
  };

  let bucket;
  try {
    bucket = await AuthRateLimit.findOneAndUpdate({ _id: id }, update, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
  } catch (error) {
    if (error?.code !== 11000) throw error;
    bucket = await AuthRateLimit.findOneAndUpdate({ _id: id }, { $inc: { count: 1 } }, { new: true });
  }

  const retryAfter = Math.max(1, Math.ceil((windowEndsAt.getTime() - nowMs) / 1000));
  return { allowed: Boolean(bucket) && bucket.count <= limit, retryAfter };
};

const consumeCooldown = async ({ scope, identifier, cooldownMs, now = new Date() }) => {
  const id = rateLimitKey(scope, identifier);
  const nextAllowedAt = new Date(now.getTime() + cooldownMs);
  try {
    const bucket = await AuthRateLimit.findOneAndUpdate(
      { _id: id, nextAllowedAt: { $lte: now } },
      {
        $set: {
          scope,
          nextAllowedAt,
          expiresAt: new Date(nextAllowedAt.getTime() + cooldownMs)
        },
        $setOnInsert: { count: 0 }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return { allowed: Boolean(bucket), retryAfter: Math.ceil(cooldownMs / 1000) };
  } catch (error) {
    if (error?.code !== 11000) throw error;
    const bucket = await AuthRateLimit.findById(id).lean();
    const retryAfter = Math.max(
      1,
      Math.ceil(((bucket?.nextAllowedAt?.getTime() || nextAllowedAt.getTime()) - now.getTime()) / 1000)
    );
    return { allowed: false, retryAfter };
  }
};

const findUserByNormalizedEmail = (email, selection = "") => User.findOne({
  email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" }
}).select(selection);

const requestPasswordReset = async ({ email }) => {
  // Validate the reset pepper even when the address does not exist so configuration
  // behavior cannot be used to enumerate accounts.
  requiredSecret("PASSWORD_RESET_CODE_PEPPER");
  const resetPageUrl = getResetPageUrl();
  const user = await findUserByNormalizedEmail(email, "_id name email");
  if (!user) return { sent: false };

  const now = new Date();
  await PasswordResetChallenge.updateMany(
    { emailNormalized: email, active: true },
    { $set: { active: false, invalidatedAt: now } }
  );

  const challengeId = new mongoose.Types.ObjectId();
  const code = generateResetCode();
  const challenge = await PasswordResetChallenge.create({
    _id: challengeId,
    user: user._id,
    emailNormalized: email,
    codeHash: hashResetCode(challengeId, code),
    expiresAt: new Date(now.getTime() + RESET_CODE_TTL_MS)
  });

  try {
    const emailContent = passwordResetCodeEmail({
      name: user.name,
      code,
      expiresInMinutes: 10,
      resetPageUrl
    });
    await sendEmail({ to: user.email, ...emailContent });
    challenge.sentAt = new Date();
    await challenge.save();
    return { sent: true };
  } catch (_error) {
    await PasswordResetChallenge.updateOne(
      { _id: challenge._id, active: true },
      { $set: { active: false, invalidatedAt: new Date() } }
    ).catch(() => undefined);
    return { sent: false };
  }
};

const recordFailedAttempt = async (challengeId, now) => PasswordResetChallenge.findOneAndUpdate(
  {
    _id: challengeId,
    active: true,
    expiresAt: { $gt: now },
    failedAttempts: { $lt: RESET_CODE_MAX_ATTEMPTS }
  },
  [
    { $set: { failedAttempts: { $add: [{ $ifNull: ["$failedAttempts", 0] }, 1] } } },
    {
      $set: {
        active: { $cond: [{ $gte: ["$failedAttempts", RESET_CODE_MAX_ATTEMPTS] }, false, "$active"] },
        invalidatedAt: {
          $cond: [{ $gte: ["$failedAttempts", RESET_CODE_MAX_ATTEMPTS] }, now, "$invalidatedAt"]
        }
      }
    }
  ],
  { new: true }
);

const resetPassword = async ({ email, code, password }) => {
  const now = new Date();
  const challenge = await PasswordResetChallenge.findOne({
    emailNormalized: email,
    active: true,
    expiresAt: { $gt: now },
    failedAttempts: { $lt: RESET_CODE_MAX_ATTEMPTS }
  }).select("+codeHash");

  if (!challenge) throw new InvalidResetCodeError();

  const computedHash = hashResetCode(challenge._id, code);
  const storedHash = Buffer.from(challenge.codeHash, "hex");
  const candidateHash = Buffer.from(computedHash, "hex");
  if (storedHash.length !== candidateHash.length || !crypto.timingSafeEqual(storedHash, candidateHash)) {
    await recordFailedAttempt(challenge._id, now);
    throw new InvalidResetCodeError();
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const claimed = await PasswordResetChallenge.findOneAndUpdate(
        {
          _id: challenge._id,
          codeHash: computedHash,
          active: true,
          expiresAt: { $gt: new Date() },
          failedAttempts: { $lt: RESET_CODE_MAX_ATTEMPTS }
        },
        { $set: { active: false, consumedAt: new Date() } },
        { new: true, session }
      );
      if (!claimed) throw new InvalidResetCodeError();

      const user = await User.findById(claimed.user).select("+password +authVersion").session(session);
      if (!user) throw new InvalidResetCodeError();
      if (await bcrypt.compare(password, user.password)) throw new ReusedPasswordError();

      if (user.role === "super-admin") user.role = "superadmin";
      user.password = password;
      await user.save({ session });

      await PasswordResetChallenge.updateMany(
        { user: user._id, active: true },
        { $set: { active: false, invalidatedAt: new Date() } },
        { session }
      );
    });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  requestPasswordReset,
  resetPassword,
  consumeFixedWindow,
  consumeCooldown,
  AuthConfigurationError,
  InvalidResetCodeError,
  ReusedPasswordError,
  _test: {
    RESET_CODE_DIGITS,
    RESET_CODE_TTL_MS,
    RESET_CODE_MAX_ATTEMPTS,
    generateResetCode,
    hashResetCode,
    getResetPageUrl,
    rateLimitKey,
    recordFailedAttempt,
    findUserByNormalizedEmail
  }
};
