import React, { useEffect, useRef, useState } from "react";
import { LayoutGrid, List, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { STORE_LIMITS, STORE_SORTS } from "./storeUtils";

export default function ProductToolbar({ total, search, sort, limit, view, onSearch, onSort, onLimit, onView, filtersButton }) {
  const { t } = useTranslation();
  const [searchDraft, setSearchDraft] = useState(search);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  useEffect(() => {
    if (searchDraft === search) return undefined;
    const timer = window.setTimeout(() => onSearchRef.current(searchDraft), 300);
    return () => window.clearTimeout(timer);
  }, [search, searchDraft]);

  const clearSearch = () => {
    setSearchDraft("");
    onSearchRef.current("");
  };

  return (
    <div className="mb-4 border-b border-stone-200 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium tabular-nums text-stone-700" aria-live="polite">{t("store.results", { count: total })}</p>
        <div className="hidden flex-wrap items-center justify-end gap-2 sm:flex">
          <label className="relative block min-w-[190px] max-w-[240px] flex-1">
            <span className="sr-only">{t("store.search")}</span>
            <Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-stone-500" aria-hidden="true" />
            <input type="search" value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder={t("store.searchPlaceholder")} className="h-10 w-full border border-stone-300 bg-white ps-9 pe-8 text-[11px] outline-none focus:border-black" />
            {searchDraft && <button type="button" onClick={clearSearch} className="absolute end-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center" aria-label={t("store.clearSearch")}><X size={14} /></button>}
          </label>
          <label htmlFor="store-sort" className="text-[10px] text-stone-600">{t("store.sortBy")} :</label>
          <select id="store-sort" value={sort} onChange={(event) => onSort(event.target.value)} className="min-h-10 min-w-[180px] border border-stone-300 bg-white px-3 text-[11px] outline-none focus:border-black">
            {STORE_SORTS.map((option) => <option key={option} value={option}>{t(`store.sort.${option}`)}</option>)}
          </select>
          <span className="ms-3 text-[10px] text-stone-600">{t("store.show")} :</span>
          {STORE_LIMITS.map((size) => <button key={size} type="button" onClick={() => onLimit(size)} className={`grid h-10 min-w-10 place-items-center text-[11px] ${limit === size ? "bg-[#f0ece6] font-semibold" : "hover:bg-stone-100"}`} aria-pressed={limit === size}>{size}</button>)}
          <div className="ms-2 flex rounded-sm border border-stone-200">
            <button type="button" onClick={() => onView("grid")} className={`grid h-10 w-10 place-items-center ${view === "grid" ? "bg-[#f0ece6]" : "hover:bg-stone-100"}`} aria-label={t("store.gridView")} aria-pressed={view === "grid"}><LayoutGrid size={17} /></button>
            <button type="button" onClick={() => onView("list")} className={`grid h-10 w-10 place-items-center ${view === "list" ? "bg-[#f0ece6]" : "hover:bg-stone-100"}`} aria-label={t("store.listView")} aria-pressed={view === "list"}><List size={18} /></button>
          </div>
        </div>
      </div>
      <label className="relative mt-3 block sm:hidden">
        <span className="sr-only">{t("store.search")}</span>
        <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-stone-500" aria-hidden="true" />
        <input type="search" value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder={t("store.searchPlaceholder")} className="h-11 w-full border border-stone-300 bg-white ps-10 pe-10 text-xs outline-none focus:border-black" />
        {searchDraft && <button type="button" onClick={clearSearch} className="absolute end-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center" aria-label={t("store.clearSearch")}><X size={15} /></button>}
      </label>
      <div className="mt-3 flex items-center gap-2 lg:hidden">
        {filtersButton}
        <div className="contents sm:hidden">
          <label htmlFor="store-sort-mobile" className="sr-only">{t("store.sortBy")}</label>
          <select id="store-sort-mobile" value={sort} onChange={(event) => onSort(event.target.value)} className="min-h-11 min-w-0 flex-1 border border-stone-300 bg-white px-3 text-xs outline-none focus:border-black">
            {STORE_SORTS.map((option) => <option key={option} value={option}>{t(`store.sort.${option}`)}</option>)}
          </select>
          <button type="button" onClick={() => onView(view === "grid" ? "list" : "grid")} className="grid h-11 w-11 shrink-0 place-items-center border border-stone-300 bg-white" aria-label={t(view === "grid" ? "store.listView" : "store.gridView")}>{view === "grid" ? <List size={18} /> : <LayoutGrid size={17} />}</button>
        </div>
      </div>
    </div>
  );
}
