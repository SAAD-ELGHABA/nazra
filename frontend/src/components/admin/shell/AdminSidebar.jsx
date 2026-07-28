import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  RadioTower,
  Sparkles,
  SquareArrowOutUpRight,
  Store,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { adminNavigation } from "../navigation/adminNavigation";
import {
  filterNavigationByCapabilities,
  isNavItemActive,
} from "../navigation/navUtils";
import AdminUserMenu from "./AdminUserMenu";

const formatRoleLabel = (user) => {
  const role = user?.role?.name || user?.role;
  if (!role) return "Administrator";
  if (role === "superadmin") return "Super Admin";
  if (role === "admin") return "Admin";
  return String(role);
};

export function AdminSidebar({ currentUser, capabilities = [], onLogout }) {
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const visibleNavigation = filterNavigationByCapabilities(
    adminNavigation,
    capabilities,
  );

  const renderNavItem = (item) => {
    const active = isNavItemActive(location.pathname, item);
    const href = item.anchorId ? `${item.href}#${item.anchorId}` : item.href;

    return (
      <SidebarMenuItem key={`${item.label}-${item.href}`}>
        <SidebarMenuButton
          asChild
          isActive={active}
          tooltip={item.label}
          className={cn(
            "h-10 rounded-lg text-sidebar-foreground/80 transition",
            "hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground",
            active &&
              "border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground shadow-sm",
          )}
        >
          <Link
            to={href}
            aria-current={active ? "page" : undefined}
            onClick={() => {
              if (isMobile) setOpenMobile(false);
            }}
          >
            <item.icon />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
        {item.badge !== undefined && item.badge !== null ? (
          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
        ) : null}
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border bg-sidebar">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground shadow-sm">
            N
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-sidebar bg-[var(--chart-2)]" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold tracking-wide">NAZRA</p>
            <p className="truncate text-xs text-muted-foreground">
              Web3 admin cockpit
            </p>
          </div>
        </div>

        <div className="mx-2 rounded-lg border border-sidebar-border bg-sidebar-accent/45 p-3 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Command Node
                </span>
              </div>
              <p className="mt-1 truncate text-sm font-semibold">
                {formatRoleLabel(currentUser)}
              </p>
            </div>
            <Badge variant="outline" className="bg-sidebar text-[10px]">
              Live
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pb-2 pt-1 group-data-[collapsible=icon]:hidden">
          <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Store className="h-3.5 w-3.5" aria-hidden="true" />
            Storefront
          </span>
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open public website in a new tab"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <SquareArrowOutUpRight className="h-4 w-4" />
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar px-1 py-2">
        {visibleNavigation.map((entry) => {
          if (entry.href) {
            return (
              <SidebarGroup key={entry.label}>
                <SidebarGroupContent>
                  <SidebarMenu>{renderNavItem(entry)}</SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }

          return (
            <SidebarGroup key={entry.label}>
              <SidebarGroupLabel className="text-[11px] uppercase tracking-[0.16em]">
                {entry.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {entry.items.map((item) => renderNavItem(item))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border bg-sidebar">
        <div className="mx-2 flex items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          <RadioTower className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">Admin network stable</span>
          <Activity className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
        </div>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <AdminUserMenu user={currentUser} onLogout={onLogout} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export default AdminSidebar;
