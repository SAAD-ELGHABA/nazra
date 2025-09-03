import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getOrders } from "../api/api";

const OrderStats = ({ hideTitle = false, heightMobile = 250, heightDesktop = 320 }) => {
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [monthRange, setMonthRange] = useState("3");
  const [allOrders, setAllOrders] = useState([]);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    fetchAllOrders();
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (allOrders.length) processOrderData();
  }, [allOrders, monthRange]);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders();
      if (res.status === 200) setAllOrders(res.data.orders);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const processOrderData = () => {
    const months = monthRange === "all" ? 120 : parseInt(monthRange, 10);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const filtered =
      monthRange === "all"
        ? allOrders
        : allOrders.filter((o) => new Date(o.createdAt) >= startDate);

    const grouped = {};
    filtered.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label =
        windowWidth < 640
          ? d.toLocaleDateString("en-US", { month: "short" })
          : d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      if (!grouped[key]) grouped[key] = { month: label, monthKey: key, orders: 0 };
      grouped[key].orders += 1;
    });

    setOrderData(Object.values(grouped).sort((a, b) => a.monthKey.localeCompare(b.monthKey)));
  };

  return (
    <div className="w-full">
      {/* {!hideTitle && (
        <h2 className="text-lg sm:text-xl font-semibold mb-2">Monthly Orders</h2>
      )} */}

      {/* Dropdown for Time Range */}
      <div className="flex justify-end mb-3">
        <select
          value={monthRange}
          onChange={(e) => setMonthRange(e.target.value)}
          className="border rounded px-2 py-1 text-sm sm:text-base focus:ring focus:ring-blue-300"
        >
          <option value="3">Last 3 Months</option>
          <option value="6">Last 6 Months</option>
          <option value="12">Last 12 Months</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-3 p-2 text-sm text-red-700 bg-red-100 border border-red-300 rounded">
          {error}
        </div>
      )}

      {/* Loading Spinner */}
      {loading ? (
        <div
          className="flex items-center justify-center"
          style={{ height: windowWidth < 640 ? heightMobile : heightDesktop }}
        >
          <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : orderData.length ? (
        <div
          className="w-full"
          style={{ height: windowWidth < 640 ? heightMobile : heightDesktop }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={orderData}
              margin={{
                top: windowWidth < 640 ? 8 : 16,
                right: windowWidth < 640 ? 8 : 16,
                left: windowWidth < 640 ? 0 : 8,
                bottom: windowWidth < 640 ? 10 : 16,
              }}
            >
              <CartesianGrid strokeDasharray="5 5" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: windowWidth < 640 ? 10 : windowWidth < 768 ? 11 : 12 }}
                minTickGap={10}
                interval={windowWidth < 640 ? Math.ceil(orderData.length / 4) - 1 : 0}
                angle={windowWidth < 640 ? -30 : 0}
                textAnchor={windowWidth < 640 ? "end" : "middle"}
              />
              <YAxis
                tick={{ fontSize: windowWidth < 640 ? 10 : windowWidth < 768 ? 11 : 12 }}
              />
              <Tooltip
                formatter={(v) => [`${v} orders`, "Orders"]}
                labelStyle={{ fontWeight: 600, fontSize: windowWidth < 640 ? 12 : 14 }}
                contentStyle={{ fontSize: windowWidth < 640 ? 12 : 14 }}
              />
              <Bar
                dataKey="orders"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                barSize={windowWidth < 640 ? 20 : windowWidth < 768 ? 32 : 44}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div
          className="flex items-center justify-center text-gray-500 text-sm sm:text-base"
          style={{ height: windowWidth < 640 ? heightMobile : heightDesktop }}
        >
          No orders found for the selected period
        </div>
      )}
    </div>
  );
};

export default OrderStats;
