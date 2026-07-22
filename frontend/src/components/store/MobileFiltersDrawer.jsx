import React, { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import FiltersSidebar from "./FiltersSidebar";
import { countActiveFilters, DEFAULT_FILTERS } from "./storeUtils";

export default function MobileFiltersDrawer({ filters, facets, total, onApply }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const closeButton = useRef(null);
  const panel = useRef(null);
  const trigger = useRef(null);
  const count = countActiveFilters(filters);

  useEffect(() => {
    if (!open) return undefined;
    const triggerElement = trigger.current;
    const previousOverflow = document.body.style.overflow;
    const desktopMedia = window.matchMedia("(min-width: 1024px)");
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const closeAtDesktop = (event) => {
      if (event.matches) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...(panel.current?.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])') || [])];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    desktopMedia.addEventListener("change", closeAtDesktop);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      desktopMedia.removeEventListener("change", closeAtDesktop);
      document.removeEventListener("keydown", onKeyDown);
      if (triggerElement?.isConnected && triggerElement.getClientRects().length > 0) {
        triggerElement.focus();
      }
    };
  }, [open]);

  const resetDraft = () => setDraft({ ...DEFAULT_FILTERS, collections: [], shapes: [], colors: [] });

  return (
    <>
      <button ref={trigger} type="button" onClick={() => { setDraft(filters); setOpen(true); }} className="inline-flex min-h-11 items-center gap-2 border border-stone-300 bg-white px-4 text-xs font-semibold lg:hidden" aria-haspopup="dialog" aria-expanded={open} aria-controls="mobile-store-filters">
        <SlidersHorizontal size={15} aria-hidden="true" /> {t("store.filters")}{count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-black px-1 text-[10px] text-white">{count}</span>}
      </button>
      {open && <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-labelledby="mobile-filters-title">
        <button type="button" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/45" aria-label={t("store.closeFilters")} />
        <div ref={panel} id="mobile-store-filters" className="absolute inset-y-0 end-0 flex w-[min(92vw,390px)] flex-col bg-white shadow-2xl">
          <header className="flex min-h-16 items-center justify-between border-b border-stone-200 px-5">
            <div><h2 id="mobile-filters-title" className="font-display text-lg font-semibold">{t("store.filters")}</h2>{countActiveFilters(draft) > 0 && <p className="text-[10px] text-stone-500">{t("store.activeFilters", { count: countActiveFilters(draft) })}</p>}</div>
            <button ref={closeButton} type="button" onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center" aria-label={t("store.closeFilters")}><X size={21} /></button>
          </header>
          <div className="flex-1 overflow-y-auto p-4"><FiltersSidebar filters={draft} facets={facets} total={total} onChange={setDraft} onReset={resetDraft} idPrefix="mobile" showHeader={false} /></div>
          <footer className="grid grid-cols-2 gap-3 border-t border-stone-200 bg-white p-4">
            <button type="button" onClick={resetDraft} className="min-h-12 border border-black text-xs font-semibold">{t("store.reset")}</button>
            <button type="button" onClick={() => { onApply(draft); setOpen(false); }} className="min-h-12 bg-black text-xs font-semibold text-white">{t("store.apply")}</button>
          </footer>
        </div>
      </div>}
    </>
  );
}
