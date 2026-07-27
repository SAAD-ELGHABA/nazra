const test = require("node:test");
const assert = require("node:assert/strict");
const {
  AdminQueryValidationError,
  parsePagination,
  parseSort,
  normalizeSearch,
  escapeRegex,
  buildAdminListMeta
} = require("../utils/adminQuery");
const {
  AdminDateRangeValidationError,
  parseAdminDateRange,
  parseOptionalDateRange,
  chooseGranularity
} = require("../utils/adminDateRange");

test("admin pagination has conservative defaults, a hard maximum, and stable metadata", () => {
  assert.deepEqual(parsePagination({}), { page: 1, limit: 25 });
  assert.deepEqual(parsePagination({ page: "3", limit: "100" }), { page: 3, limit: 100 });
  assert.throws(() => parsePagination({ page: "0" }), AdminQueryValidationError);
  assert.throws(() => parsePagination({ limit: "101" }), AdminQueryValidationError);
  assert.throws(() => parsePagination({ page: "1.5" }), AdminQueryValidationError);

  assert.deepEqual(buildAdminListMeta({
    page: 2,
    limit: 25,
    total: 51,
    sort: "-createdAt",
    filters: { status: "active" }
  }), {
    page: 2,
    limit: 25,
    total: 51,
    totalPages: 3,
    hasNextPage: true,
    hasPreviousPage: true,
    sort: "-createdAt",
    filters: { status: "active" }
  });
  assert.equal(buildAdminListMeta({ page: 1, limit: 25, total: 0, sort: "-createdAt" }).totalPages, 0);
});

test("admin search is bounded and regex metacharacters are escaped", () => {
  assert.equal(normalizeSearch("  Atlas   Black  "), "Atlas Black");
  assert.equal(escapeRegex("atlas.*(black)?"), "atlas\\.\\*\\(black\\)\\?");
  assert.doesNotThrow(() => new RegExp(escapeRegex("[a-z]+$"), "i"));
  assert.throws(() => normalizeSearch("x".repeat(151)), AdminQueryValidationError);
  assert.throws(() => normalizeSearch({ value: "atlas" }), AdminQueryValidationError);
});

test("admin sort rejects unknown fields instead of forwarding them to MongoDB", () => {
  const allowed = new Set(["createdAt", "-createdAt", "total", "-total"]);
  assert.deepEqual(parseSort("-total", allowed, "-createdAt"), {
    value: "-total",
    field: "total",
    direction: -1
  });
  assert.throws(() => parseSort("$where", allowed, "-createdAt"), AdminQueryValidationError);
});

test("date ranges interpret offset-less values in Africa/Casablanca and use exclusive to", () => {
  const range = parseAdminDateRange({
    from: "2026-07-01T00:00:00",
    to: "2026-08-01T00:00:00",
    timezone: "Africa/Casablanca",
    comparison: "previous_period"
  });
  assert.equal(range.from.toISOString(), "2026-06-30T23:00:00.000Z");
  assert.equal(range.to.toISOString(), "2026-07-31T23:00:00.000Z");
  assert.equal(range.previousTo.toISOString(), range.from.toISOString());
  assert.equal(range.previousTo - range.previousFrom, range.to - range.from);
  assert.equal(chooseGranularity(range.durationMs), "day");
});

test("date range validation rejects partial, reversed, unknown-timezone, and excessive ranges", () => {
  assert.throws(() => parseOptionalDateRange({ from: "2026-07-01" }), AdminDateRangeValidationError);
  assert.throws(() => parseAdminDateRange({
    from: "2026-08-01",
    to: "2026-07-01",
    timezone: "Africa/Casablanca"
  }), AdminDateRangeValidationError);
  assert.throws(() => parseAdminDateRange({
    from: "2026-07-01",
    to: "2026-08-01",
    timezone: "Mars/Olympus"
  }), AdminDateRangeValidationError);
  assert.throws(() => parseAdminDateRange({
    from: "2020-01-01",
    to: "2026-01-01"
  }), AdminDateRangeValidationError);
  assert.throws(() => chooseGranularity(1, "hour"), AdminDateRangeValidationError);
});
