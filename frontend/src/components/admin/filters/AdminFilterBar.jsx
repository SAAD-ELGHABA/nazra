import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminSearchInput({
  value,
  onChange,
  placeholder = "Search...",
  label = "Search",
  className,
  id = "admin-search",
}) {
  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        id={id}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          aria-label="Clear search"
          onClick={() =>
            onChange?.({ target: { value: "" } })
          }
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export function AdminFilterBar({ children, className, onClear, showClear = false }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-4 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        {children}
      </div>
      {showClear && onClear && (
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  );
}

export function ClearFiltersButton({ onClick, visible = true }) {
  if (!visible) return null;

  return (
    <Button type="button" variant="ghost" size="sm" onClick={onClick}>
      Clear filters
    </Button>
  );
}

export default AdminFilterBar;
