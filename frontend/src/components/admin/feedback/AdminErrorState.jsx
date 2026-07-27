import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminErrorState({
  title = "Something went wrong",
  description = "Please try again.",
  onRetry,
  retryLabel = "Retry",
  className,
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-destructive/20 bg-destructive/5 p-6",
        className,
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
          {onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={onRetry}
            >
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              {retryLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminOfflineState({
  title = "Showing previously loaded data",
  description = "Refresh failed. Check your connection and try again.",
  onRetry,
  className,
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900",
        className,
      )}
      role="status"
    >
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-amber-800">{description}</p>
      {onRetry && (
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Retry refresh
        </Button>
      )}
    </div>
  );
}

export default AdminErrorState;
