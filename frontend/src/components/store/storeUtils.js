export const DEFAULT_FILTERS = Object.freeze({
  gender: "",
  collections: [],
  shapes: [],
  colors: [],
  minPrice: "",
  maxPrice: "",
  polarized: false,
  uv400: false,
});

export const STORE_SORTS = Object.freeze([
  "best_selling",
  "newest",
  "price_asc",
  "price_desc",
  "top_rated",
  "discount_desc",
]);

export const STORE_LIMITS = Object.freeze([24, 48, 96]);

const unique = (values) => [...new Set(values)];

const SORT_ALIASES = Object.freeze({
  "best-sellers": "best_selling",
  "best-selling": "best_selling",
  bestsellers: "best_selling",
  "price-asc": "price_asc",
  "price-desc": "price_desc",
  "top-rated": "top_rated",
  discount: "discount_desc",
});

const asArray = (value) => {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return unique(values.flatMap((item) => `${item}`.split(",")).map((item) => item.trim()).filter(Boolean));
};

const getAllAliases = (searchParams, aliases) =>
  asArray(aliases.flatMap((key) => searchParams.getAll(key)));

const parseBoolean = (value) => ["1", "true", "yes"].includes(`${value || ""}`.toLowerCase());

const parsePrice = (value) => {
  if (value === null || value === "") return "";
  const normalized = `${value}`.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return "";
  return `${Number(normalized)}`;
};

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const filtersFromSearchParams = (searchParams) => ({
  gender: getAllAliases(searchParams, ["gender", "genders", "category", "categories"]).join(","),
  collections: getAllAliases(searchParams, ["collection", "collections"]),
  shapes: getAllAliases(searchParams, ["shape", "shapes", "type", "types"]),
  colors: getAllAliases(searchParams, ["colors", "color"]),
  minPrice: parsePrice(searchParams.get("min") ?? searchParams.get("minPrice")),
  maxPrice: parsePrice(searchParams.get("max") ?? searchParams.get("maxPrice")),
  polarized: parseBoolean(searchParams.get("polarized")),
  uv400: parseBoolean(searchParams.get("uv400")),
});

export const catalogStateFromSearchParams = (searchParams) => {
  const rawSort = (searchParams.get("sort") || searchParams.get("sortBy") || "best_selling").trim().toLowerCase();
  const requestedSort = SORT_ALIASES[rawSort] || rawSort;
  const requestedLimit = parsePositiveInteger(searchParams.get("limit") ?? searchParams.get("pageSize"), 24);

  return {
    search: (searchParams.get("search") ?? searchParams.get("q") ?? "").slice(0, 100),
    filters: filtersFromSearchParams(searchParams),
    sort: STORE_SORTS.includes(requestedSort) ? requestedSort : "best_selling",
    page: Math.min(parsePositiveInteger(searchParams.get("page"), 1), 1000000),
    limit: STORE_LIMITS.includes(requestedLimit) ? requestedLimit : 24,
    view: searchParams.get("view") === "list" ? "list" : "grid",
  };
};

const CATALOG_PARAM_KEYS = Object.freeze([
  "gender", "genders", "category", "categories",
  "collection", "collections", "shape", "shapes", "type", "types",
  "colors", "color", "min", "minPrice", "max", "maxPrice",
  "polarized", "uv400", "search", "q", "sort", "sortBy",
  "page", "limit", "pageSize", "view",
]);

export const canonicalizeCatalogSearchParams = (searchParams) => {
  const state = catalogStateFromSearchParams(searchParams);
  const canonical = new URLSearchParams(searchParams);
  CATALOG_PARAM_KEYS.forEach((key) => canonical.delete(key));

  Object.entries(filtersToParams(state.filters)).forEach(([key, value]) => canonical.set(key, value));
  if (state.search.trim()) canonical.set("search", state.search.trim());
  if (state.sort !== "best_selling") canonical.set("sort", state.sort);
  if (state.page > 1) canonical.set("page", `${state.page}`);
  if (state.limit !== 24) canonical.set("limit", `${state.limit}`);
  if (state.view === "list") canonical.set("view", "list");
  return canonical;
};

export const countActiveFilters = (filters) =>
  (filters.gender ? 1 : 0) +
  filters.collections.length +
  filters.shapes.length +
  filters.colors.length +
  (filters.minPrice !== "" ? 1 : 0) +
  (filters.maxPrice !== "" ? 1 : 0) +
  (filters.polarized ? 1 : 0) +
  (filters.uv400 ? 1 : 0);

export const filtersToParams = (filters) => {
  const params = {};
  if (filters.gender) params.gender = filters.gender;
  if (filters.collections.length) params.collection = filters.collections.join(",");
  if (filters.shapes.length) params.shape = filters.shapes.join(",");
  if (filters.colors.length) params.colors = filters.colors.join(",");
  if (filters.minPrice !== "") params.min = filters.minPrice;
  if (filters.maxPrice !== "") params.max = filters.maxPrice;
  if (filters.polarized) params.polarized = "true";
  if (filters.uv400) params.uv400 = "true";
  return params;
};

