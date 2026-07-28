import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Boxes,
  CircleDollarSign,
  Eye,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAdminDashboardSummary,
  getAdminActionCenter,
  getProductsAsAdmin,
} from "../api/api";
import { formatMAD } from "../utils/adminFormatting";
import { formatAdminDate } from "../utils/adminDates";
import AdminPageContainer from "../components/admin/page/AdminPageContainer";
import AdminPageHeader from "../components/admin/page/AdminPageHeader";
import AdminLoadingState from "../components/admin/feedback/AdminLoadingState";
import AdminErrorState from "../components/admin/feedback/AdminErrorState";
import AdminOfflineState from "../components/admin/feedback/AdminOfflineState";
import AdminForbiddenState from "../components/admin/feedback/AdminForbiddenState";
import { AdminRefreshButton } from "../components/admin/shell/AdminTopbar";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useAdminPageMeta } from "../context/AdminPageContext";
import {
  DASHBOARDHOME,
  DASHBOARDORDERS,
  DASHBOARDPRODUCTS,
} from "../constant/routerConstants";

const statusPalette = [
  "var(--chart-2)",
  "var(--chart-4)",
  "var(--chart-1)",
  "var(--chart-5)",
  "var(--chart-3)",
];

const chartAccent = "var(--chart-2)";
const chartGlow = "var(--chart-4)";
const chartMuted = "var(--muted-foreground)";

const normalizeArray = (value) => (Array.isArray(value) ? value : []);
const kpiValue = (kpis, key, fallback = 0) => Number(kpis?.[key]?.value ?? fallback);

const isValidDashboardSummary = (payload) =>
  Boolean(
    payload?.kpis &&
      Array.isArray(payload.salesSeries) &&
      Array.isArray(payload.orderStatusBreakdown) &&
      Array.isArray(payload.recentOrders) &&
      Array.isArray(payload.topProducts),
  );

const formatShortNumber = (value) =>
  new Intl.NumberFormat("en", {
    notation: Number(value || 0) >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));

