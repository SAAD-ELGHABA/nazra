import React, { useEffect } from "react";
import { useFavorites } from "../context/FavoritesContext";
import { CircleMinus, HeartOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCard } from "../context/CardContext";
import { toast } from "sonner";
import ProductComponent from "../components/store/ProductComponent";
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
  useEffect(() => {
    document.title = "Store - Nazra";
    window.scrollTo({ top: 0, behavior: "smooth" });
    // here the promise ...
  }, []);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {favorites.map((product) => {
          const inFavorites = isFavorite(product._id);

          return (
            <ProductComponent
              product={product}
              inFavorites={inFavorites}
              removeFavorite={removeFavorite}
              addFavorite={addFavorite}
              AddItemToCard={AddItemToCard}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Favorites;
