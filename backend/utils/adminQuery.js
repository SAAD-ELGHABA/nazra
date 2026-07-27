const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;
const MAX_SEARCH_LENGTH = 150;

class AdminQueryValidationError extends Error {
  constructor(errors) {
    super("Invalid admin query");
    this.name = "AdminQueryValidationError";
    this.errors = errors;
  }
}

const parseInteger = (value, name, fallback, { minimum = 1, maximum } = {}) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "string" || !/^\d+$/.test(value.trim())) {
    throw new AdminQueryValidationError({ [name]: `${name} must be a positive integer.` });
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || (maximum && parsed > maximum)) {
    throw new AdminQueryValidationError({
      [name]: `${name} must be between ${minimum} and ${maximum || Number.MAX_SAFE_INTEGER}.`
    });
  }
  return parsed;
};

const parsePagination = (query = {}, options = {}) => ({
  page: parseInteger(query.page, "page", options.defaultPage || DEFAULT_PAGE),
  limit: parseInteger(query.limit, "limit", options.defaultLimit || DEFAULT_LIMIT, {
    maximum: options.maxLimit || MAX_LIMIT
  })
});

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeSearch = (value, { maximum = MAX_SEARCH_LENGTH } = {}) => {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value !== "string") {
    throw new AdminQueryValidationError({ q: "q must be a string." });
  }
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length > maximum) {
    throw new AdminQueryValidationError({ q: `q must not exceed ${maximum} characters.` });
  }
  return normalized;
};

const parseSort = (value, allowed, fallback) => {
  const normalized = value === undefined || value === null || value === ""
    ? fallback
    : String(value).trim();
  if (!allowed.has(normalized)) {
    throw new AdminQueryValidationError({
      sort: `sort must be one of: ${Array.from(allowed).join(", ")}.`
    });
  }
  const descending = normalized.startsWith("-");
  const field = descending ? normalized.slice(1) : normalized;
  return { value: normalized, field, direction: descending ? -1 : 1 };
};

const parseEnum = (value, name, allowed, { optional = true } = {}) => {
  if (value === undefined || value === null || value === "") {
    if (optional) return undefined;
    throw new AdminQueryValidationError({ [name]: `${name} is required.` });
  }
  const normalized = String(value).trim().toLowerCase();
  if (!allowed.has(normalized)) {
    throw new AdminQueryValidationError({
      [name]: `${name} must be one of: ${Array.from(allowed).join(", ")}.`
    });
  }
  return normalized;
};

const buildAdminListMeta = ({ page, limit, total, sort, filters = {} }) => {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1 && totalPages > 0,
    sort,
    filters
  };
};

const sendAdminValidationError = (res, error) => res.status(400).json({
  success: false,
  code: "VALIDATION_ERROR",
  message: "The query parameters are invalid.",
  errors: error.errors
});

module.exports = {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  MAX_SEARCH_LENGTH,
  AdminQueryValidationError,
  parsePagination,
  parseSort,
  parseEnum,
  normalizeSearch,
  escapeRegex,
  buildAdminListMeta,
  sendAdminValidationError
};