const formatPeriodLabel = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Period";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatChange = (changePercent) => {
  if (changePercent === null || changePercent === undefined) return "No comparison";
  const value = Number(changePercent);
  if (!Number.isFinite(value)) return "No comparison";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}% vs previous`;
};

const getTrendIcon = (changePercent) => {
  const value = Number(changePercent);
  if (!Number.isFinite(value) || value >= 0) return TrendingUp;
  return TrendingDown;
};

const Dashboard = () => {
  const { hasCapability } = useAdminAuth();
  const canReadOrders = hasCapability("orders.read");
  const canReadProducts = hasCapability("products.read");
  const requestIdRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [catalogError, setCatalogError] = useState("");
  const [actionItems, setActionItems] = useState([]);
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = useCallback(async (signal) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const isLatestRequest = () => requestId === requestIdRef.current && !signal?.aborted;

    try {
      setLoading(true);
      setError("");
      setErrorStatus(null);
      setCatalogError("");

      const productRequest = canReadProducts
        ? getProductsAsAdmin(signal)
        : Promise.resolve(null);
      const [summaryResult, productsResult, actionCenterResult] = await Promise.allSettled([
        getAdminDashboardSummary({ comparison: "previous_period" }, signal),
        productRequest,
        getAdminActionCenter(signal),
      ]);

      if (!isLatestRequest()) return;

      if (summaryResult.status === "rejected") {
        throw summaryResult.reason;
      }

      const summaryResponse = summaryResult.value;
      const summaryPayload = summaryResponse?.data?.data;

      if (!isValidDashboardSummary(summaryPayload)) {
        throw new Error("Dashboard summary response was incomplete.");
      }

      setSummary(summaryPayload);
      setLastUpdated(summaryResponse?.data?.meta?.generatedAt || new Date().toISOString());
      setActionItems(
        actionCenterResult.status === "fulfilled"
          ? actionCenterResult.value?.data?.data ?? []
          : [],
      );

      if (!canReadProducts) {
        setProducts([]);
        setCatalogError("Catalog counts require products access.");
      } else if (productsResult.status === "fulfilled") {
        const productsResponse = productsResult.value;
        setProducts(normalizeArray(productsResponse?.data?.products ?? productsResponse?.data));
      } else {
        setCatalogError(
          productsResult.reason?.response?.status === 403
            ? "Catalog counts require products access."
            : "Catalog counts could not be loaded.",
        );
      }
    } catch (error) {
      if (signal?.aborted || error?.name === "CanceledError") return;
      if (!isLatestRequest()) return;

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Dashboard metrics could not be loaded.",
      );
      setErrorStatus(error?.response?.status ?? null);

      if (error?.response?.status === 403) {
        setSummary(null);
        setProducts([]);
        setLastUpdated(null);
      }
    } finally {
      if (isLatestRequest()) setLoading(false);
    }
  }, [canReadProducts]);

  const refreshAction = useMemo(
    () => (
      <AdminRefreshButton
        onClick={() => fetchDashboardData()}
        disabled={loading}
      />
    ),
    [fetchDashboardData, loading],
  );

  useAdminPageMeta({
    title: "Overview",
    documentTitle: "Overview",
    breadcrumbs: [
      {
        label: "Overview",
        href: DASHBOARDHOME,
      },
    ],
    lastUpdated,
    isRefreshing: loading && Boolean(lastUpdated),
    contextActions: refreshAction,
  });

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboardData(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchDashboardData]);

  const insights = useMemo(() => {
    const kpis = summary?.kpis ?? {};
    const activeProducts = products.filter((product) => product.isActive !== false).length;
    const salesSeries = normalizeArray(summary?.salesSeries).map((item) => ({
      ...item,
      period: formatPeriodLabel(item.periodStart),
      bookedSales: Number(item.bookedSales || 0),
      orders: Number(item.orders || 0),
    }));
    const statusData = normalizeArray(summary?.orderStatusBreakdown).map((item, index) => ({
      name: item.status || "pending",
      value: Number(item.count || 0),
      fill: statusPalette[index % statusPalette.length],
    }));

    return {
      kpis,
      bookedSales: kpiValue(kpis, "bookedSales"),
      orders: kpiValue(kpis, "orders"),
      averageOrderValue: kpiValue(kpis, "averageOrderValue"),
      unitsSold: kpiValue(kpis, "unitsSold"),
      uniqueCustomers: kpiValue(kpis, "uniqueCustomers"),
      cancellationRate: kpiValue(kpis, "cancellationRate"),
      uniqueVisitors:
        Number(summary?.visitorSummary?.uniqueVisitors ?? kpiValue(kpis, "uniqueVisitors")),
      pageViews: Number(summary?.visitorSummary?.pageViews || 0),
      salesSeries,
      statusData,
      activeProducts,
      catalogAvailable: !catalogError,
      recentOrdersAvailable: canReadOrders && summary?.recentOrdersAvailable !== false,
      topProductsAvailable: canReadProducts && summary?.topProductsAvailable !== false,
      recentOrders: canReadOrders
        ? normalizeArray(summary?.recentOrders).slice(0, 5)
        : [],
      topProducts: canReadProducts
        ? normalizeArray(summary?.topProducts).slice(0, 5)
        : [],
    };
  }, [canReadOrders, canReadProducts, catalogError, products, summary]);

  if (loading && !lastUpdated) {
    return (
      <AdminPageContainer>
        <AdminPageHeader
          title="Overview"
          description="A live control room for Nazra commerce, inventory, and demand signals."
        />
        <AdminLoadingState title="Loading overview" variant="cards" rows={6} />
      </AdminPageContainer>
    );
  }

  if (error && !lastUpdated) {
    if (errorStatus === 403) {
      return (
        <AdminPageContainer>
          <AdminPageHeader
            title="Overview"
            description="A live control room for Nazra commerce, inventory, and demand signals."
          />
          <AdminForbiddenState
            title="Dashboard analytics access is required"
            description="This overview uses the admin dashboard summary endpoint, which requires dashboard and analytics permissions."
            showAction={false}
          />
        </AdminPageContainer>
      );
    }

    return (
      <AdminPageContainer>
        <AdminPageHeader
          title="Overview"
          description="A live control room for Nazra commerce, inventory, and demand signals."
        />
        <AdminErrorState
          title="We couldn't load overview metrics"
          description={error}
          onRetry={() => fetchDashboardData()}
        />
      </AdminPageContainer>
    );
  }

  const statCards = [
    {
      title: "Booked Sales",
      value: formatMAD(insights.bookedSales, { compact: true }),
      detail: "Non-cancelled order value",
      icon: CircleDollarSign,
      trend: formatChange(insights.kpis.bookedSales?.changePercent),
      trendIcon: getTrendIcon(insights.kpis.bookedSales?.changePercent),
    },
    {
      title: "Orders",
      value: formatShortNumber(insights.orders),
      detail: "Orders in selected range",
      icon: ShoppingCart,
      trend: formatChange(insights.kpis.orders?.changePercent),
      trendIcon: getTrendIcon(insights.kpis.orders?.changePercent),
    },
    {
      title: "Avg Order",
      value: formatMAD(insights.averageOrderValue, { compact: true }),
      detail: "Booked sales per order",
      icon: WalletCards,
      trend: formatChange(insights.kpis.averageOrderValue?.changePercent),
      trendIcon: getTrendIcon(insights.kpis.averageOrderValue?.changePercent),
    },
    {
      title: "Units Sold",
      value: formatShortNumber(insights.unitsSold),
      detail: "Line quantities sold",
      icon: Package,
      trend: formatChange(insights.kpis.unitsSold?.changePercent),
      trendIcon: getTrendIcon(insights.kpis.unitsSold?.changePercent),
    },
    {
      title: "Customers",
      value: formatShortNumber(insights.uniqueCustomers),
      detail: "Unique order emails",
      icon: Users,
      trend: formatChange(insights.kpis.uniqueCustomers?.changePercent),
      trendIcon: getTrendIcon(insights.kpis.uniqueCustomers?.changePercent),
    },
    {
      title: "Visitors",
      value: formatShortNumber(insights.uniqueVisitors),
      detail: `${formatShortNumber(insights.pageViews)} page views`,
      icon: Eye,
      trend: formatChange(insights.kpis.uniqueVisitors?.changePercent),
      trendIcon: getTrendIcon(insights.kpis.uniqueVisitors?.changePercent),
    },
  ];

  return (
    <AdminPageContainer className="max-w-[1700px] space-y-7">
      <AdminPageHeader
        title="Overview"
        description="A live control room for Nazra commerce, inventory, and demand signals."
      />

      {error && lastUpdated && (
        <AdminOfflineState
          title="Showing previously loaded data"
          description={error}
          onRetry={() => fetchDashboardData()}
        />
      )}

      <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
          <div className="relative min-h-[340px] border-b bg-[linear-gradient(135deg,var(--foreground)_0%,var(--primary)_50%,var(--chart-3)_100%)] p-5 text-primary-foreground sm:p-6 lg:border-b-0 lg:border-r">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--primary-foreground)_12%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--primary-foreground)_12%,transparent)_1px,transparent_1px)] bg-[size:28px_28px]" />
            <div className="relative flex h-full flex-col justify-between gap-8">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
                  <Sparkles className="h-3 w-3" />
                  Web3 Command Layer
                </Badge>
                <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
                  <Activity className="h-3 w-3" />
                  {loading ? "Syncing" : "Synced"}
                </Badge>
              </div>

              <div className="max-w-3xl">
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-white/60">
                  Revenue Mesh
                </p>
                <h2 className="mt-3 text-4xl font-semibold tracking-normal sm:text-5xl">
                  {formatMAD(insights.bookedSales)}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                  Booked sales, order momentum, visitor reach, and catalog readiness are stitched into one admin view.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <HeroSignal
                  label="Cancellation"
                  value={`${insights.cancellationRate.toFixed(1)}%`}
                  icon={Zap}
                />
                <HeroSignal
                  label="Avg Order"
                  value={formatMAD(insights.averageOrderValue, { compact: true })}
                  icon={WalletCards}
                />
                <HeroSignal
                  label="Active Catalog"
                  value={insights.catalogAvailable ? insights.activeProducts : "Restricted"}
                  icon={ShieldCheck}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 p-5 sm:p-6">
            <div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Network Flow
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold tracking-normal">
                    Commerce pulse
                  </h3>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => fetchDashboardData()}
                  disabled={loading}
                  aria-label="Refresh dashboard data"
                >
                  <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                </Button>
              </div>
              <div className="mt-6 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={insights.salesSeries}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartAccent} stopOpacity={0.55} />
                        <stop offset="95%" stopColor={chartAccent} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fill: chartMuted, fontSize: 12 }} />
                    <YAxis hide />
                    <Tooltip content={<ChartTooltip valueFormatter={(value) => formatMAD(value, { compact: true })} />} />
                    <Area
                      type="monotone"
                      dataKey="bookedSales"
                      name="Booked Sales"
                      stroke={chartAccent}
                      strokeWidth={2.5}
                      fill="url(#salesGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MiniMetric label="Orders" value={insights.orders} />
              <MiniMetric
                label="Products"
                value={insights.catalogAvailable ? products.length : "N/A"}
                description={catalogError}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </section>

      <ActionCenterPanel items={actionItems} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <PerformanceChart data={insights.salesSeries} />
        <StatusChart data={insights.statusData} ordersCount={insights.orders} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <RecentOrdersPanel
          orders={insights.recentOrders}
          canReadOrders={insights.recentOrdersAvailable}
        />
        <TopProductsPanel
          products={insights.topProducts}
          canReadProducts={insights.topProductsAvailable}
        />
      </section>
    </AdminPageContainer>
  );
};

const HeroSignal = ({ label, value, icon: Icon }) => (
  <div className="rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur">
    <div className="flex items-center gap-2 text-white/70">
      {React.createElement(Icon, { className: "h-4 w-4", "aria-hidden": true })}
      <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
    </div>
    <p className="mt-2 text-2xl font-semibold tracking-normal text-white">{value}</p>
  </div>
);

const severityStyles = {
  critical: "border-destructive/25 bg-destructive/5 text-destructive",
  warning: "border-amber-300/60 bg-amber-50 text-amber-900",
  info: "border-border bg-muted/30 text-muted-foreground",
};

const ActionCenterPanel = ({ items = [] }) => {
  const actionable = items.filter((item) => Number(item.count || 0) > 0);

  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="border-b px-5 py-5">
        <CardTitle className="flex items-center gap-2 text-xl">
          <AlertTriangle className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          Action Center
        </CardTitle>
        <CardDescription>Operational work that needs attention now</CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        {actionable.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {actionable.map((item) => (
              <Link
                key={item.key}
                to={item.href}
                className={`rounded-lg border p-4 transition hover:bg-accent ${severityStyles[item.severity] || severityStyles.info}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Open related admin view</p>
                  </div>
                  <Badge variant={item.severity === "critical" ? "destructive" : "outline"}>
                    {item.count}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyPanel
            icon={AlertTriangle}
            title="No urgent actions"
            description="Pending work, stock alerts, contact messages, and reviews will appear here."
          />
        )}
      </CardContent>
    </Card>
  );
};

