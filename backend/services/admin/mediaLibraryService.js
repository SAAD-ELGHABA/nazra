const mongoose = require("mongoose");
const Media = require("../../models/Media");
const { getCloudinaryResource, destroyCloudinaryImage } = require("../../config/cloudinary");
const { recordActivity } = require("./adminFeatureService");
const {
  AdminQueryValidationError,
  parsePagination,
  parseSort,
  normalizeSearch,
  escapeRegex,
  buildAdminListMeta
} = require("../../utils/adminQuery");

// Every library asset lives under this Cloudinary prefix. Verified on register
// so a product or blog image can never be adopted into the library, and again
// on delete so we never destroy an asset that belongs to another feature.
const MEDIA_LIBRARY_FOLDER_PREFIX = "media-library/";
const MEDIA_FORMATS = new Set(Media.MEDIA_FORMATS);
const MEDIA_SORTS = new Set([
  "createdAt",
  "-createdAt",
  "bytes",
  "-bytes",
  "originalFilename",
  "-originalFilename"
]);
const MEDIA_SELECT = "_id publicId url format bytes width height originalFilename alt folder tags uploadedBy createdAt updatedAt";
const REGISTRATION_FIELDS = new Set(["publicId", "folder", "tags", "alt", "originalFilename"]);
const UPDATE_FIELDS = new Set(["folder", "tags", "alt", "originalFilename"]);
const ROOT_FOLDER = "/";
const MAX_FOLDER_SEGMENTS = 3;
const MAX_FOLDER_SEGMENT_LENGTH = 40;
const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 32;
const MAX_ALT_LENGTH = 300;
const MAX_FILENAME_LENGTH = 200;
const MAX_PUBLIC_ID_LENGTH = 500;
const MAX_BULK_DELETE = 50;
const DEFAULT_MEDIA_LIMIT = 24;
const MAX_TAG_FACETS = 200;

class MediaAssetNotFoundError extends Error {
  constructor(message = "That asset does not exist in Cloudinary.") {
    super(message);
    this.name = "MediaAssetNotFoundError";
  }
}

const isPlainObject = (value) => (
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
);

const serializeObjectId = (value) => value ? String(value) : null;

const serializeMedia = (doc) => doc ? {
  ...doc,
  _id: serializeObjectId(doc._id),
  uploadedBy: serializeObjectId(doc.uploadedBy)
} : null;

// Folders are DB-side labels, so the path only has to be a stable, predictable
// string. Root is the literal "/" rather than "" so ?folder=/ stays meaningful
// and no sentinel value is needed anywhere in the query layer.
const normalizeFolderPath = (value) => {
  if (value === undefined || value === null || value === "") return ROOT_FOLDER;
  if (typeof value !== "string") {
    throw new AdminQueryValidationError({ folder: "folder must be a string." });
  }

  const rawSegments = value.split("/").map((segment) => segment.trim()).filter(Boolean);
  if (!rawSegments.length) return ROOT_FOLDER;
  if (rawSegments.length > MAX_FOLDER_SEGMENTS) {
    throw new AdminQueryValidationError({
      folder: `folder must not be deeper than ${MAX_FOLDER_SEGMENTS} levels.`
    });
  }

  const segments = rawSegments.map((segment) => {
    if (segment === "." || segment === "..") {
      throw new AdminQueryValidationError({ folder: "folder contains an invalid segment." });
    }
    const slug = segment
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!slug) {
      throw new AdminQueryValidationError({ folder: "folder contains an invalid segment." });
    }
    if (slug.length > MAX_FOLDER_SEGMENT_LENGTH) {
      throw new AdminQueryValidationError({
        folder: `folder segments must not exceed ${MAX_FOLDER_SEGMENT_LENGTH} characters.`
      });
    }
    return slug;
  });

  return `/${segments.join("/")}`;
};

const normalizeTag = (value) => {
  if (typeof value !== "string") {
    throw new AdminQueryValidationError({ tag: "tag must be a string." });
  }
  const normalized = value.trim().toLowerCase();
  if (normalized.length > MAX_TAG_LENGTH) {
    throw new AdminQueryValidationError({
      tag: `tags must not exceed ${MAX_TAG_LENGTH} characters.`
    });
  }
  return normalized;
};

const normalizeTags = (value) => {
  if (value === undefined || value === null || value === "") return [];
  if (!Array.isArray(value)) {
    throw new AdminQueryValidationError({ tags: "tags must be an array." });
  }
  if (value.length > MAX_TAGS) {
    throw new AdminQueryValidationError({ tags: `tags must not exceed ${MAX_TAGS} entries.` });
  }
  const normalized = value.map(normalizeTag).filter(Boolean);
  return Array.from(new Set(normalized));
};

