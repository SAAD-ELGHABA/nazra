import React from "react";
import { toast } from "sonner";
import {
  Archive,
  Contact,
  Download,
  MessageSquare,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import {
  createAdminExport,
  downloadAdminExport,
  getAdminActivityLogs,
  getAdminContacts,
  getAdminCustomers,
  getAdminExports,
  getAdminInventory,
  getAdminReviews,
  updateAdminContactStatus,
  updateAdminReviewModeration,
} from "@/api/api";
import {
  DASHBOARDACTIVITY,
  DASHBOARDCONTACTS,
  DASHBOARDCUSTOMERS,
  DASHBOARDEXPORTS,
  DASHBOARDINVENTORY,
  DASHBOARDREVIEWS,
} from "@/constant/routerConstants";
import StatusBadge from "@/components/admin/status/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMAD } from "@/utils/adminFormatting";
import { formatAdminDateTime, formatRelativeTime } from "@/utils/adminDates";

const allStatuses = (items) => [{ value: "all", label: "All statuses" }, ...items];
const exportOptions = [
  { type: "orders", label: "Orders", capability: "orders.export" },
  { type: "customers", label: "Customers", capability: "customers.read" },
  { type: "subscribers", label: "Subscribers", capability: "subscribers.export" },
  { type: "products", label: "Products", capability: "products.read" },
];

const downloadExportFile = async (row) => {
  try {
    const response = await downloadAdminExport(row._id);
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = row.filename || "nazra-export.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded");
  } catch (error) {
    toast.error("Export download failed", {
      description: error?.response?.data?.message || "Please try again.",
    });
  }
};