const MiniMetric = ({ label, value, description }) => (
  <div className="rounded-lg border bg-muted/40 p-3">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <p className="mt-1 text-2xl font-semibold tracking-normal">
      {typeof value === "number" ? formatShortNumber(value) : value}
    </p>
    {description ? (
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    ) : null}
  </div>
);

const StatCard = ({ title, value, detail, icon: Icon, trend, trendIcon: TrendIcon }) => (
  <Card className="group min-h-40 overflow-hidden border-border/80 bg-card/95 py-0 transition hover:-translate-y-0.5 hover:shadow-lg">
    <CardContent className="flex h-full flex-col justify-between p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-lg border bg-muted/50 p-2 text-muted-foreground transition group-hover:border-primary/25 group-hover:text-foreground">
          {React.createElement(Icon, { className: "h-4 w-4", "aria-hidden": true })}
        </div>
        <Badge variant="outline" className="bg-background/80 text-[10px] uppercase tracking-wide">
          Live
        </Badge>
      </div>
      <div className="pt-6">
        <p className="text-2xl font-semibold tracking-normal">{value}</p>
        <p className="mt-1 text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </div>
      <div className="mt-4 flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
        {React.createElement(TrendIcon, { className: "h-3.5 w-3.5 text-foreground", "aria-hidden": true })}
        <span>{trend}</span>
      </div>
    </CardContent>
  </Card>
);

