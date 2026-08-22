import React from "react";
import { MediaCard } from "./MediaCard";

export function MediaGrid({
  items = [],
  selectedIds,
  onToggleSelect,
  onCopyUrl,
  onEdit,
  onDelete,
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <MediaCard
          key={item._id}
          item={item}
          selected={Boolean(selectedIds?.has(item._id))}
          onToggleSelect={onToggleSelect}
          onCopyUrl={onCopyUrl}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default MediaGrid;
