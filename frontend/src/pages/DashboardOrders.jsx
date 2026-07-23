import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import ProductDetailsModal from "../components/ProductDetailsModal";
import { getOrders, updateOrderStatus } from "../api/api";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Download,
  MoreHorizontal,
  Edit,
  Check,
  X,
  Package,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatMAD, getOrderTotal, getProductSnapshotName, neutralizeSpreadsheetCell } from "../utils/adminFormatting";

function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingStatus, setEditingStatus] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelConfirmation, setCancelConfirmation] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      setError("");
      const response = await getOrders();
      setOrders(response?.data?.orders || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Orders could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const showProductDetails = (products) => {
    setSelectedProducts(products);
    setModalOpen(true);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "delivered":
        return "success";
      case "processing":
        return "secondary";
      case "shipped":
        return "default";
      case "cancelled":
        return "destructive";
      case "pending":
        return "outline";
      default:
        return "secondary";
    }
  };

  const startEditing = (orderId, currentStatus) => {
    const order = orders.find((item) => item._id === orderId);
    const nextStatus = order?.allowedTransitions?.[0] || currentStatus;
    setEditingStatus({ orderId, previousStatus: currentStatus, status: nextStatus });
    setCancelConfirmation(null);
  };

  const updateStatus = async (orderId, newStatus) => {
    if (newStatus === "cancelled" && cancelConfirmation !== orderId) {
      setCancelConfirmation(orderId);
      return;
    }
    setIsUpdating(true);
    try {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      const response = await updateOrderStatus(orderId, newStatus);
      if (response?.data?.order) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? response.data.order : o)));
      }
      await fetchOrders();
    } catch (err) {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: editingStatus.previousStatus } : o
        )
      );
      const status = err?.response?.status;
      setError(
        status === 409
          ? "Order status changed in another session. The latest order data has been loaded."
          : err?.response?.data?.message || "Order status could not be updated."
      );
      await fetchOrders();
    } finally {
      setIsUpdating(false);
      setEditingStatus(null);
      setCancelConfirmation(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;

    const matchesSearch =
      order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.products?.some((p) =>
        getProductSnapshotName(p).toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesStatus && matchesSearch;
  });

  const exportToExcel = () => {
    const dataForExport = filteredOrders.map((order) => ({
      "Order ID": neutralizeSpreadsheetCell(order._id),
      Customer: neutralizeSpreadsheetCell(order.fullName),
      Email: neutralizeSpreadsheetCell(order.email),
      Phone: neutralizeSpreadsheetCell(order.phone),
      Address: neutralizeSpreadsheetCell(order.adresse),
      Date: new Date(order.createdAt).toLocaleDateString(),
      Products: order.products
        .map((p) => neutralizeSpreadsheetCell(`${getProductSnapshotName(p)} (x${p.quantity}, ${p.color || "N/A"})`))
        .join(", "),
      Amount: getOrderTotal(order).toFixed(2),
      Status: order.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `orders_export_${new Date().toISOString().split("T")[0]}.xlsx`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getTotalAmount = (order) => {
    return getOrderTotal(order);
  };

  const formatOrderId = (id) => {
    return id.slice(-8).toUpperCase();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-20" />
                  <Skeleton className="h-12 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-500" />
            Order Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage all customer orders and update their statuses
          </p>
        </div>
        <Button 
          onClick={exportToExcel}
          variant="outline" 
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Excel
        </Button>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by ID, customer, or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                {filteredOrders.length} of {orders.length} orders
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error && orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 opacity-50" />
              <p className="text-sm font-medium">Unable to load orders</p>
              <Button type="button" variant="outline" onClick={fetchOrders}>Retry</Button>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders
                    ?.sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt))
                    ?.map((order) => (
                      <TableRow key={order._id} className="group">
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded font-medium">
                            #{formatOrderId(order._id)}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {order.fullName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {order.adresse}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">{order.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">{order.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-left"
                            onClick={() => showProductDetails(order?.products)}
                          >
                            <div className="text-sm text-blue-600 hover:underline line-clamp-2 max-w-[200px]">
                              {order.products.map((p, idx) => (
                                <span key={idx}>
                                  {getProductSnapshotName(p)} (x{p.quantity})
                                  {idx < order.products.length - 1 && ", "}
                                </span>
                              ))}
                            </div>
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-medium">
                              {formatMAD(getTotalAmount(order))}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {order.products.length} items
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {editingStatus?.orderId === order._id ? (
                            <div className="flex flex-col gap-2">
                              <Select
                                value={editingStatus.status}
                                onValueChange={(value) =>
                                  setEditingStatus({
                                    ...editingStatus,
                                    status: value,
                                  })
                                }
                                disabled={isUpdating}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {(order.allowedTransitions || []).map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {cancelConfirmation === order._id && editingStatus.status === "cancelled" && (
                                <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                                  Cancelling restores reserved inventory. Press Save again to confirm.
                                </div>
                              )}
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  className="h-7 flex-1"
                                  onClick={() =>
                                    updateStatus(order._id, editingStatus.status)
                                  }
                                  disabled={isUpdating}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2"
                                  onClick={() => setEditingStatus(null)}
                                  disabled={isUpdating}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={getStatusVariant(order.status)}
                                className="capitalize"
                              >
                                {order.status}
                              </Badge>
                              {(order.allowedTransitions || []).length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
                                  onClick={() =>
                                    startEditing(order._id, order.status)
                                  }
                                  aria-label="Edit order status"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => showProductDetails(order?.products)}
                              >
                                View Details
                              </DropdownMenuItem>
                              {(order.allowedTransitions || []).length > 0 && (
                                <DropdownMenuItem
                                  onClick={() => startEditing(order._id, order.status)}
                                >
                                  Edit Status
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm font-medium mb-1">No orders found</p>
              <p className="text-xs text-center">
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "No orders have been placed yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <ProductDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        products={selectedProducts}
      />
    </div>
  );
}

export default OrderManagementPage;