// The filename is the only human-readable handle on an asset, because the
// upload public id is random. It carries no security meaning: strip anything
// that could read as a path or a terminal control sequence, then cap it.
const sanitizeFilename = (value) => {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") {
    throw new AdminQueryValidationError({ originalFilename: "originalFilename must be a string." });
  }
  return value
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[\\/]/g, "")
    .trim()
    .slice(0, MAX_FILENAME_LENGTH);
};

const parseAlt = (value) => {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") {
    throw new AdminQueryValidationError({ alt: "alt must be a string." });
  }
  const normalized = value.trim();
  if (normalized.length > MAX_ALT_LENGTH) {
    throw new AdminQueryValidationError({
      alt: `alt must not exceed ${MAX_ALT_LENGTH} characters.`
    });
  }
  return normalized;
};

const parsePublicId = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new AdminQueryValidationError({ publicId: "publicId is required." });
  }
  const normalized = value.trim();
  if (normalized.length > MAX_PUBLIC_ID_LENGTH) {
    throw new AdminQueryValidationError({
      publicId: `publicId must not exceed ${MAX_PUBLIC_ID_LENGTH} characters.`
    });
  }
  if (!normalized.startsWith(MEDIA_LIBRARY_FOLDER_PREFIX) || normalized.includes("..")) {
    throw new AdminQueryValidationError({
      publicId: "publicId must reference an asset uploaded to the media library."
    });
  }
  return normalized;
};

const assertKnownFields = (payload, allowed, name) => {
  const unknown = Object.keys(payload).filter((key) => !allowed.has(key));
  if (unknown.length) {
    throw new AdminQueryValidationError({ [name]: `Unsupported fields: ${unknown.join(", ")}.` });
  }
};

// The browser uploads straight to Cloudinary, so this payload is the only thing
// the server ever hears about what happened. Everything derivable is re-read
// from Cloudinary in registerMedia; what stays here is untrusted display text.
const parseMediaRegistration = (payload) => {
  if (!isPlainObject(payload)) {
    throw new AdminQueryValidationError({ body: "Request body must be an object." });
  }
  assertKnownFields(payload, REGISTRATION_FIELDS, "body");

  return {
    publicId: parsePublicId(payload.publicId),
    folder: normalizeFolderPath(payload.folder),
    tags: normalizeTags(payload.tags),
    alt: parseAlt(payload.alt),
    originalFilename: sanitizeFilename(payload.originalFilename)
  };
};

const parseMediaUpdate = (payload) => {
  if (!isPlainObject(payload)) {
    throw new AdminQueryValidationError({ body: "Request body must be an object." });
  }
  assertKnownFields(payload, UPDATE_FIELDS, "body");

  const update = {};
  if (payload.folder !== undefined) update.folder = normalizeFolderPath(payload.folder);
  if (payload.tags !== undefined) update.tags = normalizeTags(payload.tags);
  if (payload.alt !== undefined) update.alt = parseAlt(payload.alt);
  if (payload.originalFilename !== undefined) {
    update.originalFilename = sanitizeFilename(payload.originalFilename);
  }

  if (!Object.keys(update).length) {
    throw new AdminQueryValidationError({ body: "No supported fields were provided." });
  }
  return update;
};

const buildMediaListFilter = ({ folder, tag, q } = {}) => {
  const filter = {};
  if (folder) filter.folder = normalizeFolderPath(folder);
  if (tag) filter.tags = normalizeTag(tag);
  if (q) {
    const safe = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ originalFilename: safe }, { alt: safe }, { tags: safe }];
  }
  return filter;
};

const parseObjectId = (id, field = "id") => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AdminQueryValidationError({ [field]: `${field} must be a valid identifier.` });
  }
  return id;
};

// Destroy is never attempted on a public id outside the library prefix, and a
// failed destroy is reported rather than thrown: a row the admin cannot remove
// is worse than a stray CDN object.
const resolveCleanupOutcome = async ({ publicId, destroy }) => {
  if (typeof publicId !== "string" || !publicId.startsWith(MEDIA_LIBRARY_FOLDER_PREFIX)) {
    return false;
  }
  try {
    return await destroy(publicId);
  } catch {
    console.error("Media library cleanup failed");
    return false;
  }
};

