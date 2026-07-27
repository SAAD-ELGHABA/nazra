import React from "react";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { ChevronUp } from "lucide-react";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "A";

const formatRoleLabel = (user) => {
  const role = user?.role?.name || user?.role;
  if (!role) return "Administrator";
  if (role === "superadmin") return "Super Admin";
  if (role === "admin") return "Admin";
  return String(role);
};

export function AdminUserMenu({
  user,
  onLogout,
  compact = false,
  side = "top",
  align = "start",
}) {
  const displayName = user?.name || "Administrator";
  const roleLabel = formatRoleLabel(user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          aria-label={compact ? `Open user menu for ${displayName}` : undefined}
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
            {getInitials(displayName)}
          </span>
          {!compact && (
            <>
              <span className="min-w-0 flex-1 truncate text-left">
                <span className="block truncate font-medium">{displayName}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {roleLabel}
                </span>
              </span>
              <ChevronUp className="ml-auto" />
            </>
          )}
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={side}
        align={align}
        className="w-[--radix-popper-anchor-width]"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="truncate text-sm font-medium">{displayName}</p>
            {user?.email && (
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default AdminUserMenu;
