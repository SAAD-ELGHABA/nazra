import React, { useEffect, useMemo, useState } from "react";
import { Heart, Minus, Plus, ShieldCheck, ShoppingBag, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatMoney, getColorId, getLensId, getVariantPrice, normalizeSwatch } from "./productUtils";

const badgeLabel = (badge, t) => {
  const value = typeof badge === "string" ? badge : badge?.name || badge?.label || "";
  if (/best/i.test(value)) return t("productDetails.bestSeller");
  if (/new|nouveau/i.test(value)) return t("productDetails.new");
  return value;
};

const lensIdentity = (lens) => `${lens?.type || lens?.name || "lens"}:${lens?.category ?? ""}`.toLowerCase();

export default function ProductInfo({ product, color, lens, variant, onColorChange, onLensChange, onAdd, onBuyNow, favorite, onFavorite, reviewsRef }) {
  const { t, i18n } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const price = getVariantPrice(product, color, variant);
  const rating = Number(product?.rating?.average || 0);
  const reviewCount = Number(product?.rating?.count || 0);
  const available = Boolean(color && variant && variant.available !== false);
  const stockValue = variant?.stock;
  const numericStock = stockValue !== null && stockValue !== undefined && stockValue !== "" && Number.isFinite(Number(stockValue))
    ? Number(stockValue)
    : null;
  const maxQuantity = numericStock === null ? 100 : Math.max(1, numericStock);
  const language = i18n.resolvedLanguage || i18n.language;
  const allLensOptions = useMemo(() => {
    const seen = new Map();
    for (const currentColor of product?.colors || []) {
      for (const currentLens of currentColor?.lensOptions || []) {
        const key = lensIdentity(currentLens);
        if (!seen.has(key)) seen.set(key, currentLens);
      }
    }
    return [...seen.values()];
  }, [product]);

  useEffect(() => setQuantity(1), [color, lens]);

  const chooseLens = (candidate) => {
    const match = color?.lensOptions?.find((item) => lensIdentity(item) === lensIdentity(candidate));
    if (match?.active !== false && match?.available !== false) onLensChange(match);
  };
  const stockLabel = !available
    ? t("productDetails.soldOut")
    : variant?.stockStatus === "low_stock" && numericStock !== null
      ? t("productDetails.lowStock", { count: numericStock })
      : t("productDetails.inStock");

  return (
    <section aria-labelledby="product-title" className="min-w-0 lg:pt-1">
      <h1 id="product-title" className="font-display text-[clamp(2.4rem,4vw,4.25rem)] font-semibold uppercase leading-[.9] tracking-[-.035em] text-[#171411]">{product.name}</h1>
      <button type="button" onClick={() => reviewsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })} className="mt-3 flex min-h-7 items-center gap-2 text-[11px] text-stone-600 hover:text-black">
        <span className="flex text-[#d98213]" aria-label={t("productDetails.ratingOutOf", { rating: rating.toFixed(1) })}>{[1, 2, 3, 4, 5].map((value) => <Star key={value} className={`h-3.5 w-3.5 ${rating >= value - .25 ? "fill-current" : ""}`} />)}</span>
        <span>{reviewCount ? `${rating.toFixed(1)} (${t("productDetails.reviews", { count: reviewCount })})` : t("productDetails.noReviewsShort")}</span>
      </button>

      <div className="mt-1.5 flex flex-wrap items-center gap-3">
        <strong className="text-[21px] font-semibold">{formatMoney(price.current, language)}</strong>
        {price.compareAt && <span className="text-xs text-stone-400 line-through">{formatMoney(price.compareAt, language)}</span>}
        {price.discount > 0 && <span className="rounded-[2px] bg-[#be6949] px-2 py-1 text-[10px] font-semibold text-white">-{price.discount}%</span>}
      </div>

      {product.shortDescriptionText && <p className="mt-4 max-w-xl text-[11px] leading-[1.65] text-stone-700">{product.shortDescriptionText}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {product.features?.polarized && <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#eee9df] px-3 py-1.5 text-[9px]"><ShieldCheck className="h-3 w-3" />{t("productDetails.polarized")}</span>}
        {product.features?.uv400 && <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#eee9df] px-3 py-1.5 text-[9px]"><ShieldCheck className="h-3 w-3" />{t("productDetails.uv400")}</span>}
      </div>

      {(product.colors || []).length > 0 && <fieldset className="mt-5">
        <legend className="text-[10px] font-medium">{t("productDetails.color")} <strong>{color?.name}</strong></legend>
        <div className="mt-2.5 flex flex-wrap gap-3">
          {product.colors.filter((item) => item?.active !== false).map((item) => {
            const selected = getColorId(item) === getColorId(color);
            const disabled = item.available === false;
            return <button key={getColorId(item) || item.name} type="button" onClick={() => onColorChange(item)} disabled={disabled} aria-pressed={selected} aria-label={`${item.name}${disabled ? `, ${t("productDetails.soldOut")}` : ""}`} className={`relative h-7 w-7 rounded-full border-2 border-white shadow-[0_0_0_1px_#c7c1b8] outline-none transition focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${selected ? "ring-2 ring-black ring-offset-2" : "hover:scale-105"} ${disabled ? "cursor-not-allowed opacity-35 after:absolute after:inset-x-0 after:top-1/2 after:h-px after:-rotate-45 after:bg-black" : ""}`} style={{ backgroundColor: normalizeSwatch(item.value || item.name) }} />;
          })}
        </div>
      </fieldset>}

      {allLensOptions.length > 0 && <fieldset className="mt-5">
        <legend className="text-[10px] font-semibold">{t("productDetails.lenses")}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {allLensOptions.map((option) => {
            const match = color?.lensOptions?.find((item) => lensIdentity(item) === lensIdentity(option));
            const selected = match && getLensId(match) === getLensId(lens);
            const disabled = !match || match.active === false || match.available === false;
            const name = option.name || option.type || t("productDetails.lenses");
            return <button key={lensIdentity(option)} type="button" onClick={() => chooseLens(option)} disabled={disabled} aria-pressed={Boolean(selected)} className={`min-h-10 rounded-[3px] border px-3.5 py-2 text-[9px] transition focus-visible:outline-2 focus-visible:outline-offset-2 ${selected ? "border-black bg-black text-white" : "border-stone-300 bg-white hover:border-black"} disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-300 disabled:line-through`}>{name}{option.category !== null && option.category !== undefined && !name.toLowerCase().includes("cat") ? ` (${t("productDetails.category", { value: option.category })})` : ""}</button>;
          })}
        </div>
      </fieldset>}

      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold">{t("productDetails.quantity")}</p>
          <div className="mt-2 grid h-10 grid-cols-[34px_36px_34px] overflow-hidden rounded-[3px] border border-stone-300">
            <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1} aria-label={t("productDetails.decrease")} className="grid place-items-center hover:bg-stone-50 disabled:text-stone-300"><Minus size={12} /></button>
            <output className="grid place-items-center border-x border-stone-200 text-xs" aria-live="polite">{quantity}</output>
            <button type="button" onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))} disabled={!available || quantity >= maxQuantity} aria-label={t("productDetails.increase")} className="grid place-items-center hover:bg-stone-50 disabled:text-stone-300"><Plus size={12} /></button>
          </div>
        </div>
        <p className={`mt-6 text-[10px] font-medium ${available ? variant?.stockStatus === "low_stock" ? "text-[#9a5d24]" : "text-emerald-700" : "text-red-700"}`} aria-live="polite">{stockLabel}</p>
      </div>

      <button type="button" disabled={!available} onClick={() => onAdd(quantity)} className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[3px] bg-[#0d0f0e] px-5 text-[10px] font-semibold uppercase tracking-wide text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"><ShoppingBag className="h-4 w-4" />{t(available ? "productDetails.add" : "productDetails.soldOut")}</button>
      <button type="button" disabled={!available} onClick={() => onBuyNow(quantity)} className="mt-2 min-h-11 w-full rounded-[3px] bg-[#e8c795] px-5 text-[10px] font-semibold uppercase tracking-wide text-[#241a10] transition hover:bg-[#dcb77e] disabled:cursor-not-allowed disabled:bg-stone-200">{t("productDetails.buyNow")}</button>
      <button type="button" onClick={onFavorite} aria-pressed={favorite} className="mt-2 flex min-h-9 items-center gap-2 text-[10px] text-stone-600 transition hover:text-black"><Heart className={`h-4 w-4 ${favorite ? "fill-black text-black" : ""}`} />{t(favorite ? "productDetails.favoriteRemove" : "productDetails.favoriteAdd")}</button>

      {(product.badges || []).length > 0 && <div className="sr-only">{product.badges.map((badge) => badgeLabel(badge, t)).join(", ")}</div>}
    </section>
  );
}
