const test = require('node:test');
const assert = require('node:assert/strict');

const { _test } = require('../routes/ordersRoute');

test('rate limits repeated public order attempts by client address', () => {
  _test.orderRateBuckets.clear();
  const response = {
    headers: {},
    statusCode: 200,
    set(name, value) { this.headers[name] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
  const request = { ip: '203.0.113.10', socket: {} };
  let passes = 0;
  for (let index = 0; index < _test.ORDER_RATE_MAX; index += 1) {
    _test.orderCreationRateLimit(request, response, () => { passes += 1; });
  }
  assert.equal(passes, _test.ORDER_RATE_MAX);
  _test.orderCreationRateLimit(request, response, () => { passes += 1; });
  assert.equal(response.statusCode, 429);
  assert.equal(response.body.success, false);
  assert.ok(Number(response.headers['Retry-After']) >= 1);
});