const ChartTooltip = ({ active, payload, label, valueFormatter }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-popover p-3 text-popover-foreground shadow-lg">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="mt-1 text-sm font-semibold">
          {entry.name || entry.dataKey}:{" "}
          {valueFormatter
            ? valueFormatter(entry.value)
            : entry.dataKey === "bookedSales"
              ? formatMAD(entry.value, { compact: true })
              : formatShortNumber(entry.value)}
        </p>
      ))}
    </div>
  );
};

const PerformanceChart = ({ data }) => (
  <Card className="overflow-hidden py-0">
    <CardHeader className="border-b px-5 py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Activity className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            Commerce Throughput
          </CardTitle>
          <CardDescription>
            Orders and booked sales across the selected range
          </CardDescription>
        </div>
        <Badge variant="secondary" className="w-fit">
          {data.reduce((sum, item) => sum + item.orders, 0)} orders
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="p-5">
      {data.some((item) => item.orders || item.bookedSales) ? (
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fill: chartMuted, fontSize: 12 }} />
              <YAxis
                yAxisId="sales"
                tickLine={false}
                axisLine={false}
                tick={{ fill: chartMuted, fontSize: 12 }}
                tickFormatter={(value) => formatShortNumber(value)}
                width={44}
              />
              <YAxis yAxisId="orders" orientation="right" hide />
              <Tooltip content={<ChartTooltip />} />
              <Bar yAxisId="sales" dataKey="bookedSales" name="Sales" fill={chartGlow} radius={[6, 6, 0, 0]} />
              <Bar yAxisId="orders" dataKey="orders" name="Orders" fill={chartAccent} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyPanel icon={Activity} title="No throughput yet" description="Orders and booked sales will appear once data is available." />
      )}
    </CardContent>
  </Card>
);

