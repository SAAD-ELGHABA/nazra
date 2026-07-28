import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Crown, Mail, ShieldCheck, UserPlus, UserRoundCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { createAdmin, getAdmins } from "@/api/api";
import { DASHBOARDADMINS, DASHBOARDHOME } from "@/constant/routerConstants";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useAdminPageMeta } from "@/context/AdminPageContext";
import { paginateAdminItems, useAdminListQuery } from "@/hooks/useAdminListQuery";
import CreateAdminModal from "@/components/CreateAdminModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminPageContainer from "@/components/admin/page/AdminPageContainer";
import AdminPageHeader from "@/components/admin/page/AdminPageHeader";
import AdminFilterBar, { AdminSearchInput } from "@/components/admin/filters/AdminFilterBar";
import AdminErrorState from "@/components/admin/feedback/AdminErrorState";
import { AdminOfflineState } from "@/components/admin/feedback/AdminErrorState";
import AdminEmptyState from "@/components/admin/feedback/AdminEmptyState";
import { AdminMetricCard, AdminMetricGrid } from "@/components/admin/page/AdminMetricCards";
import StatusBadge from "@/components/admin/status/StatusBadge";
import AdminTable, {
  AdminTableHeader,
  AdminTableSkeleton,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/admin/table/AdminTable";
import AdminTablePagination from "@/components/admin/table/AdminTablePagination";

export default function AdminsPage() {
  const requestId = useRef(0);
  const { currentUser, hasCapability } = useAdminAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { page, limit, role, setQuery, clearFilters, searchParams } = useAdminListQuery({
    defaults: { page: 1, limit: 25, search: "", role: "all" },
    allowedFilters: ["role"],
  });
  const canCreateAdmins = hasCapability("admins.manage");

  useAdminPageMeta({
    title: "Administrators",
    breadcrumbs: [
      { label: "Overview", href: DASHBOARDHOME },
      { label: "Administrators", href: DASHBOARDADMINS },
    ],
  });

  const loadAdmins = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const response = await getAdmins();
      if (currentRequest === requestId.current) {
        setAdmins(Array.isArray(response?.data?.users) ? response.data.users : []);
      }
    } catch (loadError) {
      if (currentRequest === requestId.current) {
        setError(
          loadError?.response?.status === 403
            ? "You do not have permission to manage administrators."
            : loadError?.response?.data?.message || "Administrators could not be loaded.",
        );
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmins();
    return () => {
      requestId.current += 1;
    };
  }, [loadAdmins]);

  useEffect(() => {
    if (searchParams.has("q")) {
      setQuery({ q: "" }, { replace: true });
    }
  }, [searchParams, setQuery]);

  const filteredAdmins = useMemo(() => {
    const query = search.trim().toLowerCase();
    return admins.filter((admin) => {
      const normalizedRole = String(admin.role ?? "").toLowerCase();
      const matchesRole =
        role === "all" ||
        (role === "superadmin" && normalizedRole.includes("super")) ||
        (role === "admin" && !normalizedRole.includes("super"));
      const matchesSearch =
        !query ||
        [admin.name, admin.email, admin.role].some((value) =>
          String(value ?? "").toLowerCase().includes(query),
        );
      return matchesRole && matchesSearch;
    });
  }, [admins, role, search]);

  const adminSummary = useMemo(() => {
    const superAdmins = admins.filter((admin) =>
      String(admin.role ?? "").toLowerCase().includes("super"),
    ).length;

    return {
      total: admins.length,
      superAdmins,
      admins: Math.max(0, admins.length - superAdmins),
    };
  }, [admins]);

  const pagination = paginateAdminItems(filteredAdmins, page, limit);

  useEffect(() => {
    if (page !== pagination.page) setQuery({ page: pagination.page }, { replace: true });
  }, [page, pagination.page, setQuery]);

  const handleCreateAdmin = async (adminData) => {
    try {
      const response = await createAdmin(adminData);
      toast.success("Administrator added", {
        description: `${adminData.name} can now access the permitted admin modules.`,
      });
      await loadAdmins();
      return response;
    } catch (createError) {
      toast.error("Administrator could not be created", {
        description: createError?.response?.data?.message || "Please review the form and try again.",
      });
      throw createError;
    }
  };

  const addAdminButton = (
    <Button onClick={() => setModalOpen(true)}>
      <UserPlus aria-hidden="true" />
      Add administrator
    </Button>
  );

  const creationNote = !canCreateAdmins ? (
    <Badge variant="outline" className="min-h-9 rounded-md px-3">
      <Crown aria-hidden="true" />
      Super Admin required
    </Badge>
  ) : null;

  const clearSearch = () => {
    setSearch("");
    clearFilters();
  };

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Administrators"
        description="Manage the team members who can access NAZRA operations and protected dashboard modules."
        primaryAction={canCreateAdmins ? addAdminButton : null}
        secondaryActions={creationNote}
      />

      {!loading || admins.length > 0 ? (
        <AdminMetricGrid>
          <AdminMetricCard
            title="Team members"
            value={adminSummary.total}
            description="Loaded administrator accounts."
            icon={Users}
            tone="primary"
          />
          <AdminMetricCard
            title="Super administrators"
            value={adminSummary.superAdmins}
            description="Full system access accounts."
            icon={Crown}
            tone="warning"
          />
          <AdminMetricCard
            title="Administrators"
            value={adminSummary.admins}
            description="Operational dashboard access."
            icon={ShieldCheck}
            tone="default"
          />
          <AdminMetricCard
            title="Signed in as"
            value={currentUser?.name || "Current admin"}
            description={currentUser?.role || "Authenticated dashboard user."}
            icon={UserRoundCheck}
            tone="success"
          />
        </AdminMetricGrid>
      ) : null}

      <AdminFilterBar showClear={Boolean(search || role !== "all")} onClear={clearSearch}>
        <AdminSearchInput
          id="administrator-search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setQuery({ page: 1 }, { replace: true });
          }}
          label="Search administrators"
          placeholder="Search name, email, or role..."
          className="max-w-xl"
        />
        <Select value={role} onValueChange={(value) => setQuery({ role: value })}>
          <SelectTrigger className="w-full md:w-[190px]" aria-label="Filter administrators by role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="admin">Administrators</SelectItem>
            <SelectItem value="superadmin">Super Admins</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground md:ml-auto">
          {filteredAdmins.length === 1
            ? "1 administrator in view"
            : `${filteredAdmins.length} administrators in view`}
        </p>
      </AdminFilterBar>

      {error && admins.length > 0 && (
        <AdminOfflineState description={error} onRetry={loadAdmins} />
      )}

      {loading && admins.length === 0 ? (
        <AdminTableSkeleton rows={5} columns={3} />
      ) : error && admins.length === 0 ? (
        <AdminErrorState
          title="We couldn't load administrators"
          description={error}
          onRetry={loadAdmins}
        />
      ) : filteredAdmins.length === 0 ? (
        <AdminEmptyState
          icon={Users}
          title={admins.length ? "No administrators match your search" : "No administrators found"}
          description={
            admins.length
              ? "Clear the search or role filter to see the full team."
              : "Add an administrator to start building the team."
          }
          action={
            admins.length
              ? <Button variant="outline" onClick={clearSearch}>Clear filters</Button>
              : canCreateAdmins ? addAdminButton : null
          }
        />
      ) : (
        <>
          <AdminTable ariaLabel="Administrators">
            <AdminTableHeader>
              <TableRow>
                <TableHead>Administrator</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </AdminTableHeader>
            <TableBody>
              {pagination.items.map((admin) => {
                const isCurrentUser =
                  admin._id === currentUser?._id ||
                  (admin.email && admin.email === currentUser?.email);

                return (
                  <TableRow key={admin._id} className={isCurrentUser ? "bg-muted/35" : undefined}>
                    <TableCell>
                      <div className="flex min-w-[180px] items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                          {admin.name?.charAt(0)?.toUpperCase() || "A"}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {admin.name || "Administrator"}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-xs text-muted-foreground md:hidden">
                              {admin.email}
                            </p>
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-[11px]">
                                You
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="inline-flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        {admin.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={String(admin.role).toLowerCase().includes("super") ? "superadmin" : "admin"}
                        label={admin.role === "superadmin" ? "Super Admin" : admin.role || "Admin"}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </AdminTable>
          <AdminTablePagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            pageSize={pagination.limit}
            pageSizeOptions={[10, 25, 50]}
            onPageChange={(nextPage) => setQuery({ page: nextPage })}
            onPageSizeChange={(nextLimit) => setQuery({ limit: nextLimit, page: 1 })}
          />
        </>
      )}

      <CreateAdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreateAdmin={handleCreateAdmin}
        currentUser={currentUser}
        canCreateAdmin={canCreateAdmins}
      />
    </AdminPageContainer>
  );
}
