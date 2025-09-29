import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";

function ProductComponent({
  product,
  inFavorites,
  removeFavorite,
  addFavorite,
  AddItemToCard,
}) {
  const { t } = useTranslation();

  return (
    <div className="relative group bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-500 ease-out hover:z-40">
      <Link
        key={product.id}
        to={`/product/${product?.slug}`}
        className="block duration-300"
      >
        {/* Image container with luxury scaling */}
        <div className="relative w-full h-65 overflow-hidden rounded-t-xl">
          <div className="relative w-full h-full overflow-hidden">
            <img
              src={
                product?.colors[0]?.images[0]?.url ||
                "/fall-back-sunglasses-image.webp"
              }
              alt={product.name}
              className="w-full h-full object-cover scale-200 transition-all duration-700 ease-out group-hover:scale-110"
            />
            {product?.colors[0]?.images[1] && (
              <img
                src={
                  product?.colors[0]?.images[1]?.url ||
                  "/fall-back-sunglasses-image.webp"
                }
                alt={product.name}
                className="absolute top-0 left-0 w-full h-full object-cover opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-210"
              />
            )}
          </div>
        </div>
            
        {/* Content section that gets partially covered by buttons */}
        <div className="px-3 flex-col flex gap-2 w-full items-center pb-16 relative z-20 bg-white transition-all duration-500 group-hover:pb-4">
          <div className="flex items-center justify-between w-full gap-2 transform transition-transform duration-300">
            <div className="flex gap-2 items-center">
              <span className="bg-black/80 text-white px-3 py-1 rounded-lg font-semibold text-sm backdrop-blur-sm">
                MAD {product.sale_price + ".00"}
              </span>
              <span className="line-through text-gray-500">
                {(
                  product?.sale_price -
                  product?.original_price +
                  product?.sale_price
                )?.toFixed(2)}
              </span>
            </div>
            <div className="transform transition-transform duration-300 flex items-center gap-1">
              {product?.colors.map((color, key) => (
                <div 
                  key={key} 
                  className={`w-3 h-3 rounded-full border border-gray-300`} 
                  style={{backgroundColor: `${color.value}`}} 
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center w-full transform transition-transform duration-300">
            <h5 className="text-sm font-semibold text-gray-900">
              {product?.name?.length >= 35
                ? product?.name?.substring(0, 35) + ".."
                : product?.name}
            </h5>
          </div>
        </div>
      </Link>

      {/* Absolute positioned buttons that slide over the content */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-3 px-3 rounded-b-xl transform translate-y-full group-hover:translate-y-0 transition-all duration-500 ease-out">
        <div className="flex gap-2 items-center justify-center">
          <button
            className={`p-3 rounded-full shadow-lg transition-all duration-300 ease-out ${
              inFavorites
                ? "bg-red-500 text-white scale-105 shadow-red-200"
                : "bg-white/95 backdrop-blur-sm text-gray-800 hover:bg-red-500 hover:text-white hover:scale-105 shadow-gray-200"
            }`}
            onClick={(e) => {
              e.preventDefault();
              inFavorites ? removeFavorite(product._id) : addFavorite(product);
            }}
          >
            <Heart size={22} className="transition-transform duration-300" />
          </button>

          <button
            className="py-3 flex-1 max-w-[200px] text-sm font-medium bg-black/95 backdrop-blur-sm text-white 
            hover:bg-white hover:text-black border border-transparent hover:border-black transition-all duration-300 ease-out flex items-center gap-2 justify-center rounded-lg shadow-lg hover:scale-105 hover:shadow-xl"
            onClick={(e) => {
              e.preventDefault();
              AddItemToCard(product);
            }}
          >
            <span className="transition-all duration-300">{t("cart.addToBag")}</span>
            <ShoppingCart className="h-5 w-5 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Enhanced luxury shadow effect */}
      <div className="absolute inset-0 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 group-hover:shadow-2xl transition-all duration-500 pointer-events-none -z-10" />
    </div>
  );
}

export default ProductComponent;