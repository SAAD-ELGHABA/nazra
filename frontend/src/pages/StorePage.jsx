import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { getStoreProducts } from "../api/api";
import TrustBenefits from "../components/home/TrustBenefits";
import FiltersSidebar from "../components/store/FiltersSidebar";
import MobileFiltersDrawer from "../components/store/MobileFiltersDrawer";
import ProductGrid from "../components/store/ProductGrid";
import ProductToolbar from "../components/store/ProductToolbar";
import StoreHero from "../components/store/StoreHero";
import StorePagination from "../components/store/StorePagination";
import {
  canonicalizeCatalogSearchParams,
  catalogStateFromSearchParams,
  DEFAULT_FILTERS,
  filtersToParams,
  normalizeStoreResponse,
} from "../components/store/storeUtils";
import { useCard } from "../context/CardContext";
import { useFavorites } from "../context/FavoritesContext";

const FILTER_PARAM_KEYS = [
  "gender", "genders", "category", "categories", "collection", "collections",
  "shape", "shapes", "type", "types",
  "colors", "color", "min", "minPrice", "max", "maxPrice", "polarized", "uv400",
];

const EMPTY_CATALOG = {
  products: [],
  pagination: { total: 0, page: 1, limit: 24, totalPages: 0, hasNext: false, hasPrev: false },
  filters: { genders: [], collections: [], shapes: [], colors: [], price: { min: 0, max: 0 } },
};

function FilterChip({ children, onRemove }) {
  const { t } = useTranslation();
  return (
    <button type="button" onClick={onRemove} className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 text-[10px] text-stone-700 transition hover:border-black hover:text-black">
      <span>{children}</span><X size={12} aria-hidden="true" /><span className="sr-only">{t("store.removeFilter")}</span>
    </button>
  );
}

function ActiveFilters({ search, filters, onSearch, onFilters, onClear }) {
  const { t } = useTranslation();
  const genderKey = /^(men|man|homme)$/i.test(filters.gender)
    ? "men"
    : /^(women|woman|femme)$/i.test(filters.gender) ? "women" : null;
  const hasFilters = search || filters.gender || filters.collections.length || filters.shapes.length || filters.colors.length || filters.minPrice || filters.maxPrice || filters.polarized || filters.uv400;
  if (!hasFilters) return null;

  const removeArrayValue = (key, value) => onFilters({ ...filters, [key]: filters[key].filter((item) => item !== value) });

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2" aria-label={t("store.activeFilterList")}>
      {search && <FilterChip onRemove={() => onSearch("")}>{t("store.searchChip", { value: search })}</FilterChip>}
      {filters.gender && <FilterChip onRemove={() => onFilters({ ...filters, gender: "" })}>{genderKey ? t(`store.${genderKey}`) : filters.gender}</FilterChip>}
      {filters.collections.map((value) => <FilterChip key={`collection-${value}`} onRemove={() => removeArrayValue("collections", value)}>{value}</FilterChip>)}
      {filters.shapes.map((value) => <FilterChip key={`shape-${value}`} onRemove={() => removeArrayValue("shapes", value)}>{value}</FilterChip>)}
      {filters.colors.map((value) => <FilterChip key={`color-${value}`} onRemove={() => removeArrayValue("colors", value)}>{value}</FilterChip>)}
      {filters.minPrice && <FilterChip onRemove={() => onFilters({ ...filters, minPrice: "" })}>{t("store.minimumChip", { value: filters.minPrice })}</FilterChip>}
      {filters.maxPrice && <FilterChip onRemove={() => onFilters({ ...filters, maxPrice: "" })}>{t("store.maximumChip", { value: filters.maxPrice })}</FilterChip>}
      {filters.polarized && <FilterChip onRemove={() => onFilters({ ...filters, polarized: false })}>{t("store.polarized")}</FilterChip>}
      {filters.uv400 && <FilterChip onRemove={() => onFilters({ ...filters, uv400: false })}>{t("store.uv400")}</FilterChip>}
      <button type="button" onClick={onClear} className="min-h-8 px-2 text-[10px] font-semibold underline underline-offset-4">{t("store.clearAll")}</button>
    </div>
  );
}