const listMedia = async (query = {}) => {
  const { page, limit } = parsePagination(query, { defaultLimit: DEFAULT_MEDIA_LIMIT });
  const sort = parseSort(query.sort, MEDIA_SORTS, "-createdAt");
  const q = normalizeSearch(query.q);
  const filter = buildMediaListFilter({ folder: query.folder, tag: query.tag, q });

  const [items, total] = await Promise.all([
    Media.find(filter)
      .select(MEDIA_SELECT)
      .sort({ [sort.field]: sort.direction, _id: sort.direction })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Media.countDocuments(filter)
  ]);

  return {
    data: items.map(serializeMedia),
    meta: buildAdminListMeta({
      page,
      limit,
      total,
      sort: sort.value,
      filters: { folder: filter.folder || "", tag: filter.tags || "", q }
    })
  };
};

const listMediaFolders = async () => {
  const rows = await Media.aggregate([
    { $group: { _id: "$folder", count: { $sum: 1 }, lastUploadedAt: { $max: "$createdAt" } } },
    { $sort: { _id: 1 } }
  ]);
  return {
    data: rows.map((row) => ({
      folder: row._id,
      count: row.count,
      lastUploadedAt: row.lastUploadedAt
    }))
  };
};

const listMediaTags = async () => {
  const rows = await Media.aggregate([
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: MAX_TAG_FACETS }
  ]);
  return { data: rows.map((row) => ({ tag: row._id, count: row.count })) };
};

const isCloudinaryNotFound = (error) => (
  error?.http_code === 404 ||
  error?.error?.http_code === 404 ||
  /not found/i.test(error?.error?.message || error?.message || "")
);

const registerMedia = async (payload, req) => {
  const parsed = parseMediaRegistration(payload);

  let resource;
  try {
    resource = await getCloudinaryResource(parsed.publicId);
  } catch (error) {
    if (isCloudinaryNotFound(error)) throw new MediaAssetNotFoundError();
    throw error;
  }

  const format = String(resource?.format || "").toLowerCase();
  if (!MEDIA_FORMATS.has(format)) {
    // A rejected upload must not survive as an orphan in Cloudinary.
    await resolveCleanupOutcome({ publicId: parsed.publicId, destroy: destroyCloudinaryImage });
    throw new AdminQueryValidationError({
      publicId: `Only these image formats are supported: ${Array.from(MEDIA_FORMATS).join(", ")}.`
    });
  }

  const created = await Media.create({
    publicId: parsed.publicId,
    url: resource.secure_url,
    format,
    bytes: resource.bytes || 0,
    width: resource.width || 0,
    height: resource.height || 0,
    originalFilename: parsed.originalFilename,
    alt: parsed.alt,
    folder: parsed.folder,
    tags: parsed.tags,
    uploadedBy: req?.user?._id
  });

  await recordActivity({
    req,
    action: "media.created",
    targetType: "media",
    targetId: created._id,
    metadata: {
      publicId: parsed.publicId,
      folder: parsed.folder,
      format,
      bytes: resource.bytes || 0
    }
  });

  return { data: serializeMedia(created.toObject()) };
};

const updateMedia = async (id, payload, req) => {
  parseObjectId(id);
  const update = parseMediaUpdate(payload);

  const updated = await Media.findByIdAndUpdate(id, update, { new: true, runValidators: true })
    .select(MEDIA_SELECT)
    .lean();
  if (!updated) return null;

  await recordActivity({
    req,
    action: "media.updated",
    targetType: "media",
    targetId: id,
    metadata: { publicId: updated.publicId, changed: Object.keys(update).join(",") }
  });

  return { data: serializeMedia(updated) };
};

const deleteMedia = async (id, req) => {
  parseObjectId(id);
  const doc = await Media.findById(id).lean();
  if (!doc) return null;

  const mediaCleanupSucceeded = await resolveCleanupOutcome({
    publicId: doc.publicId,
    destroy: destroyCloudinaryImage
  });
  await Media.findByIdAndDelete(doc._id);

  await recordActivity({
    req,
    action: "media.deleted",
    targetType: "media",
    targetId: id,
    severity: mediaCleanupSucceeded ? "info" : "warning",
    metadata: { publicId: doc.publicId, folder: doc.folder, mediaCleanupSucceeded }
  });

  return { mediaCleanupSucceeded };
};

