import React from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminEmptyState({
  title = "Nothing here yet",
  description,
  action,
  icon = Inbox,
  className,
}) {
  return (
    <div
      className={cn(
        "flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed bg-card px-6 py-10 text-center",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        {React.createElement(icon, {
          className: "h-6 w-6 text-muted-foreground",
          "aria-hidden": true,
        })}
      </div>
      <h2 className="mt-4 text-base font-semibold text-foreground">{title}</h2>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default AdminEmptyState;