const optionValue = (option) => option?.value ?? option?.name ?? option?.label ?? option?._id ?? "";
const optionCount = (option) => Number(option?.count ?? option?.total ?? 0);

const COLOR_ALIASES = Object.freeze({
  noir: "#171717", black: "#171717", أسود: "#171717",
  blanc: "#f8f7f3", white: "#f8f7f3", أبيض: "#f8f7f3",
  marron: "#795548", brown: "#795548", بني: "#795548",
  beige: "#d8c5a5", بيج: "#d8c5a5",
  gris: "#8b8b88", grey: "#8b8b88", gray: "#8b8b88", رمادي: "#8b8b88",
  bleu: "#315b89", blue: "#315b89", أزرق: "#315b89",
  vert: "#497258", green: "#497258", أخضر: "#497258",
  rouge: "#a84338", red: "#a84338", أحمر: "#a84338",
  rose: "#d98f9d", pink: "#d98f9d", وردي: "#d98f9d",
  orange: "#cf7430", برتقالي: "#cf7430",
  jaune: "#d6ae38", yellow: "#d6ae38", أصفر: "#d6ae38",
  transparent: "transparent",
});

export const normalizeSwatch = (value, fallback = "#d6d3d1") => {
  const candidate = typeof value === "string" ? value.trim() : "";
  if (!candidate) return fallback;
  const aliased = COLOR_ALIASES[candidate.toLowerCase()];
  if (aliased) return aliased;
  if (/^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(candidate)) return candidate;
  if (/^(?:rgb|hsl)a?\([\d\s.,%+-]+\)$/i.test(candidate)) return candidate;
  if (typeof CSS !== "undefined" && CSS.supports?.("color", candidate)) return candidate;
  return fallback;
};

export const normalizeOptions = (options = []) =>
  (Array.isArray(options) ? options : [])
    .map((option) => {
      if (typeof option === "string") return { value: option, label: option, count: 0 };
      const value = `${optionValue(option)}`;
      const rawSwatch = option?.swatch ?? option?.hex ?? option?.color ?? option?.colour;
      return {
        value,
        label: option?.label || value,
        count: optionCount(option),
        ...(rawSwatch ? { color: normalizeSwatch(rawSwatch) } : {}),
      };
    })
    .filter((option) => option.value);

const getFacet = (filters, ...keys) => {
  for (const key of keys) if (filters?.[key]) return normalizeOptions(filters[key]);
  return [];
};

export const normalizeStoreResponse = (data, requestedPage = 1, requestedLimit = 24) => {
  const products = Array.isArray(data?.products) ? data.products : [];
  const pagination = data?.pagination || {};
  const total = Number(pagination.total ?? pagination.totalCount ?? pagination.totalItems ?? data?.total ?? data?.count ?? products.length) || 0;
  const page = Number(pagination.page ?? pagination.currentPage ?? requestedPage) || 1;
  const limit = Number(pagination.limit ?? pagination.pageSize ?? requestedLimit) || 24;
  const totalPages = Math.max(0, Number(pagination.totalPages ?? Math.ceil(total / limit)) || 0);
  const rawFilters = data?.filters || data?.facets || {};
  const price = rawFilters.price || rawFilters.priceRange || {};

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: pagination.hasNext ?? pagination.hasNextPage ?? page < totalPages,
      hasPrev: pagination.hasPrev ?? pagination.hasPreviousPage ?? page > 1,
    },
    filtersUnavailable: rawFilters.unavailable === true,
    filters: {
      genders: getFacet(rawFilters, "genders", "gender", "categories"),
      collections: getFacet(rawFilters, "collections", "collection"),
      shapes: getFacet(rawFilters, "shapes", "shape", "types"),
      colors: getFacet(rawFilters, "colors", "color"),
      price: {
        min: Number(price.min ?? price.minPrice ?? rawFilters.minPrice) || 0,
        max: Number(price.max ?? price.maxPrice ?? rawFilters.maxPrice) || 0,
      },
    },
  };
};

export const getProductImages = (product, colorIndex = 0) => {
  const variants = Array.isArray(product?.colors) ? product.colors : [];
  const images = variants[colorIndex]?.images || product?.images || product?.gallery || [];
  return (Array.isArray(images) ? images : [images])
    .map((image) => typeof image === "string" ? image : image?.url)
    .filter(Boolean);
};

export const formatPrice = (value, language = "fr") => {
  const locale = language?.startsWith("ar") ? "ar-MA" : language?.startsWith("en") ? "en-MA" : "fr-MA";
  return `${Number(value || 0).toLocaleString(locale, { maximumFractionDigits: 2 })} DH`;
};

export const getPaginationItems = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  return sorted.flatMap((page, index) => index && page - sorted[index - 1] > 1 ? ["ellipsis", page] : [page]);
};
