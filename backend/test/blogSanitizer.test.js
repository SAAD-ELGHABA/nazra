const assert = require("node:assert/strict");
const test = require("node:test");
const { sanitizeHtml, isSafeUrl } = require("../utils/sanitizeHtml");
const { parseBlogPayload, parsePagination, sanitizeBlogForResponse } = require("../controllers/blogController")._test;

test("blog sanitizer strips scripts, event handlers and unsafe URLs", () => {
  const sanitized = sanitizeHtml(`
    <h2 onclick="alert(1)">Title</h2>
    <script>alert(1)</script>
    <img src="javascript:alert(1)" onerror="alert(1)">
    <a href="javascript:alert(1)" style="color:red">bad</a>
    <iframe src="https://example.com"></iframe>
  `);

  assert.match(sanitized, /<h2>Title<\/h2>/);
  assert.doesNotMatch(sanitized, /script|onclick|onerror|javascript:|iframe|style/i);
});

test("blog sanitizer keeps allowlisted safe links and images", () => {
  const sanitized = sanitizeHtml('<p>Hello <strong>world</strong></p><a href="https://nazra.store" target="_blank">Nazra</a><img src="/image.jpg" alt="Frame">');

  assert.match(sanitized, /<p>Hello <strong>world<\/strong><\/p>/);
  assert.match(sanitized, /href="https:\/\/nazra.store"/);
  assert.match(sanitized, /rel="noopener noreferrer"/);
  assert.match(sanitized, /<img src="\/image.jpg" alt="Frame">/);
});

test("blog payload sanitizes content and validates bounded pagination", () => {
  const payload = parseBlogPayload({
    title: "Summer",
    content: '<p>Safe</p><img src=x onerror=alert(1)>',
    images: [{ url: "https://res.cloudinary.com/demo/image/upload/sample.jpg", public_id: "blog-images/sample" }]
  });

  assert.equal(payload.title, "Summer");
  assert.doesNotMatch(payload.content, /onerror/);
  assert.equal(parsePagination({ page: "2", limit: "20", sort: "asc" }).page, 2);
});

test("safe URL helper rejects dangerous schemes", () => {
  assert.equal(isSafeUrl("https://example.com/image.jpg"), true);
  assert.equal(isSafeUrl("/local-image.jpg"), true);
  assert.equal(isSafeUrl("javascript:alert(1)"), false);
  assert.equal(isSafeUrl("data:text/html,<script>alert(1)</script>"), false);
});

test("blog read responses sanitize legacy stored content", () => {
  const responseBlog = sanitizeBlogForResponse({
    title: "Legacy unsafe",
    content: '<p onclick="alert(1)">Old</p><script>alert(1)</script>'
  });

  assert.equal(responseBlog.content, "<p>Old</p>");
});
