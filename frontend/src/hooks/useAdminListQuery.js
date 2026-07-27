import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export function useAdminListQuery({
  defaults = {},
  allowedFilters = [],
} = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filtersKey = allowedFilters.join("|");
  const defaultsKey = JSON.stringify(defaults);

  const state = useMemo(() => {
    const next = {
      page: parsePositiveInt(searchParams.get("page"), defaults.page ?? 1),
      limit: parsePositiveInt(searchParams.get("limit"), defaults.limit ?? 25),
      search: searchParams.get("q") ?? defaults.search ?? "",
      sort: searchParams.get("sort") ?? defaults.sort ?? "",
    };

    filtersKey.split("|").filter(Boolean).forEach((key) => {
      next[key] = searchParams.get(key) ?? defaults[key] ?? "";
    });

    return next;
  // The serialized keys keep callers from triggering recalculation with inline
  // arrays/objects while still reacting to actual configuration changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, defaultsKey, searchParams]);

  const setQuery = useCallback(
    (updates, { replace = false } = {}) => {
      setSearchParams(
        (previous) => {
          const params = new URLSearchParams(previous);

          Object.entries(updates).forEach(([key, value]) => {
            const paramKey = key === "search" ? "q" : key;
            if (value === undefined || value === null || value === "") {
              params.delete(paramKey);
            } else {
              params.set(paramKey, String(value));
            }
          });

          const changesListShape = Object.keys(updates).some(
            (key) => !["page", "limit"].includes(key),
          );
          if (changesListShape) {
            params.delete("page");
          }

          return params;
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (defaults.limit && defaults.limit !== 25) {
      params.set("limit", String(defaults.limit));
    }
    setSearchParams(params, { replace: true });
  }, [defaults.limit, setSearchParams]);

  return { ...state, setQuery, clearFilters, searchParams };
}

export function paginateAdminItems(items = [], page = 1, limit = 25) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * limit;

  return {
    items: items.slice(startIndex, startIndex + limit),
    page: safePage,
    limit,
    total,
    totalPages,
    start: total ? startIndex + 1 : 0,
    end: Math.min(startIndex + limit, total),
  };
}

export default useAdminListQuery;
