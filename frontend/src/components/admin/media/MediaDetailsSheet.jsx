import React from "react";
import { Copy, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError, FormActions } from "@/components/admin/forms/AdminFormLayout";
import {
  MAX_TAGS,
  ROOT_FOLDER,
  folderLabel,
  formatBytes,
  normalizeFolderPath,
  parseTagsInput,
  thumbnailUrl,
} from "./mediaConstants";

const buildForm = (item) => ({
  originalFilename: item?.originalFilename || "",
  alt: item?.alt || "",
  tags: (item?.tags || []).join(", "),
  folder: item?.folder || ROOT_FOLDER,
});

function ReadOnlyRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate text-right font-medium text-foreground" title={String(value)}>
        {value}
      </span>
    </div>
  );
}

export function MediaDetailsSheet({ item, open, onOpenChange, onSave, onCopyUrl, onDelete }) {
  const [form, setForm] = React.useState(() => buildForm(item));
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    setForm(buildForm(item));
    setError("");
  }, [item]);

  if (!item) return null;

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSave = async (event) => {
    event.preventDefault();
    const tags = parseTagsInput(form.tags);
    if (tags.length > MAX_TAGS) {
      setError(`Use at most ${MAX_TAGS} tags.`);
      return;
    }

    // Send only what actually changed, so the audit entry names real edits.
    const payload = {};
    const folder = normalizeFolderPath(form.folder);
    if (form.originalFilename !== (item.originalFilename || "")) {
      payload.originalFilename = form.originalFilename;
    }
    if (form.alt !== (item.alt || "")) payload.alt = form.alt;
    if (tags.join(",") !== (item.tags || []).join(",")) payload.tags = tags;
    if (folder !== item.folder) payload.folder = folder;

    if (!Object.keys(payload).length) {
      onOpenChange?.(false);
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave?.(item._id, payload);
      onOpenChange?.(false);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "The asset could not be saved. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Asset details</SheetTitle>
          <SheetDescription>
            Labels are stored in the library. The Cloudinary URL never changes.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4">
          <img
            src={thumbnailUrl(item.url, 800)}
            alt={item.alt || item.originalFilename || "Asset preview"}
            className="w-full rounded-lg border bg-muted object-contain"
          />

          <div className="space-y-1.5 rounded-lg border bg-card p-3">
            <ReadOnlyRow label="Public ID" value={item.publicId} />
            <ReadOnlyRow label="Format" value={item.format?.toUpperCase()} />
            <ReadOnlyRow label="Size" value={formatBytes(item.bytes)} />
            <ReadOnlyRow label="Dimensions" value={`${item.width} × ${item.height}`} />
            <ReadOnlyRow
              label="Uploaded"
              value={item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}
            />
            <ReadOnlyRow label="Folder" value={folderLabel(item.folder)} />
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="media-filename">File name</Label>
              <Input
                id="media-filename"
                value={form.originalFilename}
                onChange={update("originalFilename")}
                maxLength={200}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="media-alt">Alt text</Label>
              <Input id="media-alt" value={form.alt} onChange={update("alt")} maxLength={300} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="media-tags">Tags</Label>
              <Input
                id="media-tags"
                value={form.tags}
                onChange={update("tags")}
                placeholder="hero, summer"
              />
              <p className="text-xs text-muted-foreground">
                Comma separated, up to {MAX_TAGS}.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="media-folder">Folder</Label>
              <Input
                id="media-folder"
                value={form.folder}
                onChange={update("folder")}
                placeholder={ROOT_FOLDER}
              />
              <p className="text-xs text-muted-foreground">
                Moving an asset does not change its URL.
              </p>
            </div>

            <FieldError>{error}</FieldError>

            <FormActions>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => onOpenChange?.(false)}>
                Cancel
              </Button>
            </FormActions>
          </form>
        </div>

        <SheetFooter className="mt-auto flex-row gap-2">
          <Button type="button" variant="outline" onClick={() => onCopyUrl?.(item)}>
            <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
            Copy URL
          </Button>
          <Button type="button" variant="destructive" onClick={() => onDelete?.(item)}>
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Delete
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default MediaDetailsSheet;
