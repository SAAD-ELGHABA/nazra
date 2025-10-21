import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getOrders } from "../api/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, TrendingUp, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const OrderStats = ({ 
  hideTitle = false, 
  heightMobile = 250, 
  heightDesktop = 320 
}) => {
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [monthRange, setMonthRange] = useState("3");
  const [allOrders, setAllOrders] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Color palette for bars
  const BAR_COLORS = ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

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
      
      if (!grouped[key]) {
        grouped[key] = { 
          month: label, 
          monthKey: key, 
          orders: 0,
          fullDate: d
        };
      }
      grouped[key].orders += 1;
    });

    const sortedData = Object.values(grouped).sort((a, b) => 
      a.monthKey.localeCompare(b.monthKey)
    );

    // Calculate growth percentage if we have at least 2 data points
    if (sortedData.length >= 2) {
      const current = sortedData[sortedData.length - 1].orders;
      const previous = sortedData[sortedData.length - 2].orders;
      const growth = previous > 0 ? ((current - previous) / previous) * 100 : 100;
      sortedData.growth = Math.round(growth);
    }

    setOrderData(sortedData);
  };

  const getTotalOrders = () => {
    return orderData.reduce((sum, item) => sum + item.orders, 0);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-3 shadow-lg border">
          <p className="font-semibold text-sm">{label}</p>
          <p className="text-sm flex items-center gap-2 mt-1">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{payload[0].value} orders</span>
          </p>
        </Card>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            {!hideTitle && (
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Order Analytics
              </CardTitle>
            )}
            <CardDescription>
              Monthly order distribution and trends
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-3">
            {orderData.growth !== undefined && (
              <Badge 
                variant={orderData.growth >= 0 ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {orderData.growth >= 0 ? "↑" : "↓"} 
                {Math.abs(orderData.growth)}%
              </Badge>
            )}
            
            <Select value={monthRange} onValueChange={setMonthRange}>
              <SelectTrigger className="w-[160px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Last 3 Months</SelectItem>
                <SelectItem value="6">Last 6 Months</SelectItem>
                <SelectItem value="12">Last 12 Months</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Stats Summary */}
        {!loading && orderData.length > 0 && (
          <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{getTotalOrders()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Period</p>
              <p className="text-sm font-medium">{orderData.length} months</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Chart Content */}
        {loading ? (
          <div
            className="space-y-3"
            style={{ height: windowWidth < 640 ? heightMobile : heightDesktop }}
          >
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-full w-full" />
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
                <CartesianGrid 
                  strokeDasharray="5 5" 
                  stroke="hsl(var(--muted))"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ 
                    fontSize: windowWidth < 640 ? 10 : windowWidth < 768 ? 11 : 12,
                    fill: "hsl(var(--muted-foreground))"
                  }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                  minTickGap={10}
                  interval={windowWidth < 640 ? Math.ceil(orderData.length / 4) - 1 : 0}
                  angle={windowWidth < 640 ? -30 : 0}
                  textAnchor={windowWidth < 640 ? "end" : "middle"}
                />
                <YAxis
                  tick={{ 
                    fontSize: windowWidth < 640 ? 10 : windowWidth < 768 ? 11 : 12,
                    fill: "hsl(var(--muted-foreground))"
                  }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="orders"
                  radius={[4, 4, 0, 0]}
                  barSize={windowWidth < 640 ? 20 : windowWidth < 768 ? 32 : 44}
                >
                  {orderData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={BAR_COLORS[index % BAR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center text-muted-foreground p-6"
            style={{ height: windowWidth < 640 ? heightMobile : heightDesktop }}
          >
            <TrendingUp className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm text-center">No orders found for the selected period</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderStats;