const Order = require("../../models/Order");
const Visitor = require("../../models/View");
const { parseDateTime } = require("../../utils/adminDateRange");

const NON_CANCELLED = ["pending", "processing", "shipped", "delivered"];
const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const METRIC_DEFINITIONS = Object.freeze({
  booked_sales: "Sum of saved line unitPrice × quantity for non-cancelled orders created in the period.",
  orders: "Count of orders created in the period, including cancelled orders.",
  average_order_value: "Booked Sales divided by non-cancelled order count.",
  units_sold: "Sum of saved line quantities for non-cancelled orders created in the period.",
  unique_customers: "Distinct trimmed, lower-cased order email addresses on non-cancelled orders created in the period.",
  cancellation_rate: "Cancelled orders divided by all orders created in the period, expressed as a percentage.",
  unique_visitors: "Distinct pseudonymous first-party visitor identifiers active in the period.",
  conversion_proxy: "Unavailable until compatible session and order attribution data is modeled."
});

const lineTotalExpression = {
  $sum: {
    $map: {
      input: { $ifNull: ["$products", []] },
      as: "item",
      in: {
        $multiply: [
          { $ifNull: ["$$item.unitPrice", 0] },
          { $ifNull: ["$$item.quantity", 0] }
        ]
      }
    }
  }
};

const unitCountExpression = {
  $sum: {
    $map: {
      input: { $ifNull: ["$products", []] },
      as: "item",
      in: { $ifNull: ["$$item.quantity", 0] }
    }
  }
};

const calculateChangePercent = (current, previous) => {
  if (current === null || previous === null) return null;
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
};

const summarizeOrders = (orders) => {
  const result = {
    bookedSales: 0,
    orders: orders.length,
    nonCancelledOrders: 0,
    unitsSold: 0,
    uniqueCustomers: 0,
    cancellationRate: 0
  };
  const customers = new Set();
  for (const order of orders) {
    if (order.status === "cancelled") continue;
    result.nonCancelledOrders += 1;
    for (const item of order.products || []) {
      result.bookedSales += Number(item.unitPrice || 0) * Number(item.quantity || 0);
      result.unitsSold += Number(item.quantity || 0);
    }
    const email = String(order.email || "").trim().toLowerCase();
    if (email) customers.add(email);
  }
  result.uniqueCustomers = customers.size;
  const cancelled = orders.filter((order) => order.status === "cancelled").length;
  result.cancellationRate = orders.length ? (cancelled / orders.length) * 100 : 0;
  result.averageOrderValue = result.nonCancelledOrders
    ? result.bookedSales / result.nonCancelledOrders
    : 0;
  return result;
};

const aggregateOrderMetrics = async (from, to) => {
  const [row] = await Order.aggregate([
    { $match: { createdAt: { $gte: from, $lt: to } } },
    {
      $facet: {
        totals: [{
          $group: {
            _id: null,
            orders: { $sum: 1 },
            cancelledOrders: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
            nonCancelledOrders: { $sum: { $cond: [{ $in: ["$status", NON_CANCELLED] }, 1, 0] } },
            bookedSales: { $sum: { $cond: [{ $in: ["$status", NON_CANCELLED] }, lineTotalExpression, 0] } },
            unitsSold: { $sum: { $cond: [{ $in: ["$status", NON_CANCELLED] }, unitCountExpression, 0] } }
          }
        }],
        customers: [
          { $match: { status: { $in: NON_CANCELLED } } },
          { $project: { email: { $toLower: { $trim: { input: "$email" } } } } },
          { $match: { email: { $ne: "" } } },
          { $group: { _id: "$email" } },
          { $count: "count" }
        ]
      }
    }
  ]);
  const totals = row?.totals?.[0] || {};
  const orders = Number(totals.orders || 0);
  const cancelledOrders = Number(totals.cancelledOrders || 0);
  const nonCancelledOrders = Number(totals.nonCancelledOrders || 0);
  const bookedSales = Number(totals.bookedSales || 0);
  return {
    bookedSales,
    orders,
    nonCancelledOrders,
    averageOrderValue: nonCancelledOrders ? bookedSales / nonCancelledOrders : 0,
    unitsSold: Number(totals.unitsSold || 0),
    uniqueCustomers: Number(row?.customers?.[0]?.count || 0),
    cancellationRate: orders ? (cancelledOrders / orders) * 100 : 0
  };
};

