import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  Users,
  Eye,
  TrendingUp,
  Package,
  DollarSign,
} from "lucide-react";
import OrderStats from "../components/OrderStats";
import ProductStats from "../components/ProductStats";
import VisitorStats from "../components/VisitorStats";
import RecentOrders from "../components/RecentOrders";
import TopProducts from "../components/TopProducts";
import { getOrders, getProductsAsAdmin, getVisitors } from "../api/api";
import { formatMAD, getOrderTotal, isNonCancelledOrder } from "../utils/adminFormatting";
import AdminPageContainer from "../components/admin/page/AdminPageContainer";
import AdminPageHeader from "../components/admin/page/AdminPageHeader";
import AdminLoadingState from "../components/admin/feedback/AdminLoadingState";
import AdminErrorState from "../components/admin/feedback/AdminErrorState";
import AdminOfflineState from "../components/admin/feedback/AdminOfflineState";
import { AdminRefreshButton } from "../components/admin/shell/AdminTopbar";
import { useAdminPageMeta } from "../context/AdminPageContext";
import { DASHBOARDHOME } from "../constant/routerConstants";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const getUniqueEmail = (orders = []) => {
    const emails = new Set();

    orders.forEach((order) => {
      if (order.email) {
        emails.add(order.email.toLowerCase());
      }
    });

    return emails.size;
  };

  const calculateBookedSales = (orders = []) =>
    orders
      .filter(isNonCancelledOrder)
      .reduce(
        (total, order) => total + getOrderTotal(order),
        0,
      );

  const calculateConversionRate = (
    ordersCount,
    visitorsCount,
  ) => {
    if (visitorsCount === 0) {
      return 0;
    }

    return Number(
      ((ordersCount / visitorsCount) * 100).toFixed(2),
    );
  };

  // Declare this before refreshAction
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [orders, products, visitors] = await Promise.all([
        getOrders(),
        getProductsAsAdmin(),
        getVisitors(),
      ]);

      const ordersArr = orders?.data?.orders ?? [];
      const productsArr = products?.data?.products ?? [];
      const visitorsArr = visitors?.data?.views ?? [];

      const uniqueIPs = new Set(
        visitorsArr
          .map((visitor) => visitor.ipAddress)
          .filter(Boolean),
      );

      setTotalOrders(ordersArr.length);
      setTotalRevenue(calculateBookedSales(ordersArr));
      setTotalProducts(productsArr.length);
      setTotalCustomers(getUniqueEmail(ordersArr));
      setTotalViews(uniqueIPs.size);

      setConversionRate(
        calculateConversionRate(
          ordersArr.length,
          visitorsArr.length,
        ),
      );

      setLastUpdated(new Date().toISOString());
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Dashboard metrics could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // This can now safely access fetchDashboardData
  const refreshAction = useMemo(
    () => (
      <AdminRefreshButton
        onClick={fetchDashboardData}
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
    fetchDashboardData();
  }, [fetchDashboardData]);
  if (loading && !lastUpdated) {
    return (
      <AdminPageContainer>
        <AdminPageHeader
          title="Overview"
          description="A snapshot of your store's current performance."
        />
        <AdminLoadingState title="Loading overview" variant="cards" rows={6} />
      </AdminPageContainer>
    );
  }

  if (error && !lastUpdated) {
    return (
      <AdminPageContainer>
        <AdminPageHeader
          title="Overview"
          description="A snapshot of your store's current performance."
        />
        <AdminErrorState
          title="We couldn't load overview metrics"
          description={error}
          onRetry={fetchDashboardData}
        />
      </AdminPageContainer>
    );
  }

  const statCards = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: <ShoppingCart className="w-6 h-6" />,
    },
    {
      title: "Booked Sales",
      value: formatMAD(totalRevenue),
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      title: "Total Products",
      value: totalProducts,
      icon: <Package className="w-6 h-6" />,
    },
    {
      title: "Total Customers",
      value: totalCustomers,
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "Total Views",
      value: totalViews,
      icon: <Eye className="w-6 h-6" />,
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      icon: <TrendingUp className="w-6 h-6" />,
    },
  ];

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Overview"
        description="A snapshot of your store's current performance."
      />

      {error && lastUpdated && (
        <AdminOfflineState
          title="Showing previously loaded data"
          description={error}
          onRetry={fetchDashboardData}
        />
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((c, i) => (
          <StatCard key={i} {...c} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OrderStats />
        <ProductStats />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <VisitorStats visitors={totalViews} />
        <RecentOrders />
        <TopProducts />
      </div>
    </AdminPageContainer>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="flex min-h-28 flex-col justify-between rounded-xl border bg-card p-4 shadow-sm">
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
      {icon}
    </div>
    <div className="mt-3">
      <p className="text-xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{title}</p>
    </div>
  </div>
);


export default Dashboard;
