import React from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const getImage = (product, index) => product?.colors?.[0]?.images?.[index]?.url;

export default function HomeProductCard({ product, inFavorites, onFavorite, onAdd }) {
  const { t } = useTranslation();
  const salePrice = Number(product?.sale_price ?? 0);
  const originalPrice = Number(product?.original_price ?? 0);
  const hasDiscount = originalPrice > salePrice && salePrice >= 0;
  const discount = hasDiscount ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;
  const isPolarized = `${product?.type || ""} ${product?.category || ""}`.toLowerCase().includes("polar");
  const primaryImage = getImage(product, 0) || "/fall-back-sunglasses-image.webp";
  const secondaryImage = getImage(product, 1);

  return (
    <article className="group flex min-w-[76vw] snap-start flex-col self-stretch sm:min-w-[310px] lg:min-w-0">
      <div className="relative overflow-hidden rounded-sm bg-[#f2ece3]">
        <Link to={`/product/${product?.slug}`} className="block aspect-[4/3] overflow-hidden">
          <img src={primaryImage} alt={product?.name || "Lunettes NAZRA"} width="560" height="420" loading="lazy" className={`h-full w-full object-cover transition duration-500 ${secondaryImage ? "group-hover:opacity-0" : "group-hover:scale-[1.035]"}`} />
          {secondaryImage && <img src={secondaryImage} alt="" width="560" height="420" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:scale-[1.035] group-hover:opacity-100" />}
        </Link>
        <button type="button" onClick={() => onFavorite(product)} className="absolute end-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2" aria-label={t(inFavorites ? "home.bestSellers.removeFavorite" : "home.bestSellers.favorite")}>
          <Heart size={17} className={inFavorites ? "fill-black" : ""} aria-hidden="true" />
        </button>
        {discount > 0 && <span className="absolute bottom-3 start-3 bg-[#b55135] px-2 py-1 text-[10px] font-bold text-white">-{discount}%</span>}
      </div>
      <div className="flex flex-1 flex-col pt-3">
        <Link to={`/product/${product?.slug}`} className="font-display text-lg font-semibold hover:underline">{product?.name}</Link>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide text-stone-600">
          {isPolarized && <span className="border border-stone-300 px-2 py-1">{t("home.bestSellers.polarized")}</span>}
          {product?.category && <span className="border border-stone-300 px-2 py-1">{product.category}</span>}
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-sm font-bold">{salePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} DH</span>
          {hasDiscount && <span className="text-xs text-stone-500 line-through">{originalPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} DH</span>}
        </div>
        <div className="mt-auto pt-3">
          <button type="button" onClick={() => onAdd(product)} className="flex min-h-11 w-full items-center justify-center gap-2 bg-[#111] px-4 text-xs font-semibold text-white transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-stone-400">
            <ShoppingBag size={15} aria-hidden="true" /> {t("home.bestSellers.add")}
          </button>
        </div>
      </div>
    </article>
  );
}
