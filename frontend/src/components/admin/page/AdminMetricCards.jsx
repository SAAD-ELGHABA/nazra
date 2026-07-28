import React from "react";
import { cn } from "@/lib/utils";

const TONE_CLASSES = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-700",
  warning: "bg-amber-500/10 text-amber-700",
  destructive: "bg-destructive/10 text-destructive",
};

export function AdminMetricGrid({ children, className }) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {children}
    </div>
  );
}

export function AdminMetricCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "default",
  className,
}) {
  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        {Icon && (
          <span
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-lg",
              TONE_CLASSES[tone] ?? TONE_CLASSES.default,
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>
      {description && (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export default AdminMetricCard;
