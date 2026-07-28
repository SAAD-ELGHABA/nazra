import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminPageProvider } from "@/context/AdminPageContext";
import { useAdminAuth } from "@/context/AdminAuthContext";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export function AdminShell() {
  const { currentUser, capabilities, logout } = useAdminAuth();
  const [defaultSidebarOpen] = React.useState(() => {
    const storedState = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith("sidebar_state="))
      ?.split("=")[1];

    return storedState === undefined ? true : storedState === "true";
  });

  return (
    <SidebarProvider
      defaultOpen={defaultSidebarOpen}
      style={{
        "--sidebar-width": "17rem",
        "--sidebar-width-icon": "3.25rem",
      }}
    >
      <AdminPageProvider>
        <a
          href="#admin-main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:shadow"
        >
          Skip to content
        </a>
        <AdminSidebar
          currentUser={currentUser}
          capabilities={capabilities}
          onLogout={logout}
        />
        <SidebarInset className="min-h-svh bg-[linear-gradient(180deg,var(--background)_0%,var(--muted)_100%)]">
          <AdminTopbar />
          <div
            id="admin-main-content"
            tabIndex={-1}
            className="flex min-h-[calc(100svh-4rem)] flex-1 flex-col outline-none"
          >
            <Outlet />
          </div>
        </SidebarInset>
      </AdminPageProvider>
    </SidebarProvider>
  );
}

export default AdminShell;
