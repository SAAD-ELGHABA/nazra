import React from "react";
import { CheckCircle2, LoaderCircle, UploadCloud, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { IMAGE_ACCEPT, folderLabel } from "./mediaConstants";

const STATUS_LABEL = {
  queued: "Queued",
  uploading: "Uploading",
  saving: "Saving",
  done: "Done",
  failed: "Failed",
};

function QueueRow({ entry }) {
  const Icon =
    entry.status === "done" ? CheckCircle2 : entry.status === "failed" ? XCircle : LoaderCircle;

  return (
    <li className="flex items-center gap-2 py-1 text-xs">
      <Icon
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          entry.status === "done" && "text-emerald-600",
          entry.status === "failed" && "text-destructive",
          entry.status !== "done" && entry.status !== "failed" && "animate-spin text-muted-foreground",
        )}
        aria-hidden="true"
      />
      <span className="truncate text-foreground">{entry.name}</span>
      <span className="ml-auto shrink-0 text-muted-foreground">
        {entry.error || STATUS_LABEL[entry.status]}
      </span>
    </li>
  );
}

export const MediaUploadDropzone = React.forwardRef(function MediaUploadDropzone(
  { onFiles, destination, queue = [], children },
  inputRef,
) {
  const [dragging, setDragging] = React.useState(false);
  // Nested children fire dragleave as the pointer crosses them, so track depth
  // rather than toggling on every event or the overlay flickers.
  const depth = React.useRef(0);

  const handleDragEnter = (event) => {
    event.preventDefault();
    depth.current += 1;
    setDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    depth.current = 0;
    setDragging(false);
    onFiles?.(event.dataTransfer?.files);
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-lg transition",
        dragging && "outline-2 outline-dashed outline-offset-4 outline-primary",
      )}
    >
      <label className="sr-only" htmlFor="media-file-input">
        Upload images
      </label>
      <input
        id="media-file-input"
        ref={inputRef}
        type="file"
        multiple
        accept={IMAGE_ACCEPT}
        className="sr-only"
        onChange={(event) => {
          onFiles?.(event.target.files);
          event.target.value = "";
        }}
      />

      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80">
          <div className="flex flex-col items-center gap-2 text-sm font-medium text-foreground">
            <UploadCloud className="h-6 w-6" aria-hidden="true" />
            Drop to upload into {folderLabel(destination)}
          </div>
        </div>
      )}

      {queue.length > 0 && (
        <ul className="mb-4 divide-y rounded-lg border bg-card px-3 py-1">
          {queue.map((entry) => (
            <QueueRow key={entry.localId} entry={entry} />
          ))}
        </ul>
      )}

      {children}
    </div>
  );
});

export default MediaUploadDropzone;
