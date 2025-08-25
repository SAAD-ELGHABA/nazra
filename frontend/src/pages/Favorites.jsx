import React from "react";
import { useFavorites } from "../context/FavoritesContext";
import { CircleMinus, HeartOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCard } from "../context/CardContext";
import { toast } from "sonner";
function Favorites() {
  const { t } = useTranslation();
  const { addToCard } = useCard();
  const { favorites, removeFavorite } = useFavorites();
  const { addFavorite, isFavorite } = useFavorites();
  const AddItemToCard = (product) => {
    const choosedItem = { ...product, colors: [product.colors[0]], quantiy: 1 };
    addToCard(choosedItem);
    toast.success(t("cart.addItem"));
  };
  if (favorites.length === 0) {
    return (
      <div className="min-h-screen flex gap-4 flex-col items-center justify-center  text-lg">
        <HeartOff className="h-20 w-20" />
        <h1
          className="font-bold text-[16px] text-center md:text-left md:text-[20px]"
          style={{ lineHeight: "1.2", letterSpacing: "4px" }}
        >
          You have no favorite items yet.
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-[90%] mx-auto my-8 p-4">
      <h2 className="text-2xl font-bold mb-4">Your Favorites</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {favorites.map((product) => (
          <Link
            key={product.id}
            className="relative rounded-lg shadow hover:shadow-lg transition group"
            to={`/product/${product?.slug}`}
          >
            <div className="relative">
              <img
                src={product?.colors[0]?.images[0]}
                alt={product.name}
                className="w-full h-60 object-cover rounded-t-lg"
              />

              <div className="absolute top-3 right-3 flex gap-2">
                <button className="p-1 bg-red-500 text-white rounded-full shadow hover:bg-black/70 transition-colors">
                  <Heart
                    size={26}
                    onClick={(e) => {
                      e.preventDefault();
                      if (isFavorite(product.id)) {
                        removeFavorite(product.id);
                      } else {
                        addFavorite(product);
                      }
                    }}
                    className={`${
                      isFavorite(product.id)
                        ? "fill-red-500"
                        : "fill-transparent"
                    } hover:fill-black transition-colors duration-300 text-white`}
                  />
                </button>
              </div>

              <p className="text-white font-bold absolute bottom-2 right-2 bg-black/70 px-3 py-1 rounded-lg">
                MAD {product.sale_price}
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full mt-2 p-3">
              <div className="flex items-center justify-between">
                <h5 className="font-semibold text-gray-900">{product.name}</h5>
                <div className="flex items-center gap-1 text-yellow-500">
                  {product?.rating} <Star size={12} className="fill-current" />
                </div>
              </div>

              <button
                className="mt-2 py-2 w-full text-sm font-medium bg-black text-white rounded-lg hover:bg-transparent hover:text-black border transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  AddItemToCard(product);
                }}
              >
                {t("cart.addToBag")}
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Favorites;
