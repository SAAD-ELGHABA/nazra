const test = require("node:test");
const assert = require("node:assert/strict");

const requirePermission = require("../middleware/requirePermission");
const {
  getPurposeConfiguration,
  parseUploadPurpose,
  MediaUploadValidationError
} = require("../services/mediaUploadService");
const { AdminQueryValidationError, parseSort } = require("../utils/adminQuery");
const { _test } = require("../services/admin/mediaLibraryService");

const {
  MEDIA_FORMATS,
  MEDIA_SORTS,
  MAX_BULK_DELETE,
  buildMediaListFilter,
  normalizeFolderPath,
  normalizeTags,
  parseAlt,
  parseBulkDeleteIds,
  parseFolderRename,
  parseMediaRegistration,
  parseMediaUpdate,
  parsePublicId,
  resolveCleanupOutcome,
  sanitizeFilename
} = _test;

const OBJECT_ID = "64b7f3c2a1d4e5f6a7b8c9d0";

test("registers the library upload purpose without weakening the signing contract", () => {
  assert.equal(parseUploadPurpose({ purpose: "library" }), "library");
  assert.equal(getPurposeConfiguration("library").folder, "media-library");
  assert.equal(getPurposeConfiguration("library").permission, "media.manage");

  // The exactly-one-key invariant is what keeps the signed folder
  // server-authoritative. Adding a purpose must not relax it.
  assert.throws(
    () => parseUploadPurpose({ purpose: "library", folder: "user-controlled" }),
    MediaUploadValidationError
  );
});

test("grants media.manage to both admin roles", () => {
  const { ROLE_CAPABILITIES } = requirePermission._test;
  assert.ok(ROLE_CAPABILITIES.admin.has("media.manage"));
  assert.ok(ROLE_CAPABILITIES.superadmin.has("media.manage"));
  assert.ok(requirePermission.getCapabilitiesForRole("super-admin").includes("media.manage"));
});

test("only accepts public ids that belong to the media library", () => {
  assert.equal(parsePublicId("media-library/AbC-123"), "media-library/AbC-123");

  for (const value of [
    "sunglasses-products/abc",
    "blog-images/abc",
    "media-library/../secret",
    "../media-library/abc",
    "",
    "   ",
    42,
    undefined,
    null
  ]) {
    assert.throws(() => parsePublicId(value), AdminQueryValidationError, `accepted ${value}`);
  }

  assert.throws(() => parsePublicId(`media-library/${"a".repeat(500)}`), AdminQueryValidationError);
});

test("rejects unknown registration fields and caps the free-text labels", () => {
  const parsed = parseMediaRegistration({
    publicId: "media-library/abc",
    folder: "Campaigns/Summer 25",
    tags: ["Hero", "hero", " Summer "],
    alt: "  A hero banner  ",
    originalFilename: "summer campaign hero.png"
  });

  assert.deepEqual(parsed, {
    publicId: "media-library/abc",
    folder: "/campaigns/summer-25",
    tags: ["hero", "summer"],
    alt: "A hero banner",
    originalFilename: "summer campaign hero.png"
  });

  // url, format, bytes and dimensions are read from Cloudinary, never accepted.
  assert.throws(
    () => parseMediaRegistration({ publicId: "media-library/abc", url: "https://evil.example/x.png" }),
    AdminQueryValidationError
  );
  assert.throws(
    () => parseMediaRegistration({ publicId: "media-library/abc", bytes: 1 }),
    AdminQueryValidationError
  );
  assert.throws(() => parseMediaRegistration(["media-library/abc"]), AdminQueryValidationError);
  assert.throws(
    () => parseMediaRegistration({ publicId: "media-library/abc", alt: "a".repeat(301) }),
    AdminQueryValidationError
  );
  assert.equal(parseAlt(undefined), "");
});

test("strips path separators and control characters from the filename", () => {
  assert.equal(sanitizeFilename("summer campaign hero.png"), "summer campaign hero.png");
  assert.equal(sanitizeFilename("../../etc/passwd"), "....etcpasswd");
  assert.equal(sanitizeFilename("abc.png"), "abc.png");
  assert.equal(sanitizeFilename("x".repeat(400)).length, 200);
  assert.equal(sanitizeFilename(undefined), "");
  assert.throws(() => sanitizeFilename(7), AdminQueryValidationError);
});

test("allows only the six delivery-safe image formats", () => {
  for (const format of ["jpg", "jpeg", "png", "webp", "avif", "gif"]) {
    assert.ok(MEDIA_FORMATS.has(format), `${format} should be allowed`);
  }
  // SVG is served unmodified by Cloudinary and can carry script.
  for (const format of ["svg", "pdf", "mp4", "webm"]) {
    assert.ok(!MEDIA_FORMATS.has(format), `${format} should be rejected`);
  }
});