export const inventoryConfig = {
  id: "inventory",
  title: "Inventory",
  href: DASHBOARDINVENTORY,
  description: "Monitor stock by product, color, lens option, and SKU.",
  loader: getAdminInventory,
  emptyIcon: Archive,
  emptyTitle: "No inventory rows found",
  emptyDescription: "Inventory appears here when products have color or lens variants.",
  searchPlaceholder: "Search product or SKU...",
  filters: [
    {
      key: "status",
      label: "Filter inventory by status",
      options: allStatuses([
        { value: "in_stock", label: "In stock" },
        { value: "low_stock", label: "Low stock" },
        { value: "out_of_stock", label: "Out of stock" },
        { value: "untracked", label: "Untracked" },
      ]),
    },
  ],
  columns: [
    {
      key: "product",
      header: "Product",
      render: (row) => (
        <div className="min-w-[220px]">
          <p className="text-sm font-medium">{row.productName}</p>
          <p className="text-xs text-muted-foreground">{row.color} / {row.lens}</p>
        </div>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      render: (row) => row.sku ? <code className="rounded bg-muted px-2 py-1 text-xs">{row.sku}</code> : "—",
    },
    {
      key: "stock",
      header: "Stock",
      render: (row) => row.tracked ? row.stock : "Untracked",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ],
};

export const customersConfig = {
  id: "customers",
  title: "Customers",
  href: DASHBOARDCUSTOMERS,
  description: "Review purchaser history separately from marketing subscribers.",
  loader: getAdminCustomers,
  emptyIcon: Users,
  emptyTitle: "No customers found",
  emptyDescription: "Customers appear here after checkout orders are created.",
  searchPlaceholder: "Search customer name, email, or phone...",
  columns: [
    {
      key: "customer",
      header: "Customer",
      render: (row) => (
        <div className="min-w-[220px]">
          <p className="text-sm font-medium">{row.name || "Customer"}</p>
          <p className="truncate text-xs text-muted-foreground">{row.email}</p>
          <p className="truncate text-xs text-muted-foreground">{row.phone}</p>
        </div>
      ),
    },
    {
      key: "orders",
      header: "Orders",
      render: (row) => row.orderCount,
    },
    {
      key: "spent",
      header: "Total spent",
      cellClassName: "font-medium",
      render: (row) => formatMAD(row.totalSpent, { compact: true }),
    },
    {
      key: "lastOrder",
      header: "Last order",
      render: (row) => (
        <div>
          <p className="text-sm">{formatAdminDateTime(row.lastOrderAt)}</p>
          <p className="text-xs text-muted-foreground">{row.lastStatus || "—"}</p>
        </div>
      ),
    },
  ],
};

export const contactsConfig = {
  id: "contacts",
  title: "Contacts",
  href: DASHBOARDCONTACTS,
  description: "Triage customer messages and keep support status visible.",
  loader: getAdminContacts,
  emptyIcon: Contact,
  emptyTitle: "No contact messages found",
  emptyDescription: "Messages from the contact form will appear here.",
  searchPlaceholder: "Search name, email, subject, or message...",
  filters: [
    {
      key: "status",
      label: "Filter contacts by status",
      options: allStatuses([
        { value: "new", label: "New" },
        { value: "read", label: "Read" },
        { value: "replied", label: "Replied" },
        { value: "archived", label: "Archived" },
      ]),
    },
  ],
  columns: [
    {
      key: "message",
      header: "Message",
      render: (row) => (
        <div className="min-w-[260px]">
          <p className="text-sm font-medium">{row.name}</p>
          <p className="truncate text-xs text-muted-foreground">{row.email}</p>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{row.message}</p>
        </div>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      render: (row) => <Badge variant="outline" className="capitalize">{row.subject}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "date",
      header: "Received",
      render: (row) => (
        <div>
          <p className="text-sm">{formatAdminDateTime(row.createdAt)}</p>
          <p className="text-xs text-muted-foreground">{formatRelativeTime(row.createdAt)}</p>
        </div>
      ),
    },
  ],
  getRowLabel: (row) => row.name,
  getRowActions: (row) => [
    row.status !== "read" && {
      key: "read",
      label: "Mark read",
      icon: MessageSquare,
      onRun: () => updateAdminContactStatus(row._id, "read"),
      successLabel: "Contact marked as read",
    },
    row.status !== "replied" && {
      key: "replied",
      label: "Mark replied",
      icon: ShieldCheck,
      onRun: () => updateAdminContactStatus(row._id, "replied"),
      successLabel: "Contact marked as replied",
    },
    row.status !== "archived" && {
      key: "archived",
      label: "Archive",
      icon: Archive,
      destructive: true,
      confirmTitle: "Archive contact message?",
      confirmDescription: "This keeps the message in the dashboard but removes it from active support queues.",
      confirmLabel: "Archive message",
      onRun: () => updateAdminContactStatus(row._id, "archived"),
      successLabel: "Contact archived",
    },
  ].filter(Boolean),
};

export const reviewsConfig = {
  id: "reviews",
  title: "Reviews",
  href: DASHBOARDREVIEWS,
  description: "Moderate product reviews before they affect storefront trust.",
  loader: getAdminReviews,
  emptyIcon: Star,
  emptyTitle: "No reviews found",
  emptyDescription: "Product reviews will appear here when customers submit them.",
  searchPlaceholder: "Search reviewer, title, or comment...",
  filters: [
    {
      key: "status",
      label: "Filter reviews by status",
      options: allStatuses([
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
      ]),
    },
  ],
  columns: [
    {
      key: "review",
      header: "Review",
      render: (row) => (
        <div className="min-w-[260px]">
          <p className="text-sm font-medium">{row.title || "Untitled review"}</p>
          <p className="text-xs text-muted-foreground">{row.displayName} / {row.productName}</p>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{row.comment}</p>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      render: (row) => `${row.rating}/5`,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "date",
      header: "Submitted",
      render: (row) => formatAdminDateTime(row.createdAt),
    },
  ],
  getRowLabel: (row) => row.title || row.displayName,
  getRowActions: (row) => [
    row.status !== "approved" && {
      key: "approve",
      label: "Approve",
      icon: ShieldCheck,
      onRun: () => updateAdminReviewModeration(row._id, { status: "approved" }),
      successLabel: "Review approved",
    },
    row.status !== "rejected" && {
      key: "reject",
      label: "Reject",
      icon: Archive,
      destructive: true,
      confirmTitle: "Reject review?",
      confirmDescription: "Rejected reviews will not be treated as approved storefront trust signals.",
      confirmLabel: "Reject review",
      onRun: () => updateAdminReviewModeration(row._id, { status: "rejected" }),
      successLabel: "Review rejected",
    },
  ].filter(Boolean),
};

export const activityConfig = {
  id: "activity",
  title: "Activity Log",
  href: DASHBOARDACTIVITY,
  description: "Audit important admin and business actions.",
  loader: getAdminActivityLogs,
  emptyIcon: MessageSquare,
  emptyTitle: "No activity recorded yet",
  emptyDescription: "Sensitive admin actions will appear here as features record audit events.",
  searchPlaceholder: "Search actor, action, or target...",
  filters: [
    {
      key: "severity",
      label: "Filter activity by severity",
      options: [
        { value: "all", label: "All severities" },
        { value: "info", label: "Info" },
        { value: "warning", label: "Warning" },
        { value: "critical", label: "Critical" },
      ],
    },
  ],
  columns: [
    { key: "action", header: "Action", render: (row) => <code className="rounded bg-muted px-2 py-1 text-xs">{row.action}</code> },
    { key: "actor", header: "Actor", render: (row) => row.actorName || "System" },
    { key: "target", header: "Target", render: (row) => `${row.targetType}:${row.targetId || "n/a"}` },
    { key: "severity", header: "Severity", render: (row) => <StatusBadge status={row.severity} /> },
    { key: "date", header: "Date", render: (row) => formatAdminDateTime(row.createdAt) },
  ],
};

export const exportsConfig = {
  id: "exports",
  title: "Exports",
  href: DASHBOARDEXPORTS,
  description: "Create and review audited admin exports.",
  loader: getAdminExports,
  emptyIcon: Download,
  emptyTitle: "No exports created yet",
  emptyDescription: "Create a backend-generated export to start the export history.",
  searchPlaceholder: "Search exports...",
  filters: [
    {
      key: "type",
      label: "Filter exports by type",
      options: [
        { value: "all", label: "All types" },
        { value: "orders", label: "Orders" },
        { value: "customers", label: "Customers" },
        { value: "subscribers", label: "Subscribers" },
        { value: "products", label: "Products" },
      ],
    },
  ],
  columns: [
    { key: "filename", header: "File", render: (row) => <span className="text-sm font-medium">{row.filename}</span> },
    { key: "type", header: "Type", render: (row) => <Badge variant="outline" className="capitalize">{row.type}</Badge> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "date", header: "Created", render: (row) => formatAdminDateTime(row.createdAt) },
    {
      key: "download",
      header: "Download",
      render: (row) => (
        <Button variant="outline" size="sm" onClick={() => downloadExportFile(row)}>
          Download
        </Button>
      ),
    },
  ],
  headerActions: ({ runAction, hasCapability }) => (
    <div className="flex flex-wrap items-center gap-2">
      {exportOptions.filter((option) => hasCapability(option.capability)).map(({ type, label }) => (
        <Button
          key={type}
          type="button"
          variant="outline"
          onClick={() =>
            runAction({
              onRun: () => createAdminExport({ type }),
              successLabel: `${type.charAt(0).toUpperCase() + type.slice(1)} export created`,
            })
          }
        >
          <Download aria-hidden="true" />
          {label}
        </Button>
      ))}
    </div>
  ),
  emptyAction: ({ runAction, hasCapability }) => hasCapability("orders.export") ? (
    <Button
      type="button"
      onClick={() =>
        runAction({
          onRun: () => createAdminExport({ type: "orders" }),
          successLabel: "Orders export created",
        })
      }
    >
      <Download aria-hidden="true" />
      Create orders export
    </Button>
  ) : null,
  getRowActions: (_row, { hasCapability }) => exportOptions
    .filter(({ capability }) => hasCapability(capability))
    .map(({ type, label }) => ({
      key: `create-${type}`,
      label: `Create ${label.toLowerCase()} export`,
      icon: Download,
      onRun: () => createAdminExport({ type }),
      successLabel: `${label} export created`,
    })),
};
