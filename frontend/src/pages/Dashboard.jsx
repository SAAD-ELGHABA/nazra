import React, { useCallback, useEffect, useState } from "react";
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

import SubEmails from "../components/Dashboard/SubEmails";
import VisitorAnalytics from "../components/Dashboard/VisitorAnalytics";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [error, setError] = useState("");

  const getUniqueEmail = (orders = []) => {
    const s = new Set();
    orders.forEach((o) => o.email && s.add(o.email.toLowerCase()));
    return s.size;
  };

  const calculateBookedSales = (orders = []) =>
    orders.filter(isNonCancelledOrder).reduce((acc, order) => acc + getOrderTotal(order), 0);

  const calculateConversionRate = (ordersCount, visitorsCount) =>
    visitorsCount === 0 ? 0 : ((ordersCount / visitorsCount) * 100).toFixed(2);

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
        visitorsArr.map((visitor) => visitor.ipAddress)
      );
      const totalUniqueVisitors = uniqueIPs.size;

      setTotalViews(totalUniqueVisitors);

      setTotalOrders(ordersArr.length);
      setTotalProducts(productsArr.length);
      setTotalCustomers(getUniqueEmail(ordersArr));
      setTotalRevenue(calculateBookedSales(ordersArr));
      setConversionRate(
        calculateConversionRate(ordersArr.length, visitorsArr.length)
      );
    } catch (e) {
      setError(e?.response?.data?.message || "Dashboard metrics could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading)
    return (
      <div className="w-full h-40 flex items-center justify-center">
        Loading...
      </div>
    );
  if (error) {
    return (
      <div className="w-full p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-medium">Unable to load dashboard metrics</p>
          <p className="mt-1 text-sm">{error}</p>
          <button
            type="button"
            onClick={fetchDashboardData}
            className="mt-3 rounded-md bg-red-700 px-3 py-2 text-sm font-medium text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: <ShoppingCart className="w-6 h-6" />,
      color: "text-red-500 border-t-2 border-red-500",
    },
    {
      title: "Booked Sales",
      value: formatMAD(totalRevenue),
      icon: <DollarSign className="w-6 h-6" />,
      color: "text-green-500 border-t-2 border-green-500",
    },
    {
      title: "Total Products",
      value: totalProducts,
      icon: <Package className="w-6 h-6" />,
      color: "text-orange-500 border-t-2 border-orange-500",
    },
    {
      title: "Total Customers",
      value: totalCustomers,
      icon: <Users className="w-6 h-6" />,
      color: "text-purple-500 border-t-2 border-purple-500",
    },
    {
      title: "Total Views",
      value: totalViews,
      icon: <Eye className="w-6 h-6" />,
      color: "text-cyan-500 border-t-2 border-cyan-500",
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: "text-red-600 border-t-2 border-red-600",
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Quick Statics Overview
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statCards.map((c, i) => (
          <StatCard key={i} {...c} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <OrderStats />
          <ProductStats />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VisitorStats visitors={totalViews} />
          <RecentOrders />
          <VisitorAnalytics/>
          <TopProducts />
        <div  className="lg:col-span-2">
          <SubEmails />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div
    className={`rounded-xl shadow-md p-4 flex flex-col items-center justify-center ${color}`}
  >
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-xl font-bold">{value}</span>
    </div>
    <p className="text-sm opacity-90 text-center">{title}</p>
  </div>
);


export default Dashboard;
