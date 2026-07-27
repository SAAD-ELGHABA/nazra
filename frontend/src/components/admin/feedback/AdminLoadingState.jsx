import React from "react";
import { LoaderCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function AdminLoadingState({
  title = "Loading",
  description,
  className,
  rows = 4,
  variant = "default",
}) {
  if (variant === "table") {
    return (
      <div className={cn("space-y-3", className)} aria-busy="true" aria-live="polite">
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="rounded-lg border bg-card">
          <div className="space-y-0 divide-y">
            {Array.from({ length: rows }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-none" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div
        className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}
        aria-busy="true"
        aria-live="polite"
      >
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border bg-card p-8 text-center",
        className,
      )}
      aria-busy="true"
      aria-live="polite"
    >
      <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

export default AdminLoadingState;
