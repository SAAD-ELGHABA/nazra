import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useFavorites } from "../../context/FavoritesContext";
import { useCard } from "../../context/CardContext";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import ProductComponent from "../store/ProductComponent";

function Suggestions({ products }) {
  const { t } = useTranslation();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { addToCard, isInCard } = useCard();

  const AddItemToCard = (product) => {
    const choosedItem = { ...product, colors: [product.colors[0]], quantiy: 1 };
    addToCard(choosedItem);
    toast.success(t("cart.addItem"));
  };

  if (!products?.length) return null;

  return (
    <div className="my-20 w-[90%] mx-auto">
      <h2
        className="font-bold text-[18px] text-center md:text-left md:text-[30px] mb-6"
        style={{ lineHeight: "1.2", letterSpacing: "4px" }}
      >
        You might also like
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 p-4">
        {products.map((product) => {
          const inFavorites = isFavorite(product.id);

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

export default Suggestions;
