import React from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCard } from "../../context/CardContext";
import { useFavorites } from "../../context/FavoritesContext";
import HomeProductCard from "./HomeProductCard";

function ProductSkeleton() {
  return <div className="min-w-[76vw] animate-pulse snap-start sm:min-w-[310px] lg:min-w-0" aria-hidden="true"><div className="aspect-[4/3] bg-stone-200" /><div className="mt-3 h-5 w-2/3 bg-stone-200" /><div className="mt-3 h-4 w-1/3 bg-stone-200" /><div className="mt-4 h-11 bg-stone-200" /></div>;
}

export default function BestSellersSection({ products, loading, error, onRetry }) {
  const { t } = useTranslation();
  const { addToCard } = useCard();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const addToCart = (product) => {
    if (!product?.colors?.length) return;
    addToCard({ ...product, colors: [product.colors[0]], quantiy: 1 });
    toast.success(t("home.bestSellers.added"));
  };
  const toggleFavorite = (product) => {
    if (isFavorite(product._id)) {
      removeFavorite(product._id);
      toast.success(t("home.bestSellers.favoriteRemoved"));
    } else {
      addFavorite(product);
      toast.success(t("home.bestSellers.favoriteAdded"));
    }
  };

  return (
    <section id="best-sellers" className="nazra-section bg-white" aria-labelledby="best-sellers-title">
      <div className="nazra-container">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="nazra-eyebrow">{t("home.bestSellers.eyebrow")}</p>
            <h2 id="best-sellers-title" className="nazra-heading">{t("home.bestSellers.title")}</h2>
            <p className="mt-2 text-sm text-stone-600">{t("home.bestSellers.copy")}</p>
          </div>
          <Link to="/store/products?sort=best-sellers" className="hidden items-center gap-2 text-xs font-semibold hover:underline sm:flex">{t("home.bestSellers.viewAll")} <ArrowRight size={15} className="rtl:rotate-180" /></Link>
        </div>

        {error ? (
          <div className="mt-8 flex min-h-56 flex-col items-center justify-center border border-stone-200 bg-stone-50 p-6 text-center" role="alert">
            <AlertCircle className="mb-3 text-stone-500" aria-hidden="true" />
            <p className="text-sm">{t("home.bestSellers.error")}</p>
            <button onClick={onRetry} className="nazra-button mt-4 bg-black text-white">{t("home.bestSellers.retry")}</button>
          </div>
        ) : !loading && products.length === 0 ? (
          <div className="mt-8 flex min-h-48 items-center justify-center border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-sm text-stone-600">{t("home.bestSellers.empty")}</div>
        ) : (
          <div className="-mx-4 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:-mx-0 sm:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible">
            {loading ? Array.from({ length: 4 }, (_, index) => <ProductSkeleton key={index} />) : products.map((product) => <HomeProductCard key={product._id} product={product} inFavorites={isFavorite(product._id)} onFavorite={toggleFavorite} onAdd={addToCart} />)}
          </div>
        )}
        <Link to="/store/products?sort=best-sellers" className="mt-7 flex items-center justify-center gap-2 text-xs font-semibold hover:underline sm:hidden">{t("home.bestSellers.viewAll")} <ArrowRight size={15} className="rtl:rotate-180" /></Link>
      </div>
    </section>
  );
}
