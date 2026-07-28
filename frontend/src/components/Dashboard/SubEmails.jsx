import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Mail, MailCheck, ShieldAlert, UserX } from "lucide-react";
import { getSubEmails } from "@/api/api";
import { neutralizeSpreadsheetCell } from "@/utils/adminFormatting";
import { formatAdminDateTime, formatRelativeTime } from "@/utils/adminDates";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { paginateAdminItems, useAdminListQuery } from "@/hooks/useAdminListQuery";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function SubEmails() {
  const requestId = useRef(0);
  const { hasCapability } = useAdminAuth();
  const canExport = hasCapability("subscribers.export");
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const {
    page,
    limit,
    status,
    setQuery,
    clearFilters,
    searchParams,
  } = useAdminListQuery({
    defaults: { page: 1, limit: 25, search: "", status: "all" },
    allowedFilters: ["status"],
  });

  const loadSubscribers = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const response = await getSubEmails();
      if (currentRequest === requestId.current) {
        setSubscribers(response?.data?.emails ?? []);
      }
    } catch (loadError) {
      if (currentRequest === requestId.current) {
        setError(loadError?.response?.data?.message || "Subscribers could not be loaded.");
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscribers();
    return () => {
      requestId.current += 1;
    };
  }, [loadSubscribers]);

  useEffect(() => {
    if (searchParams.has("q")) {
      setQuery({ q: "" }, { replace: true });
    }
  }, [searchParams, setQuery]);

  const filteredSubscribers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...subscribers]
      .filter((subscriber) => {
        const matchesStatus = status === "all" || subscriber.status === status;
        const matchesSearch =
          !query ||
          [subscriber.email, subscriber.source].some((value) =>
            String(value ?? "").toLowerCase().includes(query),
          );
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => new Date(b.consentAt ?? b.createdAt) - new Date(a.consentAt ?? a.createdAt));
  }, [search, status, subscribers]);

  const subscriberSummary = useMemo(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const active = subscribers.filter((subscriber) => (subscriber.status || "active") === "active").length;
    const unsubscribed = subscribers.filter((subscriber) => subscriber.status === "unsubscribed").length;
    const suppressed = subscribers.filter((subscriber) => subscriber.status === "suppressed").length;
    const recent = subscribers.filter((subscriber) => {
      const consentDate = new Date(subscriber.consentAt ?? subscriber.createdAt).getTime();
      return Number.isFinite(consentDate) && consentDate >= thirtyDaysAgo;
    }).length;

    return {
      total: subscribers.length,
      active,
      unsubscribed,
      suppressed,
      recent,
    };
  }, [subscribers]);

  const pagination = paginateAdminItems(filteredSubscribers, page, limit);

  useEffect(() => {
    if (page !== pagination.page) setQuery({ page: pagination.page }, { replace: true });
  }, [page, pagination.page, setQuery]);

  const exportToCsv = () => {
    const escapeCsv = (value) =>
      `"${String(neutralizeSpreadsheetCell(value)).replace(/"/g, '""')}"`;
    const rows = [
      ["Email", "Status", "Source", "Consent At", "Unsubscribed At", "Updated At"],
      ...filteredSubscribers.map((subscriber) => [
        subscriber.email,
        subscriber.status || "",
        subscriber.source || "",
        subscriber.consentAt || subscriber.createdAt || "",
        subscriber.unsubscribedAt || "",
        subscriber.updatedAt || "",
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearListFilters = () => {
    setSearch("");
    clearFilters();
  };

  return (
    <div className="space-y-6">
      {error && subscribers.length > 0 && (
        <AdminOfflineState description={error} onRetry={loadSubscribers} />
      )}

      {!loading || subscribers.length > 0 ? (
        <AdminMetricGrid>
          <AdminMetricCard
            title="Total subscribers"
            value={subscriberSummary.total}
            description={`${subscriberSummary.recent} new consent events in the last 30 days.`}
            icon={Mail}
            tone="primary"
          />
          <AdminMetricCard
            title="Active list"
            value={subscriberSummary.active}
            description="Eligible to receive campaigns."
            icon={MailCheck}
            tone="success"
          />
          <AdminMetricCard
            title="Unsubscribed"
            value={subscriberSummary.unsubscribed}
            description="Suppressed from future sends."
            icon={UserX}
            tone="default"
          />
          <AdminMetricCard
            title="Suppressed"
            value={subscriberSummary.suppressed}
            description="Blocked from marketing delivery."
            icon={ShieldAlert}
            tone="warning"
          />
        </AdminMetricGrid>
      ) : null}

      <AdminFilterBar
        showClear={Boolean(search || status !== "all")}
        onClear={clearListFilters}
      >
        <AdminSearchInput
          id="subscriber-search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setQuery({ page: 1 }, { replace: true });
          }}
          label="Search subscribers"
          placeholder="Search email or consent source..."
          className="max-w-xl"
        />
        <Select value={status} onValueChange={(value) => setQuery({ status: value })}>
          <SelectTrigger className="w-full md:w-[180px]" aria-label="Filter subscribers by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
            <SelectItem value="suppressed">Suppressed</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground md:ml-auto">
          {filteredSubscribers.length === 1
            ? "1 subscriber in view"
            : `${filteredSubscribers.length} subscribers in view`}
        </p>
        {canExport && (
          <Button
            variant="outline"
            onClick={exportToCsv}
            disabled={!filteredSubscribers.length}
          >
            <Download aria-hidden="true" />
            Export filtered CSV
          </Button>
        )}
      </AdminFilterBar>

      {loading && subscribers.length === 0 ? (
        <AdminTableSkeleton rows={6} columns={4} />
      ) : error && subscribers.length === 0 ? (
        <AdminErrorState
          title="We couldn't load subscribers"
          description={error}
          onRetry={loadSubscribers}
        />
      ) : filteredSubscribers.length === 0 ? (
        <AdminEmptyState
          icon={Mail}
          title={subscribers.length ? "No subscribers match your filters" : "No subscribers yet"}
          description={
            subscribers.length
              ? "Adjust or clear the current filters."
              : "People who explicitly consent to newsletter updates will appear here."
          }
          action={
            subscribers.length
              ? <Button variant="outline" onClick={clearListFilters}>Clear filters</Button>
              : null
          }
        />
      ) : (
        <>
          <AdminTable ariaLabel="Newsletter subscribers">
            <AdminTableHeader sticky>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Source</TableHead>
                <TableHead className="hidden lg:table-cell">Consent</TableHead>
                <TableHead className="hidden xl:table-cell">Last updated</TableHead>
              </TableRow>
            </AdminTableHeader>
            <TableBody>
              {pagination.items.map((subscriber) => {
                const consentDate = subscriber.consentAt ?? subscriber.createdAt;
                return (
                  <TableRow key={subscriber._id ?? subscriber.email}>
                    <TableCell>
                      <div className="min-w-[210px]">
                        <p className="text-sm font-medium">{subscriber.email}</p>
                        <p className="text-xs text-muted-foreground md:hidden">
                          {subscriber.source || "newsletter"}
                        </p>
                        <p className="text-xs text-muted-foreground lg:hidden">
                          {formatRelativeTime(consentDate)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={subscriber.status || "active"} />
                    </TableCell>
                    <TableCell className="hidden capitalize md:table-cell">
                      <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                        {subscriber.source || "newsletter"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <p className="text-sm">{formatAdminDateTime(consentDate)}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(consentDate)}</p>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {formatAdminDateTime(subscriber.updatedAt)}
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
    </div>
  );
}
