import React from "react";
import { RefreshCw } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAdminPageContext } from "@/context/AdminPageContext";
import { useAdminAuth } from "@/context/AdminAuthContext";
import AdminBreadcrumbs from "./AdminBreadcrumbs";
import AdminUserMenu from "./AdminUserMenu";
import { formatRelativeTime } from "@/utils/adminDates";

export function AdminTopbar() {
  const pageContext = useAdminPageContext();
  const { currentUser, logout } = useAdminAuth();
  const breadcrumbs = pageContext?.breadcrumbs ?? [];
  const contextActions = pageContext?.contextActions;
  const lastUpdated = pageContext?.lastUpdated;
  const isRefreshing = pageContext?.isRefreshing;

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-card/90 px-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/75 md:px-6">
      <SidebarTrigger
        aria-label="Toggle navigation sidebar"
        className="rounded-lg border bg-background shadow-sm"
      />

      <div className="min-w-0 flex-1">
        <AdminBreadcrumbs items={breadcrumbs} />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {lastUpdated && (
          <p className="hidden rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground md:block">
            Last updated {formatRelativeTime(lastUpdated)}
          </p>
        )}

        {contextActions}

        {isRefreshing && (
          <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
        )}

        <AdminUserMenu
          user={currentUser}
          onLogout={logout}
          compact
          side="bottom"
          align="end"
        />
      </div>
    </header>
  );
}

export function AdminRefreshButton({ onClick, disabled, label = "Refresh data" }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${disabled ? "animate-spin" : ""}`} />
      Refresh
    </Button>
  );
}

export default AdminTopbar;
