const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const authController = require("../controllers/authController");

const createResponse = () => ({
  statusCode: 200,
  headers: {},
  set(name, value) { this.headers[name] = value; return this; },
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; }
});

const invokeAuth = async ({ token, user }) => {
  const originalFindById = User.findById;
  User.findById = () => ({ select: async () => user });
  const req = { header: () => token ? `Bearer ${token}` : undefined };
  const res = createResponse();
  let passed = false;
  try {
    await auth(req, res, () => { passed = true; });
  } finally {
    User.findById = originalFindById;
  }
  return { req, res, passed };
};

test("auth middleware accepts matching versions and rejects revoked JWTs", async () => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "j".repeat(32);
  const userId = "507f1f77bcf86cd799439011";
  try {
    const jwtOptions = {
      algorithm: "HS256",
      issuer: "nazra-api",
      audience: "nazra-admin"
    };
    const valid = jwt.sign({ userId, authVersion: 2 }, process.env.JWT_SECRET, jwtOptions);
    const accepted = await invokeAuth({ token: valid, user: { _id: userId, authVersion: 2, role: "admin" } });
    assert.equal(accepted.passed, true);

    const revoked = await invokeAuth({ token: valid, user: { _id: userId, authVersion: 3, role: "admin" } });
    assert.equal(revoked.passed, false);
    assert.equal(revoked.res.statusCode, 401);

    const legacy = jwt.sign({ userId }, process.env.JWT_SECRET, jwtOptions);
    assert.equal((await invokeAuth({ token: legacy, user: { _id: userId, authVersion: 0 } })).res.statusCode, 401);
  } finally {
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});

test("auth middleware rejects malformed bearer headers", async () => {
  const res = createResponse();
  let passed = false;
  await auth({ header: () => "Bearer token extra" }, res, () => { passed = true; });
  assert.equal(passed, false);
  assert.equal(res.statusCode, 401);
});

test("role middleware enforces superadmin on the backend", () => {
  const blocked = createResponse();
  requireRole("superadmin")({ user: { role: "admin" } }, blocked, () => assert.fail("must not pass"));
  assert.equal(blocked.statusCode, 403);

  let passed = false;
  requireRole("superadmin")({ user: { role: "superadmin" } }, createResponse(), () => { passed = true; });
  assert.equal(passed, true);
});

test("administrator list uses an explicit public projection", async () => {
  const originalFind = User.find;
  let projection;
  User.find = () => ({
    select(value) { projection = value; return this; },
    async lean() { return [{ _id: "1", name: "Admin", email: "a@example.com", role: "admin" }]; }
  });
  const res = createResponse();
  try {
    await authController.listUsers({}, res);
  } finally {
    User.find = originalFind;
  }
  assert.equal(res.statusCode, 200);
  assert.equal(projection, "_id name email role");
  assert.deepEqual(Object.keys(res.body.users[0]).sort(), ["_id", "email", "name", "role"]);
});
