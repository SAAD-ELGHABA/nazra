import React from "react";
import { LoaderCircle, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import StoreProductCard from "./StoreProductCard";

function ProductSkeleton({ view }) {
  return <div className={`animate-pulse overflow-hidden rounded-md border border-stone-200 bg-white ${view === "list" ? "grid min-h-[220px] grid-cols-[42%_1fr]" : ""}`}><div className={`${view === "list" ? "h-full" : "aspect-[4/3]"} bg-stone-200`} /><div className="space-y-3 p-4"><div className="h-3 w-16 bg-stone-200" /><div className="h-4 w-2/3 bg-stone-200" /><div className="h-3 w-1/3 bg-stone-200" /><div className="mt-7 h-10 w-full bg-stone-200" /></div></div>;
}

export default function ProductGrid({ products, view, loading, error, onRetry, onReset, isFavorite, onFavorite, onAdd }) {
  const { t } = useTranslation();
  const gridClass = view === "list" ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-2.5 md:gap-3 xl:grid-cols-3 min-[1360px]:!grid-cols-4";

  if (loading) return <div className={gridClass} aria-label={t("store.loading")} aria-busy="true">{Array.from({ length: view === "list" ? 6 : 8 }, (_, index) => <ProductSkeleton key={index} view={view} />)}<span className="sr-only"><LoaderCircle className="animate-spin" />{t("store.loading")}</span></div>;
  if (error) return <div className="flex min-h-[360px] flex-col items-center justify-center rounded-md border border-stone-200 bg-[#faf9f7] px-5 text-center"><h2 className="font-display text-xl font-semibold">{t("store.errorTitle")}</h2><p className="mt-2 text-sm text-stone-600">{t("store.errorCopy")}</p><button type="button" onClick={onRetry} className="mt-5 min-h-11 bg-black px-6 text-xs font-semibold text-white">{t("store.retry")}</button></div>;
  if (!products.length) return <div className="flex min-h-[360px] flex-col items-center justify-center rounded-md border border-stone-200 bg-[#faf9f7] px-5 text-center"><h2 className="font-display text-xl font-semibold">{t("store.emptyTitle")}</h2><p className="mt-2 max-w-md text-sm text-stone-600">{t("store.emptyCopy")}</p><button type="button" onClick={onReset} className="mt-5 inline-flex min-h-11 items-center gap-2 border border-black px-6 text-xs font-semibold"><RotateCcw size={14} />{t("store.reset")}</button></div>;

  return <div className={gridClass}>{products.map((product, index) => {
    const productId = product?._id || product?.id || product?.slug || `product-${index}`;
    return <StoreProductCard key={productId} product={product} view={view} favorite={isFavorite(productId)} onFavorite={onFavorite} onAdd={onAdd} />;
  })}</div>;
}