test("normalizes folder paths to a predictable slug path", () => {
  assert.equal(normalizeFolderPath(undefined), "/");
  assert.equal(normalizeFolderPath(""), "/");
  assert.equal(normalizeFolderPath("/"), "/");
  assert.equal(normalizeFolderPath("Campaigns/Summer 25"), "/campaigns/summer-25");
  assert.equal(normalizeFolderPath("/campaigns/summer-25/"), "/campaigns/summer-25");
  assert.equal(normalizeFolderPath("  Banners  "), "/banners");
  assert.equal(normalizeFolderPath("///"), "/", "empty segments collapse to root");

  assert.throws(() => normalizeFolderPath("a/../b"), AdminQueryValidationError);
  assert.throws(() => normalizeFolderPath("a/b/c/d"), AdminQueryValidationError);
  assert.throws(() => normalizeFolderPath(`a/${"b".repeat(41)}`), AdminQueryValidationError);
  // A segment that slugifies to nothing is a typo, not a root reference.
  assert.throws(() => normalizeFolderPath("a/!!!/b"), AdminQueryValidationError);
  assert.throws(() => normalizeFolderPath(7), AdminQueryValidationError);
});

test("normalizes and bounds tags", () => {
  assert.deepEqual(normalizeTags(undefined), []);
  assert.deepEqual(normalizeTags(["Hero", " hero ", "Summer", ""]), ["hero", "summer"]);
  assert.throws(() => normalizeTags("hero"), AdminQueryValidationError);
  assert.throws(() => normalizeTags(new Array(11).fill("t")), AdminQueryValidationError);
  assert.throws(() => normalizeTags(["t".repeat(33)]), AdminQueryValidationError);
});

test("builds a list filter that escapes the search term", () => {
  assert.deepEqual(buildMediaListFilter({}), {});

  const filter = buildMediaListFilter({ folder: "Campaigns", tag: "Hero", q: "a.*b" });
  assert.equal(filter.folder, "/campaigns");
  assert.equal(filter.tags, "hero");
  assert.equal(filter.$or.length, 3);
  // The regex must match the literal string, not act as a wildcard.
  assert.ok(filter.$or[0].originalFilename.test("xa.*by"));
  assert.ok(!filter.$or[0].originalFilename.test("aQQQb"));
});

test("restricts sorting to an allowlist", () => {
  for (const value of MEDIA_SORTS) {
    assert.equal(parseSort(value, MEDIA_SORTS, "-createdAt").value, value);
  }
  assert.equal(parseSort(undefined, MEDIA_SORTS, "-createdAt").field, "createdAt");
  assert.throws(() => parseSort("password", MEDIA_SORTS, "-createdAt"), AdminQueryValidationError);
  assert.throws(() => parseSort("-publicId", MEDIA_SORTS, "-createdAt"), AdminQueryValidationError);
});

test("update accepts only the label fields", () => {
  assert.deepEqual(parseMediaUpdate({ alt: "hi", tags: ["A"] }), { alt: "hi", tags: ["a"] });
  assert.throws(() => parseMediaUpdate({ publicId: "media-library/x" }), AdminQueryValidationError);
  assert.throws(() => parseMediaUpdate({ url: "https://x" }), AdminQueryValidationError);
  assert.throws(() => parseMediaUpdate({}), AdminQueryValidationError);
});

test("never destroys a public id that is outside the library prefix", async () => {
  const calls = [];
  const destroy = async (publicId) => {
    calls.push(publicId);
    return true;
  };

  assert.equal(
    await resolveCleanupOutcome({ publicId: "sunglasses-products/live", destroy }),
    false
  );
  assert.deepEqual(calls, [], "destroy must not be attempted on a foreign asset");

  assert.equal(await resolveCleanupOutcome({ publicId: "media-library/abc", destroy }), true);
  assert.deepEqual(calls, ["media-library/abc"]);
});

test("reports a failed cleanup instead of throwing", async () => {
  const throwing = async () => {
    throw new Error("network down");
  };
  assert.equal(
    await resolveCleanupOutcome({ publicId: "media-library/abc", destroy: throwing }),
    false
  );

  // destroy() resolves false when Cloudinary answers with anything but ok/not found.
  assert.equal(
    await resolveCleanupOutcome({ publicId: "media-library/abc", destroy: async () => false }),
    false
  );
});

test("bounds bulk deletion", () => {
  assert.deepEqual(parseBulkDeleteIds({ ids: [OBJECT_ID, OBJECT_ID] }), [OBJECT_ID]);
  assert.throws(() => parseBulkDeleteIds({ ids: [] }), AdminQueryValidationError);
  assert.throws(() => parseBulkDeleteIds({ ids: OBJECT_ID }), AdminQueryValidationError);
  assert.throws(() => parseBulkDeleteIds({ ids: ["not-an-id"] }), AdminQueryValidationError);
  assert.throws(
    () => parseBulkDeleteIds({ ids: new Array(MAX_BULK_DELETE + 1).fill(OBJECT_ID) }),
    AdminQueryValidationError
  );
});

test("guards folder renames against no-ops and self-nesting", () => {
  assert.deepEqual(parseFolderRename({ from: "Campaigns", to: "Archive" }), {
    from: "/campaigns",
    to: "/archive"
  });

  assert.throws(() => parseFolderRename({ from: "/", to: "x" }), AdminQueryValidationError);
  assert.throws(() => parseFolderRename({ from: "a", to: "a" }), AdminQueryValidationError);
  assert.throws(() => parseFolderRename({ from: "a", to: "a/b" }), AdminQueryValidationError);
  assert.throws(() => parseFolderRename({ from: "a", to: "b", extra: 1 }), AdminQueryValidationError);
});
