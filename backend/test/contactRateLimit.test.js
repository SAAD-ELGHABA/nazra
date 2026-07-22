const test = require("node:test");
const assert = require("node:assert/strict");

const { _test } = require("../routes/contactRoutes");

const createResponse = () => ({
  headers: {},
  statusCode: 200,
  set(name, value) { this.headers[name] = value; return this; },
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; }
});

test("applies a short contact submission cooldown", () => {
  _test.rateBuckets.clear();
  const req = { ip: "203.0.113.20", socket: {} };
  const firstResponse = createResponse();
  let passes = 0;
  _test.contactRateLimit(req, firstResponse, () => { passes += 1; });
  assert.equal(passes, 1);

  const secondResponse = createResponse();
  _test.contactRateLimit(req, secondResponse, () => { passes += 1; });
  assert.equal(secondResponse.statusCode, 429);
  assert.match(secondResponse.body.message, /wait briefly/i);
  assert.ok(Number(secondResponse.headers["Retry-After"]) >= 1);
  assert.equal(passes, 1);
});

test("limits contact attempts per client without retaining the raw address", () => {
  _test.rateBuckets.clear();
  const rawAddress = "203.0.113.21";
  const req = { ip: rawAddress, socket: {} };
  let passes = 0;

  for (let index = 0; index < _test.CONTACT_RATE_MAX; index += 1) {
    const response = createResponse();
    _test.contactRateLimit(req, response, () => { passes += 1; });
    const bucket = [..._test.rateBuckets.values()][0];
    bucket.lastAttemptAt = 0;
  }
  assert.equal(passes, _test.CONTACT_RATE_MAX);

  const blockedResponse = createResponse();
  _test.contactRateLimit(req, blockedResponse, () => { passes += 1; });
  assert.equal(blockedResponse.statusCode, 429);
  assert.match(blockedResponse.body.message, /too many contact attempts/i);
  assert.ok(Number(blockedResponse.headers["Retry-After"]) >= 1);
  assert.equal([..._test.rateBuckets.keys()].includes(rawAddress), false);
});

