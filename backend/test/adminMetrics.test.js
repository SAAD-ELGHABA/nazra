const test = require("node:test");
const assert = require("node:assert/strict");
const Product = require("../models/Product");
const ProductView = require("../models/ProductView");
const Visitor = require("../models/View");
const {
  calculateChangePercent,
  summarizeOrders,
  aggregateTopProducts,
  fillSalesSeries
} = require("../services/admin/dashboardMetricsService");
const {
  listProducts,
  listVisitorAnalytics,
  normalizeReferrer,
  normalizeBrowser,
  normalizeDevice,
  summarizeStock
} = require("../services/admin/adminListService");

const sampleOrders = () => [
  {
    status: "processing",
    email: " Customer@example.com ",
    products: [{ product: "p1", productName: "Atlas", quantity: 2, unitPrice: 249 }]
  },
  {
    status: "delivered",
    email: "customer@EXAMPLE.com",
    products: [{ product: "p2", productName: "Rif", quantity: 1, unitPrice: 199 }]
  },
  {
    status: "cancelled",
    email: "cancelled@example.com",
    products: [{ product: "p1", productName: "Atlas", quantity: 5, unitPrice: 300 }]
  }
];

test("dashboard booked sales use immutable line prices and exclude cancelled orders", () => {
  const summary = summarizeOrders(sampleOrders());
  assert.equal(summary.bookedSales, 697);
  assert.equal(summary.orders, 3);
  assert.equal(summary.nonCancelledOrders, 2);
  assert.equal(summary.averageOrderValue, 348.5);
  assert.equal(summary.unitsSold, 3);
  assert.equal(summary.uniqueCustomers, 1);
  assert.ok(Math.abs(summary.cancellationRate - (100 / 3)) < Number.EPSILON * 100);
});

test("previous period comparison handles zero without Infinity", () => {
  assert.equal(calculateChangePercent(0, 0), 0);
  assert.equal(calculateChangePercent(10, 0), null);
  assert.equal(calculateChangePercent(15, 10), 50);
  assert.equal(calculateChangePercent(5, 10), -50);
  assert.equal(calculateChangePercent(null, 10), null);
});

test("sales series fills missing daily periods with measured zero", () => {
  const range = {
    from: new Date("2026-07-01T00:00:00.000Z"),
    to: new Date("2026-07-04T00:00:00.000Z"),
    timezone: "UTC"
  };
  const series = fillSalesSeries([
    { periodStart: new Date("2026-07-02T00:00:00.000Z"), bookedSales: 249, orders: 1 }
  ], range, "day");
  assert.deepEqual(series, [
    { periodStart: "2026-07-01T00:00:00.000Z", bookedSales: 0, orders: 0 },
    { periodStart: "2026-07-02T00:00:00.000Z", bookedSales: 249, orders: 1 },
    { periodStart: "2026-07-03T00:00:00.000Z", bookedSales: 0, orders: 0 }
  ]);
});

test("top products group units and immutable sales, exclude cancellation, and apply limit", () => {
  const products = aggregateTopProducts(sampleOrders(), 1);
  assert.deepEqual(products, [{
    productId: "p1",
    name: "Atlas",
    image: null,
    unitsSold: 2,
    bookedSales: 498
  }]);
});

test("stock summaries distinguish tracked, mixed, and untracked inventory", () => {
  assert.deepEqual(summarizeStock({ colors: [{ active: true, stock: null }] }), {
    trackingState: "untracked",
    trackedStock: 0,
    trackedVariants: 0,
    untrackedVariants: 1,
    outOfStockVariants: 0,
    lowStockVariants: 0
  });
  const mixed = summarizeStock({ colors: [
    { active: true, stock: 3 },
    { active: true, stock: null }
  ] });
  assert.equal(mixed.trackingState, "mixed");
  assert.equal(mixed.trackedStock, 3);
  assert.equal(mixed.lowStockVariants, 1);
});

test("product admin list performs one bounded product query and one batched view aggregation", async () => {
  const originals = {
    find: Product.find,
    countDocuments: Product.countDocuments,
    aggregate: ProductView.aggregate
  };
  let productFindCalls = 0;
  let viewAggregateCalls = 0;
  try {
    Product.find = () => {
      productFindCalls += 1;
      const chain = {
        select: () => chain,
        sort: () => chain,
        skip: () => chain,
        limit: () => chain,
        lean: async () => [{
          _id: "64b000000000000000000001",
          name: "Atlas",
          slug: "atlas",
          sale_price: 249,
          original_price: 300,
          colors: [],
          isActive: true,
          createdBy: "64b000000000000000000002"
        }]
      };
      return chain;
    };
    Product.countDocuments = async () => 1;
    ProductView.aggregate = async (pipeline) => {
      viewAggregateCalls += 1;
      assert.equal(pipeline[0].$match.productId.$in.length, 1);
      return [{ _id: "64b000000000000000000001", views: 7 }];
    };
    const result = await listProducts({}, { _id: "64b000000000000000000002", role: "admin" });
    assert.equal(productFindCalls, 1);
    assert.equal(viewAggregateCalls, 1);
    assert.equal(result.data[0].views, 7);
    assert.equal(result.meta.total, 1);
  } finally {
    Product.find = originals.find;
    Product.countDocuments = originals.countDocuments;
    ProductView.aggregate = originals.aggregate;
  }
});

test("visitor categories are bounded and full referrer query strings are not returned", () => {
  assert.equal(normalizeReferrer("https://www.google.com/search?q=customer"), "Google");
  assert.equal(normalizeReferrer("not a url?secret=1"), "Other");
  assert.equal(normalizeBrowser("Mozilla/5.0 Chrome/120.0 Safari/537.36"), "Chrome");
  assert.equal(normalizeDevice("Mozilla/5.0 (iPhone) Mobile"), "Mobile");
});

test("visitor analytics response never exposes raw visitor ids, IPs, or user agents", async () => {
  const originalAggregate = Visitor.aggregate;
  try {
    Visitor.aggregate = async () => [{
      totals: [{ uniqueVisitors: 1, pageViews: 3 }],
      series: [{ periodStart: new Date("2026-07-01T00:00:00.000Z"), pageViews: 3, uniqueVisitors: 1 }],
      referrers: [{ label: "Direct", count: 3 }],
      browsers: [{ label: "Chrome", count: 3 }],
      devices: [{ label: "Desktop", count: 3 }]
    }];
    const result = await listVisitorAnalytics({
      from: "2026-07-01T00:00:00Z",
      to: "2026-07-02T00:00:00Z",
      timezone: "Africa/Casablanca"
    });
    const serialized = JSON.stringify(result);
    assert.equal(result.uniqueVisitors, 1);
    assert.equal(serialized.includes("private-id"), false);
    assert.equal(serialized.includes("ipAddress"), false);
    assert.equal(serialized.includes("userAgent"), false);
  } finally {
    Visitor.aggregate = originalAggregate;
  }
});
