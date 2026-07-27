import React from "react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  primaryAction,
  secondaryActions,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
            {description}
          </p>
        )}
      </div>

      {(primaryAction || secondaryActions) && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {secondaryActions}
          {primaryAction}
        </div>
      )}
    </div>
  );
}

export default AdminPageHeader;