function StorePage() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const catalog = useMemo(() => catalogStateFromSearchParams(new URLSearchParams(queryString)), [queryString]);
  const [data, setData] = useState(EMPTY_CATALOG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const { addToCard } = useCard();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const setFilterParams = (params, filters) => {
    FILTER_PARAM_KEYS.forEach((key) => params.delete(key));
    Object.entries(filtersToParams(filters)).forEach(([key, value]) => params.set(key, value));
  };

  const updateFilters = (filters, replace = false) => {
    const params = new URLSearchParams(queryString);
    setFilterParams(params, filters);
    params.delete("page");
    setSearchParams(params, { replace });
  };

  const updateSearch = (value) => {
    const params = new URLSearchParams(queryString);
    const normalized = value.slice(0, 100);
    params.delete("q");
    if (normalized.trim()) params.set("search", normalized);
    else params.delete("search");
    params.delete("page");
    setSearchParams(params, { replace: true });
  };

  const updateOption = (key, value, defaultValue) => {
    const params = new URLSearchParams(queryString);
    if (key === "sort") params.delete("sortBy");
    if (key === "limit") params.delete("pageSize");
    if (value === defaultValue) params.delete(key);
    else params.set(key, `${value}`);
    if (key !== "view") params.delete("page");
    setSearchParams(params);
  };

  const resetAllFilters = () => {
    const params = new URLSearchParams(queryString);
    FILTER_PARAM_KEYS.forEach((key) => params.delete(key));
    params.delete("search");
    params.delete("q");
    params.delete("page");
    setSearchParams(params);
  };

  const updatePage = (page) => {
    const params = new URLSearchParams(queryString);
    if (page <= 1) params.delete("page");
    else params.set("page", `${page}`);
    setSearchParams(params);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  useEffect(() => {
    const canonicalParams = canonicalizeCatalogSearchParams(new URLSearchParams(queryString));
    if (canonicalParams.toString() !== queryString) {
      setSearchParams(canonicalParams, { replace: true });
    }
  }, [queryString, setSearchParams]);

  useEffect(() => {
    const controller = new AbortController();
    const currentParams = new URLSearchParams(queryString);
    const canonicalParams = canonicalizeCatalogSearchParams(currentParams);
    if (canonicalParams.toString() !== queryString) return undefined;

    const requested = catalogStateFromSearchParams(currentParams);
    const requestParams = {
      ...filtersToParams(requested.filters),
      ...(requested.search.trim() ? { search: requested.search.trim() } : {}),
      sort: requested.sort,
      page: requested.page,
      limit: requested.limit,
    };

    setLoading(true);
    setError(null);
    getStoreProducts(requestParams, controller.signal)
      .then((response) => {
        const normalized = normalizeStoreResponse(response?.data, requested.page, requested.limit);
        setData((current) => ({
          ...normalized,
          filters: normalized.filtersUnavailable ? current.filters : normalized.filters,
        }));
        if (normalized.pagination.totalPages > 0 && requested.page > normalized.pagination.totalPages) {
          const params = new URLSearchParams(queryString);
          params.set("page", `${normalized.pagination.totalPages}`);
          setSearchParams(params, { replace: true });
        }
      })
      .catch((requestError) => {
        if (requestError?.name !== "CanceledError" && requestError?.code !== "ERR_CANCELED") setError(requestError);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [queryString, retryKey, setSearchParams]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    const updates = [
      [document.querySelector('meta[name="description"]'), "content", t("store.seoDescription")],
      [document.querySelector('meta[property="og:title"]'), "content", t("store.seoTitle")],
      [document.querySelector('meta[property="og:description"]'), "content", t("store.seoDescription")],
      [document.querySelector('meta[property="og:url"]'), "content", "https://nazra.store/store/products"],
      [document.querySelector('meta[property="og:image"]'), "content", "https://nazra.store/assets/images/store/store-hero-desktop.webp"],
      [document.querySelector('link[rel="canonical"]'), "href", "https://nazra.store/store/products"],
    ].filter(([element]) => element);
    const previous = updates.map(([element, attribute]) => [element, attribute, element.getAttribute(attribute)]);
    document.title = t("store.seoTitle");
    updates.forEach(([element, attribute, value]) => element.setAttribute(attribute, value));
    return () => {
      document.title = previousTitle;
      previous.forEach(([element, attribute, value]) => element.setAttribute(attribute, value || ""));
    };
  }, [i18n.resolvedLanguage, t]);

  const toggleFavorite = (product) => {
    if (isFavorite(product?._id)) {
      removeFavorite(product._id);
      toast.success(t("store.favoriteRemoved"));
    } else {
      addFavorite(product);
      toast.success(t("store.favoriteAdded"));
    }
  };

  const addProduct = (product) => {
    addToCard(product);
    toast.success(t("store.added"));
  };

  const mobileFilters = (
    <MobileFiltersDrawer
      filters={catalog.filters}
      facets={data.filters}
      total={data.pagination.total}
      onApply={updateFilters}
    />
  );

  return (
    <div className="min-h-screen bg-white">
      <StoreHero />
      <section className="nazra-container py-7 sm:py-9 lg:py-10" aria-label={t("store.collectionLabel")}>
        <div className="grid items-start gap-6 lg:grid-cols-[235px_minmax(0,1fr)] lg:gap-7">
          <aside className="sticky top-24 hidden lg:block">
            <FiltersSidebar filters={catalog.filters} facets={data.filters} total={data.pagination.total} onChange={updateFilters} onReset={() => updateFilters({ ...DEFAULT_FILTERS, collections: [], shapes: [], colors: [] })} />
          </aside>
          <div className="min-w-0">
            <ProductToolbar
              total={data.pagination.total}
              search={catalog.search}
              sort={catalog.sort}
              limit={catalog.limit}
              view={catalog.view}
              onSearch={updateSearch}
              onSort={(value) => updateOption("sort", value, "best_selling")}
              onLimit={(value) => updateOption("limit", value, 24)}
              onView={(value) => updateOption("view", value, "grid")}
              filtersButton={mobileFilters}
            />
            <ActiveFilters search={catalog.search} filters={catalog.filters} onSearch={updateSearch} onFilters={updateFilters} onClear={resetAllFilters} />
            <ProductGrid products={data.products} view={catalog.view} loading={loading} error={error} onRetry={() => setRetryKey((value) => value + 1)} onReset={resetAllFilters} isFavorite={isFavorite} onFavorite={toggleFavorite} onAdd={addProduct} />
            {!loading && !error && <StorePagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPage={updatePage} />}
          </div>
        </div>
      </section>
      <TrustBenefits />
    </div>
  );
}

export default StorePage;
