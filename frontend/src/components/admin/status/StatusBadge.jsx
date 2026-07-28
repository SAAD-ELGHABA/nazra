import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  pending: { label: "Pending", variant: "outline", className: "border-amber-300 bg-amber-50 text-amber-800" },
  processing: { label: "Processing", variant: "secondary", className: "bg-blue-100 text-blue-800" },
  shipped: { label: "Shipped", variant: "default", className: "" },
  delivered: { label: "Delivered", variant: "default", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelled: { label: "Cancelled", variant: "destructive", className: "" },
  active: { label: "Active", variant: "default", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  inactive: { label: "Inactive", variant: "secondary", className: "" },
  unsubscribed: { label: "Unsubscribed", variant: "secondary", className: "" },
  suppressed: { label: "Suppressed", variant: "outline", className: "border-amber-300 bg-amber-50 text-amber-800" },
  archived: { label: "Archived", variant: "outline", className: "" },
  read: { label: "Read", variant: "secondary", className: "" },
  replied: { label: "Replied", variant: "default", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  new: { label: "New", variant: "outline", className: "border-blue-300 bg-blue-50 text-blue-800" },
  approved: { label: "Approved", variant: "default", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  rejected: { label: "Rejected", variant: "destructive", className: "" },
  ready: { label: "Ready", variant: "default", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  failed: { label: "Failed", variant: "destructive", className: "" },
  info: { label: "Info", variant: "secondary", className: "" },
  warning: { label: "Warning", variant: "outline", className: "border-amber-300 bg-amber-50 text-amber-800" },
  critical: { label: "Critical", variant: "destructive", className: "" },
  published: { label: "Published", variant: "default", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  draft: { label: "Draft", variant: "outline", className: "" },
  superadmin: { label: "Super Admin", variant: "default", className: "bg-violet-100 text-violet-800 border-violet-200" },
  admin: { label: "Admin", variant: "secondary", className: "" },
  in_stock: { label: "In stock", variant: "default", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  out_of_stock: { label: "Out of stock", variant: "destructive", className: "" },
  low_stock: { label: "Low stock", variant: "outline", className: "border-amber-300 bg-amber-50 text-amber-800" },
  untracked: { label: "Untracked", variant: "secondary", className: "" },
};

const normalizeStatus = (status) => String(status ?? "").trim().toLowerCase().replace(/\s+/g, "_");

export function StatusBadge({ status, label, className }) {
  const key = normalizeStatus(status);
  const config = STATUS_CONFIG[key] ?? {
    label: label || (status ? String(status) : "Unknown"),
    variant: "outline",
    className: "",
  };

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {label || config.label}
    </Badge>
  );
}

export default StatusBadge;
