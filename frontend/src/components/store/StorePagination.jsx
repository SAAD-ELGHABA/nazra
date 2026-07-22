import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getPaginationItems } from "./storeUtils";

export default function StorePagination({ page, totalPages, onPage }) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;
  const items = getPaginationItems(page, totalPages);
  return (
    <nav className="mt-7 flex items-center justify-center gap-1" aria-label="Pagination">
      <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 disabled:opacity-35" aria-label={t("store.previous")}><ChevronLeft size={17} className="rtl:rotate-180" /></button>
      {items.map((item, index) => item === "ellipsis" ? <span key={`ellipsis-${index}`} className="grid h-10 w-7 place-items-center text-xs" aria-hidden="true">…</span> : <button key={item} type="button" onClick={() => onPage(item)} className={`grid h-10 min-w-10 place-items-center rounded-md px-2 text-xs ${page === item ? "bg-[#eee9e1] font-semibold" : "hover:bg-stone-100"}`} aria-current={page === item ? "page" : undefined} aria-label={t("store.page", { page: item })}>{item}</button>)}
      <button type="button" disabled={page >= totalPages} onClick={() => onPage(page + 1)} className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 disabled:opacity-35" aria-label={t("store.next")}><ChevronRight size={17} className="rtl:rotate-180" /></button>
    </nav>
  );
}
