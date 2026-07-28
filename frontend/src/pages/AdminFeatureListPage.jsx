import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { DASHBOARDHOME } from "@/constant/routerConstants";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useAdminPageMeta } from "@/context/AdminPageContext";
import { useAdminListQuery } from "@/hooks/useAdminListQuery";
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
import AdminEmptyState from "@/components/admin/feedback/AdminEmptyState";
import AdminTable, {
  AdminTableHeader,
  AdminTableSkeleton,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/admin/table/AdminTable";
import AdminTablePagination from "@/components/admin/table/AdminTablePagination";
import AdminRowActions from "@/components/admin/table/AdminRowActions";
import AdminConfirmDialog from "@/components/admin/forms/AdminConfirmDialog";

const cleanParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== "" && value !== "all"),
  );

export default function AdminFeatureListPage({ config }) {
  const requestId = useRef(0);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const { capabilities, hasCapability } = useAdminAuth();
  const filterDefaults = useMemo(
    () =>
      Object.fromEntries(
        (config.filters || []).map((filter) => [filter.key, filter.defaultValue || "all"]),
      ),
    [config.filters],
  );
  const {
    page,
    limit,
    setQuery,
    clearFilters,
    ...queryState
  } = useAdminListQuery({
    defaults: { page: 1, limit: 25, ...filterDefaults },
    allowedFilters: Object.keys(filterDefaults),
  });
  const { status, severity, type } = queryState;
  const filterValues = useMemo(() => {
    const values = { status, severity, type };
    return Object.fromEntries(
      Object.keys(filterDefaults).map((key) => [key, values[key]]),
    );
  }, [filterDefaults, severity, status, type]);

  useAdminPageMeta({
    title: config.title,
    breadcrumbs: [
      { label: "Overview", href: DASHBOARDHOME },
      { label: config.title, href: config.href },
    ],
  });

  const fetchItems = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const response = await config.loader(
        cleanParams({
          page,
          limit,
          q: search,
          ...filterValues,
        }),
      );
      if (currentRequest === requestId.current) {
        setItems(response?.data?.data ?? []);
        setMeta(response?.data?.meta ?? null);
      }
    } catch (loadError) {
      if (currentRequest === requestId.current && loadError?.name !== "CanceledError") {
        setError(loadError?.response?.data?.message || `${config.title} could not be loaded.`);
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }

  }, [config, filterValues, limit, page, search]);

  useEffect(() => {
    fetchItems();
    return () => {
      requestId.current += 1;
    };
  }, [fetchItems]);

  const hasFilters = Boolean(
    search ||
      Object.keys(filterDefaults).some((key) => queryState[key] && queryState[key] !== "all"),
  );

  const clearAll = () => {
    setSearch("");
    clearFilters();
  };

  const runAction = async (action) => {
    try {
      await action.onRun();
      toast.success(action.successLabel || "Updated");
      await fetchItems();
    } catch (actionError) {
      toast.error(action.errorLabel || "Action failed", {
        description: actionError?.response?.data?.message || "Please try again.",
      });
    }
  };

  const requestAction = (action) => {
    if (action.destructive) {
      setConfirmAction(action);
      return;
    }
    runAction(action);
  };

  const confirmDestructiveAction = async () => {
    if (!confirmAction) return;
    setConfirming(true);
    try {
      await runAction(confirmAction);
      setConfirmAction(null);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title={config.title}
        description={config.description}
        secondaryActions={config.headerActions?.({ runAction, capabilities, hasCapability })}
      />

      <AdminFilterBar showClear={hasFilters} onClear={clearAll}>
        <AdminSearchInput
          id={`${config.id}-search`}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setQuery({ page: 1 }, { replace: true });
          }}
          label={`Search ${config.title}`}
          placeholder={config.searchPlaceholder || "Search..."}
          className="max-w-xl"
        />
        {(config.filters || []).map((filter) => (
          <Select
            key={filter.key}
            value={queryState[filter.key] || filter.defaultValue || "all"}
            onValueChange={(value) => setQuery({ [filter.key]: value })}
          >
            <SelectTrigger className="w-full md:w-[190px]" aria-label={filter.label}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        <p className="text-sm text-muted-foreground md:ml-auto">
          {meta?.total ?? items.length} result{(meta?.total ?? items.length) === 1 ? "" : "s"}
        </p>
      </AdminFilterBar>

      {loading && items.length === 0 ? (
        <AdminTableSkeleton rows={6} columns={config.columns.length + 1} />
      ) : error && items.length === 0 ? (
        <AdminErrorState title={`We couldn't load ${config.title.toLowerCase()}`} description={error} onRetry={fetchItems} />
      ) : items.length === 0 ? (
        <AdminEmptyState
          icon={config.emptyIcon || Search}
          title={hasFilters ? `No ${config.title.toLowerCase()} match your filters` : config.emptyTitle}
          description={hasFilters ? "Adjust or clear the current filters." : config.emptyDescription}
          action={
            hasFilters
              ? <Button variant="outline" onClick={clearAll}>Clear filters</Button>
              : config.emptyAction?.({ runAction, capabilities, hasCapability }) ?? null
          }
        />
      ) : (
        <>
          <AdminTable ariaLabel={config.title}>
            <AdminTableHeader sticky>
              <TableRow>
                {config.columns.map((column) => (
                  <TableHead key={column.key} className={column.headerClassName}>
                    {column.header}
                  </TableHead>
                ))}
                {config.getRowActions && (
                  <TableHead className="w-14">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                )}
              </TableRow>
            </AdminTableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item._id || item.id || item.email || item.name}>
                  {config.columns.map((column) => (
                    <TableCell key={column.key} className={column.cellClassName}>
                      {column.render(item)}
                    </TableCell>
                  ))}
                  {config.getRowActions && (
                    <TableCell>
                      <AdminRowActions
                        label={`Open actions for ${config.getRowLabel?.(item) || config.title}`}
                        items={config.getRowActions(item, { capabilities, hasCapability }).map((action) => ({
                          ...action,
                          onClick: () => requestAction(action),
                        }))}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </AdminTable>
          <AdminTablePagination
            page={meta?.page || page}
            totalPages={meta?.totalPages || 1}
            total={meta?.total || items.length}
            pageSize={meta?.limit || limit}
            pageSizeOptions={[10, 25, 50]}
            onPageChange={(nextPage) => setQuery({ page: nextPage })}
            onPageSizeChange={(nextLimit) => setQuery({ limit: nextLimit, page: 1 })}
          />
        </>
      )}
      <AdminConfirmDialog
        open={Boolean(confirmAction)}
        onOpenChange={(open) => {
          if (!open && !confirming) setConfirmAction(null);
        }}
        title={confirmAction?.confirmTitle || "Confirm this action?"}
        description={confirmAction?.confirmDescription || "This action changes a business record and will be recorded in the activity log where supported."}
        confirmLabel={confirmAction?.confirmLabel || confirmAction?.label || "Confirm"}
        onConfirm={confirmDestructiveAction}
        loading={confirming}
        destructive
      />
    </AdminPageContainer>
  );
}