const parseBulkDeleteIds = (payload) => {
  if (!isPlainObject(payload)) {
    throw new AdminQueryValidationError({ body: "Request body must be an object." });
  }
  assertKnownFields(payload, new Set(["ids"]), "body");

  const { ids } = payload;
  if (!Array.isArray(ids) || !ids.length) {
    throw new AdminQueryValidationError({ ids: "ids must be a non-empty array." });
  }
  if (ids.length > MAX_BULK_DELETE) {
    throw new AdminQueryValidationError({
      ids: `ids must not contain more than ${MAX_BULK_DELETE} entries.`
    });
  }
  ids.forEach((id) => parseObjectId(id, "ids"));
  return Array.from(new Set(ids.map(String)));
};

const bulkDeleteMedia = async (payload, req) => {
  const ids = parseBulkDeleteIds(payload);
  const docs = await Media.find({ _id: { $in: ids } }).select("_id publicId folder").lean();
  if (!docs.length) return { data: { deleted: 0, failed: 0, mediaCleanupSucceeded: true } };

  // Not deleteMultipleFromCloudinary: it is Promise.all and rejects on the first
  // failure, which would discard every destroy that did succeed.
  const outcomes = await Promise.allSettled(docs.map((doc) => resolveCleanupOutcome({
    publicId: doc.publicId,
    destroy: destroyCloudinaryImage
  })));
  const failed = outcomes.filter((outcome) => outcome.status !== "fulfilled" || !outcome.value).length;

  const result = await Media.deleteMany({ _id: { $in: docs.map((doc) => doc._id) } });
  const mediaCleanupSucceeded = failed === 0;

  await recordActivity({
    req,
    action: "media.bulk_deleted",
    targetType: "media",
    targetId: "",
    severity: mediaCleanupSucceeded ? "info" : "warning",
    metadata: { deleted: result.deletedCount || 0, failed, mediaCleanupSucceeded }
  });

  return { data: { deleted: result.deletedCount || 0, failed, mediaCleanupSucceeded } };
};

const parseFolderRename = (payload) => {
  if (!isPlainObject(payload)) {
    throw new AdminQueryValidationError({ body: "Request body must be an object." });
  }
  assertKnownFields(payload, new Set(["from", "to"]), "body");

  const from = normalizeFolderPath(payload.from);
  const to = normalizeFolderPath(payload.to);
  if (from === ROOT_FOLDER) {
    throw new AdminQueryValidationError({ from: "The root folder cannot be renamed." });
  }
  if (from === to) {
    throw new AdminQueryValidationError({ to: "The new folder name must be different." });
  }
  if (to.startsWith(`${from}/`)) {
    throw new AdminQueryValidationError({ to: "A folder cannot be moved inside itself." });
  }
  return { from, to };
};

const renameMediaFolder = async (payload, req) => {
  const { from, to } = parseFolderRename(payload);

  const exact = await Media.updateMany({ folder: from }, { $set: { folder: to } });
  const descendants = await Media.distinct("folder", {
    folder: { $regex: `^${escapeRegex(`${from}/`)}` }
  });

  let matched = exact.matchedCount || 0;
  let modified = exact.modifiedCount || 0;

  if (descendants.length) {
    // One updateMany per distinct old path, with the new path built in JS, so
    // the rewrite stays deterministic and needs no pipeline update.
    const operations = descendants.map((oldPath) => ({
      updateMany: {
        filter: { folder: oldPath },
        update: { $set: { folder: `${to}${oldPath.slice(from.length)}` } }
      }
    }));
    const bulk = await Media.bulkWrite(operations);
    matched += bulk.matchedCount || 0;
    modified += bulk.modifiedCount || 0;
  }

  await recordActivity({
    req,
    action: "media.folder_renamed",
    targetType: "media",
    targetId: "",
    metadata: { from, to, matched, modified }
  });

  return { data: { matched, modified } };
};

module.exports = {
  listMedia,
  listMediaFolders,
  listMediaTags,
  registerMedia,
  updateMedia,
  deleteMedia,
  bulkDeleteMedia,
  renameMediaFolder,
  MediaAssetNotFoundError,
  _test: {
    MEDIA_LIBRARY_FOLDER_PREFIX,
    MEDIA_FORMATS,
    MEDIA_SORTS,
    MAX_BULK_DELETE,
    buildMediaListFilter,
    isPlainObject,
    normalizeFolderPath,
    normalizeTag,
    normalizeTags,
    parseAlt,
    parseBulkDeleteIds,
    parseFolderRename,
    parseMediaRegistration,
    parseMediaUpdate,
    parsePublicId,
    resolveCleanupOutcome,
    sanitizeFilename
  }
};
