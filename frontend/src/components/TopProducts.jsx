import React, { useEffect, useState } from "react";
import { getOrders } from "../api/api";
import {
  formatMAD,
  getLineTotal,
  getProductSnapshotImage,
  getProductSnapshotName,
  isNonCancelledOrder,
} from "../utils/adminFormatting";
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
import { Button } from "@/components/ui/button";
import { AlertCircle, Package, ShoppingCart, Star } from "lucide-react";

const buildTopProducts = (orders) => {
  const grouped = new Map();

  orders.filter(isNonCancelledOrder).forEach((order) => {
    (order.products || []).forEach((item) => {
      const productId = String(item.product?._id || item.product || item.productName || "unknown");
      const current = grouped.get(productId) || {
        id: productId,
        name: getProductSnapshotName(item),
        image: getProductSnapshotImage(item),
        unitsSold: 0,
        bookedSales: 0,
      };
      current.unitsSold += Number(item.quantity || 0);
      current.bookedSales += getLineTotal(item);
      if (!current.image) current.image = getProductSnapshotImage(item);
      grouped.set(productId, current);
    });
  });

  return Array.from(grouped.values())
    .filter((product) => product.unitsSold > 0)
    .sort((a, b) => b.unitsSold - a.unitsSold || b.bookedSales - a.bookedSales)
    .slice(0, 5);
};

const TopProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTopProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const ordersResponse = await getOrders();
      setProducts(buildTopProducts(ordersResponse?.data?.orders || []));
    } catch (err) {
      setError(err?.response?.data?.message || "Top products could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopProducts();
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalUnits = products.reduce((sum, product) => sum + product.unitsSold, 0);
  const totalBookedSales = products.reduce((sum, product) => sum + product.bookedSales, 0);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Star className="h-5 w-5 text-amber-500" />
              Top Products by Units Sold
            </CardTitle>
            <CardDescription>Real order quantities from non-cancelled orders</CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            <ShoppingCart className="mr-1 h-3 w-3" />
            {totalUnits} units
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Unable to load top products</p>
                <p className="text-xs">{error}</p>
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={fetchTopProducts}>
              Retry
            </Button>
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Rank</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">Booked Sales</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Badge variant="outline" className="flex h-6 w-6 items-center justify-center p-0 text-xs">
                        {index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="h-10 w-10 rounded border object-cover" />
                        ) : (
                          <div className="grid h-10 w-10 place-items-center rounded border bg-muted">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="max-w-[220px] truncate text-sm font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{product.unitsSold}</TableCell>
                    <TableCell className="text-right">{formatMAD(product.bookedSales)}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">Unavailable</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Package className="mb-3 h-12 w-12 opacity-50" />
            <p className="mb-1 text-sm font-medium">No sold products yet</p>
            <p className="text-center text-xs">Top products will appear after non-cancelled orders exist.</p>
          </div>
        )}

        {products.length > 0 && !error && (
          <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-6">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center">
              <p className="text-lg font-bold text-blue-700">{totalUnits}</p>
              <p className="text-xs font-medium text-blue-600">Units Sold</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
              <p className="text-lg font-bold text-green-700">{formatMAD(totalBookedSales)}</p>
              <p className="text-xs font-medium text-green-600">Booked Sales</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopProducts;