const metric = ({ value, previousValue, definitionKey, range, unavailableReason = null }) => ({
  value,
  previousValue,
  changePercent: calculateChangePercent(value, previousValue),
  definitionKey,
  from: range.from.toISOString(),
  to: range.to.toISOString(),
  timezone: range.timezone,
  unavailableReason
});

const getLocalDateParts = (date, timezone) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return { year: Number(values.year), month: Number(values.month), day: Number(values.day) };
};

const localKey = ({ year, month, day }) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const addLocalPeriod = (parts, granularity) => {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  if (granularity === "month") date.setUTCMonth(date.getUTCMonth() + 1, 1);
  else date.setUTCDate(date.getUTCDate() + (granularity === "week" ? 7 : 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
};

const alignLocalPeriod = (parts, granularity) => {
  if (granularity === "month") return { ...parts, day: 1 };
  if (granularity !== "week") return parts;
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  const mondayOffset = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - mondayOffset);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
};

const fillSalesSeries = (rows, range, granularity) => {
  const byKey = new Map(rows.map((row) => [
    localKey(getLocalDateParts(new Date(row.periodStart), range.timezone)),
    row
  ]));
  const result = [];
  let cursor = alignLocalPeriod(getLocalDateParts(range.from, range.timezone), granularity);
  const last = getLocalDateParts(new Date(range.to.getTime() - 1), range.timezone);
  while (localKey(cursor) <= localKey(last)) {
    const key = localKey(cursor);
    const row = byKey.get(key);
    result.push({
      periodStart: parseDateTime(`${key}T00:00:00`, "periodStart", range.timezone).toISOString(),
      bookedSales: Number(row?.bookedSales || 0),
      orders: Number(row?.orders || 0)
    });
    cursor = addLocalPeriod(cursor, granularity);
  }
  return result;
};

const getSalesSeries = async (range, granularity) => {
  const rows = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: range.from, $lt: range.to }
      }
    },
    {
      $group: {
        _id: {
          $dateTrunc: {
            date: "$createdAt",
            unit: granularity,
            timezone: range.timezone,
            ...(granularity === "week" ? { startOfWeek: "monday" } : {})
          }
        },
        bookedSales: {
          $sum: { $cond: [{ $in: ["$status", NON_CANCELLED] }, lineTotalExpression, 0] }
        },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, periodStart: "$_id", bookedSales: 1, orders: 1 } }
  ]);
  return fillSalesSeries(rows, range, granularity);
};

const getOrderStatusBreakdown = async (range) => {
  const rows = await Order.aggregate([
    { $match: { createdAt: { $gte: range.from, $lt: range.to }, status: { $in: ORDER_STATUSES } } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  return rows.map((row) => ({ status: row._id, count: row.count }));
};

const getRecentOrders = async (range, limit = 8) => Order.aggregate([
  { $match: { createdAt: { $gte: range.from, $lt: range.to } } },
  { $sort: { createdAt: -1, _id: -1 } },
  { $limit: limit },
  {
    $project: {
      _id: 1,
      reference: { $toString: "$_id" },
      createdAt: 1,
      customerName: "$fullName",
      itemCount: unitCountExpression,
      total: lineTotalExpression,
      currency: { $literal: "MAD" },
      status: 1
    }
  }
]);

const aggregateTopProducts = (orders, limit = 5) => {
  const grouped = new Map();
  for (const order of orders.filter((entry) => entry.status !== "cancelled")) {
    for (const item of order.products || []) {
      const productId = String(item.product || "");
      if (!productId) continue;
      const current = grouped.get(productId) || {
        productId,
        name: item.productName || "Archived product",
        image: item.imageUrl || null,
        unitsSold: 0,
        bookedSales: 0
      };
      current.unitsSold += Number(item.quantity || 0);
      current.bookedSales += Number(item.unitPrice || 0) * Number(item.quantity || 0);
      grouped.set(productId, current);
    }
  }
  return Array.from(grouped.values())
    .sort((a, b) => b.unitsSold - a.unitsSold || b.bookedSales - a.bookedSales || a.productId.localeCompare(b.productId))
    .slice(0, limit);
};

const getTopProducts = async (range, limit = 5) => Order.aggregate([
  { $match: { createdAt: { $gte: range.from, $lt: range.to }, status: { $in: NON_CANCELLED } } },
  { $unwind: "$products" },
  {
    $group: {
      _id: "$products.product",
      name: { $last: "$products.productName" },
      image: { $last: "$products.imageUrl" },
      unitsSold: { $sum: "$products.quantity" },
      bookedSales: {
        $sum: { $multiply: ["$products.unitPrice", "$products.quantity"] }
      }
    }
  },
  { $sort: { unitsSold: -1, bookedSales: -1, _id: 1 } },
  { $limit: limit },
  {
    $project: {
      _id: 0,
      productId: { $toString: "$_id" },
      name: { $ifNull: ["$name", "Archived product"] },
      image: { $ifNull: ["$image", null] },
      unitsSold: 1,
      bookedSales: 1
    }
  }
]);

const getVisitorMetrics = async (range) => {
  const [row] = await Visitor.aggregate([
    { $match: { createdAt: { $gte: range.from, $lt: range.to } } },
    {
      $group: {
        _id: "$ipAddress",
        pageViews: { $sum: { $ifNull: ["$visitCount", 1] } }
      }
    },
    {
      $group: {
        _id: null,
        uniqueVisitors: { $sum: { $cond: [{ $ne: ["$_id", null] }, 1, 0] } },
        pageViews: { $sum: "$pageViews" }
      }
    },
    { $project: { _id: 0, uniqueVisitors: 1, pageViews: 1 } }
  ]);
  return {
    uniqueVisitors: Number(row?.uniqueVisitors || 0),
    pageViews: Number(row?.pageViews || 0)
  };
};

const buildDashboardSummary = async (range, granularity) => {
  const compare = range.comparison === "previous_period";
  const previousRange = {
    ...range,
    from: range.previousFrom,
    to: range.previousTo
  };
  const [
    current,
    previous,
    salesSeries,
    orderStatusBreakdown,
    recentOrders,
    topProducts,
    visitors,
    previousVisitors
  ] = await Promise.all([
    aggregateOrderMetrics(range.from, range.to),
    compare ? aggregateOrderMetrics(previousRange.from, previousRange.to) : Promise.resolve(null),
    getSalesSeries(range, granularity),
    getOrderStatusBreakdown(range),
    getRecentOrders(range),
    getTopProducts(range),
    getVisitorMetrics(range),
    compare ? getVisitorMetrics(previousRange) : Promise.resolve(null)
  ]);
  const previousValue = (key) => compare ? previous[key] : null;
  return {
    range: {
      from: range.from.toISOString(),
      to: range.to.toISOString(),
      timezone: range.timezone,
      comparison: range.comparison,
      granularity
    },
    definitions: METRIC_DEFINITIONS,
    kpis: {
      bookedSales: metric({ value: current.bookedSales, previousValue: previousValue("bookedSales"), definitionKey: "booked_sales", range }),
      orders: metric({ value: current.orders, previousValue: previousValue("orders"), definitionKey: "orders", range }),
      averageOrderValue: metric({ value: current.averageOrderValue, previousValue: previousValue("averageOrderValue"), definitionKey: "average_order_value", range }),
      unitsSold: metric({ value: current.unitsSold, previousValue: previousValue("unitsSold"), definitionKey: "units_sold", range }),
      uniqueCustomers: metric({ value: current.uniqueCustomers, previousValue: previousValue("uniqueCustomers"), definitionKey: "unique_customers", range }),
      cancellationRate: metric({ value: current.cancellationRate, previousValue: previousValue("cancellationRate"), definitionKey: "cancellation_rate", range }),
      uniqueVisitors: metric({
        value: visitors.uniqueVisitors,
        previousValue: compare ? previousVisitors.uniqueVisitors : null,
        definitionKey: "unique_visitors",
        range
      }),
      conversionProxy: metric({
        value: null,
        previousValue: null,
        definitionKey: "conversion_proxy",
        range,
        unavailableReason: "SESSIONS_NOT_MODELED"
      })
    },
    visitorSummary: {
      pageViews: visitors.pageViews,
      uniqueVisitors: visitors.uniqueVisitors
    },
    salesSeries,
    orderStatusBreakdown,
    recentOrders,
    topProducts,
    inventoryAlerts: [],
    inventoryAlertsAvailable: false
  };
};

module.exports = {
  NON_CANCELLED,
  ORDER_STATUSES,
  METRIC_DEFINITIONS,
  calculateChangePercent,
  summarizeOrders,
  aggregateTopProducts,
  fillSalesSeries,
  buildDashboardSummary,
  _expressions: { lineTotalExpression, unitCountExpression }
};