const StatusChart = ({ data, ordersCount }) => (
  <Card className="overflow-hidden py-0">
    <CardHeader className="border-b px-5 py-5">
      <CardTitle className="flex items-center gap-2 text-xl">
        <Boxes className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        Order State Map
      </CardTitle>
      <CardDescription>Status distribution across captured orders</CardDescription>
    </CardHeader>
    <CardContent className="p-5">
      {data.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-[180px_1fr] xl:grid-cols-1 2xl:grid-cols-[180px_1fr]">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} innerRadius={58} outerRadius={82} paddingAngle={4} dataKey="value">
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {data.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="truncate text-sm font-medium capitalize">{item.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {ordersCount ? Math.round((item.value / ordersCount) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyPanel icon={Boxes} title="No order states yet" description="Status distribution will appear after orders are created." />
      )}
    </CardContent>
  </Card>
);

const RecentOrdersPanel = ({ orders, canReadOrders }) => (
  <Card className="overflow-hidden py-0">
    <CardHeader className="border-b px-5 py-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            Recent Orders
          </CardTitle>
          <CardDescription>Latest customer activity from the order ledger</CardDescription>
        </div>
        {canReadOrders ? (
          <Button asChild variant="outline" size="sm">
            <Link to={DASHBOARDORDERS}>
              Open
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        ) : null}
      </div>
    </CardHeader>
    <CardContent className="p-5">
      {!canReadOrders ? (
        <EmptyPanel icon={ShoppingCart} title="Orders access required" description="Recent orders are hidden for admins without order read permission." />
      ) : orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.reference || order._id} className="flex items-center justify-between gap-4 rounded-lg border bg-muted/20 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {order.customerName || "Customer"}
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  #{String(order.reference || order._id || "ORDER").slice(-8).toUpperCase()} · {formatAdminDate(order.createdAt)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold">{formatMAD(order.total, { compact: true })}</p>
                <Badge variant="outline" className="mt-1 capitalize">
                  {order.status || "pending"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyPanel icon={ShoppingCart} title="No orders yet" description="New orders will land here as soon as customers check out." />
      )}
    </CardContent>
  </Card>
);

const TopProductsPanel = ({ products, canReadProducts }) => (
  <Card className="overflow-hidden py-0">
    <CardHeader className="border-b px-5 py-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            Product Velocity
          </CardTitle>
          <CardDescription>Best movers from non-cancelled orders</CardDescription>
        </div>
        {canReadProducts ? (
          <Button asChild variant="outline" size="sm">
            <Link to={DASHBOARDPRODUCTS}>
              Products
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        ) : null}
      </div>
    </CardHeader>
    <CardContent className="p-5">
      {!canReadProducts ? (
        <EmptyPanel icon={Package} title="Products access required" description="Product velocity is hidden for admins without product read permission." />
      ) : products.length > 0 ? (
        <div className="space-y-3">
          {products.map((product, index) => (
            <div key={product.productId || product.name} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border bg-muted/20 p-3">
              <Badge variant="secondary" className="h-7 w-7 rounded-lg p-0">
                {index + 1}
              </Badge>
              <div className="flex min-w-0 items-center gap-3">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="h-10 w-10 rounded-lg border object-cover" />
                ) : (
                  <div className="grid h-10 w-10 place-items-center rounded-lg border bg-muted">
                    <Package className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{product.name || "Archived product"}</p>
                  <p className="text-xs text-muted-foreground">{formatShortNumber(product.unitsSold)} units sold</p>
                </div>
              </div>
              <p className="text-right text-sm font-semibold">
                {formatMAD(product.bookedSales, { compact: true })}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyPanel icon={Package} title="No product velocity yet" description="Sold products will rank here after non-cancelled orders exist." />
      )}
    </CardContent>
  </Card>
);

const EmptyPanel = ({ icon: Icon, title, description }) => (
  <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-6 text-center">
    {React.createElement(Icon, { className: "h-10 w-10 text-muted-foreground/60", "aria-hidden": true })}
    <p className="mt-3 text-sm font-medium">{title}</p>
    <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
  </div>
);

export default Dashboard;
