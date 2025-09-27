import { Glasses, Heart, ShoppingCart, Star } from "lucide-react";
import React, { useState } from "react";
import { useFavorites } from "../../context/FavoritesContext";
import { useCard } from "../../context/CardContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
function ProductInfo({ product, selectedColor, setSelectedColor }) {
  const [quantity, setQuantity] = useState(1);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const toggleFavorite = (e) => {
    e.preventDefault();
    if (isFavorite(product?._id)) {
      removeFavorite(product?._id);
    } else {
      addFavorite(product);
    }
  };
  const { t, i18n } = useTranslation();
  const { addToCard } = useCard();
  const AddItemToCard = (product) => {
    const choosedItem = {
      ...product,
      colors: selectedColor ? [selectedColor] : [product.colors[0]],
      quantiy: quantity,
    };
    addToCard(choosedItem);
    toast.success(t("cart.addItem"));
  };
  return (
    <div className="md:h-[80vh] flex flex-col relative p-4">
      <div className="w-full max-w-2xl mx-auto flex-1">
        <h1 className="font-bold text-2xl md:text-3xl text-gray-900 mb-4 text-left">
          {product?.name}
        </h1>
        <button
          onClick={toggleFavorite}
          className="mb-6 flex items-center gap-2 px-4 py-2 text-sm rounded-lg border bg-gray-50 hover:bg-gray-100 transition"
        >
          <Heart
            size={18}
            className={`transition ${
              isFavorite(product?._id)
                ? "fill-black text-black"
                : "fill-none text-gray-700"
            }`}
          />
          <span>
            {isFavorite(product?._id)
              ? t("product.RemoveFromFavoriteBTN")
              : t("product.AddToFavoriteBTN")}
          </span>
        </button>
        {product?.colors && product?.colors.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-sm md:text-lg uppercase tracking-wide mb-3">
              Colors
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  title={`${color?.name}-color`}
                  className={`relative h-14 w-20 rounded-lg overflow-hidden border-2 transition ${
                    color.name === selectedColor?.name
                      ? "border-black"
                      : "border-gray-300 hover:border-black"
                  }`}
                  style={{ backgroundColor: color?.value }}
                >
                  <img
                    src={color?.images[0]?.url}
                    alt={color?.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-700">
            <span className="capitalize">{product?.type}</span>
            <Glasses />
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <span className="font-semibold capitalize">Category :</span>
            <span>{product?.category}</span>
          </div>

          <div className="flex items-center border rounded-lg w-max overflow-hidden">
            <button
              onClick={decrement}
              className="px-4 py-2 text-lg font-bold hover:bg-gray-100"
            >
              -
            </button>
            <span className="px-4">{quantity}</span>
            <button
              onClick={increment}
              className="px-4 py-2 text-lg font-bold hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="md:absolute sticky bottom-0 left-0 w-full border-t border-gray-200 bg-white p-4 flex items-center justify-between shadow-md">
        <p className="font-bold text-lg md:text-2xl text-gray-900">
          MAD {product?.sale_price + ".00"}
        </p>
        <button
          onClick={(e) => {
            e.preventDefault();
            AddItemToCard(product);
          }}
          className="px-6 py-3 bg-black text-white text-sm md:text-base rounded-lg hover:bg-gray-800 transition shadow-sm flex items-center justify-center gap-2 "
        >
          <ShoppingCart className="h-5 w-5" />
          <span>Add To Bag</span>
        </button>
      </div>
    </div>
  );
}

export default ProductInfo;
