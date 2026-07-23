import React, { useEffect, useState } from "react";
import { getOrders } from "../api/api";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ShoppingCart,
  ArrowUpDown,
  Eye,
  Calendar,
  User,
  DollarSign,
} from "lucide-react";
import { formatMAD, getOrderTotal } from "../utils/adminFormatting";

const RecentOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getOrders();
        if (response.status === 200) {
          setOrders(response?.data?.orders || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "success";
      case "pending":
        return "secondary";
      case "processing":
        return "default";
      case "shipped":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    let aValue, bValue;

    switch (sortField) {
      case "date":
        aValue = new Date(a.createdAt || a.date);
        bValue = new Date(b.createdAt || b.date);
        break;
      case "amount":
        aValue = getOrderTotal(a);
        bValue = getOrderTotal(b);
        break;
      case "customer":
        aValue = a.fullName?.toLowerCase() || "";
        bValue = b.fullName?.toLowerCase() || "";
        break;
      default:
        aValue = a[sortField];
        bValue = b[sortField];
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const displayedOrders = sortedOrders.slice(0, 8);

  const SortableHeader = ({ field, children }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="p-0 h-auto font-semibold hover:bg-transparent"
    >
      {children}
      <ArrowUpDown className="ml-2 h-3 w-3" />
    </Button>
  );

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              Recent Orders
            </CardTitle>
            <CardDescription>
              Latest customer orders and their status
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            {orders.length} total
          </Badge>
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

        {/* Orders Table */}
        {error ? null : orders.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">
                    <SortableHeader field="id">
                      Order ID
                    </SortableHeader>
                  </TableHead>
                  <TableHead>
                    <SortableHeader field="customer">
                      <User className="h-3 w-3 mr-1 inline" />
                      Customer
                    </SortableHeader>
                  </TableHead>
                  <TableHead className="text-right">
                    <SortableHeader field="amount">
                      <DollarSign className="h-3 w-3 mr-1 inline" />
                      Amount
                    </SortableHeader>
                  </TableHead>
                  <TableHead>
                    <SortableHeader field="status">
                      Status
                    </SortableHeader>
                  </TableHead>
                  <TableHead>
                    <SortableHeader field="date">
                      <Calendar className="h-3 w-3 mr-1 inline" />
                      Date
                    </SortableHeader>
                  </TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedOrders.map((order) => {
                  const totalAmount = getOrderTotal(order);
                  return (
                    <TableRow key={order._id || order.id} className="group">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">#</span>
                          {order._id
                            ? order._id.slice(-6).toUpperCase()
                            : order.id}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {order.fullName || "N/A"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {order.email || ""}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatMAD(totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusVariant(order.status)}
                          className="text-xs capitalize"
                        >
                          {order.status || "pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt || order.date)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View order</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm font-medium mb-1">No orders found</p>
            <p className="text-xs text-center">
              There are no orders to display at the moment.
            </p>
          </div>
        )}

        {/* Quick Stats */}
        {orders.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-xs">
                Delivered
              </Badge>
              <span className="text-xs text-muted-foreground">
                {orders.filter(o => o.status?.toLowerCase() === "delivered").length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Pending
              </Badge>
              <span className="text-xs text-muted-foreground">
                {orders.filter(o => o.status?.toLowerCase() === "pending").length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">
                Processing
              </Badge>
              <span className="text-xs text-muted-foreground">
                {orders.filter(o => o.status?.toLowerCase() === "processing").length}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
