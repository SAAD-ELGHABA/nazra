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
    <Link
      key={product.id}
      to={`/product/${product?.slug}`}
      className="group relative bg-white rounded-xl  hover:shadow-xl overflow-hidden transition-shadow duration-300"
    >
      <div className="relative w-full h-64 overflow-hidden">
        <img
          src={
            product?.colors[0]?.images[0]?.url ||
            "/fall-back-sunglasses-image.webp"
          }
          alt={product.name}
          className="w-full scale-220 h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
        />
        {product?.colors[0]?.images[1] && (
          <img
            src={
              product?.colors[0]?.images[1]?.url ||
              "/fall-back-sunglasses-image.webp"
            }
            alt={product.name}
            className="absolute scale-220 top-0 left-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}

        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <div className="flex flex-col gap-2 sm:hidden">
            <button
              className={`p-3 rounded-full shadow transition-colors ${
                inFavorites
                  ? "bg-red-500 text-white"
                  : "bg-white text-gray-800 hover:bg-red-500 hover:text-white"
              }`}
              onClick={(e) => {
                e.preventDefault();
                inFavorites
                  ? removeFavorite(product._id)
                  : addFavorite(product);
              }}
            >
              <Heart size={22} />
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
            {inFavorites && (
              <button
                className="p-2 rounded-full shadow bg-red-500 text-white hover:bg-red-600 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  removeFavorite(product._id);
                }}
              >
                <Heart size={22} />
              </button>
            )}
          </div>
        </div>
        <div className="absolute bottom-3 left-0 px-3  flex items-center justify-between w-full">
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
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h5 className="text-sm font-semibold text-gray-900">
            {product?.name?.length >= 35
              ? product?.name?.substring(0, 35) + ".."
              : product?.name}
          </h5>
        </div>

        <button
          className="mt-2 py-2 w-full text-sm font-medium bg-black text-white rounded-lg hover:bg-transparent hover:text-black border transition-colors flex items-center gap-2 justify-center"
          onClick={(e) => {
            e.preventDefault();
            AddItemToCard(product);
          }}
        >
          <span>{t("cart.addToBag")}</span>
          <ShoppingCart className="h-5 w-5" />
        </button>
      </div>
    </Link>
  );
}

export default ProductComponent;
