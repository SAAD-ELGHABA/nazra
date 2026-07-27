import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SquareArrowOutUpRight } from "lucide-react";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { adminNavigation } from "../navigation/adminNavigation";
import {
  filterNavigationByCapabilities,
  isNavItemActive,
} from "../navigation/navUtils";
import AdminUserMenu from "./AdminUserMenu";

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
        <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
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
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
            N
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold tracking-wide">NAZRA</p>
            <p className="truncate text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
        <div className="flex items-center justify-between px-2 pb-2 group-data-[collapsible=icon]:hidden">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
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

      <SidebarContent>
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
              <SidebarGroupLabel>{entry.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {entry.items.map((item) => renderNavItem(item))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter>
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
