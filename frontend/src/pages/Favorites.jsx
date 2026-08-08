import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Heart, HeartOff, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useFavorites } from "../context/FavoritesContext";
import { useCard } from "../context/CardContext";
import StoreProductCard from "../components/store/StoreProductCard";
import { getFirstPurchasableCartProduct } from "../components/ProductDetails/productUtils";
import { useNoIndex } from "../hooks/usePageSeo";

function Favorites() {
  const { t } = useTranslation();
  const { addToCard } = useCard();
  const { favorites, removeFavorite, addFavorite, isFavorite } = useFavorites();

  // A wishlist is per-visitor local state — there is nothing stable to index.
  useNoIndex(`${t("wishlist.title")} - Nazra`);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleFavorite = (product) => {
    const productId = product?._id || product?.id;
    if (isFavorite(productId)) {
      removeFavorite(productId);
      toast.success(t("store.favoriteRemoved"));
      return;
    }
    addFavorite(product);
    toast.success(t("store.favoriteAdded"));
  };

  const addFavoriteToCart = (product) => {
    const cartProduct = getFirstPurchasableCartProduct(product);
    if (!cartProduct) {
      toast.error(t("productDetails.unavailableCombination"));
      return;
    }
    addToCard(cartProduct);
    toast.success(t("cart.addItem"));
  };

  if (favorites.length === 0) {
    return (
      <main className="min-h-screen bg-[#fbfaf7]">
        <section className="nazra-container flex min-h-[72vh] items-center justify-center py-16">
          <div className="mx-auto max-w-xl text-center">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-stone-200 bg-white">
              <HeartOff className="h-9 w-9 text-stone-500" aria-hidden="true" />
            </span>
            <p className="mt-6 nazra-eyebrow">{t("wishlist.eyebrow")}</p>
            <h1 className="mt-3 nazra-heading text-3xl sm:text-5xl">{t("wishlist.emptyTitle")}</h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-stone-600">
              {t("wishlist.emptyCopy")}
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/store/products"
                className="nazra-button inline-flex min-h-11 items-center justify-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                {t("wishlist.shop")}
              </Link>
              <Link
                to="/"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-stone-300 px-5 text-xs font-bold uppercase tracking-wide transition hover:border-black hover:bg-white"
              >
                {t("wishlist.home")}
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <section className="nazra-container py-10 sm:py-14">
        <div className="flex flex-col gap-5 border-b border-stone-200 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="nazra-eyebrow">{t("wishlist.eyebrow")}</p>
            <h1 className="mt-3 nazra-heading text-3xl sm:text-5xl">{t("wishlist.title")}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
              {t("wishlist.description", { count: favorites.length })}
            </p>
          </div>
          <Link
            to="/store/products"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-stone-300 bg-white px-5 text-xs font-bold uppercase tracking-wide transition hover:border-black"
          >
            {t("wishlist.keepShopping")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((product) => {
            const productId = product?._id || product?.id;
            return (
              <StoreProductCard
                key={productId}
                product={product}
                favorite={isFavorite(productId)}
                onFavorite={toggleFavorite}
                onAdd={addFavoriteToCart}
              />
            );
          })}
        </div>

        <aside className="mt-10 rounded-lg border border-stone-200 bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#f1ede6]">
                <Heart className="h-5 w-5 text-[#906941]" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-sm font-bold uppercase tracking-wide">
                  {t("wishlist.tipTitle")}
                </h2>
                <p className="text-sm text-stone-600">{t("wishlist.tipCopy")}</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-stone-900">
              {t("wishlist.count", { count: favorites.length })}
            </span>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default Favorites;
