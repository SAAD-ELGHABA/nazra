import React, { useEffect, useState } from "react";
import { Glasses, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { normalizeSwatch } from "./storeUtils";

const DEFAULT_GENDERS = [
  { value: "Men", translation: "men" },
  { value: "Women", translation: "women" },
];

function FilterSection({ title, children }) {
  return (
    <fieldset className="border-t border-stone-200 px-4 py-4 first:border-0">
      <legend className="mb-3 w-full pt-4 text-[10px] font-bold uppercase tracking-[.06em] first:pt-0">{title}</legend>
      {children}
    </fieldset>
  );
}

function FilterOption({ label, count, checked, onChange, icon }) {
  return (
    <label className="flex min-h-8 cursor-pointer items-center gap-2 text-xs text-stone-700">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-3.5 w-3.5 rounded-none accent-black" />
      {icon && <Glasses size={15} strokeWidth={1.25} aria-hidden="true" />}
      <span className="flex-1">{label}</span>
      {Number.isFinite(count) && count > 0 && <span className="tabular-nums text-stone-500">{count}</span>}
    </label>
  );
}

export default function FiltersSidebar({ filters, facets, total, onChange, onReset, idPrefix = "store", showHeader = true }) {
  const { t } = useTranslation();
  const [showAllColors, setShowAllColors] = useState(false);
  const [priceDraft, setPriceDraft] = useState({ minPrice: filters.minPrice, maxPrice: filters.maxPrice });

  useEffect(() => setPriceDraft({ minPrice: filters.minPrice, maxPrice: filters.maxPrice }), [filters.minPrice, filters.maxPrice]);

  const toggleArrayValue = (key, value) => {
    const values = filters[key];
    onChange({ ...filters, [key]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value] });
  };
  const commitPrice = () => {
    let minPrice = priceDraft.minPrice === "" ? "" : `${Math.max(0, Number(priceDraft.minPrice) || 0)}`;
    let maxPrice = priceDraft.maxPrice === "" ? "" : `${Math.max(0, Number(priceDraft.maxPrice) || 0)}`;
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) [minPrice, maxPrice] = [maxPrice, minPrice];
    const next = { minPrice, maxPrice };
    setPriceDraft(next);
    if (next.minPrice !== filters.minPrice || next.maxPrice !== filters.maxPrice) onChange({ ...filters, ...next });
  };
  const genderOptions = facets.genders.length
    ? facets.genders
    : DEFAULT_GENDERS.map((option) => ({ ...option, label: t(`store.${option.translation}`), count: 0 }));
  const visibleColors = showAllColors ? facets.colors : facets.colors.slice(0, 8);

  return (
    <div className="overflow-hidden rounded-md border border-stone-200 bg-[#faf9f7]">
      {showHeader && <div className="flex h-12 items-center justify-between px-4"><h2 className="text-[11px] font-bold uppercase tracking-[.05em]">{t("store.filters")}</h2><button type="button" onClick={onReset} className="inline-flex min-h-9 items-center gap-1 text-[10px] text-stone-600 hover:text-black"><span>{t("store.reset")}</span><RotateCcw size={13} aria-hidden="true" /></button></div>}

      <FilterSection title={t("store.categories")}>
        <button type="button" onClick={() => onChange({ ...filters, gender: "" })} className={`mb-1 flex min-h-8 w-full items-center px-2 text-start text-xs ${!filters.gender ? "bg-[#eee7dc] font-medium text-black" : "text-stone-700 hover:bg-stone-100"}`}>
          <span className="flex-1">{t("store.allModels")}</span><span className="tabular-nums text-stone-500">{total}</span>
        </button>
        {genderOptions.map((option) => <FilterOption key={option.value} label={option.label || option.value} count={option.count} checked={filters.gender.toLowerCase() === option.value.toLowerCase()} onChange={() => onChange({ ...filters, gender: filters.gender.toLowerCase() === option.value.toLowerCase() ? "" : option.value })} />)}
      </FilterSection>

      {facets.collections.length > 0 && <FilterSection title={t("store.collections")}>{facets.collections.map((option) => <FilterOption key={option.value} label={option.label} count={option.count} checked={filters.collections.includes(option.value)} onChange={() => toggleArrayValue("collections", option.value)} />)}</FilterSection>}

      {facets.shapes.length > 0 && <FilterSection title={t("store.shapes")}>{facets.shapes.map((option) => <FilterOption key={option.value} label={option.label} count={option.count} icon checked={filters.shapes.includes(option.value)} onChange={() => toggleArrayValue("shapes", option.value)} />)}</FilterSection>}

      {facets.colors.length > 0 && <FilterSection title={t("store.colors")}>
        <div className="flex flex-wrap gap-2.5">
          {visibleColors.map((option) => <button key={option.value} type="button" onClick={() => toggleArrayValue("colors", option.value)} className={`h-6 w-6 rounded-full border shadow-sm transition focus-visible:outline-offset-2 ${filters.colors.includes(option.value) ? "ring-2 ring-black ring-offset-2" : "border-stone-300 hover:scale-110"}`} style={{ backgroundColor: normalizeSwatch(option.color || option.value) }} aria-label={`${option.label}${option.count ? ` (${option.count})` : ""}`} aria-pressed={filters.colors.includes(option.value)} title={option.label} />)}
          {facets.colors.length > 8 && <button type="button" onClick={() => setShowAllColors((value) => !value)} className="min-h-6 px-1 text-[10px] font-medium">{t(showAllColors ? "store.fewer" : "store.more")}</button>}
        </div>
      </FilterSection>}

      <FilterSection title={t("store.price")}>
        <div className="grid grid-cols-2 gap-2">
          <label className="sr-only" htmlFor={`${idPrefix}-min-price`}>{t("store.minPrice")}</label>
          <input id={`${idPrefix}-min-price`} type="number" min={facets.price.min || 0} max={facets.price.max || undefined} value={priceDraft.minPrice} onChange={(event) => setPriceDraft((value) => ({ ...value, minPrice: event.target.value }))} onBlur={commitPrice} onKeyDown={(event) => event.key === "Enter" && commitPrice()} placeholder={`${facets.price.min || 0} DH`} className="min-h-10 w-full border border-stone-300 bg-white px-2 text-xs outline-none focus:border-black" />
          <label className="sr-only" htmlFor={`${idPrefix}-max-price`}>{t("store.maxPrice")}</label>
          <input id={`${idPrefix}-max-price`} type="number" min={facets.price.min || 0} max={facets.price.max || undefined} value={priceDraft.maxPrice} onChange={(event) => setPriceDraft((value) => ({ ...value, maxPrice: event.target.value }))} onBlur={commitPrice} onKeyDown={(event) => event.key === "Enter" && commitPrice()} placeholder={`${facets.price.max || 699} DH`} className="min-h-10 w-full border border-stone-300 bg-white px-2 text-xs outline-none focus:border-black" />
        </div>
        {(facets.price.min || facets.price.max) ? <div className="mt-3 flex justify-between text-[10px] tabular-nums text-stone-500"><span>{facets.price.min} DH</span><span>{facets.price.max} DH</span></div> : null}
      </FilterSection>

      <FilterSection title={t("store.protection")}>
        <FilterOption label={t("store.polarized")} checked={filters.polarized} onChange={() => onChange({ ...filters, polarized: !filters.polarized })} />
        <FilterOption label={t("store.uv400")} checked={filters.uv400} onChange={() => onChange({ ...filters, uv400: !filters.uv400 })} />
      </FilterSection>
    </div>
  );
}
