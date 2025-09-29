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
    <div className="relative group bg-white rounded-xl overflow-hidden shadow-sm transition-transform duration-300 hover:scale-101 hover:shadow-xl hover:z-30">
      <Link
        key={product.id}
        to={`/product/${product?.slug}`}
        className="block duration-300"
      >
        <div className="relative w-full h-65 overflow-hidden">
          <img
            src={
              product?.colors[0]?.images[0]?.url ||
              "/fall-back-sunglasses-image.webp"
            }
            alt={product.name}
            className="w-full scale-200 h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
          />
          {product?.colors[0]?.images[1] && (
            <img
              src={
                product?.colors[0]?.images[1]?.url ||
                "/fall-back-sunglasses-image.webp"
              }
              alt={product.name}
              className="absolute scale-200 top-0 left-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
        </div>

        <div className="px-3 flex-col flex gap-4 w-full items-center pb-4">
          <div className="flex items-center gap-2">
            <span className=" bg-black/70 text-white px-3 py-1 rounded-lg font-semibold text-sm">
              MAD {product.sale_price + ".00"}
            </span>
            <span className="line-through">
              {(
                product?.sale_price -
                product?.original_price +
                product?.sale_price
              )?.toFixed(2)}
            </span>
          </div>
          <div>
            <h5 className="text-sm font-semibold">
              1/{product?.colors?.length}-Colors
            </h5>
          </div>
          <div className="flex justify-between items-center">
            <h5 className="text-sm font-semibold text-gray-900">
              {product?.name?.length >= 35
                ? product?.name?.substring(0, 35) + ".."
                : product?.name}
            </h5>
          </div>
        </div>
      </Link>

      <div className="px-3 pb-3">
        <div
          className="flex gap-2 items-center justify-center md:hidden md:translate-y-4 
      md:group-hover:flex md:group-hover:translate-y-0 transition-all duration-300"
        >
          <button
            className={`p-3 rounded-full shadow transition-colors ${
              inFavorites
                ? "bg-red-500 text-white"
                : "bg-white text-gray-800 hover:bg-red-500 hover:text-white"
            }`}
            onClick={(e) => {
              e.preventDefault();
              inFavorites ? removeFavorite(product._id) : addFavorite(product);
            }}
          >
            <Heart size={22} />
          </button>

          <button
            className="py-3 w-full max-w-[200px] text-sm font-medium bg-black text-white 
        hover:bg-transparent hover:text-black border transition-colors flex items-center gap-2 justify-center"
            onClick={(e) => {
              e.preventDefault();
              AddItemToCard(product);
            }}
          >
            <span>{t("cart.addToBag")}</span>
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductComponent;
