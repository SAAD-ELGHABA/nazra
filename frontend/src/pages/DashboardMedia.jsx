import React from "react";
import { Images, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminPageContainer } from "@/components/admin/page/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/page/AdminPageHeader";
import { AdminFilterBar, AdminSearchInput } from "@/components/admin/filters/AdminFilterBar";
import { AdminTableResultCount } from "@/components/admin/table/AdminTable";
import { AdminTablePagination } from "@/components/admin/table/AdminTablePagination";
import { AdminConfirmDialog } from "@/components/admin/forms/AdminConfirmDialog";
import { AdminEmptyState } from "@/components/admin/feedback/AdminEmptyState";
import { AdminErrorState } from "@/components/admin/feedback/AdminErrorState";
import { AdminLoadingState } from "@/components/admin/feedback/AdminLoadingState";
import { MediaDetailsSheet } from "@/components/admin/media/MediaDetailsSheet";
import { MediaFolderNav } from "@/components/admin/media/MediaFolderNav";
import { MediaGrid } from "@/components/admin/media/MediaGrid";
import { MediaUploadDropzone } from "@/components/admin/media/MediaUploadDropzone";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_BYTES,
  MEDIA_SORT_OPTIONS,
  PAGE_SIZE_OPTIONS,
  ROOT_FOLDER,
  UPLOAD_PURPOSE,
  folderLabel,
  normalizeFolderPath,
} from "@/components/admin/media/mediaConstants";
import { useAdminPageMeta } from "@/context/AdminPageContext";
import { useAdminListQuery } from "@/hooks/useAdminListQuery";
import { uploadImageToCloudinary } from "@/utils/cloudinary";
import { DASHBOARDHOME, DASHBOARDMEDIA } from "@/constant/routerConstants";
import {
  bulkDeleteAdminMedia,
  deleteAdminMedia,
  getAdminMedia,
  getAdminMediaFolders,
  getAdminMediaTags,
  registerAdminMedia,
  renameAdminMediaFolder,
  updateAdminMedia,
} from "@/api/api";

const LIST_DEFAULTS = { page: 1, limit: 24, folder: "", tag: "", sort: "-createdAt" };
const ALL_TAGS = "__all__";

const describeError = (error, fallback = "Please try again.") =>
  error?.response?.data?.message || fallback;

