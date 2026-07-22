const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");

const contactRoutes = require("../routes/contactRoutes");

const withServer = async (run) => {
  const app = express();
  app.use("/api/contact", contactRoutes);
  const server = await new Promise((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  try {
    const address = server.address();
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
};

test("rejects malformed contact JSON without exposing parser details", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: '{"name":'
    });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      success: false,
      message: "Request body must contain valid JSON."
    });
  });
});

test("enforces the contact-specific JSON body limit before database access", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "x".repeat(17 * 1024) })
    });
    assert.equal(response.status, 413);
    assert.deepEqual(await response.json(), {
      success: false,
      message: "Contact request is too large."
    });
  });
});

test("returns method-not-allowed without requiring a database connection", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/contact`);
    assert.equal(response.status, 405);
    assert.equal((await response.json()).success, false);
  });
});

