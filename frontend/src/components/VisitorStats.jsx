import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const VisitorStats = () => {
  const visitorData = [
    { day: 'Mon', visitors: 150, pageViews: 450 },
    { day: 'Tue', visitors: 180, pageViews: 520 },
    { day: 'Wed', visitors: 220, pageViews: 680 },
    { day: 'Thu', visitors: 190, pageViews: 570 },
    { day: 'Fri', visitors: 250, pageViews: 750 },
    { day: 'Sat', visitors: 300, pageViews: 900 },
    { day: 'Sun', visitors: 280, pageViews: 840 }
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow text-sm">
          <p className="font-bold mb-1">{label}</p>
          <p className="text-purple-600">Visitors: {payload[0]?.value}</p>
          <p className="text-green-600">Page Views: {payload[1]?.value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white shadow rounded p-4 w-full max-w-lg mx-auto">
      <h2 className="text-lg sm:text-xl font-semibold text-center sm:text-left mb-4">
        Visitor Analytics (Last 7 Days)
      </h2>

      <div className="w-full h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={visitorData}
            margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ display: 'none' }} /> {/* Hidden for mobile, custom legend below */}
            <Bar dataKey="visitors" fill="#8884d8" name="Visitors" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pageViews" fill="#82ca9d" name="Page Views" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Mobile/Custom legend */}
      <div className="flex justify-center sm:justify-start gap-4 mt-3">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-600 rounded-sm"></div>
          <span className="text-sm">Visitors</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
          <span className="text-sm">Page Views</span>
        </div>
      </div>
    </div>
  );
};

export default VisitorStats;