export default function DashboardMedia() {
  const { page, limit, search, sort, folder, tag, setQuery, clearFilters } = useAdminListQuery({
    defaults: LIST_DEFAULTS,
    allowedFilters: ["folder", "tag"],
  });

  const [items, setItems] = React.useState([]);
  const [meta, setMeta] = React.useState(null);
  const [folders, setFolders] = React.useState([]);
  const [tags, setTags] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState(null);

  const [searchDraft, setSearchDraft] = React.useState(search);
  const [selectedIds, setSelectedIds] = React.useState(() => new Set());
  const [pendingFolder, setPendingFolder] = React.useState("");
  const [queue, setQueue] = React.useState([]);
  const [editing, setEditing] = React.useState(null);
  const [pendingDelete, setPendingDelete] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);

  const fileInputRef = React.useRef(null);
  const requestId = React.useRef(0);

  useAdminPageMeta({
    title: "Media Library",
    documentTitle: "Media Library",
    breadcrumbs: [
      { label: "Overview", href: DASHBOARDHOME },
      { label: "Media Library", href: DASHBOARDMEDIA },
    ],
    isRefreshing: loading,
    lastUpdated,
  });

  // The upload destination is whichever folder is being browsed; "All assets"
  // and a freshly created pending folder both resolve to something concrete.
  const uploadFolder = folder || pendingFolder || ROOT_FOLDER;

  const fetchItems = React.useCallback(async () => {
    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;
    setLoading(true);

    try {
      const params = { page, limit, sort };
      if (search) params.q = search;
      if (folder) params.folder = folder;
      if (tag) params.tag = tag;

      const response = await getAdminMedia(params);
      if (requestId.current !== currentRequest) return;

      setItems(response?.data?.data ?? []);
      setMeta(response?.data?.meta ?? null);
      setError(false);
      setLastUpdated(new Date());
    } catch (requestError) {
      if (requestId.current !== currentRequest) return;
      setError(true);
      toast.error("Could not load the media library", {
        description: describeError(requestError),
      });
    } finally {
      if (requestId.current === currentRequest) setLoading(false);
    }
  }, [page, limit, sort, search, folder, tag]);

  const fetchFacets = React.useCallback(async () => {
    try {
      const [folderResponse, tagResponse] = await Promise.all([
        getAdminMediaFolders(),
        getAdminMediaTags(),
      ]);
      setFolders(folderResponse?.data?.data ?? []);
      setTags(tagResponse?.data?.data ?? []);
    } catch {
      // Facets are navigational sugar: a failure here must not blank the grid.
      setFolders([]);
      setTags([]);
    }
  }, []);

  React.useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  React.useEffect(() => {
    fetchFacets();
  }, [fetchFacets]);

  React.useEffect(() => () => {
    requestId.current += 1;
  }, []);

  // Selection refers to rows that are on screen, so drop it whenever the query
  // that produced them changes.
  React.useEffect(() => {
    setSelectedIds(new Set());
  }, [page, limit, sort, search, folder, tag]);

  React.useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  React.useEffect(() => {
    if (searchDraft === search) return undefined;
    const timer = setTimeout(() => setQuery({ search: searchDraft }), 300);
    return () => clearTimeout(timer);
  }, [searchDraft, search, setQuery]);

  const refreshAll = React.useCallback(async () => {
    await Promise.all([fetchItems(), fetchFacets()]);
  }, [fetchItems, fetchFacets]);

  const setQueueStatus = (localId, patch) =>
    setQueue((previous) =>
      previous.map((entry) => (entry.localId === localId ? { ...entry, ...patch } : entry)),
    );

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const accepted = [];
    files.forEach((file) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name} was skipped`, {
          description: "Only JPG, PNG, WEBP, AVIF and GIF images are supported.",
        });
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        toast.error(`${file.name} was skipped`, { description: "Images must be 10 MB or smaller." });
        return;
      }
      accepted.push(file);
    });

    if (!accepted.length) return;

    const destination = uploadFolder;
    const entries = accepted.map((file, index) => ({
      localId: `${Date.now()}-${index}-${file.name}`,
      name: file.name,
      status: "queued",
    }));
    setQueue(entries);

    const outcomes = await Promise.allSettled(
      accepted.map(async (file, index) => {
        const { localId } = entries[index];
        setQueueStatus(localId, { status: "uploading" });

        const uploaded = await uploadImageToCloudinary(file, UPLOAD_PURPOSE);
        setQueueStatus(localId, { status: "saving" });

        const payload = {
          publicId: uploaded.public_id,
          folder: destination,
          originalFilename: file.name,
        };

        try {
          await registerAdminMedia(payload);
        } catch (firstFailure) {
          // The bytes are already in Cloudinary. One retry keeps a transient
          // blip from stranding the asset with no record of it.
          try {
            await registerAdminMedia(payload);
          } catch {
            console.error("Media registration failed for", uploaded.public_id);
            throw firstFailure;
          }
        }

        setQueueStatus(localId, { status: "done" });
      }),
    );

    outcomes.forEach((outcome, index) => {
      if (outcome.status === "rejected") {
        setQueueStatus(entries[index].localId, {
          status: "failed",
          error: describeError(outcome.reason, "Failed"),
        });
      }
    });

    const succeeded = outcomes.filter((outcome) => outcome.status === "fulfilled").length;
    const failed = outcomes.length - succeeded;

    if (succeeded) {
      toast.success(`${succeeded} asset${succeeded === 1 ? "" : "s"} uploaded`);
      if (destination !== ROOT_FOLDER && destination === pendingFolder) setPendingFolder("");
      await refreshAll();
    }
    if (failed) {
      toast.error(`${failed} upload${failed === 1 ? "" : "s"} failed`, {
        description: "The files that did upload have been saved.",
      });
    }

    setTimeout(() => setQueue([]), failed ? 8000 : 2500);
  };

  const handleCopyUrl = async (item) => {
    try {
      await navigator.clipboard.writeText(item.url);
      toast.success("URL copied");
    } catch {
      toast.error("Could not copy", {
        description: "Copy it manually from the details panel.",
      });
    }
  };

  const handleSave = async (id, payload) => {
    await updateAdminMedia(id, payload);
    toast.success("Asset updated");
    await refreshAll();
  };

  const handleToggleSelect = (id) =>
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);

    try {
      if (pendingDelete.type === "bulk") {
        const response = await bulkDeleteAdminMedia(Array.from(selectedIds));
        const data = response?.data?.data;
        if (data?.mediaCleanupSucceeded === false) {
          toast.warning("Assets removed from the library", {
            description: `${data.failed} could not be deleted from Cloudinary.`,
          });
        } else {
          toast.success(`${data?.deleted ?? 0} assets deleted`);
        }
        setSelectedIds(new Set());
      } else {
        const response = await deleteAdminMedia(pendingDelete.item._id);
        if (response?.data?.mediaCleanupSucceeded === false) {
          toast.warning("Asset removed from the library", {
            description: "It could not be deleted from Cloudinary. Remove it there manually.",
          });
        } else {
          toast.success("Asset deleted");
        }
        setEditing(null);
      }

      setPendingDelete(null);
      await refreshAll();
    } catch (requestError) {
      toast.error("Delete failed", { description: describeError(requestError) });
    } finally {
      setDeleting(false);
    }
  };

  const handleRenameFolder = async (from) => {
    const input = window.prompt(`Rename ${folderLabel(from)} to:`, from.replace(/^\//, ""));
    if (input === null) return;

    const to = normalizeFolderPath(input);
    if (to === ROOT_FOLDER || to === from) return;

    try {
      await renameAdminMediaFolder({ from, to });
      toast.success("Folder renamed");
      if (folder === from) setQuery({ folder: to });
      await refreshAll();
    } catch (requestError) {
      toast.error("Could not rename the folder", { description: describeError(requestError) });
    }
  };

  const hasFilters = Boolean(search || folder || tag || sort !== LIST_DEFAULTS.sort);
  const total = meta?.total ?? items.length;
  const activePage = meta?.page ?? page;
  const activeLimit = meta?.limit ?? limit;
  const start = total ? (activePage - 1) * activeLimit + 1 : 0;
  const end = Math.min(activePage * activeLimit, total);
  const selectedCount = selectedIds.size;

  const renderBody = () => {
    if (loading && !items.length) return <AdminLoadingState variant="cards" rows={8} />;
    if (error && !items.length) {
      return (
        <AdminErrorState
          title="The media library could not be loaded"
          onRetry={fetchItems}
        />
      );
    }
    if (!items.length) {
      return (
        <AdminEmptyState
          icon={Images}
          title={hasFilters ? "No assets match these filters" : "No assets yet"}
          description={
            hasFilters
              ? "Try a different search term, folder or tag."
              : "Upload images here to reuse them anywhere in the store."
          }
          action={
            hasFilters ? (
              <Button type="button" variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Button type="button" onClick={() => fileInputRef.current?.click()}>
                <UploadCloud className="mr-2 h-4 w-4" aria-hidden="true" />
                Upload images
              </Button>
            )
          }
        />
      );
    }

    return (
      <MediaGrid
        items={items}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onCopyUrl={handleCopyUrl}
        onEdit={setEditing}
        onDelete={(item) => setPendingDelete({ type: "single", item })}
      />
    );
  };

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Media Library"
        description="Upload, organise and reuse store images. Assets are never shown on the storefront."
        primaryAction={
          <Button type="button" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="mr-2 h-4 w-4" aria-hidden="true" />
            Upload images
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
        <MediaFolderNav
          folders={folders}
          activeFolder={folder}
          pendingFolder={pendingFolder}
          onSelect={(value) => setQuery({ folder: value })}
          onCreatePending={(value) => {
            setPendingFolder(value);
            setQuery({ folder: value });
          }}
          onRename={handleRenameFolder}
        />

        <div className="space-y-4">
          <AdminFilterBar showClear={hasFilters} onClear={clearFilters}>
            <AdminSearchInput
              id="media-search"
              value={searchDraft}
              placeholder="Search file names, alt text and tags"
              onChange={(event) => setSearchDraft(event.target.value)}
            />

            <Select
              value={tag || ALL_TAGS}
              onValueChange={(value) => setQuery({ tag: value === ALL_TAGS ? "" : value })}
            >
              <SelectTrigger className="w-full md:w-48" aria-label="Filter by tag">
                <SelectValue placeholder="All tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_TAGS}>All tags</SelectItem>
                {tags.map((entry) => (
                  <SelectItem key={entry.tag} value={entry.tag}>
                    {entry.tag} ({entry.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={(value) => setQuery({ sort: value })}>
              <SelectTrigger className="w-full md:w-44" aria-label="Sort assets">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEDIA_SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <AdminTableResultCount start={start} end={end} total={total} noun="assets" />
          </AdminFilterBar>

          {selectedCount > 0 && (
            <div className="sticky top-2 z-10 flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
              <span className="text-sm font-medium text-foreground">
                {selectedCount} selected
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
              >
                <X className="mr-1 h-4 w-4" aria-hidden="true" />
                Clear
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="ml-auto"
                onClick={() => setPendingDelete({ type: "bulk" })}
              >
                Delete selected
              </Button>
            </div>
          )}

          <MediaUploadDropzone
            ref={fileInputRef}
            onFiles={handleFiles}
            destination={uploadFolder}
            queue={queue}
          >
            {renderBody()}
          </MediaUploadDropzone>

          <AdminTablePagination
            page={activePage}
            totalPages={meta?.totalPages ?? 1}
            total={total}
            pageSize={activeLimit}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={(value) => setQuery({ page: value })}
            onPageSizeChange={(value) => setQuery({ limit: value, page: 1 })}
          />
        </div>
      </div>

      <MediaDetailsSheet
        item={editing}
        open={Boolean(editing)}
        onOpenChange={(next) => !next && setEditing(null)}
        onSave={handleSave}
        onCopyUrl={handleCopyUrl}
        onDelete={(item) => setPendingDelete({ type: "single", item })}
      />

      <AdminConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(next) => !next && setPendingDelete(null)}
        destructive
        loading={deleting}
        title={pendingDelete?.type === "bulk" ? "Delete selected assets?" : "Delete this asset?"}
        description={
          pendingDelete?.type === "bulk"
            ? `${selectedCount} assets will be removed from the library and deleted from Cloudinary. This cannot be undone.`
            : "The asset will be removed from the library and deleted from Cloudinary. Anywhere its URL is already in use will break. This cannot be undone."
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </AdminPageContainer>
  );
}
