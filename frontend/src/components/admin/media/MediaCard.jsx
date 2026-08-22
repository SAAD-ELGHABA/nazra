import React from "react";
import { Copy, ExternalLink, ImageOff, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminRowActions } from "@/components/admin/table/AdminRowActions";
import { cn } from "@/lib/utils";
import { formatBytes, thumbnailUrl } from "./mediaConstants";

export function MediaCard({
  item,
  selected = false,
  onToggleSelect,
  onCopyUrl,
  onEdit,
  onDelete,
}) {
  const [failed, setFailed] = React.useState(false);
  const name = item.originalFilename || item.publicId.split("/").pop();

  return (
    <figure
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border bg-card transition",
        selected ? "ring-2 ring-primary" : "hover:border-foreground/20",
      )}
    >
      <div className="relative aspect-square bg-muted">
        {failed ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-6 w-6" aria-hidden="true" />
          </div>
        ) : (
          <img
            src={thumbnailUrl(item.url)}
            alt={item.alt || name}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        )}

        <label className="absolute left-2 top-2 flex cursor-pointer items-center rounded bg-background/90 p-1 shadow-sm">
          <span className="sr-only">{`Select ${name}`}</span>
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect?.(item._id)}
            className="h-4 w-4 cursor-pointer accent-primary"
          />
        </label>

        <div
          className={cn(
            "absolute right-2 top-2 flex items-center gap-1 rounded bg-background/90 p-0.5 shadow-sm",
            "opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100",
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label={`Copy the URL for ${name}`}
            onClick={() => onCopyUrl?.(item)}
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
          </Button>
          <AdminRowActions
            label={`Actions for ${name}`}
            items={[
              { key: "copy", label: "Copy URL", icon: Copy, onClick: () => onCopyUrl?.(item) },
              {
                key: "open",
                label: "Open original",
                icon: ExternalLink,
                onClick: () => window.open(item.url, "_blank", "noopener,noreferrer"),
              },
              { key: "edit", label: "Edit details", icon: Pencil, onClick: () => onEdit?.(item) },
              { type: "separator" },
              {
                key: "delete",
                label: "Delete",
                icon: Trash2,
                destructive: true,
                onClick: () => onDelete?.(item),
              },
            ]}
          />
        </div>
      </div>

      <figcaption className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="truncate text-sm font-medium text-foreground" title={name}>
          {name}
        </p>
        <p className="text-xs text-muted-foreground">
          {item.format?.toUpperCase()} · {formatBytes(item.bytes)}
          {item.width && item.height ? ` · ${item.width}×${item.height}` : ""}
        </p>
        {item.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="outline" className="text-[10px]">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </figcaption>
    </figure>
  );
}

export default MediaCard;
