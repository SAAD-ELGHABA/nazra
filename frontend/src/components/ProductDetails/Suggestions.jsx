import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useFavorites } from "../../context/FavoritesContext";
import { useCard } from "../../context/CardContext";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {products.map((product) => {
          const inFavorites = isFavorite(product.id);
          const inCard = isInCard(product.id);

          return (
            <Link
              key={product.id}
              to={`/product/${product?.slug}`}
              className="group relative bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden transition-shadow duration-300"
            >
              <div className="relative w-full h-64">
                <img
                  src={product?.colors[0]?.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                  loading="lazy"
                />
                {product?.colors[0]?.images[1] && (
                  <img
                    src={product?.colors[0]?.images[1]}
                    alt={product.name}
                    className="absolute top-0 left-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                )}

                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                  <div className="flex flex-col gap-2 sm:hidden">
                    <button
                      className={`p-3 rounded-full shadow transition-colors ${
                        inFavorites ? "bg-red-500 text-white" : "bg-white text-gray-800 hover:bg-red-500 hover:text-white"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        inFavorites ? removeFavorite(product.id) : addFavorite(product);
                      }}
                    >
                      <Heart size={22} />
                    </button>

                    <button
                      className={`p-3 rounded-full shadow transition-colors ${
                        inCard ? "bg-black text-white" : "bg-white text-gray-800 hover:bg-black hover:text-white"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        AddItemToCard(product);
                      }}
                    >
                      <ShoppingCart size={22} />
                    </button>
                  </div>

                  <div className="hidden sm:flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {!inFavorites && (
                      <button
                        className="p-2 rounded-full shadow bg-white text-gray-800 hover:bg-red-500 hover:text-white transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          addFavorite(product);
                        }}
                      >
                        <Heart size={22} />
                      </button>
                    )}
                    {!inCard && (
                      <button
                        className="p-2 rounded-full shadow bg-white text-gray-800 hover:bg-black hover:text-white transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          AddItemToCard(product);
                        }}
                      >
                        <ShoppingCart size={22} />
                      </button>
                    )}
                    {inFavorites && (
                      <button
                        className="p-2 rounded-full shadow bg-red-500 text-white hover:bg-red-600 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          removeFavorite(product.id);
                        }}
                      >
                        <Heart size={22} />
                      </button>
                    )}
                    {inCard && (
                      <button
                        className="p-2 rounded-full shadow bg-black text-white hover:bg-gray-800 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          AddItemToCard(product);
                        }}
                      >
                        <ShoppingCart size={22} />
                      </button>
                    )}
                  </div>
                </div>

                <span className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-lg font-semibold text-sm">
                  MAD {product.sale_price}
                </span>
              </div>

              <div className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h5 className="text-sm font-semibold text-gray-900">{product.name}</h5>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {product?.rating} <Star size={14} className="fill-current" />
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
          );
        })}
      </div>
    </div>
  );
}

export default Suggestions;
