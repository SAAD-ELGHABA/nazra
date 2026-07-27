import React from "react";
import { MoreHorizontal } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminRowActions({
  label = "Open row actions",
  items = [],
}) {
  const visibleItems = items.filter(Boolean);

  if (visibleItems.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        aria-label={label}
        className={buttonVariants({ variant: "ghost", size: "icon" })}
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {visibleItems.map((item, index) => {
          if (item.type === "separator") {
            return <DropdownMenuSeparator key={`sep-${index}`} />;
          }

          if (item.type === "label") {
            return <DropdownMenuLabel key={`label-${index}`}>{item.label}</DropdownMenuLabel>;
          }

          return (
            <DropdownMenuItem
              key={item.key || item.label}
              onClick={item.onClick}
              disabled={item.disabled}
              className={item.destructive ? "text-destructive focus:text-destructive" : undefined}
            >
              {item.icon && <item.icon className="mr-2 h-4 w-4" />}
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default AdminRowActions;
