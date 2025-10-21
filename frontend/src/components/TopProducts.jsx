import React, { useState, useEffect } from "react";
import { getProducts, getOrders, getProductsAsAdmin } from "../api/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  ShoppingCart,
  Package,
  Star,
  AlertCircle,
} from "lucide-react";

const TopProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month"); // 'week', 'month', 'year'

  useEffect(() => {
    fetchTopProducts();
  }, [timeRange]);

  const getProductImage = (product) => {
    if (product.colors?.[0]?.images?.[0]?.url)
      return product.colors[0].images[0].url;
    if (product.images?.[0]?.url) return product.images[0].url;
    if (product.images?.[0]) return product.images[0];
    return "/api/placeholder/40/40";
  };

  const estimateViews = (sales) => {
    const minViews = sales * 20;
    const maxViews = sales * 50;
    return Math.floor(Math.random() * (maxViews - minViews + 1)) + minViews;
  };

  const calculateTrend = () => (Math.random() > 0.5 ? "up" : "down");
  const calculateTrendValue = () => Math.floor(Math.random() * 20) + 1;

  const fetchTopProducts = async () => {
    try {
      setLoading(true);
      const productsResponse = await getProductsAsAdmin();
      const ordersResponse = await getOrders();

      const productsData = productsResponse?.data?.products || [];
      const ordersData = ordersResponse?.data?.orders || [];

      const productsWithSales = productsData.map((product) => {
        let sales = 0;
        let revenue = 0;

        ordersData.forEach((order) => {
          if (order.products && order.status !== "cancelled") {
            order.products.forEach((item) => {
              if (item.product?._id === product._id) {
                sales += item.quantity;
                const price =
                  item.product.sale_price || item.product.original_price;
                revenue += item.quantity * price;
              }
            });
          }
        });

        return {
          id: product._id,
          name: product.name,
          image: getProductImage(product),
          sales,
          revenue,
          trend: calculateTrend(),
          trendValue: calculateTrendValue(),
          stock: product.stock || 0,
          views: product?.views || estimateViews(sales),
          isActive: product?.isActive,
          category: product?.category?.name || "Uncategorized",
        };
      });

      const topProducts = productsWithSales
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      setProducts(topProducts);
    } catch (error) {
      console.error("Error fetching top products:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);

  const TrendIcon = ({ trend }) =>
    trend === "up" ? (
      <TrendingUp className="text-green-500 w-4 h-4" />
    ) : (
      <TrendingDown className="text-red-500 w-4 h-4" />
    );

  const getRankColor = (index) => {
    switch (index) {
      case 0:
        return "bg-amber-100 text-amber-800 border-amber-200";
      case 1:
        return "bg-slate-100 text-slate-800 border-slate-200";
      case 2:
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSales = products.reduce((sum, product) => sum + product.sales, 0);
  const totalRevenue = products.reduce((sum, product) => sum + product.revenue, 0);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Top Products
            </CardTitle>
            <CardDescription>
              Best performing products by sales volume
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm">
              <ShoppingCart className="h-3 w-3 mr-1" />
              {totalSales} Total Sales
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Time Range Selector */}
        <Tabs value={timeRange} onValueChange={setTimeRange} className="w-full mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week" className="text-xs">
              This Week
            </TabsTrigger>
            <TabsTrigger value="month" className="text-xs">
              This Month
            </TabsTrigger>
            <TabsTrigger value="year" className="text-xs">
              This Year
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Products Table */}
        {products.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Rank</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Trend</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow key={product.id} className="group">
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`w-6 h-6 flex items-center justify-center p-0 text-xs font-bold ${getRankColor(index)}`}
                      >
                        {index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover border"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-sm truncate max-w-[200px]">
                            {product.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {product.category}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 font-medium">
                          <ShoppingCart className="w-4 h-4 text-blue-500" />
                          {product.sales}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(product.revenue)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TrendIcon trend={product.trend} />
                        <span className={`text-sm font-medium ${
                          product.trend === "up" ? "text-green-600" : "text-red-600"
                        }`}>
                          {product.trendValue}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Eye className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">
                          {product.views.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={product.isActive ? "success" : "destructive"}
                        className="text-xs"
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm font-medium mb-1">No products data available</p>
            <p className="text-xs text-center">
              No sales data found for the selected period.
            </p>
          </div>
        )}

        {/* Quick Stats */}
        {products.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
            <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-blue-700">
                {totalSales}
              </p>
              <p className="text-xs text-blue-600 font-medium">Total Sales</p>
            </div>
            <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-700">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-xs text-green-600 font-medium">Total Revenue</p>
            </div>
          </div>
        )}

        {/* Performance Summary */}
        {products.length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Performance Summary
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Top Product:</span>
                <span className="font-medium ml-2">{products[0]?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Avg. Sales:</span>
                <span className="font-medium ml-2">
                  {Math.round(totalSales / products.length)} per product
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopProducts;