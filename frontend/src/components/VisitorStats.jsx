import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getVisitors } from "../api/api";

const VisitorStats = () => {
  const [visitors, setVisitors] = useState([]);
  const [viewMode, setViewMode] = useState("daily"); // 'daily' | 'weekly' | 'monthly'

  const getVisitorsData = async () => {
    const res = await getVisitors();
    const views = res?.data?.views || [];

    // Convert all dates to Date objects
    const parsed = views.map((v) => ({
      ...v,
      dateObj: new Date(v.date),
    }));

    if (viewMode === "daily") {
      setVisitors(getLast7DaysData(parsed));
    } else if (viewMode === "weekly") {
      setVisitors(getLast7WeeksData(parsed));
    } else {
      setVisitors(getLast12MonthsData(parsed));
    }
  };

  // 🔹 Filter last 7 days
  const getLast7DaysData = (views) => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const last7DaysViews = views.filter(
      (v) => v.dateObj >= sevenDaysAgo && v.dateObj <= today
    );

    const grouped = last7DaysViews.reduce((acc, curr) => {
      const day = curr.dateObj.toISOString().split("T")[0];
      if (!acc[day]) acc[day] = { day, visitors: 0 };
      acc[day].visitors += 1;
      return acc;
    }, {});

    return Object.values(grouped).sort(
      (a, b) => new Date(a.day) - new Date(b.day)
    );
  };

  const getLast7WeeksData = (views) => {
    const today = new Date();
    const sevenWeeksAgo = new Date(today);
    sevenWeeksAgo.setDate(today.getDate() - 7 * 6);

    const filtered = views.filter(
      (v) => v.dateObj >= sevenWeeksAgo && v.dateObj <= today
    );

    const grouped = filtered.reduce((acc, curr) => {
      const year = curr.dateObj.getFullYear();
      const week = getWeekNumber(curr.dateObj);
      const label = `${year}-W${week}`;
      if (!acc[label]) acc[label] = { week: label, visitors: 0 };
      acc[label].visitors += 1;
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) =>
      a.week.localeCompare(b.week)
    );
  };

  const getLast12MonthsData = (views) => {
    const today = new Date();
    const twelveMonthsAgo = new Date(today);
    twelveMonthsAgo.setMonth(today.getMonth() - 11);

    const filtered = views.filter(
      (v) => v.dateObj >= twelveMonthsAgo && v.dateObj <= today
    );

    const grouped = filtered.reduce((acc, curr) => {
      const month = curr.dateObj.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      if (!acc[month]) acc[month] = { month, visitors: 0 };
      acc[month].visitors += 1;
      return acc;
    }, {});

    return Object.values(grouped);
  };

  const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return weekNo;
  };

  useEffect(() => {
    getVisitorsData();
  }, [viewMode]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow text-sm">
          <p className="font-bold mb-1">{label}</p>
          <p className="text-purple-600">Visitors: {payload[0]?.value}</p>
        </div>
      );
    }
    return null;
  };

  const xKey =
    viewMode === "daily" ? "day" : viewMode === "weekly" ? "week" : "month";

  return (
    <div className="bg-white shadow rounded p-4 w-full">
      <div className="flex justify-end mb-3 gap-2">
        {["daily", "weekly", "monthly"].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1 rounded text-xs md:text-sm font-medium transition ${
              viewMode === mode
                ? "bg-[#8884d8] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {mode === "daily"
              ? "Last 7 Days"
              : mode === "weekly"
              ? "Last 7 Weeks"
              : "Last 12 Months"}
          </button>
        ))}
      </div>

      <div className="w-full h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={visitors}
            margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ display: "none" }} />
            <Bar
              dataKey="visitors"
              fill="#8884d8"
              name="Visitors"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center sm:justify-start gap-4 mt-3">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-600 rounded-sm"></div>
          <span className="text-sm">Visitors</span>
        </div>
      </div>
    </div>
  );
};

export default VisitorStats;
