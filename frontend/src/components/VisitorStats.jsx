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
  Cell,
} from "recharts";
import { getVisitors } from "../api/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Users, TrendingUp, Calendar } from "lucide-react";

const VisitorStats = () => {
  const [visitors, setVisitors] = useState([]);
  const [viewMode, setViewMode] = useState("daily"); // 'daily' | 'weekly' | 'monthly'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getVisitorsData = async () => {
    try {
      setLoading(true);
      const res = await getVisitors();
      const views = res?.data?.views || [];

      // Convert all dates to Date objects
      const parsed = views.map((v) => ({
        ...v,
        dateObj: new Date(v.date),
      }));

      let processedData = [];
      if (viewMode === "daily") {
        processedData = getLast7DaysData(parsed);
      } else if (viewMode === "weekly") {
        processedData = getLast7WeeksData(parsed);
      } else {
        processedData = getLast12MonthsData(parsed);
      }

      setVisitors(processedData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch visitor data");
      console.error("Error fetching visitor stats:", err);
    } finally {
      setLoading(false);
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
      const formattedDate = curr.dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      if (!acc[day]) acc[day] = { day: formattedDate, dayKey: day, visitors: 0 };
      acc[day].visitors += 1;
      return acc;
    }, {});

    return Object.values(grouped).sort(
      (a, b) => new Date(a.dayKey) - new Date(b.dayKey)
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
      const label = `W${week} ${year}`;
      const weekKey = `${year}-W${week}`;
      if (!acc[weekKey]) acc[weekKey] = { week: label, weekKey, visitors: 0 };
      acc[weekKey].visitors += 1;
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) =>
      a.weekKey.localeCompare(b.weekKey)
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
      const monthKey = curr.dateObj.toISOString().substring(0, 7);
      if (!acc[monthKey]) acc[monthKey] = { month, monthKey, visitors: 0 };
      acc[monthKey].visitors += 1;
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
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
        <Card className="p-3 shadow-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-purple-500" />
            <p className="font-semibold text-sm">{label}</p>
          </div>
          <p className="text-sm flex items-center gap-2">
            <span className="text-muted-foreground">Visitors:</span>
            <span className="font-medium text-purple-600">
              {payload[0]?.value}
            </span>
          </p>
        </Card>
      );
    }
    return null;
  };

  const getTotalVisitors = () => {
    return visitors.reduce((sum, item) => sum + item.visitors, 0);
  };

  const getGrowthPercentage = () => {
    if (visitors.length < 2) return 0;
    const current = visitors[visitors.length - 1]?.visitors || 0;
    const previous = visitors[visitors.length - 2]?.visitors || 0;
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const xKey = viewMode === "daily" ? "day" : viewMode === "weekly" ? "week" : "month";

  // Color palette for bars
  const BAR_COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Visitor Analytics
            </CardTitle>
            <CardDescription>
              Track your website visitor trends over time
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-3">
            {visitors.length > 1 && (
              <Badge 
                variant={getGrowthPercentage() >= 0 ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                <TrendingUp className="h-3 w-3" />
                {getGrowthPercentage() >= 0 ? "+" : ""}
                {getGrowthPercentage().toFixed(1)}%
              </Badge>
            )}
            
            <Badge variant="outline" className="text-sm">
              Total: {getTotalVisitors()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Time Range Selector */}
        <Tabs value={viewMode} onValueChange={setViewMode} className="w-full mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily" className="flex items-center gap-2 text-xs">
              <Calendar className="h-3 w-3" />
              Last 7 Days
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2 text-xs">
              <Calendar className="h-3 w-3" />
              Last 7 Weeks
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2 text-xs">
              <Calendar className="h-3 w-3" />
              Last 12 Months
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Chart */}
        {visitors.length > 0 ? (
          <div className="w-full h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={visitors}
                margin={{ 
                  top: 10, 
                  right: 20, 
                  left: 20, 
                  bottom: 10 
                }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--muted))"
                  vertical={false}
                />
                <XAxis 
                  dataKey={xKey} 
                  tick={{ 
                    fontSize: 12,
                    fill: "hsl(var(--muted-foreground))"
                  }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis 
                  tick={{ 
                    fontSize: 12,
                    fill: "hsl(var(--muted-foreground))"
                  }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ display: "none" }} />
                <Bar
                  dataKey="visitors"
                  name="Visitors"
                  radius={[4, 4, 0, 0]}
                >
                  {visitors.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={BAR_COLORS[index % BAR_COLORS.length]}
                      className="transition-opacity hover:opacity-80 cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Users className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm text-center">No visitor data available</p>
            <p className="text-xs text-center mt-1">
              for the selected time period
            </p>
          </div>
        )}

        {/* Stats Summary */}
        {visitors.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-6 p-3 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {getTotalVisitors()}
              </p>
              <p className="text-xs text-muted-foreground">Total Visitors</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {visitors.length}
              </p>
              <p className="text-xs text-muted-foreground">
                {viewMode === "daily" ? "Days" : viewMode === "weekly" ? "Weeks" : "Months"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(getTotalVisitors() / visitors.length)}
              </p>
              <p className="text-xs text-muted-foreground">Avg. per Period</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VisitorStats;