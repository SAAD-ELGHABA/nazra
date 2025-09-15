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

  const getVisitorsData = async () => {
    const res = await getVisitors();
    const views = res?.data?.views || [];

    // Group by date
    const grouped = views.reduce((acc, curr) => {
      const day = curr.date; // e.g. "2025-09-13"
      if (!acc[day]) {
        acc[day] = { day, visitors: 0, pageViews: 0 };
      }
      acc[day].visitors += 1;   // count visitors
      acc[day].pageViews += 1; // here I'm treating "views" as pageViews too
      return acc;
    }, {});

    // Convert object to array sorted by date
    const formatted = Object.values(grouped).sort(
      (a, b) => new Date(a.day) - new Date(b.day)
    );

    setVisitors(formatted);
  };

  useEffect(() => {
    getVisitorsData();
  }, []);

  // Custom tooltip
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

  return (
    <div className="bg-white shadow rounded p-4 w-full">
      <div className="w-full h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={visitors}
            margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
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

      {/* Custom legend */}
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
