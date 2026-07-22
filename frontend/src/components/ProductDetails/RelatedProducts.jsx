import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCard } from "../../context/CardContext";
import { useFavorites } from "../../context/FavoritesContext";
import StoreProductCard from "../store/StoreProductCard";
import { getFirstPurchasableCartProduct } from "./productUtils";

export default function RelatedProducts({ products }) {
  const { t } = useTranslation();
  const { addToCard } = useCard();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  if (!products?.length) return null;
  const toggleFavorite = (product) => isFavorite(product._id || product.id) ? removeFavorite(product._id || product.id) : addFavorite(product);
  const add = (product) => {
    const cartProduct = getFirstPurchasableCartProduct(product);
    if (!cartProduct) return toast.error(t("productDetails.unavailableCombination"));
    addToCard(cartProduct);
    toast.success(t("productDetails.added", { name: product.name }));
  };
  return (
    <section className="nazra-container py-8 sm:py-10" aria-labelledby="related-title">
      <h2 id="related-title" className="max-w-[160px] font-display text-2xl font-semibold leading-tight sm:max-w-none">{t("productDetails.related")}</h2>
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">{products.slice(0, 4).map((product) => <StoreProductCard key={product._id || product.id} product={product} favorite={isFavorite(product._id || product.id)} onFavorite={toggleFavorite} onAdd={add} />)}</div>
    </section>
  );
}
