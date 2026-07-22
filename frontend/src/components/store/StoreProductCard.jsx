import React, { useState } from "react";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatPrice, getProductImages, normalizeSwatch } from "./storeUtils";

const badgeNames = (product) => (Array.isArray(product?.badges) ? product.badges : [])
  .map((badge) => typeof badge === "string" ? badge : badge?.name || badge?.label)
  .filter(Boolean);

export default function StoreProductCard({ product, view, favorite, onFavorite, onAdd }) {
  const { t, i18n } = useTranslation();
  const variants = Array.isArray(product?.colors) ? product.colors : [];
  const variantKey = (variant, index) => variant?._id ? `${variant._id}` : variant?.name || variant?.value ? `${variant?.name || ""}:${variant?.value || ""}` : `${index}`;
  const [selectedVariant, setSelectedVariant] = useState(() => variantKey(variants[0], 0));
  const colorIndex = Math.max(0, variants.findIndex((variant, index) => variantKey(variant, index) === selectedVariant));
  const images = getProductImages(product, colorIndex);
  const primaryImage = images[0] || "/fall-back-sunglasses-image.webp";
  const secondaryImage = images[1];
  const salePrice = Number(product?.sale_price ?? product?.price ?? 0);
  const compareAtPrice = Number(product?.compareAtPrice ?? product?.original_price ?? product?.oldPrice ?? 0);
  const hasDiscount = compareAtPrice > salePrice && salePrice >= 0;
  const discount = hasDiscount ? Math.round(((compareAtPrice - salePrice) / compareAtPrice) * 100) : 0;
  const rating = Number(product?.ratingAverage ?? product?.averageRating ?? product?.rating ?? 0);
  const reviewCount = Number(product?.reviewCount ?? product?.reviewsCount ?? 0);
  const stockValue = product?.stock ?? product?.inventory;
  const soldOut = product?.stockStatus === "out_of_stock" || product?.inStock === false || product?.isInStock === false || (stockValue != null && Number(stockValue) <= 0);
  const names = badgeNames(product).map((badge) => badge.toLowerCase());
  const topBadge = product?.isBestSeller || product?.bestSeller || names.some((badge) => badge.includes("best"))
    ? t("store.bestSeller")
    : product?.isNew || names.some((badge) => badge.includes("new") || badge.includes("nouveau")) ? t("store.new") : null;
  const polarized = product?.polarized === true || `${product?.type || ""}`.toLowerCase().includes("polar");
  const uv400 = product?.uv400 === true || `${product?.protection || ""}`.toLowerCase().includes("uv400");
  const selectedColor = variants[colorIndex];
  const cartProduct = { ...product, colors: selectedColor ? [selectedColor] : [], quantiy: 1 };
  const productPath = product?.slug ? `/product/${product.slug}` : "/store/products";
  const language = i18n.resolvedLanguage?.split("-")[0] || "fr";
  const description = typeof product?.description === "string" ? product.description : product?.description?.[language] || product?.description?.fr || product?.description?.en;

  return (
    <article className={`group overflow-hidden rounded-md border border-stone-200 bg-white transition hover:border-stone-400 ${view === "list" ? "grid grid-cols-[42%_1fr] sm:grid-cols-[230px_1fr]" : "flex h-full flex-col"}`}>
      <div className="relative overflow-hidden bg-[#f4f0ea]">
        <Link to={productPath} className={`block overflow-hidden ${view === "list" ? "h-full min-h-[190px]" : "aspect-[4/3]"}`}>
          <img src={primaryImage} alt={product?.name || "NAZRA"} width="520" height="390" loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/fall-back-sunglasses-image.webp"; }} className={`h-full w-full object-cover transition duration-500 ${secondaryImage ? "group-hover:opacity-0" : "group-hover:scale-[1.035]"}`} />
          {secondaryImage && <img src={secondaryImage} alt="" width="520" height="390" loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = primaryImage; }} className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:scale-[1.035] group-hover:opacity-100" />}
        </Link>
        {topBadge && <span className="absolute start-3 top-3 rounded-full bg-[#eee3d1] px-2.5 py-1 text-[8px] font-bold uppercase tracking-wide">{topBadge}</span>}
        {!topBadge && hasDiscount && <span className="absolute start-3 top-3 rounded-full bg-[#f4ded5] px-2.5 py-1 text-[9px] font-bold text-[#9a412c]">-{discount}%</span>}
        <button type="button" onClick={() => onFavorite(product)} className="absolute end-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-white/80 transition hover:bg-white" aria-label={t(favorite ? "store.removeFavorite" : "store.favorite")} aria-pressed={favorite}><Heart size={17} className={favorite ? "fill-black" : ""} /></button>
      </div>

      <div className={`flex flex-1 flex-col ${view === "list" ? "p-4 sm:p-5" : "p-3"}`}>
        <div className="flex min-h-5 items-center gap-1.5 text-[8px] text-stone-700">
          {polarized && <span className="rounded-sm bg-[#f1ede6] px-2 py-1">↗ {t("store.polarized")}</span>}
          {uv400 && <span className="rounded-sm bg-[#f1ede6] px-2 py-1">↗ {t("store.uv400")}</span>}
        </div>
        <div className="mt-1.5 flex items-start justify-between gap-2">
          <Link to={productPath} className="font-display text-[13px] font-bold uppercase tracking-[.05em] hover:underline sm:text-sm">{product?.name}</Link>
          {variants.length > 0 && <div className="flex shrink-0 gap-1 pt-1">{variants.slice(0, 4).map((color, index) => {
            const key = variantKey(color, index);
            return <button key={key} type="button" onClick={() => setSelectedVariant(key)} className={`h-3.5 w-3.5 rounded-full border border-white shadow-[0_0_0_1px_#d6d3d1] ${index === colorIndex ? "ring-1 ring-black ring-offset-1" : ""}`} style={{ backgroundColor: normalizeSwatch(color?.value || color?.name) }} aria-label={color?.name || `${index + 1}`} aria-pressed={index === colorIndex} />;
          })}</div>}
        </div>
        {view === "list" && description && <p className="mt-2 line-clamp-2 max-w-2xl text-xs leading-5 text-stone-600">{description}</p>}
        {reviewCount > 0 && <div className="mt-1 flex items-center gap-1 text-[10px] text-stone-500"><span className="flex text-[#ca7b16]" aria-label={`${rating} / 5`}>{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={10} className={rating >= star - .25 ? "fill-current" : ""} />)}</span><span>{rating.toFixed(1)} ({reviewCount})</span></div>}
        <div className="mt-2 flex flex-wrap items-baseline gap-2 text-[11px]"><strong className="text-sm">{formatPrice(salePrice, i18n.language)}</strong>{hasDiscount && <><span className="text-stone-400 line-through">{formatPrice(compareAtPrice, i18n.language)}</span><span className="font-semibold text-[#b14b31]">-{discount}%</span></>}</div>
        <button type="button" disabled={soldOut} onClick={() => onAdd(cartProduct)} className="mt-auto flex min-h-10 w-full items-center justify-center gap-2 rounded-sm bg-[#101112] px-3 text-[10px] font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"><ShoppingBag size={13} />{t(soldOut ? "store.soldOut" : "store.add")}</button>
      </div>
    </article>
  );
}
