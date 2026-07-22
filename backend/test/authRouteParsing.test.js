const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const authRoutes = require("../routes/authRoutes");

const withServer = async (run) => {
  const app = express();
  app.use("/api/auth", authRoutes);
  const server = await new Promise((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
};

test("rejects malformed auth JSON without parser details", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: '{"email":'
    });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      success: false,
      message: "Request body must contain valid JSON."
    });
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("pragma"), "no-cache");
  });
});

test("enforces the auth-specific body limit before database access", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "a@example.com", password: "x".repeat(9 * 1024) })
    });
    assert.equal(response.status, 413);
  });
});

test("requires JSON content and rejects unsupported methods without database access", async () => {
  await withServer(async (baseUrl) => {
    const unsupportedContent = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "email=a@example.com"
    });
    assert.equal(unsupportedContent.status, 415);

    const unsupportedMethod = await fetch(`${baseUrl}/api/auth/forgot-password`);
    assert.equal(unsupportedMethod.status, 405);
  });
});

test("rejects auth query parameters before database access", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/login?debug=true`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "a@example.com", password: "abcdefghijkl" })
    });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      success: false,
      message: "Query parameters are not supported."
    });
  });
});
