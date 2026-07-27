import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Download, Edit, Eye, Package } from "lucide-react";
import { toast } from "sonner";
import ProductDetailsModal from "@/components/ProductDetailsModal";
import { getOrders, updateOrderStatus } from "@/api/api";
import { DASHBOARDHOME, DASHBOARDORDERS } from "@/constant/routerConstants";
import {
  formatMAD,
  getOrderTotal,
  getProductSnapshotName,
  neutralizeSpreadsheetCell,
} from "@/utils/adminFormatting";
import { formatAdminDate, formatAdminDateTime } from "@/utils/adminDates";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useAdminPageMeta } from "@/context/AdminPageContext";
import { paginateAdminItems, useAdminListQuery } from "@/hooks/useAdminListQuery";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminPageContainer from "@/components/admin/page/AdminPageContainer";
import AdminPageHeader from "@/components/admin/page/AdminPageHeader";
import AdminFilterBar, { AdminSearchInput } from "@/components/admin/filters/AdminFilterBar";
import AdminErrorState from "@/components/admin/feedback/AdminErrorState";
import AdminEmptyState from "@/components/admin/feedback/AdminEmptyState";
import StatusBadge from "@/components/admin/status/StatusBadge";
import AdminConfirmDialog from "@/components/admin/forms/AdminConfirmDialog";
import AdminRowActions from "@/components/admin/table/AdminRowActions";
import AdminTable, {
  AdminTableHeader,
  AdminTableSkeleton,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/admin/table/AdminTable";
import AdminTablePagination from "@/components/admin/table/AdminTablePagination";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function OrderManagementPage() {
  const requestId = useRef(0);
  const { hasCapability } = useAdminAuth();
  const canManage = hasCapability("orders.manage");
  const canExport = hasCapability("orders.export");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const {
    page,
    limit,
    status,
    setQuery,
    clearFilters,
    searchParams,
  } = useAdminListQuery({
    defaults: { page: 1, limit: 25, search: "", status: "all" },
    allowedFilters: ["status"],
  });

  useAdminPageMeta({
    title: "Orders",
    breadcrumbs: [
      { label: "Overview", href: DASHBOARDHOME },
      { label: "Orders", href: DASHBOARDORDERS },
    ],
  });

  const loadOrders = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const response = await getOrders();
      if (currentRequest === requestId.current) {
        setOrders(response?.data?.orders ?? []);
      }
    } catch (loadError) {
      if (currentRequest === requestId.current) {
        setError(loadError?.response?.data?.message || "Orders could not be loaded.");
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    return () => {
      requestId.current += 1;
    };
  }, [loadOrders]);

  useEffect(() => {
    if (searchParams.has("q")) {
      setQuery({ q: "" }, { replace: true });
    }
  }, [searchParams, setQuery]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...orders]
      .filter((order) => {
        const matchesStatus = status === "all" || order.status === status;
        const matchesSearch =
          !query ||
          [order._id, order.fullName, order.email, order.phone].some((value) =>
            String(value ?? "").toLowerCase().includes(query),
          ) ||
          order.products?.some((product) =>
            getProductSnapshotName(product).toLowerCase().includes(query),
          );
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, search, status]);

  const pagination = paginateAdminItems(filteredOrders, page, limit);

  useEffect(() => {
    if (page !== pagination.page) setQuery({ page: pagination.page }, { replace: true });
  }, [page, pagination.page, setQuery]);

  const showProducts = (products = []) => {
    setSelectedProducts(products);
    setDetailsOpen(true);
  };

  const beginStatusEdit = (order) => {
    const allowedTransitions = order.allowedTransitions ?? [];
    if (!allowedTransitions.length) return;
    setEditing({
      orderId: order._id,
      previousStatus: order.status,
      status: allowedTransitions[0],
    });
  };

  const persistStatus = async (orderId, nextStatus) => {
    setUpdating(true);
    setMutationError("");
    try {
      const response = await updateOrderStatus(orderId, nextStatus);
      const updatedOrder = response?.data?.order;
      setOrders((previous) =>
        previous.map((order) =>
          order._id === orderId ? (updatedOrder ?? { ...order, status: nextStatus }) : order,
        ),
      );
      toast.success("Order status updated");
      setEditing(null);
      setCancelDialog(null);
    } catch (updateError) {
      const statusCode = updateError?.response?.status;
      const message =
        statusCode === 409
          ? "This order changed in another session. The latest data has been reloaded."
          : updateError?.response?.data?.message || "Order status could not be updated.";
      await loadOrders();
      setMutationError(message);
    } finally {
      setUpdating(false);
    }
  };

  const requestStatusUpdate = () => {
    if (!editing) return;
    if (editing.status === "cancelled") {
      setCancelDialog(editing);
      return;
    }
    persistStatus(editing.orderId, editing.status);
  };

  const exportToExcel = () => {
    const rows = filteredOrders.map((order) => ({
      "Order ID": neutralizeSpreadsheetCell(order._id),
      Customer: neutralizeSpreadsheetCell(order.fullName),
      Email: neutralizeSpreadsheetCell(order.email),
      Phone: neutralizeSpreadsheetCell(order.phone),
      Address: neutralizeSpreadsheetCell(order.adresse),
      Date: formatAdminDateTime(order.createdAt),
      Products: (order.products ?? [])
        .map((product) =>
          neutralizeSpreadsheetCell(
            `${getProductSnapshotName(product)} (x${product.quantity}, ${product.color || "N/A"})`,
          ),
        )
        .join(", "),
      "Amount (MAD)": getOrderTotal(order).toFixed(2),
      Status: order.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, `orders_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const secondaryActions = canExport ? (
    <Button variant="outline" onClick={exportToExcel} disabled={!filteredOrders.length}>
      <Download aria-hidden="true" />
      Export
    </Button>
  ) : null;

  const clearListFilters = () => {
    setSearch("");
    clearFilters();
  };

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Orders"
        description="Review and manage customer orders."
        secondaryActions={secondaryActions}
      />

      {error && orders.length > 0 && (
        <AdminErrorState title="Some order data may be stale" description={error} onRetry={loadOrders} />
      )}
      {mutationError && (
        <AdminErrorState
          title="The order status was not updated"
          description={mutationError}
        />
      )}

      <AdminFilterBar
        showClear={Boolean(search || status !== "all")}
        onClear={clearListFilters}
      >
        <AdminSearchInput
          id="order-search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setQuery({ page: 1 }, { replace: true });
          }}
          label="Search orders"
          placeholder="Search order, customer, or product..."
          className="max-w-xl"
        />
        <Select value={status} onValueChange={(value) => setQuery({ status: value })}>
          <SelectTrigger className="w-full md:w-[180px]" aria-label="Filter orders by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ORDER_STATUSES.map((orderStatus) => (
              <SelectItem key={orderStatus} value={orderStatus}>
                {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AdminFilterBar>

      {loading && orders.length === 0 ? (
        <AdminTableSkeleton rows={6} columns={7} />
      ) : error && orders.length === 0 ? (
        <AdminErrorState title="We couldn't load orders" description={error} onRetry={loadOrders} />
      ) : filteredOrders.length === 0 ? (
        <AdminEmptyState
          icon={Package}
          title={orders.length ? "No orders match your current filters" : "No orders yet"}
          description={
            orders.length
              ? "Adjust or clear the current filters."
              : "New customer orders will appear here."
          }
          action={
            orders.length ? <Button variant="outline" onClick={clearListFilters}>Clear filters</Button> : null
          }
        />
      ) : (
        <>
          <AdminTable ariaLabel="Customer orders">
            <AdminTableHeader sticky>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead className="hidden xl:table-cell">Products</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-14"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </AdminTableHeader>
            <TableBody>
              {pagination.items.map((order) => {
                const actions = [
                  {
                    key: "view",
                    label: "View products",
                    icon: Eye,
                    onClick: () => showProducts(order.products),
                  },
                  canManage && (order.allowedTransitions ?? []).length
                    ? {
                        key: "edit-status",
                        label: "Update status",
                        icon: Edit,
                        onClick: () => beginStatusEdit(order),
                      }
                    : null,
                ];
                return (
                  <TableRow key={order._id}>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 text-xs font-medium">
                        #{String(order._id).slice(-8).toUpperCase()}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-[160px]">
                        <p className="text-sm font-medium">{order.fullName || "Unknown customer"}</p>
                        <p className="max-w-[220px] truncate text-xs text-muted-foreground">
                          {order.email || order.phone || "No contact details"}
                        </p>
                        <p className="text-xs text-muted-foreground lg:hidden">
                          {formatAdminDate(order.createdAt)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {formatAdminDateTime(order.createdAt)}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <Button variant="link" className="h-auto max-w-[230px] justify-start p-0" onClick={() => showProducts(order.products)}>
                        {(order.products ?? []).length} item{order.products?.length === 1 ? "" : "s"}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMAD(getOrderTotal(order), { compact: true })}
                    </TableCell>
                    <TableCell>
                      {editing?.orderId === order._id ? (
                        <div className="flex min-w-[190px] items-center gap-2">
                          <Select
                            value={editing.status}
                            onValueChange={(nextStatus) =>
                              setEditing((previous) => ({ ...previous, status: nextStatus }))
                            }
                            disabled={updating}
                          >
                            <SelectTrigger aria-label="Select new order status">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(order.allowedTransitions ?? []).map((nextStatus) => (
                                <SelectItem key={nextStatus} value={nextStatus}>
                                  {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button size="sm" onClick={requestStatusUpdate} disabled={updating}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditing(null)} disabled={updating}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <StatusBadge status={order.status} />
                      )}
                    </TableCell>
                    <TableCell>
                      <AdminRowActions
                        label={`Open actions for order ${String(order._id).slice(-8)}`}
                        items={actions}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </AdminTable>
          <AdminTablePagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            pageSize={pagination.limit}
            pageSizeOptions={[10, 25, 50]}
            onPageChange={(nextPage) => setQuery({ page: nextPage })}
            onPageSizeChange={(nextLimit) => setQuery({ limit: nextLimit, page: 1 })}
          />
        </>
      )}

      <ProductDetailsModal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        products={selectedProducts}
      />
      <AdminConfirmDialog
        open={Boolean(cancelDialog)}
        onOpenChange={(open) => {
          if (!open) setCancelDialog(null);
        }}
        title="Cancel this order?"
        description="Cancelling the order restores reserved inventory. This transition cannot be reversed from the dashboard."
        confirmLabel="Cancel order"
        onConfirm={() => persistStatus(cancelDialog.orderId, "cancelled")}
        loading={updating}
        destructive
      />
    </AdminPageContainer>
  );
}
