import React from "react";
import { Folder, FolderPlus, Images, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminRowActions } from "@/components/admin/table/AdminRowActions";
import { cn } from "@/lib/utils";
import { ROOT_FOLDER, folderLabel, normalizeFolderPath } from "./mediaConstants";

function FolderButton({ label, count, active, icon, onClick, action }) {
  const Icon = icon;

  return (
    <li className="flex items-center gap-1">
      <button
        type="button"
        onClick={onClick}
        aria-current={active ? "true" : undefined}
        className={cn(
          "flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition",
          active ? "bg-accent font-medium text-accent-foreground" : "hover:bg-accent/50",
        )}
      >
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="truncate">{label}</span>
        {typeof count === "number" && (
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">{count}</span>
        )}
      </button>
      {action}
    </li>
  );
}

export function MediaFolderNav({
  folders = [],
  activeFolder,
  pendingFolder,
  onSelect,
  onCreatePending,
  onRename,
}) {
  const [creating, setCreating] = React.useState(false);
  const [draft, setDraft] = React.useState("");

  const totalCount = folders.reduce((sum, entry) => sum + entry.count, 0);
  const knownPaths = new Set(folders.map((entry) => entry.folder));

  const submitDraft = (event) => {
    event.preventDefault();
    const normalized = normalizeFolderPath(draft);
    if (normalized === ROOT_FOLDER) {
      setCreating(false);
      setDraft("");
      return;
    }
    onCreatePending?.(normalized);
    setCreating(false);
    setDraft("");
  };

  return (
    <nav aria-label="Media folders" className="space-y-2">
      <ul className="space-y-0.5">
        <FolderButton
          label="All assets"
          count={totalCount}
          icon={Images}
          active={!activeFolder}
          onClick={() => onSelect?.("")}
        />
        {folders.map((entry) => (
          <FolderButton
            key={entry.folder}
            label={folderLabel(entry.folder)}
            count={entry.count}
            icon={Folder}
            active={activeFolder === entry.folder}
            onClick={() => onSelect?.(entry.folder)}
            action={
              entry.folder === ROOT_FOLDER ? null : (
                <AdminRowActions
                  label={`Actions for ${folderLabel(entry.folder)}`}
                  items={[
                    {
                      key: "rename",
                      label: "Rename folder",
                      icon: Pencil,
                      onClick: () => onRename?.(entry.folder),
                    },
                  ]}
                />
              )
            }
          />
        ))}

        {/* A folder only exists once it holds an asset, so a freshly created one
            lives here until the first upload lands in it. */}
        {pendingFolder && !knownPaths.has(pendingFolder) && (
          <FolderButton
            label={folderLabel(pendingFolder)}
            count={0}
            icon={Folder}
            active={activeFolder === pendingFolder}
            onClick={() => onSelect?.(pendingFolder)}
          />
        )}
      </ul>

      {creating ? (
        <form onSubmit={submitDraft} className="space-y-2">
          <Input
            autoFocus
            value={draft}
            placeholder="Campaigns/Summer 25"
            aria-label="New folder name"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setCreating(false);
                setDraft("");
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            The folder appears in this list once it holds an asset.
          </p>
          <div className="flex gap-2">
            <Button type="submit" size="sm">
              Create
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => setCreating(true)}
        >
          <FolderPlus className="mr-2 h-4 w-4" aria-hidden="true" />
          New folder
        </Button>
      )}
    </nav>
  );
}

export default MediaFolderNav;
