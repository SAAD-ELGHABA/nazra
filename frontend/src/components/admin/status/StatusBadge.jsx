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
  archived: { label: "Archived", variant: "outline", className: "" },
  published: { label: "Published", variant: "default", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  draft: { label: "Draft", variant: "outline", className: "" },
  superadmin: { label: "Super Admin", variant: "default", className: "bg-violet-100 text-violet-800 border-violet-200" },
  admin: { label: "Admin", variant: "secondary", className: "" },
  in_stock: { label: "In stock", variant: "default", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  out_of_stock: { label: "Out of stock", variant: "destructive", className: "" },
  low_stock: { label: "Low stock", variant: "outline", className: "border-amber-300 bg-amber-50 text-amber-800" },
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
