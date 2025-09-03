import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Users,
  Eye,
  TrendingUp,
  Package,
  DollarSign,
} from "lucide-react"; // using lucide icons instead of MUI
import OrderStats from "../components/OrderStats";
import ProductStats from "../components/ProductStats";
import VisitorStats from "../components/VisitorStats";
import RecentOrders from "../components/RecentOrders";
import TopProducts from "../components/TopProducts";
import { getOrders, getProducts } from "../api/api";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalViews] = useState(1000); // Estimated visitor count
  const [conversionRate, setConversionRate] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getUniqueEmail = (orders = []) => {
    const s = new Set();
    orders.forEach((o) => o.email && s.add(o.email.toLowerCase()));
    return s.size;
  };

  const calculateRevenue = (orders = []) =>
    orders.reduce((acc, o) => {
      const sub = (o.products || []).reduce((sum, it) => {
        const price =
          it.product?.sale_price ?? it.product?.original_price ?? 0;
        return sum + price * (it.quantity ?? 0);
      }, 0);
      return acc + sub;
    }, 0);

  const calculateConversionRate = (ordersCount, visitorsCount) =>
    visitorsCount === 0
      ? 0
      : ((ordersCount / visitorsCount) * 100).toFixed(2);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [orders, products] = await Promise.all([
        getOrders(),
        getProducts(),
      ]);

      const ordersArr = orders?.data?.orders ?? [];
      const productsArr = products?.data?.products ?? [];

      setTotalOrders(ordersArr.length);
      setTotalProducts(productsArr.length);
      setTotalCustomers(getUniqueEmail(ordersArr));
      setTotalRevenue(calculateRevenue(ordersArr));
      setConversionRate(
        calculateConversionRate(ordersArr.length, totalViews)
      );
    } catch (e) {
      console.error("Error fetching dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="w-full h-40 flex items-center justify-center">Loading...</div>;

  const statCards = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: <ShoppingCart className="w-6 h-6" />,
      color: "bg-blue-600",
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: "bg-green-600",
    },
    {
      title: "Total Products",
      value: totalProducts,
      icon: <Package className="w-6 h-6" />,
      color: "bg-orange-500",
    },
    {
      title: "Total Customers",
      value: totalCustomers,
      icon: <Users className="w-6 h-6" />,
      color: "bg-purple-600",
    },
    {
      title: "Total Views",
      value: totalViews.toLocaleString(),
      icon: <Eye className="w-6 h-6" />,
      color: "bg-cyan-600",
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: "bg-red-600",
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Dashboard Overview
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statCards.map((c, i) => (
          <StatCard key={i} {...c} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SectionCard title="Monthly Orders">
          <OrderStats />
        </SectionCard>
        <SectionCard title="Product Status">
          <ProductStats />
        </SectionCard>
      </div>

      {/* Other sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Visitor Analytics (Last 7 Days)">
          <VisitorStats />
        </SectionCard>
        <SectionCard title="Recent Orders">
          <RecentOrders />
        </SectionCard>
        <SectionCard title="Top Products" className="lg:col-span-2">
          <TopProducts />
        </SectionCard>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div
    className={`rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-white ${color}`}
  >
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-xl font-bold">{value}</span>
    </div>
    <p className="text-sm opacity-90 text-center">{title}</p>
  </div>
);

const SectionCard = ({ title, children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-900 rounded-xl shadow p-4 md:p-6 ${className}`}
  >
    <h2 className="text-lg md:text-xl font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

export default Dashboard;
