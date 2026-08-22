// SVG is deliberately absent: Cloudinary serves it unmodified, and library URLs
// are delivered from a public CDN, so an SVG would be a stored-XSS vector.
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

export const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,.avif,.gif";
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const ROOT_FOLDER = "/";
export const UPLOAD_PURPOSE = "library";
export const PAGE_SIZE_OPTIONS = [24, 48, 96];
export const MAX_TAGS = 10;

export const MEDIA_SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest first" },
  { value: "createdAt", label: "Oldest first" },
  { value: "-bytes", label: "Largest first" },
  { value: "bytes", label: "Smallest first" },
  { value: "originalFilename", label: "Name A–Z" },
  { value: "-originalFilename", label: "Name Z–A" },
];

// Grid thumbnails are derived from the stored URL rather than fetched at full
// size: 24 untouched originals per page is tens of megabytes.
export const thumbnailUrl = (url, size = 400) => {
  if (typeof url !== "string") return "";
  const marker = "/upload/";
  const index = url.indexOf(marker);
  if (index === -1) return url;
  const head = url.slice(0, index + marker.length);
  const tail = url.slice(index + marker.length);
  return `${head}c_fill,w_${size},h_${size},q_auto,f_auto/${tail}`;
};

export const formatBytes = (bytes) => {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(0)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

export const folderLabel = (folder) => {
  if (!folder || folder === ROOT_FOLDER) return "Root";
  return folder.replace(/^\//, "").split("/").join(" / ");
};

// Mirrors normalizeFolderPath in backend/services/admin/mediaLibraryService.js so
// the folder a user types is the folder they end up filtering on.
export const normalizeFolderPath = (value) => {
  if (!value) return ROOT_FOLDER;
  const segments = String(value)
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) =>
      segment
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter(Boolean);

  if (!segments.length) return ROOT_FOLDER;
  return `/${segments.slice(0, 3).join("/")}`;
};

export const parseTagsInput = (value) =>
  Array.from(
    new Set(
      String(value || "")
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, MAX_TAGS);
