import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Globe2, Laptop } from "lucide-react";
import { getVisitors } from "@/api/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminErrorState from "@/components/admin/feedback/AdminErrorState";
import { AdminOfflineState } from "@/components/admin/feedback/AdminErrorState";
import AdminEmptyState from "@/components/admin/feedback/AdminEmptyState";
import AdminTable, {
  AdminTableHeader,
  AdminTableSkeleton,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/admin/table/AdminTable";

const browserName = (userAgent = "") => {
  if (/Edg\//.test(userAgent)) return "Edge";
  if (/Firefox\//.test(userAgent)) return "Firefox";
  if (/Chrome\//.test(userAgent)) return "Chrome";
  if (/Safari\//.test(userAgent)) return "Safari";
  return "Other";
};

const referrerName = (referrer) => {
  if (!referrer || referrer === "direct") return "Direct";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return String(referrer);
  }
};

const groupUniqueVisitors = (visits, getLabel) => {
  const groups = new Map();
  visits.forEach((visit) => {
    const label = getLabel(visit);
    const identity = visit.visitorId || visit.ipAddress;
    if (!identity) return;
    if (!groups.has(label)) groups.set(label, new Set());
    groups.get(label).add(identity);
  });
  return [...groups.entries()]
    .map(([label, identities]) => ({ label, visitors: identities.size }))
    .sort((a, b) => b.visitors - a.visitors);
};

function DistributionTable({ rows, labelHeading }) {
  const total = rows.reduce((sum, row) => sum + row.visitors, 0);
  return (
    <AdminTable ariaLabel={`${labelHeading} visitor distribution`}>
      <AdminTableHeader>
        <TableRow>
          <TableHead>{labelHeading}</TableHead>
          <TableHead className="text-right">Visitors</TableHead>
          <TableHead className="text-right">Share</TableHead>
        </TableRow>
      </AdminTableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.label}>
            <TableCell className="font-medium">{row.label}</TableCell>
            <TableCell className="text-right">{row.visitors}</TableCell>
            <TableCell className="text-right text-muted-foreground">
              {total ? `${((row.visitors / total) * 100).toFixed(1)}%` : "0%"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </AdminTable>
  );
}

export default function VisitorAnalytics() {
  const requestId = useRef(0);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVisitors = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const response = await getVisitors();
      if (currentRequest === requestId.current) {
        setVisits(response?.data?.views ?? []);
      }
    } catch (loadError) {
      if (currentRequest === requestId.current) {
        setError(loadError?.response?.data?.message || "Visitor analytics could not be loaded.");
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVisitors();
    return () => {
      requestId.current += 1;
    };
  }, [loadVisitors]);

  const browsers = useMemo(
    () => groupUniqueVisitors(visits, (visit) => browserName(visit.userAgent)),
    [visits],
  );
  const referrers = useMemo(
    () => groupUniqueVisitors(visits, (visit) => referrerName(visit.referrer)),
    [visits],
  );

  if (loading && visits.length === 0) return <AdminTableSkeleton rows={6} columns={3} />;
  if (error && visits.length === 0) {
    return (
      <AdminErrorState
        title="We couldn't load visitor analytics"
        description={error}
        onRetry={loadVisitors}
      />
    );
  }
  if (visits.length === 0) {
    return (
      <AdminEmptyState
        icon={Globe2}
        title="No visitor data yet"
        description="Visitor sources and browser usage will appear once visits are recorded."
      />
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <AdminOfflineState description={error} onRetry={loadVisitors} />
      )}
      <Tabs defaultValue="sources" className="space-y-4">
      <TabsList aria-label="Analytics breakdown">
        <TabsTrigger value="sources">
          <Globe2 aria-hidden="true" />
          Traffic sources
        </TabsTrigger>
        <TabsTrigger value="browsers">
          <Laptop aria-hidden="true" />
          Browsers
        </TabsTrigger>
      </TabsList>
      <TabsContent value="sources">
        <DistributionTable rows={referrers} labelHeading="Source" />
      </TabsContent>
      <TabsContent value="browsers">
        <DistributionTable rows={browsers} labelHeading="Browser" />
      </TabsContent>
      </Tabs>
    </div>
  );
}
