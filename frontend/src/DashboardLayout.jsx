import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { useAdminAuth } from "./context/AdminAuthContext";

const DashboardLayout = () => {
  const { currentUser, capabilities } = useAdminAuth();

  return (
    <SidebarProvider>
      <AppSidebar currentUser={currentUser} capabilities={capabilities} />
      <main className="flex min-h-screen flex-1">
        <SidebarTrigger className="m-2" />
        <div className="w-full">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
};

export default DashboardLayout;
