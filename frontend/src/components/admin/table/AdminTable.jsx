import React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import AdminEmptyState from "../feedback/AdminEmptyState";

export function AdminTable({ children, className, ariaLabel }) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border bg-card", className)}>
      <Table aria-label={ariaLabel}>{children}</Table>
    </div>
  );
}

export function AdminTableToolbar({ children, className }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminTableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div
      className="overflow-hidden rounded-lg border bg-card"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading table data"
      role="status"
    >
      <span className="sr-only">Loading table data</span>
      <div className="space-y-0 divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 px-4 py-3">
            {Array.from({ length: columns }).map((__, colIndex) => (
              <Skeleton key={colIndex} className="h-5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminTableEmpty({
  title,
  description,
  action,
  colSpan = 1,
}) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="p-0">
        <AdminEmptyState title={title} description={description} action={action} />
      </TableCell>
    </TableRow>
  );
}

export function AdminTableHeader({ children, sticky = false }) {
  return (
    <TableHeader className={sticky ? "sticky top-0 z-10 bg-card" : undefined}>
      {children}
    </TableHeader>
  );
}

export function AdminTableResultCount({ start, end, total, noun = "results" }) {
  if (total === 0) {
    return <p className="text-sm text-muted-foreground">No {noun}</p>;
  }

  return (
    <p className="text-sm text-muted-foreground">
      Showing {start}–{end} of {total} {noun}
    </p>
  );
}

export { TableBody, TableCell, TableHead, TableRow };
export default AdminTable;
